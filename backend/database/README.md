# Banco de Dados - Sistema de Administração de Igreja

Este diretório contém scripts e configurações para o banco de dados do sistema.

## 📁 Arquivos Incluídos

### `setup_test_db.sql`
Script SQL completo para configurar o banco de dados com:
- Criação de todas as tabelas
- Inserção de dados de teste
- Configuração de usuário da aplicação
- Views e funções úteis

### `config.test.env`
Arquivo de configuração específico para ambiente de teste.

## 🚀 Como Configurar o Banco no pgAdmin

### Pré-requisitos
- PostgreSQL instalado e rodando
- pgAdmin instalado e configurado

### Passo a Passo no pgAdmin

1. **Conectar ao Servidor PostgreSQL**
   - Abra o pgAdmin
   - Conecte-se ao seu servidor PostgreSQL

2. **Criar o Banco de Dados**
   - Clique com botão direito em "Databases"
   - Selecione "Create" → "Database"
   - Nome: `igreja_admin`
   - Clique em "Save"

3. **Executar o Script SQL**
   - Selecione o banco `igreja_admin` no painel esquerdo
   - Clique no ícone "Query Tool" (ou Ctrl+Shift+Q)
   - Abra o arquivo `setup_test_db.sql`
   - Execute o script (F5 ou botão "Execute")

## 📊 Dados de Teste Incluídos

### 👥 Usuários Criados
| Email | Senha | Role | Descrição |
|-------|-------|------|-----------|
| admin@igreja.com | 123456 | admin | Administrador Principal |
| maria@igreja.com | 123456 | secretary | Secretária Maria |
| pastor@igreja.com | 123456 | admin | Pastor João |

### 👨‍👩‍👧‍👦 Membros Criados
- **6 membros** com dados completos
- **3 membros ativos**
- **2 visitantes**
- **1 membro inativo**

### 💰 Transações Financeiras
- **11 transações** (6 receitas, 5 despesas)
- **Saldo inicial:** R$ 4.620,00
- Dados dos últimos 2 meses

## 🔧 Configuração da Aplicação

Após configurar o banco, use estas configurações no seu arquivo `.env`:

```env
# Banco de dados
DB_HOST=localhost
DB_PORT=5432
DB_NAME=igreja_admin
DB_USER=postgres
DB_PASSWORD=sua_senha_postgres
DB_DIALECT=postgres
```

Ou copie o arquivo de configuração de teste:
```bash
cp config.test.env .env
```

**Importante:** Altere `sua_senha_postgres` pela senha real do seu usuário postgres.

## 📋 Estrutura das Tabelas

### `users`
- Usuários do sistema (admins e secretários)
- Campos: id, name, email, password, role, active, etc.

### `members`
- Membros da igreja
- Campos: id, full_name, email, phone, status, birth_date, etc.

### `transactions`
- Transações financeiras
- Campos: id, type, category, amount, date, payment_method, etc.

## 🔍 Views Úteis

### `monthly_financial_summary`
Resumo financeiro mensal por tipo de transação.

### `member_statistics`
Estatísticas de membros por status.

### `member_details`
Membros com informações calculadas (idade, anos de membro).

## ⚙️ Funções Personalizadas

### `calculate_age(birth_date)`
Calcula a idade baseada na data de nascimento.

### `calculate_membership_years(member_since)`
Calcula os anos de membro.

### `get_financial_balance(start_date, end_date)`
Retorna o saldo financeiro em um período.

## 🧪 Testando a Configuração

### 1. Verificar Conexão
```sql
\c igreja_admin_test
```

### 2. Verificar Dados
```sql
-- Verificar usuários
SELECT name, email, role FROM users WHERE deleted_at IS NULL;

-- Verificar membros
SELECT full_name, status FROM members WHERE deleted_at IS NULL;

-- Verificar saldo
SELECT * FROM get_financial_balance();
```

### 3. Testar Login na API
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@igreja.com","password":"123456"}'
```

## 🔒 Segurança

### Usuário da Aplicação
- **Nome:** igreja_app_user
- **Permissões:** Apenas as necessárias para a aplicação
- **Não é superusuário**

### Dados de Teste
- Senhas são hasheadas com bcrypt
- Dados realistas mas fictícios
- Soft delete implementado

## 🗑️ Limpeza (Opcional)

Para remover o banco de teste:
```sql
DROP DATABASE igreja_admin_test;
DROP USER igreja_app_user;
```

## 📞 Solução de Problemas

### Erro de Conexão
- Verifique se o PostgreSQL está rodando
- Confirme se o usuário `postgres` tem permissões
- Verifique se a porta 5432 está disponível

### Erro de Permissão
- Execute como usuário `postgres` ou superusuário
- Verifique se o usuário tem permissão para criar bancos

### Erro de Arquivo
- Confirme se está no diretório correto
- Verifique se o arquivo `setup_test_db.sql` existe

---

**Pronto para desenvolvimento e testes! 🚀**
