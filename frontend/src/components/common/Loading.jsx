import React from 'react'

const Loading = ({ 
  size = 'md', 
  text = 'Carregando...', 
  fullScreen = false,
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  }

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl'
  }

  const LoadingContent = () => (
    <div className={`flex flex-col items-center justify-center space-y-4 ${className}`}>
      {/* Spinner */}
      <div className={`spinner ${sizeClasses[size]} border-2 border-gray-300 border-t-primary-600`}></div>
      
      {/* Texto */}
      {text && (
        <p className={`text-gray-600 ${textSizeClasses[size]}`}>
          {text}
        </p>
      )}
    </div>
  )

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
        <LoadingContent />
      </div>
    )
  }

  return <LoadingContent />
}

// Componente de loading para botões
export const ButtonLoading = ({ size = 'sm' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  }

  return (
    <div className={`spinner ${sizeClasses[size]} border-2 border-white border-t-transparent`}></div>
  )
}

// Componente de loading para cards
export const CardLoading = ({ lines = 3 }) => {
  return (
    <div className="card animate-pulse">
      <div className="card-body">
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>
      </div>
    </div>
  )
}

// Componente de loading para tabelas
export const TableLoading = ({ rows = 5, columns = 4 }) => {
  return (
    <div className="card animate-pulse">
      <div className="card-body p-0">
        <table className="table">
          <thead>
            <tr>
              {Array.from({ length: columns }).map((_, index) => (
                <th key={index}>
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }).map((_, rowIndex) => (
              <tr key={rowIndex}>
                {Array.from({ length: columns }).map((_, colIndex) => (
                  <td key={colIndex}>
                    <div className="h-4 bg-gray-200 rounded w-16"></div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// Componente de loading para gráficos
export const ChartLoading = ({ height = 'h-64' }) => {
  return (
    <div className={`card animate-pulse ${height}`}>
      <div className="card-body flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="spinner w-8 h-8 mx-auto"></div>
          <p className="text-gray-600">Carregando gráfico...</p>
        </div>
      </div>
    </div>
  )
}

// Componente de loading para formulários
export const FormLoading = ({ fields = 5 }) => {
  return (
    <div className="space-y-6 animate-pulse">
      {Array.from({ length: fields }).map((_, index) => (
        <div key={index} className="form-group">
          <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
          <div className="h-10 bg-gray-200 rounded w-full"></div>
        </div>
      ))}
      <div className="flex justify-end space-x-3">
        <div className="h-10 bg-gray-200 rounded w-20"></div>
        <div className="h-10 bg-gray-200 rounded w-24"></div>
      </div>
    </div>
  )
}

// Componente de skeleton personalizado
export const Skeleton = ({ 
  className = '', 
  width = 'w-full', 
  height = 'h-4' 
}) => {
  return (
    <div className={`bg-gray-200 rounded animate-pulse ${width} ${height} ${className}`}></div>
  )
}

export default Loading
