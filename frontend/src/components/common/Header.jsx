import React, { useState } from 'react'
import { 
  Search, 
  Bell, 
  Settings, 
  LogOut, 
  User,
  Menu,
  Globe
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useApp } from '../../context/AppContext'

const Header = () => {
  const { user, logout } = useAuth()
  const { sidebarCollapsed, toggleSidebar } = useApp()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    // Implementar busca global
    console.log('Buscar:', searchQuery)
  }

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-40">
      {/* Lado esquerdo - Logo e menu toggle */}
      <div className="flex items-center space-x-4">
        {/* Botão para colapsar/expandir sidebar */}
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors lg:hidden"
          aria-label="Toggle sidebar"
        >
          <Menu className="h-5 w-5 text-gray-600" />
        </button>

        {/* Logo */}
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">I</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900 hidden sm:block">
            Igreja Admin
          </h1>
        </div>
      </div>

      {/* Centro - Barra de pesquisa */}
      <div className="flex-1 max-w-md mx-8 hidden md:block">
        <form onSubmit={handleSearch} className="relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar membros, transações..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
            />
          </div>
        </form>
      </div>

      {/* Lado direito - Ações e perfil */}
      <div className="flex items-center space-x-4">
        {/* Idioma */}
        <div className="hidden lg:flex items-center space-x-2 text-sm text-gray-600">
          <Globe className="h-4 w-4" />
          <span>PT-BR</span>
        </div>

        {/* Notificações */}
        <button
          className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="Notificações"
        >
          <Bell className="h-5 w-5 text-gray-600" />
          <span className="absolute -top-1 -right-1 h-4 w-4 bg-danger-500 text-white text-xs rounded-full flex items-center justify-center">
            3
          </span>
        </button>

        {/* Configurações */}
        <button
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="Configurações"
        >
          <Settings className="h-5 w-5 text-gray-600" />
        </button>

        {/* Perfil do usuário */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
              <User className="h-4 w-4 text-white" />
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-medium text-gray-900">
                {user?.name || 'Usuário'}
              </p>
              <p className="text-xs text-gray-500">
                {user?.role === 'admin' ? 'Administrador' : 'Secretário'}
              </p>
            </div>
          </button>

          {/* Menu dropdown do usuário */}
          {showUserMenu && (
            <>
              {/* Overlay para fechar menu */}
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowUserMenu(false)}
              />
              
              {/* Menu dropdown */}
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-strong border border-gray-200 py-1 z-20">
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900">
                    {user?.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {user?.email}
                  </p>
                </div>
                
                <button
                  onClick={() => {
                    setShowUserMenu(false)
                    // Navegar para perfil
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                >
                  <User className="h-4 w-4" />
                  <span>Meu Perfil</span>
                </button>
                
                <button
                  onClick={() => {
                    setShowUserMenu(false)
                    // Navegar para configurações
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                >
                  <Settings className="h-4 w-4" />
                  <span>Configurações</span>
                </button>
                
                <div className="border-t border-gray-100 my-1" />
                
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 text-left text-sm text-danger-600 hover:bg-danger-50 flex items-center space-x-2"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sair</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header
