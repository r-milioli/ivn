import React from 'react'
import { Outlet } from 'react-router-dom'
import Header from './Header'
import Sidebar from './Sidebar'
import { useApp } from '../../context/AppContext'

const Layout = () => {
  const { sidebarCollapsed, loading } = useApp()

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Conteúdo principal */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header />

        {/* Área de conteúdo */}
        <main className="flex-1 overflow-y-auto">
          {/* Loading global */}
          {loading && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 flex items-center space-x-4">
                <div className="spinner w-6 h-6"></div>
                <span className="text-gray-700">Carregando...</span>
              </div>
            </div>
          )}

          {/* Conteúdo das páginas */}
          <div className="p-6">
            <div className={`transition-all duration-300 ${
              sidebarCollapsed ? 'ml-0' : 'ml-0'
            }`}>
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default Layout
