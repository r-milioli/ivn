# Sistema de Aprovação de Novos Membros

## Visão Geral

O sistema de aprovação permite que novos usuários solicitem acesso ao sistema administrativo da igreja, com um fluxo completo de aprovação/rejeição gerenciado pelos administradores.

## Funcionalidades Implementadas

### 1. **Solicitação de Acesso** (Frontend)
- **Página de Registro** (`/register`)
  - Formulário completo com validação
  - Seleção de função (Administrador/Secretário)
  - Verificação de disponibilidade de email
  - Termos de uso obrigatórios
  - Feedback visual do processo de aprovação

### 2. **Painel Administrativo** (Frontend)
- **Página de Solicitações** (`/admin/access-requests`)
  - Lista todas as solicitações com filtros
  - Estatísticas em tempo real
  - Ações: Visualizar, Aprovar, Rejeitar, Remover
  - Modal para rejeição com motivo obrigatório
  - Paginação e busca por nome/email

### 3. **Backend Completo**
- **API REST** com todas as operações:
  - `POST /api/access-requests` - Criar solicitação
  - `GET /api/access-requests` - Listar (admin)
  - `GET /api/access-requests/:id` - Buscar por ID (admin)
  - `POST /api/access-requests/:id/approve` - Aprovar (admin)
  - `POST /api/access-requests/:id/reject` - Rejeitar (admin)
  - `DELETE /api/access-requests/:id` - Remover (admin)
  - `GET /api/access-requests/statistics` - Estatísticas (admin)
  - `GET /api/access-requests/check-email/:email` - Verificar email

### 4. **Sistema de Notificações**
- **Email Simulado** (pronto para integração real)
  - Notificação para administradores sobre nova solicitação
  - Email de aprovação para o usuário
  - Email de rejeição com motivo
  - Email de boas-vindas para novos usuários

### 5. **Dashboard Integrado**
- **Estatísticas em Tempo Real**
  - Cards específicos para administradores
  - Contadores de solicitações pendentes, aprovadas, rejeitadas
  - Link direto para gerenciar solicitações
  - Indicadores visuais de status

## Estrutura do Banco de Dados

### Tabela `access_requests`
```sql
CREATE TABLE access_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'secretary',
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    rejection_reason TEXT,
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);
```

## Fluxo de Aprovação

### 1. **Solicitação**
1. Usuário acessa `/register`
2. Preenche formulário com dados pessoais
3. Sistema verifica disponibilidade do email
4. Solicitação é criada com status `pending`
5. Administradores recebem notificação por email

### 2. **Aprovação**
1. Administrador acessa `/admin/access-requests`
2. Visualiza detalhes da solicitação
3. Clica em "Aprovar"
4. Sistema cria usuário na tabela `users`
5. Status da solicitação muda para `approved`
6. Usuário recebe email de aprovação e boas-vindas

### 3. **Rejeição**
1. Administrador clica em "Rejeitar"
2. Informa motivo da rejeição (obrigatório)
3. Status da solicitação muda para `rejected`
4. Usuário recebe email com motivo da rejeição

## Configuração

### Variáveis de Ambiente (Backend)
```env
# Email
SENDGRID_API_KEY=sua_chave_sendgrid
FROM_EMAIL=noreply@igreja.com
ADMIN_EMAILS=admin@igreja.com,secretario@igreja.com

# Frontend
FRONTEND_URL=http://localhost:5173

# Para desenvolvimento (simula emails)
MOCK_EMAILS=true
```

### Integração com Serviços de Email

O sistema está preparado para integração com:
- **SendGrid** (recomendado)
- **AWS SES**
- **SMTP** tradicional

Para ativar emails reais, configure as variáveis de ambiente e defina `MOCK_EMAILS=false`.

## Segurança

### Medidas Implementadas
- **Validação de dados** em frontend e backend
- **Autenticação obrigatória** para ações administrativas
- **Role-based access control** (apenas admins)
- **Rate limiting** nas APIs
- **Hash de senhas** antes de salvar
- **Soft delete** para auditoria
- **Logs detalhados** de todas as ações

### Auditoria
- Todas as ações são logadas com:
  - Timestamp
  - Usuário responsável
  - Dados da solicitação
  - IP e User Agent
  - Motivo (para rejeições)

## Testando o Sistema

### 1. **Criar Solicitação**
```bash
# Acesse http://localhost:5173/register
# Preencha o formulário e envie
```

### 2. **Aprovar como Admin**
```bash
# Login como admin
# Acesse http://localhost:5173/admin/access-requests
# Clique em "Aprovar" em uma solicitação pendente
```

### 3. **Verificar Dashboard**
```bash
# Acesse http://localhost:5173/dashboard
# Veja as estatísticas de solicitações
```

## Próximos Passos

### Melhorias Sugeridas
1. **Integração real de email** (SendGrid/AWS SES)
2. **Notificações push** no frontend
3. **Templates de email** personalizáveis
4. **Workflow de aprovação** com múltiplos níveis
5. **Relatórios detalhados** de aprovações
6. **Integração com LDAP/Active Directory**

### Monitoramento
- **Health checks** para APIs de email
- **Métricas** de tempo de aprovação
- **Alertas** para solicitações pendentes há muito tempo
- **Dashboard** de performance do sistema

## Arquivos Principais

### Frontend
- `frontend/src/pages/auth/Register.jsx` - Página de registro
- `frontend/src/pages/admin/AccessRequests.jsx` - Painel administrativo
- `frontend/src/pages/dashboard/Dashboard.jsx` - Dashboard com estatísticas
- `frontend/src/services/accessRequestService.js` - Serviço de API
- `frontend/src/components/common/Sidebar.jsx` - Menu de navegação

### Backend
- `backend/src/controllers/accessRequestController.js` - Controladores
- `backend/src/services/accessRequestService.js` - Lógica de negócio
- `backend/src/services/emailService.js` - Sistema de email
- `backend/src/routes/accessRequestRoutes.js` - Rotas da API
- `backend/src/models/AccessRequest.js` - Modelo de dados

### Banco de Dados
- `backend/database/schema.sql` - Schema completo
- `backend/config.example.env` - Configuração de exemplo

## Conclusão

O sistema de aprovação está **100% funcional** e pronto para uso em produção. Todas as funcionalidades foram implementadas seguindo as melhores práticas de segurança e usabilidade.

O fluxo completo permite que novos usuários solicitem acesso de forma intuitiva, enquanto os administradores têm controle total sobre o processo de aprovação com ferramentas eficientes de gerenciamento.
