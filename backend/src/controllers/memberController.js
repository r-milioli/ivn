const memberService = require('../services/memberService');
const { sendSuccessResponse, sendErrorResponse } = require('../utils/helpers');
const { asyncHandler } = require('../middlewares/errorHandler');

/**
 * Controller para operações de membros
 * Gerencia CRUD de membros e operações relacionadas
 */

/**
 * Listar membros
 * GET /api/members
 */
const listMembers = asyncHandler(async (req, res) => {
  const options = {
    page: req.query.page,
    limit: req.query.limit,
    search: req.query.search,
    status: req.query.status,
    startDate: req.query.startDate,
    endDate: req.query.endDate,
    sortBy: req.query.sortBy,
    sortOrder: req.query.sortOrder
  };

  const result = await memberService.listMembers(options);

  sendSuccessResponse(res, result, 'Membros listados com sucesso');
});

/**
 * Criar novo membro
 * POST /api/members
 */
const createMember = asyncHandler(async (req, res) => {
  const memberData = req.body;
  const creator = req.user;

  const newMember = await memberService.createMember(memberData, creator);

  sendSuccessResponse(res, newMember, 'Membro criado com sucesso', 201);
});

/**
 * Obter membro por ID
 * GET /api/members/:id
 */
const getMemberById = asyncHandler(async (req, res) => {
  const memberId = req.params.id;

  const member = await memberService.getMemberById(memberId);

  sendSuccessResponse(res, member, 'Membro obtido com sucesso');
});

/**
 * Atualizar membro
 * PUT /api/members/:id
 */
const updateMember = asyncHandler(async (req, res) => {
  const memberId = req.params.id;
  const updateData = req.body;
  const updater = req.user;

  const updatedMember = await memberService.updateMember(memberId, updateData, updater);

  sendSuccessResponse(res, updatedMember, 'Membro atualizado com sucesso');
});

/**
 * Remover membro
 * DELETE /api/members/:id
 */
const deleteMember = asyncHandler(async (req, res) => {
  const memberId = req.params.id;
  const remover = req.user;

  await memberService.deleteMember(memberId, remover);

  sendSuccessResponse(res, null, 'Membro removido com sucesso');
});

/**
 * Promover visitante a membro ativo
 * POST /api/members/:id/promote
 */
const promoteToMember = asyncHandler(async (req, res) => {
  const memberId = req.params.id;
  const updater = req.user;

  const updatedMember = await memberService.promoteToMember(memberId, updater);

  sendSuccessResponse(res, updatedMember, 'Visitante promovido a membro com sucesso');
});

/**
 * Registrar presença de membro
 * POST /api/members/:id/attendance
 */
const registerAttendance = asyncHandler(async (req, res) => {
  const memberId = req.params.id;
  const registrar = req.user;

  const updatedMember = await memberService.registerAttendance(memberId, registrar);

  sendSuccessResponse(res, updatedMember, 'Presença registrada com sucesso');
});

/**
 * Buscar membros por status
 * GET /api/members/status/:status
 */
const getMembersByStatus = asyncHandler(async (req, res) => {
  const status = req.params.status;

  const members = await memberService.getMembersByStatus(status);

  sendSuccessResponse(res, { members }, 'Membros obtidos por status');
});

/**
 * Buscar membros
 * GET /api/members/search
 */
const searchMembers = asyncHandler(async (req, res) => {
  const searchTerm = req.query.q;

  if (!searchTerm) {
    return sendErrorResponse(res, 'Termo de busca é obrigatório', 400);
  }

  const members = await memberService.searchMembers(searchTerm);

  sendSuccessResponse(res, { members }, 'Busca de membros realizada');
});

/**
 * Obter estatísticas de membros
 * GET /api/members/statistics
 */
const getMemberStatistics = asyncHandler(async (req, res) => {
  const statistics = await memberService.getMemberStatistics();

  sendSuccessResponse(res, statistics, 'Estatísticas de membros obtidas');
});

/**
 * Obter crescimento de membros
 * GET /api/members/growth
 */
const getMemberGrowth = asyncHandler(async (req, res) => {
  const period = req.query.period || 'monthly';
  const months = parseInt(req.query.months) || 12;

  const growthData = await memberService.getMemberGrowth(period, months);

  sendSuccessResponse(res, { growthData }, 'Dados de crescimento obtidos');
});

/**
 * Obter membros ativos
 * GET /api/members/active
 */
const getActiveMembers = asyncHandler(async (req, res) => {
  const members = await memberService.getMembersByStatus('active');

  sendSuccessResponse(res, { members }, 'Membros ativos obtidos');
});

/**
 * Obter visitantes
 * GET /api/members/visitors
 */
const getVisitors = asyncHandler(async (req, res) => {
  const members = await memberService.getMembersByStatus('visitor');

  sendSuccessResponse(res, { members }, 'Visitantes obtidos');
});

/**
 * Obter membros inativos
 * GET /api/members/inactive
 */
const getInactiveMembers = asyncHandler(async (req, res) => {
  const members = await memberService.getMembersByStatus('inactive');

  sendSuccessResponse(res, { members }, 'Membros inativos obtidos');
});

/**
 * Exportar lista de membros
 * GET /api/members/export
 */
const exportMembers = asyncHandler(async (req, res) => {
  const { format = 'json', status = '' } = req.query;
  
  const options = {
    page: 1,
    limit: 10000, // Limite alto para exportação
    status: status || undefined
  };

  const result = await memberService.listMembers(options);

  if (format === 'csv') {
    // Implementar exportação CSV se necessário
    return sendErrorResponse(res, 'Exportação CSV não implementada', 501);
  }

  sendSuccessResponse(res, result.members, 'Lista de membros exportada');
});

/**
 * Obter aniversariantes do mês
 * GET /api/members/birthdays
 */
const getBirthdays = asyncHandler(async (req, res) => {
  const { month = new Date().getMonth() + 1 } = req.query;
  
  const { Member } = require('../models');
  
  const members = await Member.findAll({
    where: {
      birthDate: {
        [require('sequelize').Op.ne]: null
      }
    },
    attributes: ['id', 'fullName', 'birthDate', 'phone', 'email']
  });

  // Filtra membros que fazem aniversário no mês especificado
  const birthdayMembers = members.filter(member => {
    if (!member.birthDate) return false;
    const birthMonth = new Date(member.birthDate).getMonth() + 1;
    return birthMonth === parseInt(month);
  });

  sendSuccessResponse(res, { members: birthdayMembers }, 'Aniversariantes obtidos');
});

/**
 * Obter novos membros do período
 * GET /api/members/new
 */
const getNewMembers = asyncHandler(async (req, res) => {
  const { period = '30' } = req.query; // dias
  
  const { Member } = require('../models');
  const { Op } = require('sequelize');
  
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - parseInt(period));
  
  const members = await Member.findAll({
    where: {
      createdAt: {
        [Op.gte]: startDate
      }
    },
    order: [['createdAt', 'DESC']]
  });

  sendSuccessResponse(res, { members }, 'Novos membros obtidos');
});

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
  getMemberGrowth,
  getActiveMembers,
  getVisitors,
  getInactiveMembers,
  exportMembers,
  getBirthdays,
  getNewMembers
};
