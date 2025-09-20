import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Loading from '../common/Loading'

const ProtectedRoute = ({ 
  children, 
  requiredRole = null,
  fallbackPath = '/login'
}) => {
  const { isAuthenticated, user, loading } = useAuth()
  const location = useLocation()

  // Mostrar loading enquanto verifica autenticação
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loading size="lg" text="Verificando permissões..." />
      </div>
    )
  }

  // Redirecionar para login se não estiver autenticado
  if (!isAuthenticated) {
    return <Navigate to={fallbackPath} state={{ from: location }} replace />
  }

  // Verificar permissões de role se necessário
  if (requiredRole && !hasRequiredRole(user, requiredRole)) {
    // Redirecionar para página sem permissão ou dashboard
    return <Navigate to="/unauthorized" replace />
  }

  return children
}

// Função para verificar se o usuário tem a role necessária
const hasRequiredRole = (user, requiredRole) => {
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
}

// Hook para verificar permissões
export const usePermissions = () => {
  const { user } = useAuth()

  const hasRole = (role) => {
    return hasRequiredRole(user, role)
  }

  const isAdmin = () => {
    return user?.role === 'admin'
  }

  const isSecretary = () => {
    return user?.role === 'secretary'
  }

  const isSecretaryOrAdmin = () => {
    return ['admin', 'secretary'].includes(user?.role)
  }

  const canManageUsers = () => {
    return isAdmin()
  }

  const canManageMembers = () => {
    return isSecretaryOrAdmin()
  }

  const canManageFinances = () => {
    return isSecretaryOrAdmin()
  }

  const canViewReports = () => {
    return isSecretaryOrAdmin()
  }

  return {
    hasRole,
    isAdmin,
    isSecretary,
    isSecretaryOrAdmin,
    canManageUsers,
    canManageMembers,
    canManageFinances,
    canViewReports,
    userRole: user?.role
  }
}

export default ProtectedRoute
