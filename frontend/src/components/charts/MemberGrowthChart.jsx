import React from 'react'
import { Users, UserPlus, TrendingUp } from 'lucide-react'

const MemberGrowthChart = ({ 
  title = 'Crescimento de Membros',
  data = [],
  height = 'h-64',
  className = ''
}) => {
  // Dados mockados para demonstração
  const mockData = [
    { month: 'Jan', newMembers: 8, totalMembers: 280 },
    { month: 'Fev', newMembers: 12, totalMembers: 292 },
    { month: 'Mar', newMembers: 15, totalMembers: 307 },
    { month: 'Abr', newMembers: 10, totalMembers: 317 },
    { month: 'Mai', newMembers: 18, totalMembers: 335 },
    { month: 'Jun', newMembers: 14, totalMembers: 349 },
    { month: 'Jul', newMembers: 22, totalMembers: 371 },
    { month: 'Ago', newMembers: 16, totalMembers: 387 },
    { month: 'Set', newMembers: 13, totalMembers: 400 },
    { month: 'Out', newMembers: 20, totalMembers: 420 },
    { month: 'Nov', newMembers: 17, totalMembers: 437 },
    { month: 'Dez', newMembers: 25, totalMembers: 462 }
  ]

  const chartData = data.length > 0 ? data : mockData

  // Calcular estatísticas
  const totalNewMembers = chartData.reduce((sum, item) => sum + item.newMembers, 0)
  const averageNewMembers = Math.round(totalNewMembers / chartData.length)
  const currentTotal = chartData[chartData.length - 1]?.totalMembers || 0
  const previousTotal = chartData[chartData.length - 2]?.totalMembers || 0
  const growthRate = previousTotal > 0 ? ((currentTotal - previousTotal) / previousTotal * 100) : 0

  // Encontrar valores máximos para escalar o gráfico
  const maxNewMembers = Math.max(...chartData.map(d => d.newMembers))
  const maxTotalMembers = Math.max(...chartData.map(d => d.totalMembers))

  const getBarHeight = (value, maxValue) => {
    return (value / maxValue) * 100
  }

  return (
    <div className={`card ${className}`}>
      <div className="card-header">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <div className="flex items-center space-x-4 mt-2">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-primary-500 rounded-full"></div>
            <span className="text-sm text-gray-600">Novos Membros</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-secondary-500 rounded-full"></div>
            <span className="text-sm text-gray-600">Total Acumulado</span>
          </div>
        </div>
      </div>
      
      <div className="card-body">
        <div className={`${height} relative`}>
          {/* Gráfico de barras */}
          <div className="h-full flex items-end justify-between space-x-1 pb-8">
            {chartData.map((item, index) => (
              <div key={index} className="flex flex-col items-center flex-1">
                {/* Barras */}
                <div className="w-full flex flex-col items-center justify-end space-y-1 mb-2">
                  {/* Barra de novos membros */}
                  <div 
                    className="w-full bg-primary-500 rounded-t"
                    style={{ height: `${getBarHeight(item.newMembers, maxNewMembers)}%` }}
                    title={`Novos: ${item.newMembers} | Total: ${item.totalMembers}`}
                  ></div>
                </div>
                
                {/* Label do mês */}
                <span className="text-xs text-gray-500 font-medium">
                  {item.month}
                </span>
              </div>
            ))}
          </div>
          
          {/* Linha de referência */}
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gray-200"></div>
        </div>
        
        {/* Estatísticas */}
        <div className="mt-4 grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1 mb-1">
              <UserPlus className="h-4 w-4 text-primary-500" />
              <span className="text-lg font-bold text-gray-900">{totalNewMembers}</span>
            </div>
            <p className="text-xs text-gray-500">Novos Membros (Ano)</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1 mb-1">
              <TrendingUp className="h-4 w-4 text-success-500" />
              <span className="text-lg font-bold text-gray-900">
                {growthRate > 0 ? '+' : ''}{growthRate.toFixed(1)}%
              </span>
            </div>
            <p className="text-xs text-gray-500">Crescimento</p>
          </div>
        </div>
        
        {/* Informações adicionais */}
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-900">
                Total Atual: {currentTotal.toLocaleString('pt-BR')} membros
              </span>
            </div>
            <div className="text-sm text-gray-600">
              Média: {averageNewMembers} novos/mês
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MemberGrowthChart
