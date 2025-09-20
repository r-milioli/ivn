import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Eye,
  UserPlus,
  Users as UsersIcon,
  Shield,
  Mail,
  Calendar
} from 'lucide-react'
import userService from '../../services/userService'
import Loading from '../../components/common/Loading'
import Modal from '../../components/common/Modal'

const Users = () => {
  const navigate = useNavigate()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  // Carregar usuários
  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      setLoading(true)
      const response = await userService.listUsers({
        search: searchTerm,
        role: roleFilter,
        active: statusFilter === 'active' ? true : statusFilter === 'inactive' ? false : null
      })
      setUsers(response.data.users || [])
    } catch (error) {
      console.error('Erro ao carregar usuários:', error)
    } finally {
      setLoading(false)
    }
  }

  // Filtrar usuários
  useEffect(() => {
    loadUsers()
  }, [searchTerm, roleFilter, statusFilter])

  const handleDeleteUser = async (userId) => {
    try {
      await userService.deleteUser(userId)
      loadUsers()
      setShowDeleteModal(false)
      setSelectedUser(null)
    } catch (error) {
      console.error('Erro ao deletar usuário:', error)
    }
  }

  const getRoleBadge = (role) => {
    const styles = {
      admin: 'bg-red-100 text-red-800',
      secretary: 'bg-blue-100 text-blue-800'
    }
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[role]}`}>
        <Shield className="w-3 h-3 mr-1" />
        {role === 'admin' ? 'Administrador' : 'Secretário'}
      </span>
    )
  }

  const getStatusBadge = (active) => {
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
      }`}>
        {active ? 'Ativo' : 'Inativo'}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loading size="lg" text="Carregando usuários..." />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestão de Usuários</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gerencie usuários do sistema administrativo
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="mt-4 sm:mt-0 btn btn-primary"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Novo Usuário
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Busca */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar usuários..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 input"
            />
          </div>

          {/* Filtro por role */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="input"
          >
            <option value="">Todas as funções</option>
            <option value="admin">Administrador</option>
            <option value="secretary">Secretário</option>
          </select>

          {/* Filtro por status */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input"
          >
            <option value="">Todos os status</option>
            <option value="active">Ativo</option>
            <option value="inactive">Inativo</option>
          </select>

          {/* Botão de filtros */}
          <button
            onClick={loadUsers}
            className="btn btn-secondary"
          >
            <Filter className="w-4 h-4 mr-2" />
            Aplicar
          </button>
        </div>
      </div>

      {/* Lista de usuários */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {users.length === 0 ? (
          <div className="text-center py-12">
            <UsersIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum usuário encontrado
            </h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || roleFilter || statusFilter
                ? 'Tente ajustar os filtros de busca.'
                : 'Comece criando o primeiro usuário do sistema.'}
            </p>
            {!searchTerm && !roleFilter && !statusFilter && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn btn-primary"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Criar Primeiro Usuário
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usuário
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Função
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Último Login
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Criado em
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-medium text-sm">
                            {user.name?.charAt(0) || 'U'}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.name}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <Mail className="w-3 h-3 mr-1" />
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getRoleBadge(user.role)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(user.active)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.lastLogin ? (
                        <div className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          {new Date(user.lastLogin).toLocaleDateString('pt-BR')}
                        </div>
                      ) : (
                        'Nunca'
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => navigate(`/admin/users/${user.id}`)}
                          className="text-primary-600 hover:text-primary-900"
                          title="Ver detalhes"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => navigate(`/admin/users/${user.id}/edit`)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedUser(user)
                            setShowDeleteModal(true)
                          }}
                          className="text-red-600 hover:text-red-900"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de criação de usuário */}
      {showCreateModal && (
        <CreateUserModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false)
            loadUsers()
          }}
        />
      )}

      {/* Modal de confirmação de exclusão */}
      {showDeleteModal && selectedUser && (
        <Modal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false)
            setSelectedUser(null)
          }}
          title="Confirmar Exclusão"
        >
          <div className="space-y-4">
            <p className="text-gray-600">
              Tem certeza que deseja excluir o usuário <strong>{selectedUser.name}</strong>?
            </p>
            <p className="text-sm text-gray-500">
              Esta ação não pode ser desfeita. O usuário será removido permanentemente do sistema.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false)
                  setSelectedUser(null)
                }}
                className="btn btn-secondary"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDeleteUser(selectedUser.id)}
                className="btn btn-danger"
              >
                Excluir
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

// Componente do modal de criação de usuário
const CreateUserModal = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'secretary',
    active: true
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErrors({})

    try {
      // Validações básicas
      const newErrors = {}
      
      if (!formData.name.trim()) {
        newErrors.name = 'Nome é obrigatório'
      }
      
      if (!formData.email.trim()) {
        newErrors.email = 'Email é obrigatório'
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Email inválido'
      }
      
      if (!formData.password) {
        newErrors.password = 'Senha é obrigatória'
      } else if (formData.password.length < 6) {
        newErrors.password = 'Senha deve ter pelo menos 6 caracteres'
      }
      
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Senhas não coincidem'
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors)
        setLoading(false)
        return
      }

      // Enviar dados para API
      const userData = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        role: formData.role,
        active: formData.active
      }

      await userService.createUser(userData)
      onSuccess()
    } catch (error) {
      console.error('Erro ao criar usuário:', error)
      
      if (error.details) {
        setErrors(error.details)
      } else {
        setErrors({ general: error.message || 'Erro ao criar usuário' })
      }
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    
    // Limpar erro do campo quando usuário começar a digitar
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  return (
    <Modal isOpen={true} onClose={onClose} title="Criar Novo Usuário">
      <form onSubmit={handleSubmit} className="space-y-6">
        {errors.general && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-sm text-red-600">{errors.general}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Nome */}
          <div className="md:col-span-2">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Nome Completo *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`input ${errors.name ? 'border-red-500' : ''}`}
              placeholder="Digite o nome completo"
            />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
          </div>

          {/* Email */}
          <div className="md:col-span-2">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`input ${errors.email ? 'border-red-500' : ''}`}
              placeholder="usuario@igreja.com"
            />
            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
          </div>

          {/* Senha */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Senha *
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`input ${errors.password ? 'border-red-500' : ''}`}
              placeholder="Mínimo 6 caracteres"
            />
            {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
          </div>

          {/* Confirmar Senha */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Confirmar Senha *
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`input ${errors.confirmPassword ? 'border-red-500' : ''}`}
              placeholder="Digite a senha novamente"
            />
            {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
          </div>

          {/* Função */}
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
              Função *
            </label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="input"
            >
              <option value="secretary">Secretário</option>
              <option value="admin">Administrador</option>
            </select>
          </div>

          {/* Status */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="active"
              name="active"
              checked={formData.active}
              onChange={handleChange}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label htmlFor="active" className="ml-2 block text-sm text-gray-700">
              Usuário ativo
            </label>
          </div>
        </div>

        {/* Botões */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-secondary"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loading size="sm" />
                Criando...
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4 mr-2" />
                Criar Usuário
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default Users
