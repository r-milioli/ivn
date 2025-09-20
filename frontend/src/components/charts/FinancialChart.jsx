import React from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'

const FinancialChart = ({ 
  title = 'Gráfico Financeiro',
  data = [],
  type = 'line', // line, bar, area
  height = 'h-64',
  showLegend = true,
  className = ''
}) => {
  // Dados mockados para demonstração
  const mockData = [
    { label: 'Jan', income: 8500, expense: 3200 },
    { label: 'Fev', income: 9200, expense: 3800 },
    { label: 'Mar', income: 7800, expense: 2900 },
    { label: 'Abr', income: 10500, expense: 4200 },
    { label: 'Mai', income: 8800, expense: 3500 },
    { label: 'Jun', income: 11200, expense: 4800 },
    { label: 'Jul', income: 9500, expense: 3600 },
    { label: 'Ago', income: 10800, expense: 4100 },
    { label: 'Set', income: 8700, expense: 3300 },
    { label: 'Out', income: 10200, expense: 4400 },
    { label: 'Nov', income: 9100, expense: 3700 },
    { label: 'Dez', income: 11500, expense: 4600 }
  ]

  const chartData = data.length > 0 ? data : mockData

  // Calcular valores para o gráfico
  const maxValue = Math.max(...chartData.flatMap(d => [d.income, d.expense]))
  const minValue = Math.min(...chartData.flatMap(d => [d.income, d.expense]))
  const range = maxValue - minValue

  // Calcular altura das barras
  const getBarHeight = (value) => {
    return ((value - minValue) / range) * 100
  }

  // Calcular saldo
  const getBalance = (income, expense) => {
    return income - expense
  }

  return (
    <div className={`card ${className}`}>
      <div className="card-header">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {showLegend && (
          <div className="flex items-center space-x-4 mt-2">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-success-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Receitas</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-danger-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Despesas</span>
            </div>
          </div>
        )}
      </div>
      
      <div className="card-body">
        <div className={`${height} relative`}>
          {/* Gráfico de barras simples */}
          <div className="h-full flex items-end justify-between space-x-1 pb-8">
            {chartData.map((item, index) => (
              <div key={index} className="flex flex-col items-center flex-1">
                {/* Barras */}
                <div className="w-full flex flex-col items-center justify-end space-y-1 mb-2">
                  {/* Barra de receita */}
                  <div 
                    className="w-full bg-success-500 rounded-t"
                    style={{ height: `${getBarHeight(item.income)}%` }}
                    title={`Receita: R$ ${item.income.toLocaleString('pt-BR')}`}
                  ></div>
                  
                  {/* Barra de despesa */}
                  <div 
                    className="w-full bg-danger-500 rounded-b"
                    style={{ height: `${getBarHeight(item.expense)}%` }}
                    title={`Despesa: R$ ${item.expense.toLocaleString('pt-BR')}`}
                  ></div>
                </div>
                
                {/* Label do mês */}
                <span className="text-xs text-gray-500 font-medium">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
          
          {/* Linha de referência */}
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gray-200"></div>
        </div>
        
        {/* Estatísticas do gráfico */}
        <div className="mt-4 grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1 mb-1">
              <TrendingUp className="h-4 w-4 text-success-500" />
              <span className="text-sm font-medium text-gray-900">
                R$ {Math.round(chartData.reduce((sum, item) => sum + item.income, 0) / chartData.length).toLocaleString('pt-BR')}
              </span>
            </div>
            <p className="text-xs text-gray-500">Receita Média</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1 mb-1">
              <TrendingDown className="h-4 w-4 text-danger-500" />
              <span className="text-sm font-medium text-gray-900">
                R$ {Math.round(chartData.reduce((sum, item) => sum + item.expense, 0) / chartData.length).toLocaleString('pt-BR')}
              </span>
            </div>
            <p className="text-xs text-gray-500">Despesa Média</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1 mb-1">
              <div className="w-4 h-4 bg-primary-500 rounded-full"></div>
              <span className="text-sm font-medium text-gray-900">
                R$ {Math.round(chartData.reduce((sum, item) => sum + getBalance(item.income, item.expense), 0) / chartData.length).toLocaleString('pt-BR')}
              </span>
            </div>
            <p className="text-xs text-gray-500">Saldo Médio</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FinancialChart
