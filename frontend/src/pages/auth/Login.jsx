import React, { useState, useEffect } from 'react'
import { Navigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Eye, EyeOff, Church, Mail, Lock } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useApp } from '../../context/AppContext'
import Loading from '../../components/common/Loading'

const Login = () => {
  const { login, isAuthenticated, loading: authLoading } = useAuth()
  const { notifyError } = useApp()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setFocus
  } = useForm()

  // Redirecionar se já estiver autenticado
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  // Focar no primeiro campo ao carregar
  useEffect(() => {
    setFocus('email')
  }, [setFocus])

  const onSubmit = async (data) => {
    try {
      setIsLoading(true)
      await login(data)
    } catch (error) {
      // O erro já é tratado no contexto
      console.error('Erro no login:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loading size="lg" text="Verificando autenticação..." />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Logo e título */}
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center mb-6">
            <Church className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">
            Igreja Admin
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sistema de Gestão e Administração
          </p>
        </div>

        {/* Formulário de login */}
        <div className="card">
          <div className="card-body">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Campo de email */}
              <div className="form-group">
                <label htmlFor="email" className="label label-required">
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...register('email', {
                      required: 'Email é obrigatório',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Email inválido'
                      }
                    })}
                    type="email"
                    autoComplete="email"
                    className={`input pl-10 ${errors.email ? 'input-error' : ''}`}
                    placeholder="seu@email.com"
                  />
                </div>
                {errors.email && (
                  <p className="form-error">{errors.email.message}</p>
                )}
              </div>

              {/* Campo de senha */}
              <div className="form-group">
                <label htmlFor="password" className="label label-required">
                  Senha
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...register('password', {
                      required: 'Senha é obrigatória',
                      minLength: {
                        value: 6,
                        message: 'Senha deve ter pelo menos 6 caracteres'
                      }
                    })}
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    className={`input pl-10 pr-10 ${errors.password ? 'input-error' : ''}`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="form-error">{errors.password.message}</p>
                )}
              </div>

              {/* Opções adicionais */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                    Lembrar de mim
                  </label>
                </div>

                <div className="text-sm">
                  <a
                    href="#"
                    className="font-medium text-primary-600 hover:text-primary-500"
                  >
                    Esqueceu a senha?
                  </a>
                </div>
              </div>

              {/* Botão de submit */}
              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn btn-primary btn-lg w-full"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="spinner w-5 h-5 border-2 border-white border-t-transparent"></div>
                      <span>Entrando...</span>
                    </div>
                  ) : (
                    'Entrar'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Link para cadastro */}
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Não tem uma conta?{' '}
            <Link
              to="/register"
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              Solicite acesso aqui
            </Link>
          </p>
        </div>

        {/* Informações adicionais */}
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Sistema desenvolvido para{' '}
            <span className="font-medium text-primary-600">
              administração de igreja
            </span>
          </p>
          <p className="mt-1 text-xs text-gray-500">
            Controle financeiro • Gestão de membros • Relatórios
          </p>
        </div>

        {/* Dicas de acesso */}
        <div className="card bg-primary-50 border-primary-200">
          <div className="card-body">
            <h3 className="text-sm font-medium text-primary-800 mb-2">
              Acesso de teste
            </h3>
            <div className="text-xs text-primary-700 space-y-1">
              <p><strong>Admin:</strong> admin@igreja.com / admin123</p>
              <p><strong>Secretário:</strong> secretario@igreja.com / secret123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
