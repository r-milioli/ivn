import React, { useState, useEffect } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Eye, EyeOff, Church, Mail, Lock, User, UserCheck } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useApp } from '../../context/AppContext'
import registerService from '../../services/registerService'
import Loading from '../../components/common/Loading'

const Register = () => {
  const { isAuthenticated, loading: authLoading } = useAuth()
  const { notifySuccess, notifyError } = useApp()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setFocus
  } = useForm()

  const password = watch('password')

  // Redirecionar se já estiver autenticado
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  // Focar no primeiro campo ao carregar
  useEffect(() => {
    setFocus('name')
  }, [setFocus])

  const onSubmit = async (data) => {
    try {
      setIsLoading(true)
      
      // Validar dados
      const errors = registerService.validateUserData(data)
      if (Object.keys(errors).length > 0) {
        // Os erros já são mostrados pelo react-hook-form
        return
      }
      
      // Verificar disponibilidade do email
      const emailCheck = await registerService.checkEmailAvailability(data.email)
      if (!emailCheck.available) {
        notifyError(emailCheck.message)
        return
      }
      
      // Formatar dados
      const formattedData = registerService.formatUserData(data)
      
      // Enviar solicitação
      const result = await registerService.requestAccess(formattedData)
      
      if (result.success) {
        notifySuccess(result.message)
        
        // Redirecionar para login após cadastro
        setTimeout(() => {
          window.location.href = '/login'
        }, 2000)
      }
      
    } catch (error) {
      notifyError('Erro ao realizar cadastro. Tente novamente.')
      console.error('Erro no cadastro:', error)
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
            Criar Conta
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Solicite acesso ao sistema administrativo
          </p>
        </div>

        {/* Formulário de cadastro */}
        <div className="card">
          <div className="card-body">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Campo de nome */}
              <div className="form-group">
                <label htmlFor="name" className="label label-required">
                  Nome Completo
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...register('name', {
                      required: 'Nome é obrigatório',
                      minLength: {
                        value: 2,
                        message: 'Nome deve ter pelo menos 2 caracteres'
                      }
                    })}
                    type="text"
                    autoComplete="name"
                    className={`input pl-10 ${errors.name ? 'input-error' : ''}`}
                    placeholder="Seu nome completo"
                  />
                </div>
                {errors.name && (
                  <p className="form-error">{errors.name.message}</p>
                )}
              </div>

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
                    autoComplete="new-password"
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

              {/* Campo de confirmar senha */}
              <div className="form-group">
                <label htmlFor="confirmPassword" className="label label-required">
                  Confirmar Senha
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <UserCheck className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...register('confirmPassword', {
                      required: 'Confirmação de senha é obrigatória',
                      validate: value => value === password || 'Senhas não coincidem'
                    })}
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    className={`input pl-10 pr-10 ${errors.confirmPassword ? 'input-error' : ''}`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="form-error">{errors.confirmPassword.message}</p>
                )}
              </div>

              {/* Campo de função */}
              <div className="form-group">
                <label htmlFor="role" className="label label-required">
                  Função Desejada
                </label>
                <select
                  {...register('role', {
                    required: 'Função é obrigatória'
                  })}
                  className={`input ${errors.role ? 'input-error' : ''}`}
                >
                  <option value="">Selecione uma função</option>
                  <option value="secretary">Secretário</option>
                  <option value="admin">Administrador</option>
                </select>
                {errors.role && (
                  <p className="form-error">{errors.role.message}</p>
                )}
              </div>

              {/* Termos e condições */}
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    {...register('terms', {
                      required: 'Você deve aceitar os termos de uso'
                    })}
                    id="terms"
                    type="checkbox"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="terms" className="text-gray-700">
                    Eu aceito os{' '}
                    <a href="#" className="text-primary-600 hover:text-primary-500">
                      termos de uso
                    </a>{' '}
                    e{' '}
                    <a href="#" className="text-primary-600 hover:text-primary-500">
                      política de privacidade
                    </a>
                  </label>
                  {errors.terms && (
                    <p className="form-error mt-1">{errors.terms.message}</p>
                  )}
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
                      <span>Criando conta...</span>
                    </div>
                  ) : (
                    'Criar Conta'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Link para login */}
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Já tem uma conta?{' '}
            <Link
              to="/login"
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              Faça login aqui
            </Link>
          </p>
        </div>

        {/* Informações sobre aprovação */}
        <div className="card bg-blue-50 border-blue-200">
          <div className="card-body">
            <h3 className="text-sm font-medium text-blue-800 mb-2">
              Processo de Aprovação
            </h3>
            <div className="text-xs text-blue-700 space-y-1">
              <p>• Seu cadastro será analisado por um administrador</p>
              <p>• Você receberá um email quando sua conta for aprovada</p>
              <p>• O processo pode levar até 24 horas</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register
