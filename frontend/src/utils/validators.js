// Validadores para formulários e dados

/**
 * Validar email
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i
  return emailRegex.test(email)
}

/**
 * Validar CPF
 */
export const isValidCPF = (cpf) => {
  // Remove caracteres não numéricos
  const numbers = cpf.replace(/\D/g, '')
  
  // Verifica se tem 11 dígitos
  if (numbers.length !== 11) return false
  
  // Verifica se não são todos iguais
  if (/^(\d)\1{10}$/.test(numbers)) return false
  
  // Validação do primeiro dígito verificador
  let sum = 0
  for (let i = 0; i < 9; i++) {
    sum += parseInt(numbers.charAt(i)) * (10 - i)
  }
  let remainder = (sum * 10) % 11
  if (remainder === 10 || remainder === 11) remainder = 0
  if (remainder !== parseInt(numbers.charAt(9))) return false
  
  // Validação do segundo dígito verificador
  sum = 0
  for (let i = 0; i < 10; i++) {
    sum += parseInt(numbers.charAt(i)) * (11 - i)
  }
  remainder = (sum * 10) % 11
  if (remainder === 10 || remainder === 11) remainder = 0
  if (remainder !== parseInt(numbers.charAt(10))) return false
  
  return true
}

/**
 * Validar CNPJ
 */
export const isValidCNPJ = (cnpj) => {
  // Remove caracteres não numéricos
  const numbers = cnpj.replace(/\D/g, '')
  
  // Verifica se tem 14 dígitos
  if (numbers.length !== 14) return false
  
  // Verifica se não são todos iguais
  if (/^(\d)\1{13}$/.test(numbers)) return false
  
  // Validação do primeiro dígito verificador
  let sum = 0
  let weight = 2
  for (let i = 11; i >= 0; i--) {
    sum += parseInt(numbers.charAt(i)) * weight
    weight = weight === 9 ? 2 : weight + 1
  }
  let remainder = sum % 11
  const firstDigit = remainder < 2 ? 0 : 11 - remainder
  if (firstDigit !== parseInt(numbers.charAt(12))) return false
  
  // Validação do segundo dígito verificador
  sum = 0
  weight = 2
  for (let i = 12; i >= 0; i--) {
    sum += parseInt(numbers.charAt(i)) * weight
    weight = weight === 9 ? 2 : weight + 1
  }
  remainder = sum % 11
  const secondDigit = remainder < 2 ? 0 : 11 - remainder
  if (secondDigit !== parseInt(numbers.charAt(13))) return false
  
  return true
}

/**
 * Validar telefone brasileiro
 */
export const isValidPhone = (phone) => {
  // Remove caracteres não numéricos
  const numbers = phone.replace(/\D/g, '')
  
  // Aceita telefones com 10 ou 11 dígitos
  return numbers.length === 10 || numbers.length === 11
}

/**
 * Validar CEP brasileiro
 */
export const isValidCEP = (cep) => {
  // Remove caracteres não numéricos
  const numbers = cep.replace(/\D/g, '')
  
  // CEP deve ter 8 dígitos
  return numbers.length === 8
}

/**
 * Validar senha forte
 */
export const isValidPassword = (password, options = {}) => {
  const {
    minLength = 6,
    requireUppercase = false,
    requireLowercase = false,
    requireNumbers = false,
    requireSpecialChars = false
  } = options
  
  if (!password || password.length < minLength) {
    return { isValid: false, message: `Senha deve ter pelo menos ${minLength} caracteres` }
  }
  
  if (requireUppercase && !/[A-Z]/.test(password)) {
    return { isValid: false, message: 'Senha deve conter pelo menos uma letra maiúscula' }
  }
  
  if (requireLowercase && !/[a-z]/.test(password)) {
    return { isValid: false, message: 'Senha deve conter pelo menos uma letra minúscula' }
  }
  
  if (requireNumbers && !/\d/.test(password)) {
    return { isValid: false, message: 'Senha deve conter pelo menos um número' }
  }
  
  if (requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return { isValid: false, message: 'Senha deve conter pelo menos um caractere especial' }
  }
  
  return { isValid: true, message: 'Senha válida' }
}

/**
 * Validar data
 */
export const isValidDate = (date) => {
  if (!date) return false
  
  const dateObj = date instanceof Date ? date : new Date(date)
  return !isNaN(dateObj.getTime())
}

/**
 * Validar data futura
 */
export const isFutureDate = (date) => {
  if (!isValidDate(date)) return false
  
  const dateObj = date instanceof Date ? date : new Date(date)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  return dateObj > today
}

/**
 * Validar data passada
 */
export const isPastDate = (date) => {
  if (!isValidDate(date)) return false
  
  const dateObj = date instanceof Date ? date : new Date(date)
  const today = new Date()
  today.setHours(23, 59, 59, 999)
  
  return dateObj < today
}

/**
 * Validar idade mínima
 */
export const isValidAge = (birthDate, minAge = 0, maxAge = 150) => {
  if (!isValidDate(birthDate)) return false
  
  const birth = new Date(birthDate)
  const today = new Date()
  
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  
  return age >= minAge && age <= maxAge
}

/**
 * Validar valor monetário
 */
export const isValidCurrency = (value) => {
  if (value === null || value === undefined || value === '') return false
  
  const numericValue = parseFloat(value)
  return !isNaN(numericValue) && numericValue >= 0
}

/**
 * Validar número positivo
 */
export const isPositiveNumber = (value) => {
  if (value === null || value === undefined || value === '') return false
  
  const numericValue = parseFloat(value)
  return !isNaN(numericValue) && numericValue > 0
}

/**
 * Validar número inteiro
 */
export const isInteger = (value) => {
  if (value === null || value === undefined || value === '') return false
  
  const numericValue = parseFloat(value)
  return !isNaN(numericValue) && Number.isInteger(numericValue)
}

/**
 * Validar URL
 */
export const isValidURL = (url) => {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

/**
 * Validar arquivo por tipo
 */
export const isValidFileType = (file, allowedTypes = []) => {
  if (!file || !allowedTypes.length) return false
  
  const fileType = file.type
  const fileName = file.name.toLowerCase()
  
  return allowedTypes.some(type => {
    if (type.startsWith('.')) {
      return fileName.endsWith(type)
    }
    return fileType.includes(type)
  })
}

/**
 * Validar tamanho de arquivo
 */
export const isValidFileSize = (file, maxSizeInMB = 5) => {
  if (!file) return false
  
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024
  return file.size <= maxSizeInBytes
}

/**
 * Validar nome (pelo menos 2 palavras)
 */
export const isValidFullName = (name) => {
  if (!name || typeof name !== 'string') return false
  
  const words = name.trim().split(/\s+/)
  return words.length >= 2 && words.every(word => word.length >= 2)
}

/**
 * Validar campo obrigatório
 */
export const isRequired = (value) => {
  if (value === null || value === undefined) return false
  if (typeof value === 'string') return value.trim().length > 0
  if (Array.isArray(value)) return value.length > 0
  return true
}

/**
 * Validar tamanho mínimo de string
 */
export const hasMinLength = (value, minLength) => {
  if (!value || typeof value !== 'string') return false
  return value.trim().length >= minLength
}

/**
 * Validar tamanho máximo de string
 */
export const hasMaxLength = (value, maxLength) => {
  if (!value || typeof value !== 'string') return true
  return value.trim().length <= maxLength
}

/**
 * Validar se valor está em uma lista
 */
export const isInList = (value, list) => {
  return list.includes(value)
}

/**
 * Validar formato de hora (HH:MM)
 */
export const isValidTime = (time) => {
  if (!time || typeof time !== 'string') return false
  
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
  return timeRegex.test(time)
}

/**
 * Validar se uma data está em um período
 */
export const isDateInRange = (date, startDate, endDate) => {
  if (!isValidDate(date) || !isValidDate(startDate) || !isValidDate(endDate)) {
    return false
  }
  
  const dateObj = date instanceof Date ? date : new Date(date)
  const start = startDate instanceof Date ? startDate : new Date(startDate)
  const end = endDate instanceof Date ? endDate : new Date(endDate)
  
  return dateObj >= start && dateObj <= end
}

/**
 * Combinar múltiplas validações
 */
export const validateField = (value, validators = []) => {
  for (const validator of validators) {
    const result = validator(value)
    if (!result.isValid) {
      return result
    }
  }
  
  return { isValid: true, message: '' }
}

/**
 * Validar formulário completo
 */
export const validateForm = (data, schema) => {
  const errors = {}
  let isValid = true
  
  for (const [field, validators] of Object.entries(schema)) {
    const fieldValue = data[field]
    const result = validateField(fieldValue, validators)
    
    if (!result.isValid) {
      errors[field] = result.message
      isValid = false
    }
  }
  
  return { isValid, errors }
}
