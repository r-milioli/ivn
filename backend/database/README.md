# Banco de Dados - Sistema de Administração de Igreja

Este diretório contém scripts e configurações para o banco de dados do sistema.

## 📁 Arquivos Incluídos

### `schema.sql`
Script SQL limpo que cria apenas as tabelas necessárias:
- Criação de todas as tabelas do sistema
- Índices para performance
- Triggers para updated_at
- Sem dados mockados

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
   - Abra o arquivo `schema.sql`
   - Execute o script (F5 ou botão "Execute")

## 📊 Estrutura das Tabelas

### 🗄️ Tabelas Criadas
- **users** - Usuários do sistema (admins e secretários)
- **members** - Membros da igreja
- **transactions** - Transações financeiras
- **access_requests** - Solicitações de acesso ao sistema

### 📋 Campos Principais
- **UUID** como chave primária
- **Soft delete** implementado (deleted_at)
- **Timestamps** automáticos (created_at, updated_at)
- **Índices** para performance
- **Triggers** para updated_at automático

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

### `access_requests`
- Solicitações de acesso ao sistema
- Campos: id, name, email, password, role, status, approved_by, etc.

## 🔍 Funcionalidades Implementadas

### 📊 Estrutura das Tabelas
- **UUID** como chave primária para todas as tabelas
- **Soft delete** implementado com campo `deleted_at`
- **Timestamps** automáticos (`created_at`, `updated_at`)
- **Índices** otimizados para performance
- **Triggers** para atualização automática de `updated_at`

### 🔒 Segurança
- **Validação de dados** com CHECK constraints
- **Referências** entre tabelas com FOREIGN KEY
- **Índices únicos** para campos críticos (email)
- **Soft delete** para preservar histórico

## 🧪 Testando a Configuração

### 1. Verificar Conexão
```sql
\c igreja_admin
```

### 2. Verificar Tabelas
```sql
-- Verificar se todas as tabelas foram criadas
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Verificar estrutura das tabelas
\d users;
\d members;
\d transactions;
\d access_requests;
```

### 3. Testar Solicitação de Acesso
```bash
curl -X POST http://localhost:3001/api/access-requests \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Novo Usuário",
    "email": "novo@igreja.com",
    "password": "123456",
    "role": "secretary"
  }'
```

### 4. Verificar Tabelas Criadas
```sql
-- Verificar se todas as tabelas foram criadas
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

## 📝 Funcionalidade de Solicitações de Acesso

### Como Funciona
1. **Solicitação**: Usuários podem solicitar acesso através do frontend
2. **Armazenamento**: Solicitações são salvas na tabela `access_requests`
3. **Aprovação**: Administradores podem aprovar/rejeitar solicitações
4. **Criação de Usuário**: Solicitações aprovadas criam usuários automaticamente

### Status das Solicitações
- **pending**: Aguardando aprovação
- **approved**: Aprovada e usuário criado
- **rejected**: Rejeitada com motivo

### Campos Importantes
- `email`: Deve ser único (não pode ter solicitação pendente)
- `password`: Armazenada com hash bcrypt
- `role`: Função solicitada (admin/secretary)
- `approved_by`: ID do usuário que aprovou
- `ip_address`: IP de onde veio a solicitação

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

Para remover o banco de dados:
```sql
DROP DATABASE igreja_admin;
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
- Verifique se o arquivo `schema.sql` existe

---

**Pronto para desenvolvimento e testes! 🚀**
