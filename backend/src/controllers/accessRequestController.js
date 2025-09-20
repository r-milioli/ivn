const accessRequestService = require('../services/accessRequestService');
const { sendSuccessResponse, sendErrorResponse } = require('../utils/helpers');
const { asyncHandler } = require('../middlewares/errorHandler');

/**
 * Controller para operações de solicitações de acesso
 * Gerencia o processo de solicitação e aprovação de novos usuários
 */

/**
 * Cria uma nova solicitação de acesso (público)
 * POST /api/access-requests
 */
const createRequest = asyncHandler(async (req, res) => {
  try {
    const requestData = req.body;
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');


    const newRequest = await accessRequestService.createAccessRequest(
      requestData,
      ipAddress,
      userAgent
    );

    sendSuccessResponse(res, newRequest, 'Solicitação de acesso enviada com sucesso! Aguarde aprovação do administrador.', 201);
  } catch (error) {
    throw error;
  }
});

/**
 * Lista solicitações de acesso (apenas para admins)
 * GET /api/access-requests
 */
const listRequests = asyncHandler(async (req, res) => {
  const options = {
    page: req.query.page,
    limit: req.query.limit,
    status: req.query.status,
    search: req.query.search
  };

  const result = await accessRequestService.listAccessRequests(options);

  sendSuccessResponse(res, result, 'Solicitações listadas com sucesso');
});

/**
 * Busca solicitação por ID (apenas para admins)
 * GET /api/access-requests/:id
 */
const getRequestById = asyncHandler(async (req, res) => {
  const requestId = req.params.id;

  const request = await accessRequestService.getAccessRequestById(requestId);

  sendSuccessResponse(res, request, 'Solicitação obtida com sucesso');
});

/**
 * Aprova uma solicitação de acesso (apenas para admins)
 * POST /api/access-requests/:id/approve
 */
const approveRequest = asyncHandler(async (req, res) => {
  const requestId = req.params.id;
  const approver = req.user;

  const newUser = await accessRequestService.approveAccessRequest(requestId, approver);

  sendSuccessResponse(res, newUser, 'Solicitação aprovada e usuário criado com sucesso');
});

/**
 * Rejeita uma solicitação de acesso (apenas para admins)
 * POST /api/access-requests/:id/reject
 */
const rejectRequest = asyncHandler(async (req, res) => {
  const requestId = req.params.id;
  const { reason } = req.body;
  const rejector = req.user;

  if (!reason || reason.trim().length === 0) {
    return sendErrorResponse(res, 'Motivo da rejeição é obrigatório', 400);
  }

  await accessRequestService.rejectAccessRequest(requestId, reason.trim(), rejector);

  sendSuccessResponse(res, null, 'Solicitação rejeitada com sucesso');
});

/**
 * Atualiza uma solicitação de acesso (apenas para admins)
 * PUT /api/access-requests/:id
 */
const updateRequest = asyncHandler(async (req, res) => {
  const requestId = req.params.id;
  const updateData = req.body;
  const updater = req.user;

  const updatedRequest = await accessRequestService.updateAccessRequest(requestId, updateData, updater);

  sendSuccessResponse(res, updatedRequest, 'Solicitação atualizada com sucesso');
});

/**
 * Verifica se email tem solicitação pendente (público)
 * GET /api/access-requests/check-email/:email
 */
const checkEmailRequest = asyncHandler(async (req, res) => {
  const { email } = req.params;

  const hasPending = await accessRequestService.hasPendingRequest(email);

  sendSuccessResponse(res, { 
    email, 
    hasPendingRequest: hasPending 
  }, 'Verificação realizada com sucesso');
});

/**
 * Obtém estatísticas de solicitações (apenas para admins)
 * GET /api/access-requests/statistics
 */
const getStatistics = asyncHandler(async (req, res) => {
  const statistics = await accessRequestService.getRequestStatistics();

  sendSuccessResponse(res, statistics, 'Estatísticas obtidas com sucesso');
});

/**
 * Remove uma solicitação (apenas para admins)
 * DELETE /api/access-requests/:id
 */
const deleteRequest = asyncHandler(async (req, res) => {
  const requestId = req.params.id;
  const remover = req.user;

  await accessRequestService.deleteAccessRequest(requestId, remover);

  sendSuccessResponse(res, null, 'Solicitação removida com sucesso');
});

module.exports = {
  createRequest,
  listRequests,
  getRequestById,
  approveRequest,
  rejectRequest,
  updateRequest,
  checkEmailRequest,
  getStatistics,
  deleteRequest
};
