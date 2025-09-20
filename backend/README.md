# Sistema de Administração de Igreja - Backend API

API REST completa para sistema de administração de igreja com controle financeiro e gestão de membros. Desenvolvido com Node.js, Express.js, PostgreSQL e Sequelize.

## 🏗️ Arquitetura do Sistema

O sistema segue uma arquitetura modular em camadas:

- **Controllers** → **Services** → **Models** → **Database**
- **Routes** → **Middlewares** → **Controllers**

## 📁 Estrutura Detalhada dos Arquivos

### 📂 Raiz do Projeto

#### `server.js` - Arquivo Principal do Servidor
**Propósito:** Ponto de entrada da aplicação, configura e inicia o servidor Express.

**Principais funcionalidades:**
- Configuração de middlewares (CORS, Helmet, Rate Limiting)
- Configuração de parsing de JSON e URL-encoded
- Sistema de logs HTTP
- Inicialização do banco de dados
- Configuração de rotas da API
- Tratamento de erros global
- Shutdown graceful com sinais do sistema
- Tratamento de erros não capturados

**Como funciona:**
1. Importa todas as configurações necessárias
2. Cria a aplicação Express
3. Aplica middlewares na ordem correta
4. Configura as rotas da API
5. Inicializa o banco de dados
6. Inicia o servidor na porta especificada
7. Configura handlers para shutdown graceful

#### `package.json` - Configuração do Projeto
**Propósito:** Define dependências, scripts e metadados do projeto.

**Principais seções:**
- **Dependencies:** Express, Sequelize, PostgreSQL, JWT, bcryptjs, Winston, etc.
- **DevDependencies:** Nodemon, Sequelize-CLI, Jest
- **Scripts:** start, dev, migrate, seed, test
- **Engines:** Node.js >= 16.0.0

#### `config.example.env` - Exemplo de Configuração
**Propósito:** Template para variáveis de ambiente.

**Configurações incluídas:**
- Configurações do servidor (PORT, HOST, NODE_ENV)
- Configurações do banco de dados (DB_HOST, DB_PORT, DB_NAME, etc.)
- Configurações JWT (JWT_SECRET, JWT_REFRESH_SECRET)
- Configurações de segurança (BCRYPT_ROUNDS, RATE_LIMIT)
- Configurações de logs (LOG_LEVEL, LOG_FILE)

### 📂 src/config/ - Configurações do Sistema

#### `database.js` - Configuração do Banco de Dados
**Propósito:** Configuração e conexão com PostgreSQL usando Sequelize.

**Principais funcionalidades:**
- Configuração da conexão Sequelize
- Configuração do pool de conexões
- Configuração de SSL para produção
- Função de teste de conexão
- Configuração de timestamps e soft delete
- Configuração de logging condicional

#### `express.js` - Configurações do Express
**Propósito:** Configurações de middlewares e segurança do Express.

**Configurações incluídas:**
- **CORS:** Configuração de origens permitidas e headers
- **Rate Limiting:** Limitação de requests por IP
- **Morgan:** Configuração de logs HTTP
- **Helmet:** Headers de segurança

#### `auth.js` - Configurações de Autenticação
**Propósito:** Configurações e utilitários para autenticação JWT.

**Principais funcionalidades:**
- Geração de tokens de acesso e refresh
- Verificação e decodificação de tokens
- Hash e comparação de senhas com bcrypt
- Extração de token do header Authorization
- Configurações de expiração de tokens

### 📂 src/models/ - Modelos do Banco de Dados

#### `User.js` - Modelo de Usuário
**Propósito:** Define o modelo de usuários do sistema (admins e secretários).

**Campos principais:**
- `id` (UUID, PK)
- `name` (STRING, obrigatório)
- `email` (STRING, único, obrigatório)
- `password` (STRING, hasheada, obrigatória)
- `role` (ENUM: admin/secretary)
- `active` (BOOLEAN, padrão: true)
- `lastLogin` (DATE)
- `refreshToken` (TEXT)

**Funcionalidades especiais:**
- Hash automático de senha antes de salvar
- Soft delete (paranoid: true)
- Scopes para usuários ativos e dados públicos
- Métodos: findByEmail, findActiveByEmail
- Método toJSON que remove dados sensíveis

#### `Member.js` - Modelo de Membro
**Propósito:** Define o modelo de membros da igreja.

**Campos principais:**
- `id` (UUID, PK)
- `fullName` (STRING, obrigatório)
- `email` (STRING, opcional)
- `phone` (STRING, opcional)
- `address` (TEXT, opcional)
- `birthDate` (DATE, opcional)
- `baptismDate` (DATE, opcional)
- `status` (ENUM: active/inactive/visitor)
- `memberSince` (DATE, opcional)
- `notes` (TEXT, opcional)
- `familyMembers` (JSON)
- `emergencyContact` (JSON)
- `attendanceCount` (INTEGER, padrão: 0)
- `lastAttendance` (DATE)

**Funcionalidades especiais:**
- Método getAge() para calcular idade
- Método getMemberYears() para calcular anos de membro
- Método updateAttendance() para registrar presença
- Método promoteToMember() para promover visitante
- Scopes para diferentes status
- Método estático getStatistics()

#### `Transaction.js` - Modelo de Transação
**Propósito:** Define o modelo de transações financeiras.

**Campos principais:**
- `id` (UUID, PK)
- `type` (ENUM: income/expense, obrigatório)
- `category` (STRING, obrigatória)
- `subcategory` (STRING, opcional)
- `amount` (DECIMAL, obrigatório)
- `description` (TEXT, opcional)
- `date` (DATE, obrigatório)
- `paymentMethod` (ENUM: cash/transfer/check/pix/credit_card)
- `createdBy` (UUID, FK para User)
- `referenceNumber` (STRING, opcional)
- `tags` (JSON, opcional)
- `lastModifiedBy` (UUID, FK para User)

**Funcionalidades especiais:**
- Método isIncome() e isExpense()
- Método getFormattedAmount() para formatação monetária
- Método markAsDeleted() para soft delete com motivo
- Métodos estáticos para relatórios financeiros
- Scopes para diferentes tipos e filtros

#### `index.js` - Configuração dos Models
**Propósito:** Configura as associações entre modelos e inicializa o banco.

**Principais funcionalidades:**
- Define relacionamentos entre User e Transaction
- Configuração de foreign keys
- Função syncDatabase() para sincronização
- Função initializeDatabase() para inicialização
- Função closeDatabase() para fechamento

### 📂 src/middlewares/ - Middlewares da Aplicação

#### `auth.js` - Middlewares de Autenticação
**Propósito:** Middlewares para autenticação e autorização.

**Middlewares incluídos:**
- `authenticateToken`: Verifica token JWT de acesso
- `requireAdmin`: Exige role de administrador
- `requireAdminOrSecretary`: Exige role admin ou secretário
- `optionalAuth`: Autenticação opcional
- `authenticateRefreshToken`: Verifica refresh token

**Funcionalidades:**
- Extração de token do header Authorization
- Verificação de tipo de token (access/refresh)
- Validação de usuário ativo
- Logs de tentativas de acesso não autorizadas

#### `validation.js` - Middlewares de Validação
**Propósito:** Validação de dados de entrada usando Joi.

**Validações incluídas:**
- `validateUserRegistration`: Validação de registro de usuário
- `validateUserLogin`: Validação de login
- `validateMember`: Validação de dados de membro
- `validateTransaction`: Validação de transação financeira
- `validateQueryParams`: Validação de parâmetros de query
- `validateDateRange`: Validação de intervalo de datas
- `validateUUID`: Validação de UUID

**Funcionalidades:**
- Validação de formato de email
- Validação de formato de telefone brasileiro
- Validação de senha forte
- Validação de datas
- Sanitização de dados

#### `errorHandler.js` - Tratamento de Erros
**Propósito:** Middleware global para captura e tratamento de erros.

**Funcionalidades:**
- Captura de erros do Sequelize
- Tratamento de erros JWT
- Tratamento de erros de validação
- Logs estruturados de erros
- Respostas padronizadas de erro
- Middleware para rotas não encontradas
- Wrapper para funções async (asyncHandler)
- Validação de campos obrigatórios
- Sanitização de entrada

### 📂 src/services/ - Lógica de Negócio

#### `authService.js` - Serviço de Autenticação
**Propósito:** Lógica de negócio para operações de autenticação.

**Métodos principais:**
- `authenticateUser`: Autentica usuário com email/senha
- `registerUser`: Registra novo usuário (apenas admins)
- `updateUser`: Atualiza dados do usuário
- `deleteUser`: Remove usuário (soft delete)
- `listUsers`: Lista usuários com paginação
- `getUserById`: Busca usuário por ID
- `updatePassword`: Atualiza senha do usuário
- `logoutUser`: Desativa refresh tokens

**Funcionalidades especiais:**
- Verificação de email duplicado
- Hash de senha automático
- Logs de auditoria
- Validação de permissões

#### `memberService.js` - Serviço de Membros
**Propósito:** Lógica de negócio para operações de membros.

**Métodos principais:**
- `listMembers`: Lista membros com filtros e paginação
- `createMember`: Cria novo membro
- `getMemberById`: Busca membro por ID
- `updateMember`: Atualiza dados do membro
- `deleteMember`: Remove membro (soft delete)
- `promoteToMember`: Promove visitante a membro
- `registerAttendance`: Registra presença
- `getMembersByStatus`: Busca por status
- `searchMembers`: Busca por termo
- `getMemberStatistics`: Estatísticas de membros
- `getMemberGrowth`: Dados de crescimento

**Funcionalidades especiais:**
- Filtros avançados (nome, email, telefone)
- Busca por intervalo de datas
- Estatísticas detalhadas
- Promoção de visitantes

#### `financeService.js` - Serviço Financeiro
**Propósito:** Lógica de negócio para operações financeiras.

**Métodos principais:**
- `listTransactions`: Lista transações com filtros
- `createTransaction`: Cria nova transação
- `getTransactionById`: Busca transação por ID
- `updateTransaction`: Atualiza transação
- `deleteTransaction`: Remove transação (soft delete)
- `registerIncome`: Registra receita
- `registerExpense`: Registra despesa
- `getFinancialSummary`: Resumo financeiro
- `getTransactionsByCategory`: Relatório por categoria
- `getMonthlyReport`: Relatório mensal
- `getFinancialChartData`: Dados para gráficos

**Funcionalidades especiais:**
- Cálculos de saldo automáticos
- Relatórios por categoria e período
- Dados para gráficos e dashboards
- Auditoria de modificações

### 📂 src/controllers/ - Controladores da API

#### `authController.js` - Controller de Autenticação
**Propósito:** Controla as rotas de autenticação e usuários.

**Endpoints principais:**
- `POST /api/auth/login` - Login de usuário
- `POST /api/auth/refresh` - Renovar token
- `POST /api/auth/logout` - Logout
- `GET /api/auth/profile` - Perfil do usuário
- `PUT /api/auth/profile` - Atualizar perfil
- `PUT /api/auth/change-password` - Alterar senha
- `GET /api/auth/users` - Listar usuários (admin)
- `POST /api/auth/users` - Registrar usuário (admin)
- `GET /api/auth/statistics` - Estatísticas de usuários

#### `memberController.js` - Controller de Membros
**Propósito:** Controla as rotas de membros.

**Endpoints principais:**
- `GET /api/members` - Listar membros
- `POST /api/members` - Criar membro
- `GET /api/members/:id` - Buscar membro
- `PUT /api/members/:id` - Atualizar membro
- `DELETE /api/members/:id` - Remover membro
- `POST /api/members/:id/promote` - Promover membro
- `POST /api/members/:id/attendance` - Registrar presença
- `GET /api/members/statistics` - Estatísticas
- `GET /api/members/birthdays` - Aniversariantes
- `GET /api/members/export` - Exportar dados

#### `financeController.js` - Controller Financeiro
**Propósito:** Controla as rotas financeiras.

**Endpoints principais:**
- `GET /api/finances/transactions` - Listar transações
- `POST /api/finances/transactions` - Criar transação
- `POST /api/finances/income` - Registrar receita
- `POST /api/finances/expense` - Registrar despesa
- `GET /api/finances/summary` - Resumo financeiro
- `GET /api/finances/reports` - Relatórios
- `GET /api/finances/chart-data` - Dados para gráficos
- `GET /api/finances/categories` - Categorias
- `GET /api/finances/export` - Exportar dados

#### `dashboardController.js` - Controller do Dashboard
**Propósito:** Controla as rotas do dashboard.

**Endpoints principais:**
- `GET /api/dashboard/summary` - Resumo geral
- `GET /api/dashboard/financial-chart` - Dados financeiros
- `GET /api/dashboard/member-growth` - Crescimento de membros
- `GET /api/dashboard/statistics` - Estatísticas gerais
- `GET /api/dashboard/alerts` - Alertas e notificações
- `GET /api/dashboard/performance` - Dados de performance

### 📂 src/routes/ - Rotas da API

#### `index.js` - Centralizador de Rotas
**Propósito:** Centraliza todas as rotas da API.

**Rotas configuradas:**
- `/api/auth` → Rotas de autenticação
- `/api/members` → Rotas de membros
- `/api/finances` → Rotas financeiras
- `/api/dashboard` → Rotas do dashboard
- `/api/health` → Health check
- `/api/info` → Informações da API

#### `authRoutes.js` - Rotas de Autenticação
**Propósito:** Define todas as rotas relacionadas à autenticação.

**Características:**
- Rotas públicas: login, refresh
- Rotas protegidas: profile, logout
- Rotas de admin: gerenciamento de usuários
- Middlewares aplicados: validação, autenticação, autorização

#### `memberRoutes.js` - Rotas de Membros
**Propósito:** Define todas as rotas relacionadas aos membros.

**Características:**
- CRUD completo de membros
- Rotas especiais: busca, estatísticas, exportação
- Middlewares: autenticação, validação, sanitização

#### `financeRoutes.js` - Rotas Financeiras
**Propósito:** Define todas as rotas relacionadas às finanças.

**Características:**
- CRUD completo de transações
- Rotas de relatórios e gráficos
- Rotas específicas para receitas e despesas
- Middlewares: autenticação, validação, filtros de data

#### `dashboardRoutes.js` - Rotas do Dashboard
**Propósito:** Define todas as rotas relacionadas ao dashboard.

**Características:**
- Dados consolidados para dashboard
- Gráficos e estatísticas
- Alertas e notificações
- Middlewares: autenticação, validação de query

### 📂 src/utils/ - Utilitários

#### `logger.js` - Sistema de Logs
**Propósito:** Configuração do sistema de logs com Winston.

**Funcionalidades:**
- Logs em console (desenvolvimento)
- Logs em arquivos (produção)
- Diferentes níveis de log
- Formato estruturado
- Rotação de arquivos
- Middleware HTTP logger
- Logs especializados por tipo (auth, db, finance, member)

#### `helpers.js` - Funções Auxiliares
**Propósito:** Funções utilitárias para toda a aplicação.

**Funções principais:**
- `sendSuccessResponse`: Resposta de sucesso padronizada
- `sendErrorResponse`: Resposta de erro padronizada
- `getPagination`: Configuração de paginação
- `getPaginationInfo`: Informações de paginação
- `createSearchFilter`: Filtros de busca
- `createDateFilter`: Filtros de data
- `formatCurrency`: Formatação monetária
- `formatDate`: Formatação de datas
- `isValidEmail`: Validação de email
- `isValidPhone`: Validação de telefone
- `generateRandomString`: Geração de strings aleatórias
- `daysDifference`: Cálculo de diferença em dias
- `removeUndefined`: Limpeza de objetos
- `groupBy`: Agrupamento de arrays

## 🚀 Como Usar

### 1. Configuração Inicial

#### Opção A: Banco de Produção
```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp config.example.env .env
# Editar .env com suas configurações

# Criar banco de dados PostgreSQL
createdb igreja_admin
```

#### Opção B: Banco de Teste (Recomendado para desenvolvimento)
```bash
# Instalar dependências
npm install

# Configurar banco no pgAdmin
# 1. Abra o pgAdmin
# 2. Crie um banco chamado 'igreja_admin'
# 3. Selecione o banco 'igreja_admin'
# 4. Abra o Query Tool (Ctrl+Shift+Q)
# 5. Execute o arquivo database/setup_test_db.sql

# Usar configuração de teste
cp config.test.env .env
# Edite o .env e altere 'sua_senha_postgres' pela sua senha real
```

### 2. Dados de Teste Incluídos
O banco de teste já vem com:
- **3 usuários:** admin@igreja.com, maria@igreja.com, pastor@igreja.com (senha: 123456)
- **6 membros** com dados completos
- **11 transações** financeiras
- **Views e funções** úteis para relatórios

### 3. Executar o Servidor
```bash
# Modo desenvolvimento
npm run dev

# Modo produção
npm start
```

### 4. Testar a API
```bash
# Health check
curl http://localhost:3000/api/health

# Informações da API
curl http://localhost:3000/api/info
```

## 🔐 Autenticação

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@igreja.com","password":"senha123"}'
```

### Usar Token
```bash
curl -X GET http://localhost:3000/api/members \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

## 📊 Exemplos de Uso

### Criar Membro
```bash
curl -X POST http://localhost:3000/api/members \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "João Silva",
    "email": "joao@email.com",
    "phone": "(11) 99999-9999",
    "status": "visitor"
  }'
```

### Registrar Receita
```bash
curl -X POST http://localhost:3000/api/finances/income \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "category": "Dízimo",
    "amount": 500.00,
    "description": "Dízimo do mês",
    "paymentMethod": "cash"
  }'
```

## 🛠️ Scripts Disponíveis

- `npm start` - Inicia servidor em produção
- `npm run dev` - Inicia servidor em desenvolvimento com nodemon
- `npm run migrate` - Executa migrações do banco
- `npm run seed` - Executa seeders
- `npm test` - Executa testes

## 🔧 Configurações Importantes

### Banco de Dados
- **Desenvolvimento:** Sincronização automática dos modelos
- **Produção:** Uso de migrações do Sequelize
- **Soft Delete:** Todos os modelos usam exclusão lógica

### Segurança
- **Rate Limiting:** 100 requests por 15 minutos por IP
- **CORS:** Configurado para desenvolvimento e produção
- **Helmet:** Headers de segurança aplicados
- **JWT:** Tokens com expiração configurável

### Logs
- **Desenvolvimento:** Logs no console
- **Produção:** Logs em arquivos com rotação
- **Níveis:** error, warn, info, http, debug

## 📝 Notas Importantes

1. **Primeiro Usuário:** Crie um usuário admin manualmente no banco ou via seeder
2. **Banco de Dados:** Certifique-se de que o PostgreSQL está rodando
3. **Variáveis de Ambiente:** Nunca commite o arquivo `.env` real
4. **Logs:** Monitore os logs para identificar problemas
5. **Backup:** Configure backup automático do banco de dados

## 🆘 Solução de Problemas

### Erro de Conexão com Banco
- Verifique se o PostgreSQL está rodando
- Confirme as credenciais no `.env`
- Teste a conexão manualmente

### Erro de Autenticação
- Verifique se o JWT_SECRET está configurado
- Confirme se o token não expirou
- Verifique se o usuário está ativo

### Erro de Validação
- Confirme o formato dos dados enviados
- Verifique se todos os campos obrigatórios estão presentes
- Consulte a documentação das validações

---

**Desenvolvido com ❤️ para administração de igrejas**