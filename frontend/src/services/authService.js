import api from './api'

// Serviço de autenticação
export const authService = {
  // Fazer login
  async login(credentials) {
    try {
      const response = await api.post('/auth/login', credentials)
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Fazer logout
  async logout() {
    try {
      await api.post('/auth/logout')
    } catch (error) {
      // Mesmo se der erro na API, consideramos logout bem-sucedido
      console.warn('Erro no logout da API:', error)
    }
  },

  // Renovar token
  async refreshToken(refreshToken) {
    try {
      const response = await api.post('/auth/refresh', { refreshToken })
      return response.data.tokens
    } catch (error) {
      throw error
    }
  },

  // Obter usuário atual
  async getCurrentUser() {
    try {
      const response = await api.get('/auth/profile')
      return response.data.data
    } catch (error) {
      throw error
    }
  },

  // Atualizar perfil
  async updateProfile(userData) {
    try {
      const response = await api.put('/auth/profile', userData)
      return response.data.data
    } catch (error) {
      throw error
    }
  },

  // Alterar senha
  async changePassword(passwordData) {
    try {
      const response = await api.put('/auth/change-password', passwordData)
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Verificar se token é válido
  async verifyToken(token) {
    try {
      const response = await api.get('/auth/profile', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      return response.status === 200
    } catch (error) {
      return false
    }
  },

  // Verificar se email está disponível
  async checkEmail(email) {
    try {
      const response = await api.get(`/auth/check-email/${email}`)
      return response.data.data.available
    } catch (error) {
      throw error
    }
  },

  // Obter estatísticas de usuários (apenas admin)
  async getUserStatistics() {
    try {
      const response = await api.get('/auth/statistics')
      return response.data.data
    } catch (error) {
      throw error
    }
  },

  // Listar usuários (apenas admin)
  async listUsers(params = {}) {
    try {
      const response = await api.get('/auth/users', { params })
      return response.data.data
    } catch (error) {
      throw error
    }
  },

  // Criar usuário (apenas admin)
  async createUser(userData) {
    try {
      const response = await api.post('/auth/users', userData)
      return response.data.data
    } catch (error) {
      throw error
    }
  },

  // Obter usuário por ID (apenas admin)
  async getUserById(userId) {
    try {
      const response = await api.get(`/auth/users/${userId}`)
      return response.data.data
    } catch (error) {
      throw error
    }
  },

  // Atualizar usuário por ID (apenas admin)
  async updateUserById(userId, userData) {
    try {
      const response = await api.put(`/auth/users/${userId}`, userData)
      return response.data.data
    } catch (error) {
      throw error
    }
  },

  // Deletar usuário por ID (apenas admin)
  async deleteUserById(userId) {
    try {
      await api.delete(`/auth/users/${userId}`)
      return true
    } catch (error) {
      throw error
    }
  },

  // Alterar senha de usuário por ID (apenas admin)
  async changeUserPassword(userId, newPassword) {
    try {
      const response = await api.put(`/auth/users/${userId}/password`, { newPassword })
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Recuperar senha (implementação futura)
  async forgotPassword(email) {
    try {
      const response = await api.post('/auth/forgot-password', { email })
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Redefinir senha (implementação futura)
  async resetPassword(token, newPassword) {
    try {
      const response = await api.post('/auth/reset-password', {
        token,
        newPassword
      })
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Verificar se usuário tem permissão
  hasPermission(user, requiredRole) {
    if (!user) return false

    switch (requiredRole) {
      case 'admin':
        return user.role === 'admin'
      case 'admin_or_secretary':
        return ['admin', 'secretary'].includes(user.role)
      case 'secretary':
        return user.role === 'secretary'
      default:
        return true
    }
  },

  // Obter roles disponíveis
  getAvailableRoles() {
    return [
      { value: 'admin', label: 'Administrador' },
      { value: 'secretary', label: 'Secretário' }
    ]
  },

  // Validar credenciais localmente (antes de enviar para API)
  validateCredentials(credentials) {
    const errors = {}

    if (!credentials.email) {
      errors.email = 'Email é obrigatório'
    } else if (!/\S+@\S+\.\S+/.test(credentials.email)) {
      errors.email = 'Email inválido'
    }

    if (!credentials.password) {
      errors.password = 'Senha é obrigatória'
    } else if (credentials.password.length < 6) {
      errors.password = 'Senha deve ter pelo menos 6 caracteres'
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    }
  },

  // Formatar dados do usuário para exibição
  formatUserForDisplay(user) {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      roleLabel: user.role === 'admin' ? 'Administrador' : 'Secretário',
      active: user.active,
      lastLogin: user.lastLogin ? new Date(user.lastLogin).toLocaleString('pt-BR') : 'Nunca',
      createdAt: new Date(user.createdAt).toLocaleDateString('pt-BR')
    }
  },

  // Obter informações do token (decodificar JWT)
  getTokenInfo(token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      return {
        userId: payload.id,
        email: payload.email,
        role: payload.role,
        type: payload.type,
        exp: payload.exp,
        iat: payload.iat
      }
    } catch (error) {
      return null
    }
  },

  // Verificar se token está expirado
  isTokenExpired(token) {
    const tokenInfo = this.getTokenInfo(token)
    if (!tokenInfo) return true
    
    const now = Math.floor(Date.now() / 1000)
    return tokenInfo.exp < now
  },

  // Calcular tempo restante do token
  getTokenTimeRemaining(token) {
    const tokenInfo = this.getTokenInfo(token)
    if (!tokenInfo) return 0
    
    const now = Math.floor(Date.now() / 1000)
    const remaining = tokenInfo.exp - now
    
    return Math.max(0, remaining)
  }
}

export default authService
