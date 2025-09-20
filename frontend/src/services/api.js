import axios from 'axios'

// URL base da API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

// Criar instância do axios
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Interceptor para adicionar token automaticamente
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Interceptor para tratar respostas e erros
api.interceptors.response.use(
  (response) => {
    return response
  },
  async (error) => {
    const originalRequest = error.config

    // Se o erro for 401 (não autorizado) e não for uma tentativa de refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        // Tentar renovar o token
        const refreshToken = localStorage.getItem('refreshToken')
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken
          })

          const { accessToken, refreshToken: newRefreshToken } = response.data.tokens
          
          // Salvar novos tokens
          localStorage.setItem('token', accessToken)
          localStorage.setItem('refreshToken', newRefreshToken)
          
          // Atualizar header da requisição original
          originalRequest.headers.Authorization = `Bearer ${accessToken}`
          
          // Retry da requisição original
          return api(originalRequest)
        }
      } catch (refreshError) {
        // Se não conseguir renovar, limpar tokens e redirecionar para login
        localStorage.removeItem('token')
        localStorage.removeItem('refreshToken')
        
        // Emitir evento personalizado para logout
        window.dispatchEvent(new CustomEvent('auth:logout'))
        
        return Promise.reject(refreshError)
      }
    }

    // Tratar outros tipos de erro
    if (error.response) {
      // Erro da API (4xx, 5xx)
      const errorMessage = error.response.data?.message || 'Erro na requisição'
      const errorDetails = error.response.data?.errors || null
      
      return Promise.reject({
        message: errorMessage,
        details: errorDetails,
        status: error.response.status,
        data: error.response.data
      })
    } else if (error.request) {
      // Erro de rede
      return Promise.reject({
        message: 'Erro de conexão. Verifique sua internet.',
        status: 0
      })
    } else {
      // Outros erros
      return Promise.reject({
        message: 'Erro inesperado',
        status: 0
      })
    }
  }
)

// Função para fazer upload de arquivos
export const uploadFile = async (file, endpoint = '/upload') => {
  const formData = new FormData()
  formData.append('file', file)

  const response = await api.post(endpoint, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    onUploadProgress: (progressEvent) => {
      const percentCompleted = Math.round(
        (progressEvent.loaded * 100) / progressEvent.total
      )
      console.log(`Upload: ${percentCompleted}%`)
    }
  })

  return response.data
}

// Função para download de arquivos
export const downloadFile = async (url, filename) => {
  try {
    const response = await api.get(url, {
      responseType: 'blob'
    })

    // Criar link para download
    const blob = new Blob([response.data])
    const downloadUrl = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = filename || 'download'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(downloadUrl)
  } catch (error) {
    throw new Error('Erro ao baixar arquivo')
  }
}

// Função para exportar dados
export const exportData = async (endpoint, params = {}, filename) => {
  try {
    const response = await api.get(endpoint, {
      params,
      responseType: 'blob'
    })

    // Determinar tipo de arquivo baseado no content-type
    const contentType = response.headers['content-type']
    let fileExtension = 'xlsx'
    
    if (contentType.includes('csv')) {
      fileExtension = 'csv'
    } else if (contentType.includes('pdf')) {
      fileExtension = 'pdf'
    }

    const finalFilename = filename || `export_${new Date().toISOString().split('T')[0]}.${fileExtension}`

    // Criar link para download
    const blob = new Blob([response.data])
    const downloadUrl = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = finalFilename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(downloadUrl)
  } catch (error) {
    throw new Error('Erro ao exportar dados')
  }
}

// Função para fazer requisições com retry automático
export const apiWithRetry = async (requestFunction, maxRetries = 3, delay = 1000) => {
  let lastError
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await requestFunction()
    } catch (error) {
      lastError = error
      
      // Não tentar novamente para erros 4xx (exceto 429)
      if (error.status >= 400 && error.status < 500 && error.status !== 429) {
        throw error
      }
      
      // Aguardar antes da próxima tentativa
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)))
      }
    }
  }
  
  throw lastError
}

// Função para cancelar requisições
export const createCancelToken = () => {
  return axios.CancelToken.source()
}

// Função para verificar se o erro foi por cancelamento
export const isCancelError = (error) => {
  return axios.isCancel(error)
}

// Função para obter estatísticas da API
export const getApiStats = () => {
  // Esta função pode ser expandida para coletar métricas
  return {
    baseURL: API_BASE_URL,
    timeout: 10000,
    timestamp: new Date().toISOString()
  }
}

// Função para testar conectividade
export const testConnection = async () => {
  try {
    const response = await api.get('/health')
    return {
      connected: true,
      status: response.status,
      data: response.data
    }
  } catch (error) {
    return {
      connected: false,
      error: error.message
    }
  }
}

export default api
