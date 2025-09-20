import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { useApp } from './context/AppContext'

// Layout
import Layout from './components/common/Layout'

// Páginas de autenticação
import Login from './pages/auth/Login'

// Páginas do sistema
import Dashboard from './pages/dashboard/Dashboard'

// Componentes
import ProtectedRoute from './components/auth/ProtectedRoute'
import Loading from './components/common/Loading'

// Página de erro 404
const NotFound = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <h1 className="text-6xl font-bold text-gray-400 mb-4">404</h1>
      <h2 className="text-2xl font-semibold text-gray-900 mb-2">Página não encontrada</h2>
      <p className="text-gray-600 mb-6">A página que você está procurando não existe.</p>
      <button 
        onClick={() => window.history.back()}
        className="btn btn-primary"
      >
        Voltar
      </button>
    </div>
  </div>
)

// Página de não autorizado
const Unauthorized = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <h1 className="text-6xl font-bold text-danger-400 mb-4">403</h1>
      <h2 className="text-2xl font-semibold text-gray-900 mb-2">Acesso negado</h2>
      <p className="text-gray-600 mb-6">Você não tem permissão para acessar esta página.</p>
      <button 
        onClick={() => window.location.href = '/dashboard'}
        className="btn btn-primary"
      >
        Ir para Dashboard
      </button>
    </div>
  </div>
)

function App() {
  const { loading } = useAuth()
  const { loading: appLoading } = useApp()

  // Mostrar loading global enquanto inicializa
  if (loading || appLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loading size="lg" text="Carregando sistema..." />
      </div>
    )
  }

  return (
    <Routes>
      {/* Rota pública - Login */}
      <Route 
        path="/login" 
        element={<Login />} 
      />

      {/* Rotas protegidas */}
      <Route 
        path="/" 
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        {/* Redirecionar para dashboard */}
        <Route index element={<Navigate to="/dashboard" replace />} />
        
        {/* Dashboard */}
        <Route path="dashboard" element={<Dashboard />} />
        
        {/* Rotas de membros (placeholder) */}
        <Route path="members/*" element={<div className="p-6"><h1 className="text-2xl font-bold">Gestão de Membros</h1><p>Em desenvolvimento...</p></div>} />
        
        {/* Rotas financeiras (placeholder) */}
        <Route path="finances/*" element={<div className="p-6"><h1 className="text-2xl font-bold">Gestão Financeira</h1><p>Em desenvolvimento...</p></div>} />
        
        {/* Rotas de relatórios (placeholder) */}
        <Route path="reports/*" element={<div className="p-6"><h1 className="text-2xl font-bold">Relatórios</h1><p>Em desenvolvimento...</p></div>} />
        
        {/* Rotas administrativas (apenas admin) */}
        <Route 
          path="admin/*" 
          element={
            <ProtectedRoute requiredRole="admin">
              <div className="p-6">
                <h1 className="text-2xl font-bold">Administração</h1>
                <p>Área administrativa - Em desenvolvimento...</p>
              </div>
            </ProtectedRoute>
          } 
        />
      </Route>

      {/* Páginas de erro */}
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="/404" element={<NotFound />} />
      
      {/* Qualquer rota não encontrada */}
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  )
}

export default App
