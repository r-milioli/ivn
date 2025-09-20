// Formatadores para exibição de dados

/**
 * Formatar valor monetário em reais
 */
export const formatCurrency = (value, options = {}) => {
  const {
    locale = 'pt-BR',
    currency = 'BRL',
    minimumFractionDigits = 2,
    maximumFractionDigits = 2,
    showSymbol = true
  } = options

  if (value === null || value === undefined || isNaN(value)) {
    return 'R$ 0,00'
  }

  const numericValue = typeof value === 'string' ? parseFloat(value) : value

  const formatter = new Intl.NumberFormat(locale, {
    style: showSymbol ? 'currency' : 'decimal',
    currency,
    minimumFractionDigits,
    maximumFractionDigits
  })

  return formatter.format(numericValue)
}

/**
 * Formatar data em português brasileiro
 */
export const formatDate = (date, options = {}) => {
  const {
    locale = 'pt-BR',
    format = 'short', // short, medium, long, full
    includeTime = false
  } = options

  if (!date) return ''

  const dateObj = date instanceof Date ? date : new Date(date)

  if (isNaN(dateObj.getTime())) {
    return 'Data inválida'
  }

  const formatOptions = {
    short: { day: '2-digit', month: '2-digit', year: 'numeric' },
    medium: { day: '2-digit', month: 'short', year: 'numeric' },
    long: { day: '2-digit', month: 'long', year: 'numeric' },
    full: { 
      weekday: 'long', 
      day: '2-digit', 
      month: 'long', 
      year: 'numeric' 
    }
  }

  const dateFormat = {
    ...formatOptions[format],
    ...(includeTime && {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return dateObj.toLocaleDateString(locale, dateFormat)
}

/**
 * Formatar data relativa (ex: "há 2 dias")
 */
export const formatRelativeDate = (date) => {
  if (!date) return ''

  const dateObj = date instanceof Date ? date : new Date(date)
  const now = new Date()
  const diffInMs = now - dateObj
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

  if (diffInDays === 0) {
    return 'Hoje'
  } else if (diffInDays === 1) {
    return 'Ontem'
  } else if (diffInDays < 7) {
    return `Há ${diffInDays} dias`
  } else if (diffInDays < 30) {
    const weeks = Math.floor(diffInDays / 7)
    return `Há ${weeks} semana${weeks > 1 ? 's' : ''}`
  } else if (diffInDays < 365) {
    const months = Math.floor(diffInDays / 30)
    return `Há ${months} mês${months > 1 ? 'es' : ''}`
  } else {
    const years = Math.floor(diffInDays / 365)
    return `Há ${years} ano${years > 1 ? 's' : ''}`
  }
}

/**
 * Formatar número com separadores de milhares
 */
export const formatNumber = (value, options = {}) => {
  const {
    locale = 'pt-BR',
    minimumFractionDigits = 0,
    maximumFractionDigits = 2
  } = options

  if (value === null || value === undefined || isNaN(value)) {
    return '0'
  }

  const numericValue = typeof value === 'string' ? parseFloat(value) : value

  return numericValue.toLocaleString(locale, {
    minimumFractionDigits,
    maximumFractionDigits
  })
}

/**
 * Formatar porcentagem
 */
export const formatPercentage = (value, options = {}) => {
  const {
    locale = 'pt-BR',
    minimumFractionDigits = 0,
    maximumFractionDigits = 1
  } = options

  if (value === null || value === undefined || isNaN(value)) {
    return '0%'
  }

  const numericValue = typeof value === 'string' ? parseFloat(value) : value

  return numericValue.toLocaleString(locale, {
    style: 'percent',
    minimumFractionDigits,
    maximumFractionDigits
  })
}

/**
 * Formatar telefone brasileiro
 */
export const formatPhone = (phone) => {
  if (!phone) return ''

  // Remove todos os caracteres não numéricos
  const numbers = phone.replace(/\D/g, '')

  // Formatar baseado no tamanho
  if (numbers.length === 11) {
    // Celular: (XX) 9XXXX-XXXX
    return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
  } else if (numbers.length === 10) {
    // Fixo: (XX) XXXX-XXXX
    return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
  }

  return phone
}

/**
 * Formatar CPF
 */
export const formatCPF = (cpf) => {
  if (!cpf) return ''

  const numbers = cpf.replace(/\D/g, '')
  
  if (numbers.length === 11) {
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
  }

  return cpf
}

/**
 * Formatar CEP
 */
export const formatCEP = (cep) => {
  if (!cep) return ''

  const numbers = cep.replace(/\D/g, '')
  
  if (numbers.length === 8) {
    return numbers.replace(/(\d{5})(\d{3})/, '$1-$2')
  }

  return cep
}

/**
 * Formatar nome com inicial maiúscula
 */
export const formatName = (name) => {
  if (!name) return ''

  return name
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

/**
 * Formatar status de membro
 */
export const formatMemberStatus = (status) => {
  const statusMap = {
    active: { label: 'Ativo', color: 'success' },
    inactive: { label: 'Inativo', color: 'danger' },
    pending: { label: 'Pendente', color: 'warning' },
    suspended: { label: 'Suspenso', color: 'danger' }
  }

  return statusMap[status] || { label: status, color: 'gray' }
}

/**
 * Formatar tipo de transação
 */
export const formatTransactionType = (type) => {
  const typeMap = {
    income: { label: 'Receita', color: 'success', icon: '↗' },
    expense: { label: 'Despesa', color: 'danger', icon: '↙' },
    transfer: { label: 'Transferência', color: 'warning', icon: '↔' }
  }

  return typeMap[type] || { label: type, color: 'gray', icon: '?' }
}

/**
 * Formatar categoria de transação
 */
export const formatTransactionCategory = (category) => {
  const categoryMap = {
    tithe: 'Dízimo',
    offering: 'Oferta',
    donation: 'Doação',
    utility: 'Utilidades',
    maintenance: 'Manutenção',
    salary: 'Salários',
    equipment: 'Equipamentos',
    marketing: 'Marketing',
    mission: 'Missões',
    other: 'Outros'
  }

  return categoryMap[category] || category
}

/**
 * Formatar role de usuário
 */
export const formatUserRole = (role) => {
  const roleMap = {
    admin: 'Administrador',
    secretary: 'Secretário',
    treasurer: 'Tesoureiro',
    pastor: 'Pastor'
  }

  return roleMap[role] || role
}

/**
 * Truncar texto com reticências
 */
export const truncateText = (text, maxLength = 50) => {
  if (!text) return ''
  
  if (text.length <= maxLength) return text
  
  return text.substring(0, maxLength) + '...'
}

/**
 * Formatar tamanho de arquivo
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * Formatar idade baseada na data de nascimento
 */
export const formatAge = (birthDate) => {
  if (!birthDate) return ''

  const birth = new Date(birthDate)
  const today = new Date()
  
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }

  return `${age} anos`
}

/**
 * Formatar período (ex: "Jan 2024")
 */
export const formatPeriod = (date) => {
  if (!date) return ''

  const dateObj = date instanceof Date ? date : new Date(date)
  
  return dateObj.toLocaleDateString('pt-BR', {
    month: 'short',
    year: 'numeric'
  })
}

/**
 * Formatar horário
 */
export const formatTime = (date) => {
  if (!date) return ''

  const dateObj = date instanceof Date ? date : new Date(date)
  
  return dateObj.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

/**
 * Formatar endereço completo
 */
export const formatAddress = (address) => {
  if (!address) return ''

  const parts = []
  
  if (address.street) parts.push(address.street)
  if (address.number) parts.push(address.number)
  if (address.complement) parts.push(address.complement)
  if (address.neighborhood) parts.push(address.neighborhood)
  if (address.city) parts.push(address.city)
  if (address.state) parts.push(address.state)
  if (address.zipCode) parts.push(formatCEP(address.zipCode))

  return parts.join(', ')
}
