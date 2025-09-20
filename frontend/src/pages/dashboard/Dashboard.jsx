import React, { useState, useEffect } from 'react'
import { 
  DollarSign, 
  Users, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  FileText,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  UserPlus,
  UserCheck,
  Clock
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useApp } from '../../context/AppContext'
import accessRequestService from '../../services/accessRequestService'

const Dashboard = () => {
  const { isAdmin } = useAuth()
  const { notifyError } = useApp()
  const [accessRequestStats, setAccessRequestStats] = useState({})
  const [loading, setLoading] = useState(false)

  // Carregar estatísticas de solicitações de acesso (apenas para admins)
  useEffect(() => {
    if (isAdmin()) {
      loadAccessRequestStats()
    }
  }, [isAdmin])

  const loadAccessRequestStats = async () => {
    try {
      setLoading(true)
      const response = await accessRequestService.getStatistics()
      setAccessRequestStats(response.data)
    } catch (error) {
      console.error('Erro ao carregar estatísticas de solicitações:', error)
      notifyError('Erro ao carregar estatísticas de solicitações')
    } finally {
      setLoading(false)
    }
  }

  // Dados mockados para demonstração
  const statsData = {
    totalRevenue: {
      value: 'R$ 15.420',
      change: '+8%',
      changeType: 'positive',
      period: 'vs mês anterior'
    },
    totalMembers: {
      value: '324',
      change: '+12',
      changeType: 'positive',
      period: 'novos membros'
    },
    activeMembers: {
      value: '287',
      change: '+5%',
      changeType: 'positive',
      period: 'membros ativos'
    },
    monthlyGrowth: {
      value: 'R$ 3.240',
      change: '+15%',
      changeType: 'positive',
      period: 'crescimento mensal'
    }
  }

  const recentTransactions = [
    {
      id: 1,
      type: 'receita',
      description: 'Dízimo - Família Silva',
      amount: 'R$ 500,00',
      date: '2024-01-15',
      category: 'Dízimo'
    },
    {
      id: 2,
      type: 'receita',
      description: 'Oferta - Culto de domingo',
      amount: 'R$ 1.200,00',
      date: '2024-01-14',
      category: 'Oferta'
    },
    {
      id: 3,
      type: 'despesa',
      description: 'Conta de luz',
      amount: 'R$ 280,00',
      date: '2024-01-13',
      category: 'Utilidades'
    },
    {
      id: 4,
      type: 'receita',
      description: 'Doação - Projeto missionário',
      amount: 'R$ 800,00',
      date: '2024-01-12',
      category: 'Doação'
    },
    {
      id: 5,
      type: 'despesa',
      description: 'Material de limpeza',
      amount: 'R$ 120,00',
      date: '2024-01-11',
      category: 'Manutenção'
    }
  ]

  const upcomingBirthdays = [
    {
      id: 1,
      name: 'Maria Santos',
      date: '2024-01-20',
      age: 35
    },
    {
      id: 2,
      name: 'João Oliveira',
      date: '2024-01-22',
      age: 28
    },
    {
      id: 3,
      name: 'Ana Costa',
      date: '2024-01-25',
      age: 42
    }
  ]

  const StatCard = ({ title, value, change, changeType, period, icon: Icon, color }) => (
    <div className="dashboard-card">
      <div className="card-body">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
            <p className="dashboard-stat text-2xl font-bold text-gray-900">{value}</p>
            <div className="flex items-center mt-2">
              <span className={`dashboard-stat-change ${changeType === 'positive' ? 'positive' : 'negative'} text-sm font-medium`}>
                {change}
              </span>
              <span className="text-xs text-gray-500 ml-2">{period}</span>
            </div>
          </div>
          <div className={`w-12 h-12 rounded-lg ${color} flex items-center justify-center`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
      </div>
    </div>
  )

  const TransactionItem = ({ transaction }) => (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
      <div className="flex items-center space-x-3">
        <div className={`w-2 h-2 rounded-full ${transaction.type === 'receita' ? 'bg-success-500' : 'bg-danger-500'}`} />
        <div>
          <p className="text-sm font-medium text-gray-900">{transaction.description}</p>
          <p className="text-xs text-gray-500">{transaction.category} • {transaction.date}</p>
        </div>
      </div>
      <div className="text-right">
        <p className={`text-sm font-medium ${transaction.type === 'receita' ? 'text-success-600' : 'text-danger-600'}`}>
          {transaction.amount}
        </p>
        <p className={`text-xs ${transaction.type === 'receita' ? 'text-success-500' : 'text-danger-500'}`}>
          {transaction.type === 'receita' ? '+' : '-'}
        </p>
      </div>
    </div>
  )

  const BirthdayItem = ({ birthday }) => (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
          <Calendar className="h-4 w-4 text-primary-600" />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900">{birthday.name}</p>
          <p className="text-xs text-gray-500">{birthday.date} • {birthday.age} anos</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-xs text-gray-500">
          {Math.ceil((new Date(birthday.date) - new Date()) / (1000 * 60 * 60 * 24))} dias
        </p>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Visão geral da administração da igreja</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="btn btn-outline btn-md flex items-center space-x-2">
            <Download className="h-4 w-4" />
            <span>Exportar</span>
          </button>
          <button className="btn btn-primary btn-md">
            Novo Relatório
          </button>
        </div>
      </div>

      {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Receita Total"
          value={statsData.totalRevenue.value}
          change={statsData.totalRevenue.change}
          changeType={statsData.totalRevenue.changeType}
          period={statsData.totalRevenue.period}
          icon={DollarSign}
          color="bg-success-500"
        />
        <StatCard
          title="Total de Membros"
          value={statsData.totalMembers.value}
          change={statsData.totalMembers.change}
          changeType={statsData.totalMembers.changeType}
          period={statsData.totalMembers.period}
          icon={Users}
          color="bg-primary-500"
        />
        <StatCard
          title="Membros Ativos"
          value={statsData.activeMembers.value}
          change={statsData.activeMembers.change}
          changeType={statsData.activeMembers.changeType}
          period={statsData.activeMembers.period}
          icon={TrendingUp}
          color="bg-warning-500"
        />
        {isAdmin() && (
          <StatCard
            title="Solicitações Pendentes"
            value={accessRequestStats.pending || 0}
            change={`${accessRequestStats.lastMonth || 0} este mês`}
            changeType="neutral"
            period="aguardando aprovação"
            icon={Clock}
            color="bg-orange-500"
          />
        )}
      </div>

      {/* Cards adicionais para admins */}
      {isAdmin() && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title="Total de Solicitações"
            value={accessRequestStats.total || 0}
            change={`${accessRequestStats.approved || 0} aprovadas`}
            changeType="positive"
            period="todas as solicitações"
            icon={UserCheck}
            color="bg-blue-500"
          />
          <StatCard
            title="Solicitações Aprovadas"
            value={accessRequestStats.approved || 0}
            change={`${accessRequestStats.rejected || 0} rejeitadas`}
            changeType="positive"
            period="usuários criados"
            icon={UserPlus}
            color="bg-green-500"
          />
          <StatCard
            title="Solicitações Rejeitadas"
            value={accessRequestStats.rejected || 0}
            change={`${Math.round(((accessRequestStats.rejected || 0) / (accessRequestStats.total || 1)) * 100)}%`}
            changeType="negative"
            period="do total"
            icon={TrendingDown}
            color="bg-red-500"
          />
        </div>
      )}

      {/* Gráficos e tabelas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfico de receitas vs despesas */}
        <div className="lg:col-span-2 card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900">Receitas vs Despesas</h3>
            <p className="text-sm text-gray-600">Últimos 12 meses</p>
          </div>
          <div className="card-body">
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center">
                <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">Gráfico será implementado</p>
                <p className="text-xs text-gray-400">Chart.js ou Recharts</p>
              </div>
            </div>
          </div>
        </div>

        {/* Aniversariantes do mês */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900">Aniversariantes</h3>
            <p className="text-sm text-gray-600">Próximos 30 dias</p>
          </div>
          <div className="card-body">
            <div className="space-y-1">
              {upcomingBirthdays.map((birthday) => (
                <BirthdayItem key={birthday.id} birthday={birthday} />
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                Ver todos os aniversariantes
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Transações recentes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900">Transações Recentes</h3>
            <p className="text-sm text-gray-600">Últimas movimentações</p>
          </div>
          <div className="card-body">
            <div className="space-y-1">
              {recentTransactions.map((transaction) => (
                <TransactionItem key={transaction.id} transaction={transaction} />
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                Ver todas as transações
              </button>
            </div>
          </div>
        </div>

        {/* Resumo financeiro mensal */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900">Resumo do Mês</h3>
            <p className="text-sm text-gray-600">Janeiro 2024</p>
          </div>
          <div className="card-body">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-success-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Total de Receitas</span>
                </div>
                <span className="text-sm font-semibold text-success-600">R$ 8.420,00</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-danger-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Total de Despesas</span>
                </div>
                <span className="text-sm font-semibold text-danger-600">R$ 3.200,00</span>
              </div>

              <div className="border-t border-gray-100 pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">Saldo do Mês</span>
                  <span className="text-lg font-bold text-success-600">R$ 5.220,00</span>
                </div>
              </div>

              <div className="bg-primary-50 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <ArrowUpRight className="h-4 w-4 text-primary-600" />
                  <span className="text-sm font-medium text-primary-800">Meta mensal atingida</span>
                </div>
                <p className="text-xs text-primary-600 mt-1">120% da meta de R$ 4.350,00</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ações rápidas */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold text-gray-900">Ações Rápidas</h3>
          <p className="text-sm text-gray-600">Acesso rápido às funcionalidades principais</p>
        </div>
        <div className="card-body">
          <div className={`grid ${isAdmin() ? 'grid-cols-2 md:grid-cols-5' : 'grid-cols-2 md:grid-cols-4'} gap-4`}>
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center">
              <UserPlus className="h-8 w-8 text-primary-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-900">Novo Membro</p>
            </button>
            
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center">
              <DollarSign className="h-8 w-8 text-success-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-900">Nova Receita</p>
            </button>
            
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center">
              <TrendingDown className="h-8 w-8 text-danger-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-900">Nova Despesa</p>
            </button>
            
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center">
              <FileText className="h-8 w-8 text-secondary-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-900">Relatório</p>
            </button>

            {isAdmin() && (
              <button 
                onClick={() => window.location.href = '/admin/access-requests'}
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center"
              >
                <UserCheck className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-900">Solicitações</p>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
