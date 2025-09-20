import React, { createContext, useContext, useReducer } from 'react'
import toast from 'react-hot-toast'

// Estado inicial do contexto da aplicação
const initialState = {
  notifications: [],
  loading: false,
  sidebarCollapsed: false,
  theme: 'light',
  currentPage: 'Dashboard'
}

// Actions do reducer
const APP_ACTIONS = {
  ADD_NOTIFICATION: 'ADD_NOTIFICATION',
  REMOVE_NOTIFICATION: 'REMOVE_NOTIFICATION',
  CLEAR_NOTIFICATIONS: 'CLEAR_NOTIFICATIONS',
  SET_LOADING: 'SET_LOADING',
  TOGGLE_SIDEBAR: 'TOGGLE_SIDEBAR',
  SET_SIDEBAR_COLLAPSED: 'SET_SIDEBAR_COLLAPSED',
  SET_THEME: 'SET_THEME',
  SET_CURRENT_PAGE: 'SET_CURRENT_PAGE'
}

// Reducer para gerenciar o estado da aplicação
const appReducer = (state, action) => {
  switch (action.type) {
    case APP_ACTIONS.ADD_NOTIFICATION:
      return {
        ...state,
        notifications: [...state.notifications, {
          id: Date.now(),
          ...action.payload
        }]
      }
    
    case APP_ACTIONS.REMOVE_NOTIFICATION:
      return {
        ...state,
        notifications: state.notifications.filter(
          notification => notification.id !== action.payload
        )
      }
    
    case APP_ACTIONS.CLEAR_NOTIFICATIONS:
      return {
        ...state,
        notifications: []
      }
    
    case APP_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload
      }
    
    case APP_ACTIONS.TOGGLE_SIDEBAR:
      return {
        ...state,
        sidebarCollapsed: !state.sidebarCollapsed
      }
    
    case APP_ACTIONS.SET_SIDEBAR_COLLAPSED:
      return {
        ...state,
        sidebarCollapsed: action.payload
      }
    
    case APP_ACTIONS.SET_THEME:
      return {
        ...state,
        theme: action.payload
      }
    
    case APP_ACTIONS.SET_CURRENT_PAGE:
      return {
        ...state,
        currentPage: action.payload
      }
    
    default:
      return state
  }
}

// Criar o contexto
const AppContext = createContext()

// Provider do contexto da aplicação
export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState)

  // Adicionar notificação
  const addNotification = (notification) => {
    const notificationData = {
      type: 'info', // info, success, warning, error
      duration: 5000,
      ...notification
    }

    dispatch({
      type: APP_ACTIONS.ADD_NOTIFICATION,
      payload: notificationData
    })

    // Mostrar toast
    switch (notificationData.type) {
      case 'success':
        toast.success(notificationData.message)
        break
      case 'error':
        toast.error(notificationData.message)
        break
      case 'warning':
        toast(notificationData.message, {
          icon: '⚠️',
          style: {
            background: '#fbbf24',
            color: '#fff'
          }
        })
        break
      default:
        toast(notificationData.message)
    }

    // Auto remover após a duração especificada
    if (notificationData.duration > 0) {
      setTimeout(() => {
        removeNotification(notificationData.id)
      }, notificationData.duration)
    }
  }

  // Remover notificação
  const removeNotification = (id) => {
    dispatch({
      type: APP_ACTIONS.REMOVE_NOTIFICATION,
      payload: id
    })
  }

  // Limpar todas as notificações
  const clearNotifications = () => {
    dispatch({ type: APP_ACTIONS.CLEAR_NOTIFICATIONS })
  }

  // Definir estado de loading
  const setLoading = (loading) => {
    dispatch({
      type: APP_ACTIONS.SET_LOADING,
      payload: loading
    })
  }

  // Alternar sidebar
  const toggleSidebar = () => {
    dispatch({ type: APP_ACTIONS.TOGGLE_SIDEBAR })
  }

  // Definir estado do sidebar
  const setSidebarCollapsed = (collapsed) => {
    dispatch({
      type: APP_ACTIONS.SET_SIDEBAR_COLLAPSED,
      payload: collapsed
    })
  }

  // Definir tema
  const setTheme = (theme) => {
    dispatch({
      type: APP_ACTIONS.SET_THEME,
      payload: theme
    })
    
    // Aplicar tema no documento
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    
    // Salvar preferência no localStorage
    localStorage.setItem('theme', theme)
  }

  // Definir página atual
  const setCurrentPage = (page) => {
    dispatch({
      type: APP_ACTIONS.SET_CURRENT_PAGE,
      payload: page
    })
  }

  // Funções de conveniência para notificações
  const notifySuccess = (message, options = {}) => {
    addNotification({
      type: 'success',
      message,
      ...options
    })
  }

  const notifyError = (message, options = {}) => {
    addNotification({
      type: 'error',
      message,
      ...options
    })
  }

  const notifyWarning = (message, options = {}) => {
    addNotification({
      type: 'warning',
      message,
      ...options
    })
  }

  const notifyInfo = (message, options = {}) => {
    addNotification({
      type: 'info',
      message,
      ...options
    })
  }

  // Função para mostrar loading global
  const showGlobalLoading = () => {
    setLoading(true)
  }

  const hideGlobalLoading = () => {
    setLoading(false)
  }

  // Função para executar ação com loading
  const withLoading = async (asyncFunction) => {
    try {
      showGlobalLoading()
      const result = await asyncFunction()
      return result
    } finally {
      hideGlobalLoading()
    }
  }

  // Valor do contexto
  const value = {
    // Estado
    notifications: state.notifications,
    loading: state.loading,
    sidebarCollapsed: state.sidebarCollapsed,
    theme: state.theme,
    currentPage: state.currentPage,
    
    // Funções gerais
    addNotification,
    removeNotification,
    clearNotifications,
    setLoading,
    
    // Funções do sidebar
    toggleSidebar,
    setSidebarCollapsed,
    
    // Funções do tema
    setTheme,
    
    // Funções de navegação
    setCurrentPage,
    
    // Funções de conveniência para notificações
    notifySuccess,
    notifyError,
    notifyWarning,
    notifyInfo,
    
    // Funções de loading
    showGlobalLoading,
    hideGlobalLoading,
    withLoading
  }

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  )
}

// Hook para usar o contexto da aplicação
export const useApp = () => {
  const context = useContext(AppContext)
  
  if (!context) {
    throw new Error('useApp deve ser usado dentro de um AppProvider')
  }
  
  return context
}

export default AppContext
