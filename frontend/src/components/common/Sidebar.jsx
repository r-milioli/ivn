import React from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  DollarSign,
  FileText,
  Settings,
  BarChart3,
  Calendar,
  UserPlus,
  TrendingUp,
  Bell,
  HelpCircle,
  Shield,
  UserCheck
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useApp } from '../../context/AppContext'

const Sidebar = () => {
  const { user, isAdmin } = useAuth()
  const { sidebarCollapsed } = useApp()

  // Menu de navegação
  const menuItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
      description: 'Visão geral do sistema'
    },
    {
      name: 'Membros',
      href: '/members',
      icon: Users,
      description: 'Gestão de membros',
      children: [
        {
          name: 'Lista de Membros',
          href: '/members',
          icon: Users
        },
        {
          name: 'Adicionar Membro',
          href: '/members/add',
          icon: UserPlus
        },
        {
          name: 'Aniversariantes',
          href: '/members/birthdays',
          icon: Calendar
        }
      ]
    },
    {
      name: 'Financeiro',
      href: '/finances',
      icon: DollarSign,
      description: 'Gestão financeira',
      children: [
        {
          name: 'Transações',
          href: '/finances/transactions',
          icon: FileText
        },
        {
          name: 'Nova Receita',
          href: '/finances/income',
          icon: TrendingUp
        },
        {
          name: 'Nova Despesa',
          href: '/finances/expense',
          icon: DollarSign
        },
        {
          name: 'Relatórios',
          href: '/finances/reports',
          icon: BarChart3
        }
      ]
    },
    {
      name: 'Relatórios',
      href: '/reports',
      icon: BarChart3,
      description: 'Análises e gráficos'
    }
  ]

  // Itens administrativos (apenas para admins)
  const adminItems = [
    {
      name: 'Usuários',
      href: '/admin/users',
      icon: Shield,
      description: 'Gestão de usuários'
    },
    {
      name: 'Solicitações',
      href: '/admin/access-requests',
      icon: UserCheck,
      description: 'Aprovação de novos usuários'
    },
    {
      name: 'Configurações',
      href: '/admin/settings',
      icon: Settings,
      description: 'Configurações do sistema'
    }
  ]

  const NavItem = ({ item, isChild = false }) => {
    const Icon = item.icon
    
    return (
      <NavLink
        to={item.href}
        className={({ isActive }) =>
          `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors group ${
            isActive
              ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-600'
              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
          } ${isChild ? 'ml-4 text-sm' : 'text-sm font-medium'}`
        }
        title={sidebarCollapsed ? item.name : undefined}
      >
        <Icon className={`h-5 w-5 ${sidebarCollapsed ? 'mx-auto' : ''}`} />
        {!sidebarCollapsed && (
          <span className="flex-1">{item.name}</span>
        )}
      </NavLink>
    )
  }

  return (
    <aside
      className={`bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ${
        sidebarCollapsed ? 'sidebar-width-collapsed' : 'sidebar-width'
      }`}
    >
      {/* Logo - apenas quando sidebar está expandida */}
      {!sidebarCollapsed && (
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">I</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Igreja Admin
              </h2>
              <p className="text-xs text-gray-500">
                Sistema de Gestão
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Navegação principal */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {menuItems.map((item) => (
          <div key={item.name}>
            {/* Item principal */}
            <NavItem item={item} />
            
            {/* Subitens */}
            {item.children && !sidebarCollapsed && (
              <div className="ml-4 mt-2 space-y-1">
                {item.children.map((child) => (
                  <NavItem key={child.name} item={child} isChild />
                ))}
              </div>
            )}
          </div>
        ))}

        {/* Separador */}
        {isAdmin() && !sidebarCollapsed && (
          <div className="border-t border-gray-200 my-4" />
        )}

        {/* Itens administrativos */}
        {isAdmin() && (
          <div className="space-y-2">
            {!sidebarCollapsed && (
              <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Administração
              </p>
            )}
            {adminItems.map((item) => (
              <NavItem key={item.name} item={item} />
            ))}
          </div>
        )}
      </nav>

      {/* Rodapé do sidebar */}
      <div className="p-4 border-t border-gray-200">
        {sidebarCollapsed ? (
          <div className="flex justify-center">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">P</span>
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl p-4 text-white">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">P</span>
              </div>
              <div>
                <p className="text-sm font-semibold">Igreja Pro</p>
                <p className="text-xs opacity-90">
                  Acesso a todas as funcionalidades
                </p>
              </div>
            </div>
            <button className="w-full bg-white/20 hover:bg-white/30 text-white text-xs font-medium py-2 px-3 rounded-lg transition-colors">
              Atualizar
            </button>
          </div>
        )}
      </div>

      {/* Informações do usuário */}
      <div className="p-4 border-t border-gray-200">
        <div className={`flex items-center space-x-3 ${sidebarCollapsed ? 'justify-center' : ''}`}>
          <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-medium">
              {user?.name?.charAt(0) || 'U'}
            </span>
          </div>
          {!sidebarCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.name || 'Usuário'}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {user?.email || 'usuario@igreja.com'}
              </p>
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
