import React, { useState, useEffect } from 'react'
import { 
  CheckCircle, 
  XCircle, 
  Eye, 
  Edit,
  Trash2,
  Search,
  Filter,
  BarChart3,
  UserPlus,
  Clock,
  AlertTriangle
} from 'lucide-react'
import Loading from '../../components/common/Loading'
import Modal from '../../components/common/Modal'
import accessRequestService from '../../services/accessRequestService'
import { useApp } from '../../context/AppContext'

const AccessRequests = () => {
  const { notifySuccess, notifyError } = useApp()
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState('view') // 'view', 'edit', 'approve', 'reject'
  const [rejectReason, setRejectReason] = useState('')
  const [editData, setEditData] = useState({})
  const [statistics, setStatistics] = useState({})
  const [filters, setFilters] = useState({
    status: '',
    search: '',
    page: 1,
    limit: 10
  })
  const [pagination, setPagination] = useState({})

  // Carregar dados iniciais
  useEffect(() => {
    loadRequests()
    loadStatistics()
  }, [filters])

  const loadRequests = async () => {
    try {
      setLoading(true)
      const response = await accessRequestService.listRequests(filters)
      console.log('Resposta completa da API:', response) // Debug
      console.log('Dados da resposta:', response.data) // Debug
      console.log('Requests encontrados:', response.data.requests) // Debug
      setRequests(response.data.requests || [])
      setPagination(response.data.pagination || {})
    } catch (error) {
      console.error('Erro ao carregar solicitações:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadStatistics = async () => {
    try {
      const response = await accessRequestService.getStatistics()
      setStatistics(response.data)
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error)
    }
  }

  const handleApprove = async (requestId) => {
    try {
      setActionLoading(true)
      await accessRequestService.approveRequest(requestId)
      await loadRequests()
      await loadStatistics()
      setShowModal(false)
      notifySuccess('Solicitação aprovada com sucesso!')
    } catch (error) {
      console.error('Erro ao aprovar solicitação:', error)
      notifyError('Erro ao aprovar solicitação: ' + error.message)
    } finally {
      setActionLoading(false)
    }
  }

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      notifyError('Por favor, informe o motivo da rejeição')
      return
    }

    try {
      setActionLoading(true)
      await accessRequestService.rejectRequest(selectedRequest.id, rejectReason)
      await loadRequests()
      await loadStatistics()
      setShowModal(false)
      setRejectReason('')
      notifySuccess('Solicitação rejeitada com sucesso!')
    } catch (error) {
      console.error('Erro ao rejeitar solicitação:', error)
      notifyError('Erro ao rejeitar solicitação: ' + error.message)
    } finally {
      setActionLoading(false)
    }
  }

  const handleDelete = async (requestId) => {
    if (!confirm('Tem certeza que deseja remover esta solicitação?')) {
      return
    }

    try {
      setActionLoading(true)
      await accessRequestService.deleteRequest(requestId)
      await loadRequests()
      await loadStatistics()
      notifySuccess('Solicitação removida com sucesso!')
    } catch (error) {
      console.error('Erro ao remover solicitação:', error)
      notifyError('Erro ao remover solicitação: ' + error.message)
    } finally {
      setActionLoading(false)
    }
  }

  const openModal = (request, type) => {
    setSelectedRequest(request)
    setModalType(type)
    setShowModal(true)
    if (type === 'reject') {
      setRejectReason('')
    } else if (type === 'edit') {
      setEditData({
        name: request.name,
        email: request.email,
        role: request.role
      })
    }
  }

  const closeModal = () => {
    setShowModal(false)
    setSelectedRequest(null)
    setRejectReason('')
    setEditData({})
  }

  const handleUpdate = async () => {
    if (!selectedRequest) return

    try {
      setActionLoading(true)
      await accessRequestService.updateRequest(selectedRequest.id, editData)
      notifySuccess('Solicitação atualizada com sucesso!')
      closeModal()
      loadRequests()
    } catch (error) {
      notifyError(error.response?.data?.message || 'Erro ao atualizar solicitação')
    } finally {
      setActionLoading(false)
    }
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { 
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        icon: Clock,
        label: 'Pendente'
      },
      approved: { 
        color: 'bg-green-100 text-green-800 border-green-200',
        icon: CheckCircle,
        label: 'Aprovado'
      },
      rejected: { 
        color: 'bg-red-100 text-red-800 border-red-200',
        icon: XCircle,
        label: 'Rejeitado'
      }
    }

    const config = statusConfig[status] || statusConfig.pending
    const Icon = config.icon

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </span>
    )
  }

  const getRoleBadge = (role) => {
    const roleConfig = {
      admin: { color: 'bg-purple-100 text-purple-800', label: 'Administrador' },
      secretary: { color: 'bg-blue-100 text-blue-800', label: 'Secretário' }
    }

    const config = roleConfig[role] || roleConfig.secretary

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    )
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Data não disponível';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Data inválida';
      }
      
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Data inválida';
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Solicitações de Acesso</h1>
          <p className="text-gray-600">Gerencie solicitações de novos usuários</p>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <UserPlus className="h-8 w-8 text-blue-600" />
          </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total</p>
              <p className="text-2xl font-semibold text-gray-900">{statistics.total || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Pendentes</p>
              <p className="text-2xl font-semibold text-gray-900">{statistics.pending || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Aprovadas</p>
              <p className="text-2xl font-semibold text-gray-900">{statistics.approved || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Rejeitadas</p>
              <p className="text-2xl font-semibold text-gray-900">{statistics.rejected || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Buscar
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Nome ou email..."
                className="pl-10 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
            >
              <option value="">Todos os status</option>
              <option value="pending">Pendente</option>
              <option value="approved">Aprovado</option>
              <option value="rejected">Rejeitado</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Itens por página
            </label>
            <select
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filters.limit}
              onChange={(e) => setFilters({ ...filters, limit: parseInt(e.target.value), page: 1 })}
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabela de Solicitações */}
      <div className="bg-white shadow-sm rounded-lg border overflow-hidden">
        {loading ? (
          <div className="p-8">
            <Loading />
          </div>
        ) : requests.length === 0 ? (
          <div className="p-8 text-center">
            <AlertTriangle className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhuma solicitação encontrada</h3>
            <p className="mt-1 text-sm text-gray-500">
              {filters.search || filters.status 
                ? 'Tente ajustar os filtros de busca.' 
                : 'Não há solicitações de acesso no momento.'}
            </p>
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
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {requests.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{request.name}</div>
                        <div className="text-sm text-gray-500">{request.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getRoleBadge(request.role)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(request.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(request.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => openModal(request, 'view')}
                          className="text-blue-600 hover:text-blue-900 p-1"
                          title="Visualizar"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        
                        {request.status === 'pending' && (
                          <>
                            <button
                              onClick={() => openModal(request, 'edit')}
                              className="text-blue-600 hover:text-blue-900 p-1"
                              title="Editar"
                              disabled={actionLoading}
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => openModal(request, 'approve')}
                              className="text-green-600 hover:text-green-900 p-1"
                              title="Aprovar"
                              disabled={actionLoading}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => openModal(request, 'reject')}
                              className="text-red-600 hover:text-red-900 p-1"
                              title="Rejeitar"
                              disabled={actionLoading}
                            >
                              <XCircle className="h-4 w-4" />
                            </button>
                          </>
                        )}
                        
                        <button
                          onClick={() => handleDelete(request.id)}
                          className="text-gray-600 hover:text-red-600 p-1"
                          title="Remover"
                          disabled={actionLoading}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Paginação */}
        {pagination.totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                disabled={filters.page <= 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anterior
              </button>
              <button
                onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                disabled={filters.page >= pagination.totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Próximo
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Mostrando <span className="font-medium">{pagination.startIndex || 1}</span> até{' '}
                  <span className="font-medium">{pagination.endIndex || 0}</span> de{' '}
                  <span className="font-medium">{pagination.total || 0}</span> resultados
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                    disabled={filters.page <= 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Anterior
                  </button>
                  <button
                    onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                    disabled={filters.page >= pagination.totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Próximo
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal isOpen={showModal} onClose={closeModal}>
        {modalType === 'view' && selectedRequest && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Detalhes da Solicitação</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nome</label>
                <p className="text-sm text-gray-900">{selectedRequest.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <p className="text-sm text-gray-900">{selectedRequest.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Role</label>
                <p className="text-sm text-gray-900">{getRoleBadge(selectedRequest.role)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <p className="text-sm text-gray-900">{getStatusBadge(selectedRequest.status)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Data de Solicitação</label>
                <p className="text-sm text-gray-900">{formatDate(selectedRequest.createdAt)}</p>
              </div>
              {selectedRequest.approvedAt && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Data de Processamento</label>
                  <p className="text-sm text-gray-900">{formatDate(selectedRequest.approvedAt)}</p>
                </div>
              )}
              {selectedRequest.rejectionReason && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Motivo da Rejeição</label>
                  <p className="text-sm text-gray-900">{selectedRequest.rejectionReason}</p>
                </div>
              )}
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
              >
                Fechar
              </button>
            </div>
          </div>
        )}

        {modalType === 'edit' && selectedRequest && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Editar Solicitação</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nome</label>
                <input
                  type="text"
                  value={editData.name || ''}
                  onChange={(e) => setEditData({...editData, name: e.target.value})}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  value={editData.email || ''}
                  onChange={(e) => setEditData({...editData, email: e.target.value})}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Role</label>
                <select
                  value={editData.role || ''}
                  onChange={(e) => setEditData({...editData, role: e.target.value})}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="secretary">Secretário</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                disabled={actionLoading}
              >
                Cancelar
              </button>
              <button
                onClick={handleUpdate}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50"
                disabled={actionLoading}
              >
                {actionLoading ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        )}

        {modalType === 'approve' && selectedRequest && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Aprovar Solicitação</h3>
            <p className="text-sm text-gray-600">
              Tem certeza que deseja aprovar a solicitação de <strong>{selectedRequest.name}</strong>?
              O usuário será criado com role de <strong>{selectedRequest.role}</strong>.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                disabled={actionLoading}
              >
                Cancelar
              </button>
              <button
                onClick={() => handleApprove(selectedRequest.id)}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md disabled:opacity-50"
                disabled={actionLoading}
              >
                {actionLoading ? 'Aprovando...' : 'Aprovar'}
              </button>
            </div>
          </div>
        )}

        {modalType === 'reject' && selectedRequest && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Rejeitar Solicitação</h3>
            <p className="text-sm text-gray-600">
              Tem certeza que deseja rejeitar a solicitação de <strong>{selectedRequest.name}</strong>?
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Motivo da rejeição *
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Informe o motivo da rejeição..."
                required
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                disabled={actionLoading}
              >
                Cancelar
              </button>
              <button
                onClick={handleReject}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md disabled:opacity-50"
                disabled={actionLoading}
              >
                {actionLoading ? 'Rejeitando...' : 'Rejeitar'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default AccessRequests
