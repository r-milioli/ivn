# Sistema de Administração de Igreja - Frontend

Frontend React para o sistema de administração de igreja, desenvolvido com foco em controle financeiro e gestão de membros.

## 🚀 Tecnologias

- **React 18+** - Biblioteca principal
- **Vite** - Build tool e dev server
- **Tailwind CSS** - Framework de CSS
- **React Router DOM** - Roteamento
- **React Hook Form** - Gerenciamento de formulários
- **Axios** - Cliente HTTP
- **React Query** - Cache e sincronização de dados
- **Lucide React** - Ícones
- **React Hot Toast** - Notificações

## 📁 Estrutura do Projeto

```
frontend/
├── src/
│   ├── components/           # Componentes reutilizáveis
│   │   ├── auth/            # Componentes de autenticação
│   │   ├── charts/          # Componentes de gráficos
│   │   └── common/          # Componentes comuns (Layout, Header, etc.)
│   ├── context/             # Contextos React (Auth, App)
│   ├── hooks/               # Hooks customizados
│   ├── pages/               # Páginas da aplicação
│   │   ├── auth/            # Páginas de autenticação
│   │   ├── dashboard/       # Dashboard principal
│   │   ├── members/         # Gestão de membros
│   │   └── finances/        # Gestão financeira
│   ├── services/            # Serviços da API
│   ├── styles/              # Estilos globais
│   ├── utils/               # Utilitários e helpers
│   ├── App.jsx              # Componente principal
│   └── main.jsx             # Ponto de entrada
├── package.json
├── vite.config.js
├── tailwind.config.js
└── README.md
```

## 🛠️ Instalação e Configuração

### Pré-requisitos

- Node.js 16+ 
- npm ou yarn
- Backend da API rodando

### Instalação

1. **Clone o repositório e navegue para o frontend:**
```bash
cd frontend
```

2. **Instale as dependências:**
```bash
npm install
```

3. **Configure as variáveis de ambiente:**
```bash
# Crie um arquivo .env na raiz do frontend
cp .env.example .env
```

4. **Configure as variáveis no .env:**
```env
VITE_API_URL=http://localhost:3001/api
VITE_APP_NAME=Igreja Admin
VITE_APP_VERSION=1.0.0
```

### Executar em Desenvolvimento

```bash
npm run dev
```

A aplicação estará disponível em `http://localhost:3000`

### Build para Produção

```bash
npm run build
```

### Preview da Build

```bash
npm run preview
```

## 🎨 Design System

### Cores Principais

- **Primary**: Azul (#0ea5e9)
- **Secondary**: Roxo (#a855f7)
- **Success**: Verde (#22c55e)
- **Warning**: Amarelo (#f59e0b)
- **Danger**: Vermelho (#ef4444)

### Componentes Base

- **Botões**: `btn`, `btn-primary`, `btn-secondary`, `btn-success`, `btn-danger`
- **Cards**: `card`, `card-header`, `card-body`, `card-footer`
- **Inputs**: `input`, `label`, `form-group`
- **Tabelas**: `table`, `table-responsive`
- **Badges**: `badge`, `badge-success`, `badge-warning`, `badge-danger`

## 📱 Funcionalidades

### ✅ Implementadas

- [x] **Sistema de Autenticação**
  - Login com email/senha
  - Proteção de rotas
  - Gerenciamento de tokens
  - Logout automático

- [x] **Layout Responsivo**
  - Header com perfil do usuário
  - Sidebar colapsável
  - Design mobile-first
  - Navegação intuitiva

- [x] **Dashboard**
  - Cards de estatísticas
  - Gráficos de receitas vs despesas
  - Lista de transações recentes
  - Aniversariantes do mês
  - Ações rápidas

- [x] **Componentes Base**
  - Loading states
  - Modais de confirmação
  - Formulários validados
  - Tabelas responsivas
  - Notificações toast

### 🚧 Em Desenvolvimento

- [ ] **Gestão de Membros**
  - Lista de membros com filtros
  - Formulário de cadastro
  - Perfil detalhado
  - Histórico de atividades

- [ ] **Gestão Financeira**
  - Registro de receitas/despesas
  - Categorização de transações
  - Relatórios financeiros
  - Exportação de dados

- [ ] **Relatórios Avançados**
  - Gráficos interativos
  - Análises temporais
  - Comparativos
  - Dashboards personalizados

## 🔧 Configurações

### Tailwind CSS

O projeto usa Tailwind CSS com configurações customizadas:

- **Cores personalizadas** para o tema da igreja
- **Componentes utilitários** para consistência
- **Responsividade** mobile-first
- **Animações** suaves

### React Query

Configuração para cache e sincronização:

- **Cache inteligente** com TTL configurável
- **Retry automático** em caso de falhas
- **Background refetch** para dados atualizados
- **Otimistic updates** para melhor UX

### Formulários

Validação com React Hook Form + Yup:

- **Validação em tempo real**
- **Mensagens de erro** em português
- **Máscaras de input** para CPF, telefone, CEP
- **Debounce** para performance

## 📊 Estado da Aplicação

### Contextos

- **AuthContext**: Gerenciamento de autenticação
- **AppContext**: Estado global da aplicação

### Hooks Customizados

- **useAuth**: Hook para autenticação
- **useApp**: Hook para estado global
- **usePermissions**: Hook para verificar permissões

## 🚀 Deploy

### Variáveis de Ambiente de Produção

```env
VITE_API_URL=https://api.igreja.com/api
VITE_APP_NAME=Igreja Admin
VITE_APP_VERSION=1.0.0
```

### Build Otimizado

```bash
npm run build
```

O build será gerado na pasta `dist/` com:
- Código minificado
- Assets otimizados
- Source maps para debug
- Cache busting automático

## 🧪 Testes

```bash
# Executar testes
npm run test

# Testes com coverage
npm run test:coverage

# Testes em modo watch
npm run test:watch
```

## 📝 Scripts Disponíveis

- `npm run dev` - Servidor de desenvolvimento
- `npm run build` - Build de produção
- `npm run preview` - Preview da build
- `npm run lint` - Linting do código
- `npm run test` - Executar testes

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 📞 Suporte

Para suporte ou dúvidas:

- **Email**: suporte@igreja.com
- **Documentação**: [Wiki do projeto]
- **Issues**: [GitHub Issues]

---

**Desenvolvido com ❤️ para administração de igrejas**
