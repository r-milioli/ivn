import api from './api'

/**
 * Serviço para operações de cadastro e solicitação de acesso
 */
class RegisterService {
  /**
   * Solicita acesso ao sistema
   * @param {Object} userData - Dados do usuário
   * @returns {Promise<Object>} Resultado da solicitação
   */
  async requestAccess(userData) {
    try {
      const response = await api.post('/access-requests', userData)
      return {
        success: true,
        message: 'Solicitação enviada com sucesso! Aguarde aprovação do administrador.',
        data: response.data.data
      }
    } catch (error) {
      throw error
    }
  }

  /**
   * Verifica se um email já está em uso
   * @param {string} email - Email para verificar
   * @returns {Promise<Object>} Resultado da verificação
   */
  async checkEmailAvailability(email) {
    try {
      const response = await api.get(`/access-requests/check-email/${email}`)
      return {
        available: !response.data.data.hasPendingRequest,
        message: response.data.data.hasPendingRequest 
          ? 'Já existe uma solicitação pendente com este email' 
          : 'Email disponível'
      }
    } catch (error) {
      throw error
    }
  }

  /**
   * Lista solicitações de acesso (apenas para admins)
   * @param {Object} params - Parâmetros de filtro
   * @returns {Promise<Object>} Lista de solicitações
   */
  async listRequests(params = {}) {
    try {
      const response = await api.get('/auth/requests', { params })
      return response.data
    } catch (error) {
      throw error
    }
  }

  /**
   * Aprova uma solicitação de acesso
   * @param {string} requestId - ID da solicitação
   * @returns {Promise<Object>} Resultado da aprovação
   */
  async approveRequest(requestId) {
    try {
      const response = await api.post(`/auth/requests/${requestId}/approve`)
      return response.data
    } catch (error) {
      throw error
    }
  }

  /**
   * Rejeita uma solicitação de acesso
   * @param {string} requestId - ID da solicitação
   * @param {string} reason - Motivo da rejeição
   * @returns {Promise<Object>} Resultado da rejeição
   */
  async rejectRequest(requestId, reason) {
    try {
      const response = await api.post(`/auth/requests/${requestId}/reject`, { reason })
      return response.data
    } catch (error) {
      throw error
    }
  }

  /**
   * Obtém status de uma solicitação
   * @param {string} email - Email da solicitação
   * @returns {Promise<Object>} Status da solicitação
   */
  async getRequestStatus(email) {
    try {
      const response = await api.get(`/auth/requests/status/${email}`)
      return response.data
    } catch (error) {
      throw error
    }
  }

  /**
   * Valida dados de cadastro
   * @param {Object} userData - Dados do usuário
   * @returns {Object} Erros de validação
   */
  validateUserData(userData) {
    const errors = {}

    // Validar nome
    if (!userData.name || userData.name.trim().length < 2) {
      errors.name = 'Nome deve ter pelo menos 2 caracteres'
    }

    // Validar email
    if (!userData.email) {
      errors.email = 'Email é obrigatório'
    } else if (!/\S+@\S+\.\S+/.test(userData.email)) {
      errors.email = 'Email inválido'
    }

    // Validar senha
    if (!userData.password) {
      errors.password = 'Senha é obrigatória'
    } else if (userData.password.length < 6) {
      errors.password = 'Senha deve ter pelo menos 6 caracteres'
    }

    // Validar confirmação de senha
    if (!userData.confirmPassword) {
      errors.confirmPassword = 'Confirmação de senha é obrigatória'
    } else if (userData.password !== userData.confirmPassword) {
      errors.confirmPassword = 'Senhas não coincidem'
    }

    // Validar função
    if (!userData.role) {
      errors.role = 'Função é obrigatória'
    } else if (!['admin', 'secretary'].includes(userData.role)) {
      errors.role = 'Função deve ser admin ou secretary'
    }

    // Validar termos
    if (!userData.terms) {
      errors.terms = 'Você deve aceitar os termos de uso'
    }

    return errors
  }

  /**
   * Formata dados para envio
   * @param {Object} userData - Dados do usuário
   * @returns {Object} Dados formatados
   */
  formatUserData(userData) {
    return {
      name: userData.name.trim(),
      email: userData.email.trim().toLowerCase(),
      password: userData.password,
      role: userData.role
    }
  }

  /**
   * Gera senha temporária
   * @param {number} length - Comprimento da senha
   * @returns {string} Senha gerada
   */
  generateTemporaryPassword(length = 8) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let password = ''
    
    for (let i = 0; i < length; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    
    return password
  }

  /**
   * Envia email de confirmação
   * @param {string} email - Email do usuário
   * @param {Object} userData - Dados do usuário
   * @returns {Promise<boolean>} Sucesso do envio
   */
  async sendConfirmationEmail(email, userData) {
    try {
      // Simular envio de email
      const response = await new Promise((resolve) => {
        setTimeout(() => {
          console.log('Email enviado para:', email)
          console.log('Dados do usuário:', userData)
          resolve({ success: true })
        }, 1000)
      })
      
      return response.success
    } catch (error) {
      throw error
    }
  }
}

// Exportar instância única do serviço
export default new RegisterService()
