import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { authService } from '../services/authService'
import toast from 'react-hot-toast'

// Estado inicial do contexto de autenticação
const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: true,
  error: null
}

// Actions do reducer
const AUTH_ACTIONS = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  SET_LOADING: 'SET_LOADING',
  CLEAR_ERROR: 'CLEAR_ERROR',
  REFRESH_TOKEN: 'REFRESH_TOKEN'
}

// Reducer para gerenciar o estado de autenticação
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
      return {
        ...state,
        loading: true,
        error: null
      }
    
    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
        error: null
      }
    
    case AUTH_ACTIONS.LOGIN_FAILURE:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: action.payload
      }
    
    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: null
      }
    
    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload
      }
    
    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null
      }
    
    case AUTH_ACTIONS.REFRESH_TOKEN:
      return {
        ...state,
        token: action.payload.token,
        user: action.payload.user
      }
    
    default:
      return state
  }
}

// Criar o contexto
const AuthContext = createContext()

// Provider do contexto de autenticação
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // Verificar se há token salvo no localStorage ao inicializar
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('token')
        const refreshToken = localStorage.getItem('refreshToken')
        
        if (token && refreshToken) {
          // Verificar se o token ainda é válido
          const isValid = await authService.verifyToken(token)
          
          if (isValid) {
            // Buscar dados do usuário atual
            const userData = await authService.getCurrentUser()
            dispatch({
              type: AUTH_ACTIONS.LOGIN_SUCCESS,
              payload: {
                user: userData,
                token
              }
            })
          } else {
            // Tentar renovar o token
            try {
              const newTokens = await authService.refreshToken(refreshToken)
              localStorage.setItem('token', newTokens.accessToken)
              localStorage.setItem('refreshToken', newTokens.refreshToken)
              
              const userData = await authService.getCurrentUser()
              dispatch({
                type: AUTH_ACTIONS.LOGIN_SUCCESS,
                payload: {
                  user: userData,
                  token: newTokens.accessToken
                }
              })
            } catch (refreshError) {
              // Se não conseguir renovar, limpar tudo
              localStorage.removeItem('token')
              localStorage.removeItem('refreshToken')
              dispatch({ type: AUTH_ACTIONS.LOGOUT })
            }
          }
        } else {
          dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false })
        }
      } catch (error) {
        console.error('Erro ao inicializar autenticação:', error)
        localStorage.removeItem('token')
        localStorage.removeItem('refreshToken')
        dispatch({ type: AUTH_ACTIONS.LOGOUT })
      }
    }

    initializeAuth()
  }, [])

  // Função de login
  const login = async (credentials) => {
    try {
      dispatch({ type: AUTH_ACTIONS.LOGIN_START })
      
      const response = await authService.login(credentials)
      
      // Verificar se a resposta tem a estrutura esperada
      if (!response || !response.data || !response.data.tokens || !response.data.tokens.accessToken) {
        throw new Error('Resposta de login inválida')
      }
      
      // Salvar tokens no localStorage
      localStorage.setItem('token', response.data.tokens.accessToken)
      localStorage.setItem('refreshToken', response.data.tokens.refreshToken)
      
      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: {
          user: response.data.user,
          token: response.data.tokens.accessToken
        }
      })
      
      toast.success(`Bem-vindo(a), ${response.data.user.name}!`)
      return response
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Erro ao fazer login'
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: errorMessage
      })
      toast.error(errorMessage)
      throw error
    }
  }

  // Função de logout
  const logout = async () => {
    try {
      await authService.logout()
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
    } finally {
      // Limpar dados locais independente do resultado da API
      localStorage.removeItem('token')
      localStorage.removeItem('refreshToken')
      dispatch({ type: AUTH_ACTIONS.LOGOUT })
      toast.success('Logout realizado com sucesso')
    }
  }

  // Função para renovar token
  const refreshToken = async () => {
    try {
      const refreshTokenValue = localStorage.getItem('refreshToken')
      if (!refreshTokenValue) {
        throw new Error('Refresh token não encontrado')
      }

      const newTokens = await authService.refreshToken(refreshTokenValue)
      
      // Salvar novos tokens
      localStorage.setItem('token', newTokens.accessToken)
      localStorage.setItem('refreshToken', newTokens.refreshToken)
      
      // Buscar dados atualizados do usuário
      const userData = await authService.getCurrentUser()
      
      dispatch({
        type: AUTH_ACTIONS.REFRESH_TOKEN,
        payload: {
          token: newTokens.accessToken,
          user: userData
        }
      })
      
      return newTokens
    } catch (error) {
      console.error('Erro ao renovar token:', error)
      // Se não conseguir renovar, fazer logout
      logout()
      throw error
    }
  }

  // Função para limpar erros
  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR })
  }

  // Função para atualizar dados do usuário
  const updateUser = (userData) => {
    dispatch({
      type: AUTH_ACTIONS.LOGIN_SUCCESS,
      payload: {
        user: userData,
        token: state.token
      }
    })
  }

  // Verificar se o usuário tem permissão específica
  const hasPermission = (requiredRole) => {
    if (!state.user) return false
    
    if (requiredRole === 'admin') {
      return state.user.role === 'admin'
    }
    
    if (requiredRole === 'admin_or_secretary') {
      return ['admin', 'secretary'].includes(state.user.role)
    }
    
    return true
  }

  // Verificar se é administrador
  const isAdmin = () => {
    return state.user?.role === 'admin'
  }

  // Verificar se é secretário ou admin
  const isSecretaryOrAdmin = () => {
    return ['admin', 'secretary'].includes(state.user?.role)
  }

  // Valor do contexto
  const value = {
    // Estado
    user: state.user,
    token: state.token,
    isAuthenticated: state.isAuthenticated,
    loading: state.loading,
    error: state.error,
    
    // Funções
    login,
    logout,
    refreshToken,
    clearError,
    updateUser,
    hasPermission,
    isAdmin,
    isSecretaryOrAdmin
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// Hook para usar o contexto de autenticação
export const useAuth = () => {
  const context = useContext(AuthContext)
  
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  }
  
  return context
}

export default AuthContext
