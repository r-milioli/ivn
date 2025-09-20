-- =====================================================
-- Schema do Banco de Dados
-- Sistema de Administração de Igreja
-- =====================================================
-- 
-- INSTRUÇÕES:
-- 1. Execute este script no pgAdmin
-- 2. Selecione o banco 'igreja_admin'
-- 3. Cole e execute este script
-- 4. Este script cria APENAS as tabelas (sem dados)
-- =====================================================

-- Habilitar extensão UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABELAS PRINCIPAIS
-- =====================================================

-- Tabela de usuários do sistema
CREATE TABLE IF NOT EXISTS users (
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
CREATE TABLE IF NOT EXISTS members (
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
CREATE TABLE IF NOT EXISTS transactions (
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

-- Tabela de solicitações de acesso
CREATE TABLE IF NOT EXISTS access_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'secretary' CHECK (role IN ('admin', 'secretary')),
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    rejection_reason TEXT,
    approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    approved_at TIMESTAMP,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- =====================================================
-- ÍNDICES PARA PERFORMANCE
-- =====================================================

-- Índices para tabela users
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(active);
CREATE INDEX IF NOT EXISTS idx_users_deleted_at ON users(deleted_at);

-- Índices para tabela members
CREATE INDEX IF NOT EXISTS idx_members_full_name ON members(full_name);
CREATE INDEX IF NOT EXISTS idx_members_email ON members(email);
CREATE INDEX IF NOT EXISTS idx_members_status ON members(status);
CREATE INDEX IF NOT EXISTS idx_members_birth_date ON members(birth_date);
CREATE INDEX IF NOT EXISTS idx_members_member_since ON members(member_since);
CREATE INDEX IF NOT EXISTS idx_members_deleted_at ON members(deleted_at);

-- Índices para tabela transactions
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
CREATE INDEX IF NOT EXISTS idx_transactions_created_by ON transactions(created_by);
CREATE INDEX IF NOT EXISTS idx_transactions_payment_method ON transactions(payment_method);
CREATE INDEX IF NOT EXISTS idx_transactions_deleted_at ON transactions(deleted_at);

-- Índices para tabela access_requests
CREATE INDEX IF NOT EXISTS idx_access_requests_email ON access_requests(email);
CREATE INDEX IF NOT EXISTS idx_access_requests_status ON access_requests(status);
CREATE INDEX IF NOT EXISTS idx_access_requests_created_at ON access_requests(created_at);
CREATE INDEX IF NOT EXISTS idx_access_requests_deleted_at ON access_requests(deleted_at);

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
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_members_updated_at ON members;
CREATE TRIGGER update_members_updated_at 
    BEFORE UPDATE ON members
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_transactions_updated_at ON transactions;
CREATE TRIGGER update_transactions_updated_at 
    BEFORE UPDATE ON transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_access_requests_updated_at ON access_requests;
CREATE TRIGGER update_access_requests_updated_at 
    BEFORE UPDATE ON access_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- VERIFICAÇÃO DAS TABELAS CRIADAS
-- =====================================================

-- Mostrar estatísticas das tabelas
SELECT 
    'users' as tabela, COUNT(*) as registros FROM users
UNION ALL
SELECT 
    'members' as tabela, COUNT(*) as registros FROM members
UNION ALL
SELECT 
    'transactions' as tabela, COUNT(*) as registros FROM transactions
UNION ALL
SELECT 
    'access_requests' as tabela, COUNT(*) as registros FROM access_requests;

-- Mostrar estrutura das tabelas
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name IN ('users', 'members', 'transactions', 'access_requests')
ORDER BY table_name, ordinal_position;

-- Mensagem final
SELECT 'Schema criado com sucesso! Todas as tabelas estao prontas para uso.' as resultado;
