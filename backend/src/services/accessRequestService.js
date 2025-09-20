const { AccessRequest, User } = require('../models');
const { authLog } = require('../utils/logger');

/**
 * Service para operações de solicitações de acesso
 * Gerencia o processo de solicitação e aprovação de novos usuários
 */

/**
 * Cria uma nova solicitação de acesso
 * @param {Object} requestData - Dados da solicitação
 * @param {string} ipAddress - IP do solicitante
 * @param {string} userAgent - User Agent do solicitante
 * @returns {Object} Solicitação criada
 */
const createAccessRequest = async (requestData, ipAddress, userAgent) => {
  try {
    
    // Verificar se já existe uma solicitação pendente com este email
    const existingRequest = await AccessRequest.findPendingByEmail(requestData.email);
    if (existingRequest) {
      throw new Error('Já existe uma solicitação pendente com este email');
    }

    // Verificar se já existe um usuário com este email
    const existingUser = await User.findByEmail(requestData.email);
    if (existingUser && !existingUser.deletedAt) {
      throw new Error('Já existe um usuário cadastrado com este email');
    }

    // Criar a solicitação
    const newRequest = await AccessRequest.create({
      ...requestData,
      ipAddress,
      userAgent
    });

    authLog('info', 'Nova solicitação de acesso criada', {
      requestId: newRequest.id,
      email: newRequest.email,
      name: newRequest.name,
      role: newRequest.role,
      ipAddress,
      userAgent
    });

    const result = newRequest.toJSON();
    return result;
  } catch (error) {
    authLog('error', 'Erro ao criar solicitação de acesso', {
      email: requestData.email,
      error: error.message,
      ipAddress,
      userAgent
    });
    throw error;
  }
};

/**
 * Lista solicitações de acesso com filtros
 * @param {Object} options - Opções de filtro e paginação
 * @returns {Object} Lista de solicitações
 */
const listAccessRequests = async (options = {}) => {
  try {
    const { page = 1, limit = 10, status = '', search = '' } = options;
    
    const whereClause = {};
    
    // Filtro por status
    if (status) {
      whereClause.status = status;
    }
    
    // Filtro por busca
    if (search) {
      whereClause[sequelize.Op.or] = [
        { name: { [sequelize.Op.iLike]: `%${search}%` } },
        { email: { [sequelize.Op.iLike]: `%${search}%` } }
      ];
    }

    const { count, rows } = await AccessRequest.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'approver',
          attributes: ['id', 'name', 'email']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: (page - 1) * limit
    });

    return {
      requests: rows,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: limit
      }
    };
  } catch (error) {
    authLog('error', 'Erro ao listar solicitações de acesso', {
      error: error.message,
      options
    });
    throw error;
  }
};

/**
 * Busca solicitação por ID
 * @param {string} requestId - ID da solicitação
 * @returns {Object} Dados da solicitação
 */
const getAccessRequestById = async (requestId) => {
  try {
    const request = await AccessRequest.findByPk(requestId, {
      include: [
        {
          model: User,
          as: 'approver',
          attributes: ['id', 'name', 'email']
        }
      ]
    });
    
    if (!request) {
      throw new Error('Solicitação não encontrada');
    }

    return request.toJSON();
  } catch (error) {
    authLog('error', 'Erro ao buscar solicitação por ID', {
      requestId,
      error: error.message
    });
    throw error;
  }
};

/**
 * Aprova uma solicitação de acesso
 * @param {string} requestId - ID da solicitação
 * @param {Object} approver - Usuário que está aprovando
 * @returns {Object} Usuário criado
 */
const approveAccessRequest = async (requestId, approver) => {
  try {
    const request = await AccessRequest.findByPk(requestId);
    
    if (!request) {
      throw new Error('Solicitação não encontrada');
    }

    if (request.status !== 'pending') {
      throw new Error('Solicitação já foi processada');
    }

    // Criar o usuário
    const userData = {
      name: request.name,
      email: request.email,
      password: request.password,
      role: request.role,
      active: true
    };

    const newUser = await User.create(userData);

    // Atualizar a solicitação
    await request.update({
      status: 'approved',
      approvedBy: approver.id,
      approvedAt: new Date()
    });

    authLog('info', 'Solicitação de acesso aprovada', {
      requestId: request.id,
      userId: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
      approvedBy: approver.id,
      approvedByEmail: approver.email
    });

    return newUser.toJSON();
  } catch (error) {
    authLog('error', 'Erro ao aprovar solicitação de acesso', {
      requestId,
      approvedBy: approver.id,
      error: error.message
    });
    throw error;
  }
};

/**
 * Rejeita uma solicitação de acesso
 * @param {string} requestId - ID da solicitação
 * @param {string} reason - Motivo da rejeição
 * @param {Object} rejector - Usuário que está rejeitando
 * @returns {boolean} Sucesso da operação
 */
const rejectAccessRequest = async (requestId, reason, rejector) => {
  try {
    const request = await AccessRequest.findByPk(requestId);
    
    if (!request) {
      throw new Error('Solicitação não encontrada');
    }

    if (request.status !== 'pending') {
      throw new Error('Solicitação já foi processada');
    }

    // Atualizar a solicitação
    await request.update({
      status: 'rejected',
      rejectionReason: reason,
      approvedBy: rejector.id,
      approvedAt: new Date()
    });

    authLog('info', 'Solicitação de acesso rejeitada', {
      requestId: request.id,
      email: request.email,
      name: request.name,
      reason,
      rejectedBy: rejector.id,
      rejectedByEmail: rejector.email
    });

    return true;
  } catch (error) {
    authLog('error', 'Erro ao rejeitar solicitação de acesso', {
      requestId,
      rejectedBy: rejector.id,
      error: error.message
    });
    throw error;
  }
};

/**
 * Verifica se um email já tem solicitação pendente
 * @param {string} email - Email para verificar
 * @returns {boolean} Se tem solicitação pendente
 */
const hasPendingRequest = async (email) => {
  try {
    const request = await AccessRequest.findPendingByEmail(email);
    return !!request;
  } catch (error) {
    authLog('error', 'Erro ao verificar solicitação pendente', {
      email,
      error: error.message
    });
    throw error;
  }
};

/**
 * Obtém estatísticas de solicitações
 * @returns {Object} Estatísticas
 */
const getRequestStatistics = async () => {
  try {
    const totalRequests = await AccessRequest.count();
    const pendingRequests = await AccessRequest.count({ where: { status: 'pending' } });
    const approvedRequests = await AccessRequest.count({ where: { status: 'approved' } });
    const rejectedRequests = await AccessRequest.count({ where: { status: 'rejected' } });

    // Solicitações do último mês
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    
    const requestsLastMonth = await AccessRequest.count({
      where: {
        createdAt: {
          [require('sequelize').Op.gte]: lastMonth
        }
      }
    });

    return {
      total: totalRequests,
      pending: pendingRequests,
      approved: approvedRequests,
      rejected: rejectedRequests,
      lastMonth: requestsLastMonth
    };
  } catch (error) {
    authLog('error', 'Erro ao obter estatísticas de solicitações', {
      error: error.message
    });
    throw error;
  }
};

/**
 * Remove uma solicitação (soft delete)
 * @param {string} requestId - ID da solicitação
 * @param {Object} remover - Usuário que está removendo
 * @returns {boolean} Sucesso da operação
 */
const deleteAccessRequest = async (requestId, remover) => {
  try {
    const request = await AccessRequest.findByPk(requestId);
    
    if (!request) {
      throw new Error('Solicitação não encontrada');
    }

    await request.destroy();

    authLog('info', 'Solicitação de acesso removida', {
      requestId: request.id,
      email: request.email,
      name: request.name,
      removedBy: remover.id,
      removedByEmail: remover.email
    });

    return true;
  } catch (error) {
    authLog('error', 'Erro ao remover solicitação de acesso', {
      requestId,
      removedBy: remover.id,
      error: error.message
    });
    throw error;
  }
};

module.exports = {
  createAccessRequest,
  listAccessRequests,
  getAccessRequestById,
  approveAccessRequest,
  rejectAccessRequest,
  hasPendingRequest,
  getRequestStatistics,
  deleteAccessRequest
};
