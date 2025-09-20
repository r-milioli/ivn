// Constantes do sistema

/**
 * Roles de usuário
 */
export const USER_ROLES = {
  ADMIN: 'admin',
  SECRETARY: 'secretary',
  TREASURER: 'treasurer',
  PASTOR: 'pastor'
}

/**
 * Labels das roles
 */
export const USER_ROLE_LABELS = {
  [USER_ROLES.ADMIN]: 'Administrador',
  [USER_ROLES.SECRETARY]: 'Secretário',
  [USER_ROLES.TREASURER]: 'Tesoureiro',
  [USER_ROLES.PASTOR]: 'Pastor'
}

/**
 * Status de membros
 */
export const MEMBER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  PENDING: 'pending',
  SUSPENDED: 'suspended'
}

/**
 * Labels dos status de membros
 */
export const MEMBER_STATUS_LABELS = {
  [MEMBER_STATUS.ACTIVE]: 'Ativo',
  [MEMBER_STATUS.INACTIVE]: 'Inativo',
  [MEMBER_STATUS.PENDING]: 'Pendente',
  [MEMBER_STATUS.SUSPENDED]: 'Suspenso'
}

/**
 * Cores dos status de membros
 */
export const MEMBER_STATUS_COLORS = {
  [MEMBER_STATUS.ACTIVE]: 'success',
  [MEMBER_STATUS.INACTIVE]: 'danger',
  [MEMBER_STATUS.PENDING]: 'warning',
  [MEMBER_STATUS.SUSPENDED]: 'danger'
}

/**
 * Tipos de transação
 */
export const TRANSACTION_TYPES = {
  INCOME: 'income',
  EXPENSE: 'expense',
  TRANSFER: 'transfer'
}

/**
 * Labels dos tipos de transação
 */
export const TRANSACTION_TYPE_LABELS = {
  [TRANSACTION_TYPES.INCOME]: 'Receita',
  [TRANSACTION_TYPES.EXPENSE]: 'Despesa',
  [TRANSACTION_TYPES.TRANSFER]: 'Transferência'
}

/**
 * Cores dos tipos de transação
 */
export const TRANSACTION_TYPE_COLORS = {
  [TRANSACTION_TYPES.INCOME]: 'success',
  [TRANSACTION_TYPES.EXPENSE]: 'danger',
  [TRANSACTION_TYPES.TRANSFER]: 'warning'
}

/**
 * Categorias de receita
 */
export const INCOME_CATEGORIES = {
  TITHE: 'tithe',
  OFFERING: 'offering',
  DONATION: 'donation',
  EVENT: 'event',
  COURSE: 'course',
  RENT: 'rent',
  INVESTMENT: 'investment',
  OTHER: 'other'
}

/**
 * Labels das categorias de receita
 */
export const INCOME_CATEGORY_LABELS = {
  [INCOME_CATEGORIES.TITHE]: 'Dízimo',
  [INCOME_CATEGORIES.OFFERING]: 'Oferta',
  [INCOME_CATEGORIES.DONATION]: 'Doação',
  [INCOME_CATEGORIES.EVENT]: 'Eventos',
  [INCOME_CATEGORIES.COURSE]: 'Cursos',
  [INCOME_CATEGORIES.RENT]: 'Aluguel',
  [INCOME_CATEGORIES.INVESTMENT]: 'Investimentos',
  [INCOME_CATEGORIES.OTHER]: 'Outros'
}

/**
 * Categorias de despesa
 */
export const EXPENSE_CATEGORIES = {
  UTILITY: 'utility',
  MAINTENANCE: 'maintenance',
  SALARY: 'salary',
  EQUIPMENT: 'equipment',
  MARKETING: 'marketing',
  MISSION: 'mission',
  FOOD: 'food',
  CLEANING: 'cleaning',
  SECURITY: 'security',
  INSURANCE: 'insurance',
  OTHER: 'other'
}

/**
 * Labels das categorias de despesa
 */
export const EXPENSE_CATEGORY_LABELS = {
  [EXPENSE_CATEGORIES.UTILITY]: 'Utilidades',
  [EXPENSE_CATEGORIES.MAINTENANCE]: 'Manutenção',
  [EXPENSE_CATEGORIES.SALARY]: 'Salários',
  [EXPENSE_CATEGORIES.EQUIPMENT]: 'Equipamentos',
  [EXPENSE_CATEGORIES.MARKETING]: 'Marketing',
  [EXPENSE_CATEGORIES.MISSION]: 'Missões',
  [EXPENSE_CATEGORIES.FOOD]: 'Alimentação',
  [EXPENSE_CATEGORIES.CLEANING]: 'Limpeza',
  [EXPENSE_CATEGORIES.SECURITY]: 'Segurança',
  [EXPENSE_CATEGORIES.INSURANCE]: 'Seguros',
  [EXPENSE_CATEGORIES.OTHER]: 'Outros'
}

/**
 * Métodos de pagamento
 */
export const PAYMENT_METHODS = {
  CASH: 'cash',
  PIX: 'pix',
  BANK_TRANSFER: 'bank_transfer',
  CREDIT_CARD: 'credit_card',
  DEBIT_CARD: 'debit_card',
  CHECK: 'check',
  OTHER: 'other'
}

/**
 * Labels dos métodos de pagamento
 */
export const PAYMENT_METHOD_LABELS = {
  [PAYMENT_METHODS.CASH]: 'Dinheiro',
  [PAYMENT_METHODS.PIX]: 'PIX',
  [PAYMENT_METHODS.BANK_TRANSFER]: 'Transferência Bancária',
  [PAYMENT_METHODS.CREDIT_CARD]: 'Cartão de Crédito',
  [PAYMENT_METHODS.DEBIT_CARD]: 'Cartão de Débito',
  [PAYMENT_METHODS.CHECK]: 'Cheque',
  [PAYMENT_METHODS.OTHER]: 'Outros'
}

/**
 * Estados brasileiros
 */
export const BRAZILIAN_STATES = [
  { value: 'AC', label: 'Acre' },
  { value: 'AL', label: 'Alagoas' },
  { value: 'AP', label: 'Amapá' },
  { value: 'AM', label: 'Amazonas' },
  { value: 'BA', label: 'Bahia' },
  { value: 'CE', label: 'Ceará' },
  { value: 'DF', label: 'Distrito Federal' },
  { value: 'ES', label: 'Espírito Santo' },
  { value: 'GO', label: 'Goiás' },
  { value: 'MA', label: 'Maranhão' },
  { value: 'MT', label: 'Mato Grosso' },
  { value: 'MS', label: 'Mato Grosso do Sul' },
  { value: 'MG', label: 'Minas Gerais' },
  { value: 'PA', label: 'Pará' },
  { value: 'PB', label: 'Paraíba' },
  { value: 'PR', label: 'Paraná' },
  { value: 'PE', label: 'Pernambuco' },
  { value: 'PI', label: 'Piauí' },
  { value: 'RJ', label: 'Rio de Janeiro' },
  { value: 'RN', label: 'Rio Grande do Norte' },
  { value: 'RS', label: 'Rio Grande do Sul' },
  { value: 'RO', label: 'Rondônia' },
  { value: 'RR', label: 'Roraima' },
  { value: 'SC', label: 'Santa Catarina' },
  { value: 'SP', label: 'São Paulo' },
  { value: 'SE', label: 'Sergipe' },
  { value: 'TO', label: 'Tocantins' }
]

/**
 * Meses do ano
 */
export const MONTHS = [
  { value: 1, label: 'Janeiro' },
  { value: 2, label: 'Fevereiro' },
  { value: 3, label: 'Março' },
  { value: 4, label: 'Abril' },
  { value: 5, label: 'Maio' },
  { value: 6, label: 'Junho' },
  { value: 7, label: 'Julho' },
  { value: 8, label: 'Agosto' },
  { value: 9, label: 'Setembro' },
  { value: 10, label: 'Outubro' },
  { value: 11, label: 'Novembro' },
  { value: 12, label: 'Dezembro' }
]

/**
 * Dias da semana
 */
export const WEEK_DAYS = [
  { value: 0, label: 'Domingo', short: 'Dom' },
  { value: 1, label: 'Segunda-feira', short: 'Seg' },
  { value: 2, label: 'Terça-feira', short: 'Ter' },
  { value: 3, label: 'Quarta-feira', short: 'Qua' },
  { value: 4, label: 'Quinta-feira', short: 'Qui' },
  { value: 5, label: 'Sexta-feira', short: 'Sex' },
  { value: 6, label: 'Sábado', short: 'Sáb' }
]

/**
 * Configurações de paginação
 */
export const PAGINATION_CONFIG = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [5, 10, 25, 50, 100],
  MAX_PAGE_SIZE: 100
}

/**
 * Configurações de upload
 */
export const UPLOAD_CONFIG = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  ALLOWED_DOCUMENT_TYPES: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ]
}

/**
 * Configurações de notificação
 */
export const NOTIFICATION_CONFIG = {
  DEFAULT_DURATION: 5000,
  SUCCESS_DURATION: 3000,
  ERROR_DURATION: 8000,
  WARNING_DURATION: 6000
}

/**
 * Configurações de sessão
 */
export const SESSION_CONFIG = {
  TOKEN_REFRESH_THRESHOLD: 5 * 60 * 1000, // 5 minutos
  INACTIVITY_TIMEOUT: 30 * 60 * 1000, // 30 minutos
  MAX_SESSION_DURATION: 24 * 60 * 60 * 1000 // 24 horas
}

/**
 * URLs da API
 */
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    PROFILE: '/auth/profile',
    USERS: '/auth/users'
  },
  MEMBERS: {
    LIST: '/members',
    CREATE: '/members',
    GET: '/members/:id',
    UPDATE: '/members/:id',
    DELETE: '/members/:id',
    STATISTICS: '/members/statistics'
  },
  TRANSACTIONS: {
    LIST: '/transactions',
    CREATE: '/transactions',
    GET: '/transactions/:id',
    UPDATE: '/transactions/:id',
    DELETE: '/transactions/:id',
    STATISTICS: '/transactions/statistics'
  },
  REPORTS: {
    FINANCIAL: '/reports/financial',
    MEMBERS: '/reports/members',
    EXPORT: '/reports/export'
  }
}

/**
 * Configurações de tema
 */
export const THEME_CONFIG = {
  DEFAULT_THEME: 'light',
  THEMES: ['light', 'dark'],
  STORAGE_KEY: 'theme_preference'
}

/**
 * Configurações de idioma
 */
export const LANGUAGE_CONFIG = {
  DEFAULT_LANGUAGE: 'pt-BR',
  LANGUAGES: [
    { value: 'pt-BR', label: 'Português (Brasil)' },
    { value: 'en-US', label: 'English (US)' }
  ],
  STORAGE_KEY: 'language_preference'
}

/**
 * Configurações de sidebar
 */
export const SIDEBAR_CONFIG = {
  STORAGE_KEY: 'sidebar_collapsed',
  BREAKPOINT: 'lg', // Tailwind breakpoint
  WIDTH: {
    EXPANDED: 280,
    COLLAPSED: 80
  }
}

/**
 * Configurações de dashboard
 */
export const DASHBOARD_CONFIG = {
  REFRESH_INTERVAL: 5 * 60 * 1000, // 5 minutos
  CHART_ANIMATION_DURATION: 1000,
  MAX_RECENT_ITEMS: 10
}

/**
 * Configurações de formulário
 */
export const FORM_CONFIG = {
  DEBOUNCE_DELAY: 300,
  AUTO_SAVE_DELAY: 2000,
  MAX_RETRIES: 3
}

/**
 * Configurações de busca
 */
export const SEARCH_CONFIG = {
  MIN_QUERY_LENGTH: 2,
  DEBOUNCE_DELAY: 500,
  MAX_RESULTS: 50,
  HIGHLIGHT_TAG: 'mark'
}

/**
 * Configurações de exportação
 */
export const EXPORT_CONFIG = {
  FORMATS: ['xlsx', 'csv', 'pdf'],
  DEFAULT_FORMAT: 'xlsx',
  MAX_RECORDS: 10000
}

/**
 * Mensagens do sistema
 */
export const SYSTEM_MESSAGES = {
  SUCCESS: {
    SAVED: 'Dados salvos com sucesso!',
    UPDATED: 'Dados atualizados com sucesso!',
    DELETED: 'Item removido com sucesso!',
    CREATED: 'Item criado com sucesso!'
  },
  ERROR: {
    GENERIC: 'Ocorreu um erro inesperado. Tente novamente.',
    NETWORK: 'Erro de conexão. Verifique sua internet.',
    UNAUTHORIZED: 'Você não tem permissão para esta ação.',
    NOT_FOUND: 'Item não encontrado.',
    VALIDATION: 'Por favor, verifique os dados informados.'
  },
  WARNING: {
    UNSAVED_CHANGES: 'Você tem alterações não salvas. Deseja continuar?',
    DELETE_CONFIRMATION: 'Tem certeza que deseja excluir este item?',
    SESSION_EXPIRING: 'Sua sessão expirará em breve.'
  },
  INFO: {
    NO_DATA: 'Nenhum dado encontrado.',
    LOADING: 'Carregando dados...',
    SEARCHING: 'Buscando...'
  }
}

/**
 * Configurações de validação
 */
export const VALIDATION_CONFIG = {
  PASSWORD: {
    MIN_LENGTH: 6,
    REQUIRE_UPPERCASE: false,
    REQUIRE_LOWERCASE: false,
    REQUIRE_NUMBERS: false,
    REQUIRE_SPECIAL_CHARS: false
  },
  NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 100
  },
  EMAIL: {
    MAX_LENGTH: 255
  },
  PHONE: {
    MIN_LENGTH: 10,
    MAX_LENGTH: 11
  }
}

/**
 * Configurações de cache
 */
export const CACHE_CONFIG = {
  DEFAULT_TTL: 5 * 60 * 1000, // 5 minutos
  USER_DATA_TTL: 15 * 60 * 1000, // 15 minutos
  STATISTICS_TTL: 10 * 60 * 1000, // 10 minutos
  REPORTS_TTL: 30 * 60 * 1000 // 30 minutos
}

export default {
  USER_ROLES,
  USER_ROLE_LABELS,
  MEMBER_STATUS,
  MEMBER_STATUS_LABELS,
  MEMBER_STATUS_COLORS,
  TRANSACTION_TYPES,
  TRANSACTION_TYPE_LABELS,
  TRANSACTION_TYPE_COLORS,
  INCOME_CATEGORIES,
  INCOME_CATEGORY_LABELS,
  EXPENSE_CATEGORIES,
  EXPENSE_CATEGORY_LABELS,
  PAYMENT_METHODS,
  PAYMENT_METHOD_LABELS,
  BRAZILIAN_STATES,
  MONTHS,
  WEEK_DAYS,
  PAGINATION_CONFIG,
  UPLOAD_CONFIG,
  NOTIFICATION_CONFIG,
  SESSION_CONFIG,
  API_ENDPOINTS,
  THEME_CONFIG,
  LANGUAGE_CONFIG,
  SIDEBAR_CONFIG,
  DASHBOARD_CONFIG,
  FORM_CONFIG,
  SEARCH_CONFIG,
  EXPORT_CONFIG,
  SYSTEM_MESSAGES,
  VALIDATION_CONFIG,
  CACHE_CONFIG
}
