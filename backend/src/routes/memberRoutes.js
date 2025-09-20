const express = require('express');
const router = express.Router();
const memberController = require('../controllers/memberController');
const { authenticateToken, requireAdminOrSecretary } = require('../middlewares/auth');
const {
  validateMember,
  validateQueryParams,
  validateDateRange,
  validateUUID
} = require('../middlewares/validation');
const { sanitizeInput } = require('../middlewares/errorHandler');

/**
 * Rotas de membros
 * Gerencia CRUD de membros e operações relacionadas
 */

// Aplicar autenticação e sanitização em todas as rotas
router.use(authenticateToken);
router.use(requireAdminOrSecretary);
router.use(sanitizeInput);

// Rotas de listagem e busca
router.get('/', validateQueryParams, memberController.listMembers);
router.get('/search', validateQueryParams, memberController.searchMembers);
router.get('/statistics', memberController.getMemberStatistics);
router.get('/growth', validateQueryParams, memberController.getMemberGrowth);
router.get('/export', validateQueryParams, memberController.exportMembers);

// Rotas por status
router.get('/active', memberController.getActiveMembers);
router.get('/visitors', memberController.getVisitors);
router.get('/inactive', memberController.getInactiveMembers);
router.get('/status/:status', validateQueryParams, memberController.getMembersByStatus);

// Rotas especiais
router.get('/birthdays', validateQueryParams, memberController.getBirthdays);
router.get('/new', validateQueryParams, memberController.getNewMembers);

// CRUD básico
router.post('/', validateMember, memberController.createMember);
router.get('/:id', validateUUID('id'), memberController.getMemberById);
router.put('/:id', validateUUID('id'), validateMember, memberController.updateMember);
router.delete('/:id', validateUUID('id'), memberController.deleteMember);

// Operações especiais
router.post('/:id/promote', validateUUID('id'), memberController.promoteToMember);
router.post('/:id/attendance', validateUUID('id'), memberController.registerAttendance);

module.exports = router;
