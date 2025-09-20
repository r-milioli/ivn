const { Member } = require('../models');
const { Op } = require('sequelize');
const { memberLog } = require('../utils/logger');
const { getPagination, createSearchFilter, createDateFilter } = require('../utils/helpers');

/**
 * Service para operações de membros
 * Contém toda a lógica de negócio relacionada aos membros da igreja
 */

/**
 * Lista membros com paginação e filtros
 * @param {Object} options - Opções de paginação e filtros
 * @returns {Object} Lista paginada de membros
 */
const listMembers = async (options = {}) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search = '', 
      status = '', 
      startDate = null, 
      endDate = null,
      sortBy = 'fullName',
      sortOrder = 'ASC'
    } = options;
    
    const whereClause = {};
    
    // Filtro por status
    if (status) {
      whereClause.status = status;
    }
    
    // Filtro por busca (nome, email, telefone)
    if (search) {
      const searchFilter = createSearchFilter(search, ['fullName', 'email', 'phone']);
      Object.assign(whereClause, searchFilter);
    }
    
    // Filtro por data de cadastro
    if (startDate || endDate) {
      const dateFilter = createDateFilter(startDate, endDate, 'createdAt');
      Object.assign(whereClause, dateFilter);
    }

    const { count, rows } = await Member.findAndCountAll({
      where: whereClause,
      order: [[sortBy, sortOrder]],
      limit: parseInt(limit),
      offset: (page - 1) * limit
    });

    memberLog('info', 'Lista de membros consultada', {
      totalMembers: count,
      filters: options
    });

    return {
      members: rows,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: limit
      }
    };
  } catch (error) {
    memberLog('error', 'Erro na listagem de membros', {
      error: error.message,
      options
    });
    throw error;
  }
};

/**
 * Cria um novo membro
 * @param {Object} memberData - Dados do membro
 * @param {Object} creator - Usuário que está criando
 * @returns {Object} Dados do membro criado
 */
const createMember = async (memberData, creator) => {
  try {
    // Verifica se já existe membro com este email (se fornecido)
    if (memberData.email) {
      const existingMember = await Member.findOne({
        where: { email: memberData.email }
      });
      
      if (existingMember) {
        throw new Error('Já existe um membro com este email');
      }
    }

    const newMember = await Member.create(memberData);

    memberLog('info', 'Novo membro criado', {
      memberId: newMember.id,
      memberName: newMember.fullName,
      memberStatus: newMember.status,
      createdBy: creator.id,
      createdByEmail: creator.email
    });

    return newMember;
  } catch (error) {
    memberLog('error', 'Erro na criação de membro', {
      memberData: memberData.fullName,
      createdBy: creator.id,
      error: error.message
    });
    throw error;
  }
};

/**
 * Busca membro por ID
 * @param {String} memberId - ID do membro
 * @returns {Object} Dados do membro
 */
const getMemberById = async (memberId) => {
  try {
    const member = await Member.findByPk(memberId);
    
    if (!member) {
      throw new Error('Membro não encontrado');
    }

    memberLog('info', 'Membro consultado', {
      memberId: member.id,
      memberName: member.fullName
    });

    return member;
  } catch (error) {
    memberLog('error', 'Erro ao buscar membro por ID', {
      memberId,
      error: error.message
    });
    throw error;
  }
};

/**
 * Atualiza um membro
 * @param {String} memberId - ID do membro
 * @param {Object} updateData - Dados para atualizar
 * @param {Object} updater - Usuário que está atualizando
 * @returns {Object} Dados do membro atualizado
 */
const updateMember = async (memberId, updateData, updater) => {
  try {
    const member = await Member.findByPk(memberId);
    
    if (!member) {
      throw new Error('Membro não encontrado');
    }

    // Se está alterando o email, verifica se já existe outro membro com este email
    if (updateData.email && updateData.email !== member.email) {
      const existingMember = await Member.findOne({
        where: { 
          email: updateData.email,
          id: { [Op.ne]: memberId }
        }
      });
      
      if (existingMember) {
        throw new Error('Já existe outro membro com este email');
      }
    }

    await member.update(updateData);

    memberLog('info', 'Membro atualizado', {
      memberId: member.id,
      memberName: member.fullName,
      updatedBy: updater.id,
      updatedByEmail: updater.email,
      changes: Object.keys(updateData)
    });

    return member;
  } catch (error) {
    memberLog('error', 'Erro na atualização de membro', {
      memberId,
      updatedBy: updater.id,
      error: error.message
    });
    throw error;
  }
};

/**
 * Remove um membro (soft delete)
 * @param {String} memberId - ID do membro
 * @param {Object} remover - Usuário que está removendo
 * @returns {Boolean} Sucesso da operação
 */
const deleteMember = async (memberId, remover) => {
  try {
    const member = await Member.findByPk(memberId);
    
    if (!member) {
      throw new Error('Membro não encontrado');
    }

    await member.destroy();

    memberLog('info', 'Membro removido', {
      memberId: member.id,
      memberName: member.fullName,
      deletedBy: remover.id,
      deletedByEmail: remover.email
    });

    return true;
  } catch (error) {
    memberLog('error', 'Erro na remoção de membro', {
      memberId,
      deletedBy: remover.id,
      error: error.message
    });
    throw error;
  }
};

/**
 * Promove um visitante a membro ativo
 * @param {String} memberId - ID do membro
 * @param {Object} updater - Usuário que está promovendo
 * @returns {Object} Dados do membro atualizado
 */
const promoteToMember = async (memberId, updater) => {
  try {
    const member = await Member.findByPk(memberId);
    
    if (!member) {
      throw new Error('Membro não encontrado');
    }

    if (member.status === 'active') {
      throw new Error('Membro já está ativo');
    }

    await member.promoteToMember();

    memberLog('info', 'Visitante promovido a membro', {
      memberId: member.id,
      memberName: member.fullName,
      promotedBy: updater.id,
      promotedByEmail: updater.email
    });

    return member;
  } catch (error) {
    memberLog('error', 'Erro na promoção de membro', {
      memberId,
      promotedBy: updater.id,
      error: error.message
    });
    throw error;
  }
};

/**
 * Registra presença de um membro
 * @param {String} memberId - ID do membro
 * @param {Object} registrar - Usuário que está registrando
 * @returns {Object} Dados do membro atualizado
 */
const registerAttendance = async (memberId, registrar) => {
  try {
    const member = await Member.findByPk(memberId);
    
    if (!member) {
      throw new Error('Membro não encontrado');
    }

    await member.updateAttendance();

    memberLog('info', 'Presença registrada', {
      memberId: member.id,
      memberName: member.fullName,
      registeredBy: registrar.id,
      registeredByEmail: registrar.email,
      attendanceCount: member.attendanceCount + 1
    });

    return member;
  } catch (error) {
    memberLog('error', 'Erro no registro de presença', {
      memberId,
      registeredBy: registrar.id,
      error: error.message
    });
    throw error;
  }
};

/**
 * Busca membros por status
 * @param {String} status - Status dos membros
 * @returns {Array} Lista de membros
 */
const getMembersByStatus = async (status) => {
  try {
    const members = await Member.findByStatus(status);

    memberLog('info', 'Membros consultados por status', {
      status,
      count: members.length
    });

    return members;
  } catch (error) {
    memberLog('error', 'Erro ao buscar membros por status', {
      status,
      error: error.message
    });
    throw error;
  }
};

/**
 * Busca membros por termo de busca
 * @param {String} searchTerm - Termo de busca
 * @returns {Array} Lista de membros encontrados
 */
const searchMembers = async (searchTerm) => {
  try {
    const members = await Member.searchMembers(searchTerm);

    memberLog('info', 'Busca de membros realizada', {
      searchTerm,
      resultsCount: members.length
    });

    return members;
  } catch (error) {
    memberLog('error', 'Erro na busca de membros', {
      searchTerm,
      error: error.message
    });
    throw error;
  }
};

/**
 * Obtém estatísticas dos membros
 * @returns {Object} Estatísticas dos membros
 */
const getMemberStatistics = async () => {
  try {
    const stats = await Member.getStatistics();
    
    // Estatísticas adicionais
    const totalMembers = await Member.count();
    const activeMembers = await Member.count({ where: { status: 'active' } });
    const visitors = await Member.count({ where: { status: 'visitor' } });
    const inactiveMembers = await Member.count({ where: { status: 'inactive' } });
    
    // Membros cadastrados no último mês
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    
    const newMembersLastMonth = await Member.count({
      where: {
        createdAt: {
          [Op.gte]: lastMonth
        }
      }
    });

    const statistics = {
      total: totalMembers,
      active: activeMembers,
      visitors: visitors,
      inactive: inactiveMembers,
      newLastMonth: newMembersLastMonth,
      ...stats
    };

    memberLog('info', 'Estatísticas de membros consultadas', statistics);

    return statistics;
  } catch (error) {
    memberLog('error', 'Erro ao obter estatísticas de membros', {
      error: error.message
    });
    throw error;
  }
};

/**
 * Obtém crescimento de membros por período
 * @param {String} period - Período (monthly, yearly)
 * @param {Number} months - Número de meses para análise
 * @returns {Array} Dados de crescimento
 */
const getMemberGrowth = async (period = 'monthly', months = 12) => {
  try {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);
    
    const members = await Member.findAll({
      attributes: [
        [Member.sequelize.fn('DATE_TRUNC', period, Member.sequelize.col('createdAt')), 'period'],
        [Member.sequelize.fn('COUNT', Member.sequelize.col('id')), 'count']
      ],
      where: {
        createdAt: {
          [Op.gte]: startDate
        }
      },
      group: [Member.sequelize.fn('DATE_TRUNC', period, Member.sequelize.col('createdAt'))],
      order: [[Member.sequelize.fn('DATE_TRUNC', period, Member.sequelize.col('createdAt')), 'ASC']],
      raw: true
    });

    memberLog('info', 'Crescimento de membros consultado', {
      period,
      months,
      dataPoints: members.length
    });

    return members;
  } catch (error) {
    memberLog('error', 'Erro ao obter crescimento de membros', {
      period,
      months,
      error: error.message
    });
    throw error;
  }
};

module.exports = {
  listMembers,
  createMember,
  getMemberById,
  updateMember,
  deleteMember,
  promoteToMember,
  registerAttendance,
  getMembersByStatus,
  searchMembers,
  getMemberStatistics,
  getMemberGrowth
};
