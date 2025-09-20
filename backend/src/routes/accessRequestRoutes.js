const express = require('express');
const router = express.Router();
const accessRequestController = require('../controllers/accessRequestController');
const { authenticateToken, requireAdmin } = require('../middlewares/auth');
const {
  validateAccessRequest,
  validateQueryParams,
  validateUUID
} = require('../middlewares/validation');
const { sanitizeInput } = require('../middlewares/errorHandler');

/**
 * Rotas de solicitações de acesso
 * Gerencia o processo de solicitação e aprovação de novos usuários
 */

// Aplicar sanitização em todas as rotas
router.use(sanitizeInput);

// Rotas públicas
router.post('/', validateAccessRequest, accessRequestController.createRequest);
router.get('/check-email/:email', accessRequestController.checkEmailRequest);

// Rotas protegidas - requerem autenticação
router.use(authenticateToken);

// Rotas de administração - requerem role de admin
router.get('/', requireAdmin, validateQueryParams, accessRequestController.listRequests);
router.get('/statistics', requireAdmin, accessRequestController.getStatistics);
router.get('/:id', requireAdmin, validateUUID('id'), accessRequestController.getRequestById);
router.post('/:id/approve', requireAdmin, validateUUID('id'), accessRequestController.approveRequest);
router.post('/:id/reject', requireAdmin, validateUUID('id'), accessRequestController.rejectRequest);
router.delete('/:id', requireAdmin, validateUUID('id'), accessRequestController.deleteRequest);

module.exports = router;
