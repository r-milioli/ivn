import api from './api'

/**
 * Serviço para operações relacionadas a usuários
 */
class UserService {
  /**
   * Lista usuários com filtros e paginação
   * @param {Object} params - Parâmetros de filtro e paginação
   * @returns {Promise<Object>} Lista de usuários
   */
  async listUsers(params = {}) {
    try {
      const response = await api.get('/auth/users', { params })
      return response.data
    } catch (error) {
      throw error
    }
  }

  /**
   * Busca usuário por ID
   * @param {string} userId - ID do usuário
   * @returns {Promise<Object>} Dados do usuário
   */
  async getUserById(userId) {
    try {
      const response = await api.get(`/auth/users/${userId}`)
      return response.data
    } catch (error) {
      throw error
    }
  }

  /**
   * Cria um novo usuário
   * @param {Object} userData - Dados do usuário
   * @returns {Promise<Object>} Usuário criado
   */
  async createUser(userData) {
    try {
      const response = await api.post('/auth/register', userData)
      return response.data
    } catch (error) {
      throw error
    }
  }

  /**
   * Atualiza um usuário
   * @param {string} userId - ID do usuário
   * @param {Object} updateData - Dados para atualizar
   * @returns {Promise<Object>} Usuário atualizado
   */
  async updateUser(userId, updateData) {
    try {
      const response = await api.put(`/auth/users/${userId}`, updateData)
      return response.data
    } catch (error) {
      throw error
    }
  }

  /**
   * Remove um usuário
   * @param {string} userId - ID do usuário
   * @returns {Promise<boolean>} Sucesso da operação
   */
  async deleteUser(userId) {
    try {
      await api.delete(`/auth/users/${userId}`)
      return true
    } catch (error) {
      throw error
    }
  }

  /**
   * Altera a senha de um usuário
   * @param {string} userId - ID do usuário
   * @param {string} newPassword - Nova senha
   * @returns {Promise<boolean>} Sucesso da operação
   */
  async changeUserPassword(userId, newPassword) {
    try {
      await api.put(`/auth/users/${userId}/password`, { newPassword })
      return true
    } catch (error) {
      throw error
    }
  }

  /**
   * Verifica se um email está disponível
   * @param {string} email - Email para verificar
   * @returns {Promise<Object>} Resultado da verificação
   */
  async checkEmailAvailability(email) {
    try {
      const response = await api.get(`/auth/check-email/${email}`)
      return response.data
    } catch (error) {
      throw error
    }
  }

  /**
   * Obtém estatísticas de usuários
   * @returns {Promise<Object>} Estatísticas
   */
  async getUserStatistics() {
    try {
      const response = await api.get('/auth/statistics')
      return response.data
    } catch (error) {
      throw error
    }
  }

  /**
   * Ativa/desativa um usuário
   * @param {string} userId - ID do usuário
   * @param {boolean} active - Status ativo/inativo
   * @returns {Promise<Object>} Usuário atualizado
   */
  async toggleUserStatus(userId, active) {
    try {
      const response = await api.put(`/auth/users/${userId}`, { active })
      return response.data
    } catch (error) {
      throw error
    }
  }

  /**
   * Altera a função de um usuário
   * @param {string} userId - ID do usuário
   * @param {string} role - Nova função (admin/secretary)
   * @returns {Promise<Object>} Usuário atualizado
   */
  async changeUserRole(userId, role) {
    try {
      const response = await api.put(`/auth/users/${userId}`, { role })
      return response.data
    } catch (error) {
      throw error
    }
  }

  /**
   * Exporta lista de usuários
   * @param {Object} filters - Filtros para exportação
   * @returns {Promise<Blob>} Arquivo de exportação
   */
  async exportUsers(filters = {}) {
    try {
      const response = await api.get('/auth/users/export', {
        params: filters,
        responseType: 'blob'
      })
      return response.data
    } catch (error) {
      throw error
    }
  }

  /**
   * Importa usuários de arquivo
   * @param {File} file - Arquivo para importar
   * @returns {Promise<Object>} Resultado da importação
   */
  async importUsers(file) {
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await api.post('/auth/users/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      return response.data
    } catch (error) {
      throw error
    }
  }

  /**
   * Gera senha temporária para usuário
   * @param {string} userId - ID do usuário
   * @returns {Promise<Object>} Senha temporária
   */
  async generateTemporaryPassword(userId) {
    try {
      const response = await api.post(`/auth/users/${userId}/temporary-password`)
      return response.data
    } catch (error) {
      throw error
    }
  }

  /**
   * Força logout de um usuário
   * @param {string} userId - ID do usuário
   * @returns {Promise<boolean>} Sucesso da operação
   */
  async forceLogout(userId) {
    try {
      await api.post(`/auth/users/${userId}/force-logout`)
      return true
    } catch (error) {
      throw error
    }
  }

  /**
   * Obtém histórico de atividades de um usuário
   * @param {string} userId - ID do usuário
   * @param {Object} params - Parâmetros de filtro
   * @returns {Promise<Object>} Histórico de atividades
   */
  async getUserActivityHistory(userId, params = {}) {
    try {
      const response = await api.get(`/auth/users/${userId}/activity`, { params })
      return response.data
    } catch (error) {
      throw error
    }
  }

  /**
   * Valida dados do usuário antes de enviar
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

    // Validar senha (apenas se fornecida)
    if (userData.password) {
      if (userData.password.length < 6) {
        errors.password = 'Senha deve ter pelo menos 6 caracteres'
      }
    }

    // Validar função
    if (userData.role && !['admin', 'secretary'].includes(userData.role)) {
      errors.role = 'Função deve ser admin ou secretary'
    }

    return errors
  }

  /**
   * Formata dados do usuário para exibição
   * @param {Object} user - Dados do usuário
   * @returns {Object} Dados formatados
   */
  formatUserForDisplay(user) {
    return {
      ...user,
      name: user.name || 'Nome não informado',
      email: user.email || 'Email não informado',
      role: user.role === 'admin' ? 'Administrador' : 'Secretário',
      status: user.active ? 'Ativo' : 'Inativo',
      lastLoginFormatted: user.lastLogin 
        ? new Date(user.lastLogin).toLocaleDateString('pt-BR')
        : 'Nunca',
      createdAtFormatted: user.createdAt 
        ? new Date(user.createdAt).toLocaleDateString('pt-BR')
        : 'Data não disponível'
    }
  }
}

// Exportar instância única do serviço
export default new UserService()
