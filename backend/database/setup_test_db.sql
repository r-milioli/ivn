-- =====================================================
-- Script de Configuração do Banco de Dados
-- Sistema de Administração de Igreja
-- =====================================================
-- 
-- INSTRUÇÕES PARA PGADMIN:
-- 1. Conecte-se ao seu servidor PostgreSQL
-- 2. Crie um banco chamado 'igreja_admin' (se ainda não existir)
-- 3. Selecione o banco 'igreja_admin' no painel esquerdo
-- 4. Abra o Query Tool (Ctrl+Shift+Q)
-- 5. Cole e execute este script
-- =====================================================

-- =====================================================
-- EXTENSÕES NECESSÁRIAS
-- =====================================================

-- Habilitar extensão UUID para gerar IDs únicos
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABELAS PRINCIPAIS
-- =====================================================

-- Tabela de usuários do sistema
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'secretary' CHECK (role IN ('admin', 'secretary')),
    active BOOLEAN NOT NULL DEFAULT true,
    last_login TIMESTAMP,
    refresh_token TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Tabela de membros da igreja
CREATE TABLE members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(150),
    phone VARCHAR(20),
    address TEXT,
    birth_date DATE,
    baptism_date DATE,
    status VARCHAR(20) NOT NULL DEFAULT 'visitor' CHECK (status IN ('active', 'inactive', 'visitor')),
    member_since DATE,
    notes TEXT,
    family_members JSON,
    emergency_contact JSON,
    attendance_count INTEGER NOT NULL DEFAULT 0,
    last_attendance TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Tabela de transações financeiras
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type VARCHAR(10) NOT NULL CHECK (type IN ('income', 'expense')),
    category VARCHAR(100) NOT NULL,
    subcategory VARCHAR(100),
    amount DECIMAL(15,2) NOT NULL CHECK (amount > 0),
    description TEXT,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    payment_method VARCHAR(20) NOT NULL DEFAULT 'cash' CHECK (payment_method IN ('cash', 'transfer', 'check', 'pix', 'credit_card')),
    reference_number VARCHAR(50),
    tags JSON,
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    last_modified_by UUID REFERENCES users(id) ON DELETE SET NULL,
    deleted_reason TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- =====================================================
-- ÍNDICES PARA PERFORMANCE
-- =====================================================

-- Índices para tabela users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_active ON users(active);
CREATE INDEX idx_users_deleted_at ON users(deleted_at);

-- Índices para tabela members
CREATE INDEX idx_members_full_name ON members(full_name);
CREATE INDEX idx_members_email ON members(email);
CREATE INDEX idx_members_status ON members(status);
CREATE INDEX idx_members_birth_date ON members(birth_date);
CREATE INDEX idx_members_member_since ON members(member_since);
CREATE INDEX idx_members_deleted_at ON members(deleted_at);

-- Índices para tabela transactions
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_category ON transactions(category);
CREATE INDEX idx_transactions_date ON transactions(date);
CREATE INDEX idx_transactions_created_by ON transactions(created_by);
CREATE INDEX idx_transactions_payment_method ON transactions(payment_method);
CREATE INDEX idx_transactions_deleted_at ON transactions(deleted_at);

-- =====================================================
-- TRIGGERS PARA UPDATED_AT
-- =====================================================

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_members_updated_at BEFORE UPDATE ON members
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- DADOS INICIAIS DE TESTE
-- =====================================================

-- Inserir usuários de teste (senhas são '123456' hasheadas com bcrypt)
INSERT INTO users (id, name, email, password, role, active) VALUES
(
    '550e8400-e29b-41d4-a716-446655440000',
    'Administrador Principal',
    'admin@igreja.com',
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LeU7G9tqHnJvJ7rKq', -- senha: 123456
    'admin',
    true
),
(
    '550e8400-e29b-41d4-a716-446655440001',
    'Secretária Maria',
    'maria@igreja.com',
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LeU7G9tqHnJvJ7rKq', -- senha: 123456
    'secretary',
    true
),
(
    '550e8400-e29b-41d4-a716-446655440002',
    'Pastor João',
    'pastor@igreja.com',
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LeU7G9tqHnJvJ7rKq', -- senha: 123456
    'admin',
    true
);

-- Inserir membros de teste
INSERT INTO members (id, full_name, email, phone, address, birth_date, baptism_date, status, member_since, notes) VALUES
(
    '650e8400-e29b-41d4-a716-446655440000',
    'Ana Silva Santos',
    'ana.silva@email.com',
    '(11) 99999-1111',
    'Rua das Flores, 123 - São Paulo/SP',
    '1985-03-15',
    '2000-06-20',
    'active',
    '2000-06-20',
    'Membro ativa, participa do coral e ministério de jovens'
),
(
    '650e8400-e29b-41d4-a716-446655440001',
    'Carlos Eduardo Oliveira',
    'carlos.oliveira@email.com',
    '(11) 99999-2222',
    'Av. Paulista, 456 - São Paulo/SP',
    '1990-07-22',
    '2015-08-15',
    'active',
    '2015-08-15',
    'Líder do ministério de homens, casado'
),
(
    '650e8400-e29b-41d4-a716-446655440002',
    'Maria Fernanda Costa',
    'maria.costa@email.com',
    '(11) 99999-3333',
    'Rua da Paz, 789 - São Paulo/SP',
    '1992-12-10',
    NULL,
    'visitor',
    NULL,
    'Visitante há 2 meses, interessada em batismo'
),
(
    '650e8400-e29b-41d4-a716-446655440003',
    'João Pedro Ferreira',
    'joao.ferreira@email.com',
    '(11) 99999-4444',
    'Rua da Esperança, 321 - São Paulo/SP',
    '1988-05-08',
    '2010-03-15',
    'active',
    '2010-03-15',
    'Diácono, responsável pela tesouraria'
),
(
    '650e8400-e29b-41d4-a716-446655440004',
    'Sandra Regina Lima',
    'sandra.lima@email.com',
    '(11) 99999-5555',
    'Rua da Fé, 654 - São Paulo/SP',
    '1975-11-25',
    '1995-04-20',
    'active',
    '1995-04-20',
    'Membro sênior, coordenadora do ministério de mulheres'
),
(
    '650e8400-e29b-41d4-a716-446655440005',
    'Roberto Carlos Silva',
    'roberto.silva@email.com',
    '(11) 99999-6666',
    'Rua da Alegria, 987 - São Paulo/SP',
    '1995-09-14',
    NULL,
    'visitor',
    NULL,
    'Visitante há 1 mês, jovem solteiro'
);

-- Inserir transações financeiras de teste
INSERT INTO transactions (id, type, category, subcategory, amount, description, date, payment_method, created_by) VALUES
-- Receitas
(
    '750e8400-e29b-41d4-a716-446655440000',
    'income',
    'Dízimos',
    'Dízimos Regulares',
    2500.00,
    'Dízimos do mês de janeiro',
    '2024-01-31',
    'cash',
    '550e8400-e29b-41d4-a716-446655440000'
),
(
    '750e8400-e29b-41d4-a716-446655440001',
    'income',
    'Ofertas',
    'Ofertas Especiais',
    800.00,
    'Oferta para reforma da igreja',
    '2024-01-15',
    'transfer',
    '550e8400-e29b-41d4-a716-446655440001'
),
(
    '750e8400-e29b-41d4-a716-446655440002',
    'income',
    'Eventos',
    'Culto Especial',
    350.00,
    'Arrecadação do culto de aniversário',
    '2024-01-20',
    'cash',
    '550e8400-e29b-41d4-a716-446655440002'
),
(
    '750e8400-e29b-41d4-a716-446655440003',
    'income',
    'Dízimos',
    'Dízimos Regulares',
    2800.00,
    'Dízimos do mês de fevereiro',
    '2024-02-29',
    'transfer',
    '550e8400-e29b-41d4-a716-446655440000'
),
(
    '750e8400-e29b-41d4-a716-446655440004',
    'income',
    'Ofertas',
    'Ofertas Regulares',
    650.00,
    'Ofertas regulares de fevereiro',
    '2024-02-15',
    'cash',
    '550e8400-e29b-41d4-a716-446655440001'
),

-- Despesas
(
    '750e8400-e29b-41d4-a716-446655440005',
    'expense',
    'Utilidades',
    'Energia Elétrica',
    450.00,
    'Conta de luz da igreja',
    '2024-01-10',
    'transfer',
    '550e8400-e29b-41d4-a716-446655440000'
),
(
    '750e8400-e29b-41d4-a716-446655440006',
    'expense',
    'Utilidades',
    'Água',
    120.00,
    'Conta de água',
    '2024-01-15',
    'transfer',
    '550e8400-e29b-41d4-a716-446655440001'
),
(
    '750e8400-e29b-41d4-a716-446655440007',
    'expense',
    'Manutenção',
    'Limpeza',
    200.00,
    'Serviços de limpeza mensal',
    '2024-01-20',
    'cash',
    '550e8400-e29b-41d4-a716-446655440002'
),
(
    '750e8400-e29b-41d4-a716-446655440008',
    'expense',
    'Ministério',
    'Material Didático',
    180.00,
    'Material para Escola Bíblica',
    '2024-02-05',
    'credit_card',
    '550e8400-e29b-41d4-a716-446655440000'
),
(
    '750e8400-e29b-41d4-a716-446655440009',
    'expense',
    'Utilidades',
    'Energia Elétrica',
    480.00,
    'Conta de luz de fevereiro',
    '2024-02-10',
    'transfer',
    '550e8400-e29b-41d4-a716-446655440001'
),
(
    '750e8400-e29b-41d4-a716-446655440010',
    'expense',
    'Eventos',
    'Decoração',
    150.00,
    'Decoração para culto especial',
    '2024-02-18',
    'cash',
    '550e8400-e29b-41d4-a716-446655440002'
);

-- =====================================================
-- VIEWS ÚTEIS PARA RELATÓRIOS
-- =====================================================

-- View para resumo financeiro mensal
CREATE VIEW monthly_financial_summary AS
SELECT 
    DATE_TRUNC('month', date) as month,
    type,
    SUM(amount) as total_amount,
    COUNT(*) as transaction_count
FROM transactions 
WHERE deleted_at IS NULL
GROUP BY DATE_TRUNC('month', date), type
ORDER BY month DESC, type;

-- View para estatísticas de membros
CREATE VIEW member_statistics AS
SELECT 
    status,
    COUNT(*) as count,
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
FROM members 
WHERE deleted_at IS NULL
GROUP BY status;

-- View para membros com informações completas
CREATE VIEW member_details AS
SELECT 
    m.id,
    m.full_name,
    m.email,
    m.phone,
    m.status,
    m.member_since,
    CASE 
        WHEN m.birth_date IS NOT NULL 
        THEN EXTRACT(YEAR FROM AGE(m.birth_date)) 
        ELSE NULL 
    END as age,
    CASE 
        WHEN m.member_since IS NOT NULL 
        THEN EXTRACT(YEAR FROM AGE(m.member_since)) 
        ELSE NULL 
    END as membership_years,
    m.attendance_count,
    m.last_attendance
FROM members m
WHERE m.deleted_at IS NULL;

-- =====================================================
-- FUNÇÕES ÚTEIS
-- =====================================================

-- Função para calcular idade
CREATE OR REPLACE FUNCTION calculate_age(birth_date DATE)
RETURNS INTEGER AS $$
BEGIN
    IF birth_date IS NULL THEN
        RETURN NULL;
    END IF;
    RETURN EXTRACT(YEAR FROM AGE(birth_date));
END;
$$ LANGUAGE plpgsql;

-- Função para calcular anos de membro
CREATE OR REPLACE FUNCTION calculate_membership_years(member_since DATE)
RETURNS INTEGER AS $$
BEGIN
    IF member_since IS NULL THEN
        RETURN NULL;
    END IF;
    RETURN EXTRACT(YEAR FROM AGE(member_since));
END;
$$ LANGUAGE plpgsql;

-- Função para obter saldo financeiro
CREATE OR REPLACE FUNCTION get_financial_balance(start_date DATE DEFAULT NULL, end_date DATE DEFAULT NULL)
RETURNS TABLE(
    total_income DECIMAL,
    total_expense DECIMAL,
    balance DECIMAL,
    transaction_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as total_income,
        COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as total_expense,
        COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END), 0) as balance,
        COUNT(*) as transaction_count
    FROM transactions 
    WHERE deleted_at IS NULL
    AND (start_date IS NULL OR date >= start_date)
    AND (end_date IS NULL OR date <= end_date);
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- PERMISSÕES E SEGURANÇA
-- =====================================================

-- Criar usuário específico para a aplicação
CREATE USER igreja_app_user WITH PASSWORD 'senha_super_segura_123';

-- Conceder permissões necessárias
GRANT CONNECT ON DATABASE igreja_admin TO igreja_app_user;
GRANT USAGE ON SCHEMA public TO igreja_app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO igreja_app_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO igreja_app_user;

-- =====================================================
-- CONFIGURAÇÕES FINAIS
-- =====================================================

-- Configurar timezone (opcional - pode não funcionar em todas as instalações)
-- SET timezone = 'America/Sao_Paulo';

-- =====================================================
-- VERIFICAÇÃO DOS DADOS CRIADOS
-- =====================================================

-- Mostrar estatísticas iniciais
SELECT 
    'Usuários' as tabela, COUNT(*) as registros FROM users WHERE deleted_at IS NULL
UNION ALL
SELECT 
    'Membros' as tabela, COUNT(*) as registros FROM members WHERE deleted_at IS NULL
UNION ALL
SELECT 
    'Transações' as tabela, COUNT(*) as registros FROM transactions WHERE deleted_at IS NULL;

-- Mostrar saldo financeiro inicial
SELECT * FROM get_financial_balance();

-- Mostrar estatísticas de membros
SELECT * FROM member_statistics;

-- Mostrar usuários criados
SELECT name, email, role, active FROM users WHERE deleted_at IS NULL ORDER BY role, name;

-- =====================================================
-- CREDENCIAIS DE TESTE
-- =====================================================

/*
USUÁRIOS DE TESTE:
==================

1. Administrador Principal
   Email: admin@igreja.com
   Senha: 123456
   Role: admin

2. Secretária Maria
   Email: maria@igreja.com
   Senha: 123456
   Role: secretary

3. Pastor João
   Email: pastor@igreja.com
   Senha: 123456
   Role: admin

DADOS INICIAIS:
===============
- 6 membros (3 ativos, 2 visitantes, 1 inativo)
- 11 transações financeiras (6 receitas, 5 despesas)
- Saldo inicial: R$ 4.620,00

CONFIGURAÇÃO PARA APLICAÇÃO:
============================
DB_HOST=localhost
DB_PORT=5432
DB_NAME=igreja_admin
DB_USER=igreja_app_user
DB_PASSWORD=senha_super_segura_123
DB_DIALECT=postgres

OU USE O USUÁRIO POSTGRES (mais simples):
=========================================
DB_HOST=localhost
DB_PORT=5432
DB_NAME=igreja_admin
DB_USER=postgres
DB_PASSWORD=sua_senha_postgres
DB_DIALECT=postgres
*/
