import api from './api'

/**
 * Serviço para operações de solicitações de acesso
 */
class AccessRequestService {
  /**
   * Lista solicitações de acesso com filtros
   * @param {Object} params - Parâmetros de filtro e paginação
   * @returns {Promise<Object>} Lista de solicitações
   */
  async listRequests(params = {}) {
    try {
      const response = await api.get('/access-requests', { params })
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      }
    } catch (error) {
      throw error
    }
  }

  /**
   * Busca uma solicitação por ID
   * @param {string} id - ID da solicitação
   * @returns {Promise<Object>} Dados da solicitação
   */
  async getRequestById(id) {
    try {
      const response = await api.get(`/access-requests/${id}`)
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      }
    } catch (error) {
      throw error
    }
  }

  /**
   * Aprova uma solicitação de acesso
   * @param {string} id - ID da solicitação
   * @returns {Promise<Object>} Usuário criado
   */
  async approveRequest(id) {
    try {
      const response = await api.post(`/access-requests/${id}/approve`)
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      }
    } catch (error) {
      throw error
    }
  }

  /**
   * Rejeita uma solicitação de acesso
   * @param {string} id - ID da solicitação
   * @param {string} reason - Motivo da rejeição
   * @returns {Promise<Object>} Resultado da operação
   */
  async rejectRequest(id, reason) {
    try {
      const response = await api.post(`/access-requests/${id}/reject`, { reason })
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      }
    } catch (error) {
      throw error
    }
  }

  /**
   * Remove uma solicitação
   * @param {string} id - ID da solicitação
   * @returns {Promise<Object>} Resultado da operação
   */
  async deleteRequest(id) {
    try {
      const response = await api.delete(`/access-requests/${id}`)
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      }
    } catch (error) {
      throw error
    }
  }

  /**
   * Obtém estatísticas de solicitações
   * @returns {Promise<Object>} Estatísticas
   */
  async getStatistics() {
    try {
      const response = await api.get('/access-requests/statistics')
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      }
    } catch (error) {
      throw error
    }
  }

  /**
   * Verifica se um email tem solicitação pendente
   * @param {string} email - Email para verificar
   * @returns {Promise<Object>} Resultado da verificação
   */
  async checkEmailRequest(email) {
    try {
      const response = await api.get(`/access-requests/check-email/${email}`)
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      }
    } catch (error) {
      throw error
    }
  }

  /**
   * Cria uma nova solicitação de acesso (público)
   * @param {Object} requestData - Dados da solicitação
   * @returns {Promise<Object>} Solicitação criada
   */
  async createRequest(requestData) {
    try {
      const response = await api.post('/access-requests', requestData)
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      }
    } catch (error) {
      throw error
    }
  }
}

export default new AccessRequestService()
