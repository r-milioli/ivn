const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { authenticateToken, requireAdminOrSecretary } = require('../middlewares/auth');
const { validateQueryParams, validateDateRange } = require('../middlewares/validation');
const { sanitizeInput } = require('../middlewares/errorHandler');

/**
 * Rotas do dashboard
 * Gerencia dados consolidados para a tela principal
 */

// Aplicar autenticação e sanitização em todas as rotas
router.use(authenticateToken);
router.use(requireAdminOrSecretary);
router.use(sanitizeInput);

// Resumo geral do dashboard
router.get('/summary', validateDateRange, dashboardController.getDashboardSummary);

// Dados para gráficos
router.get('/financial-chart', validateQueryParams, dashboardController.getFinancialChartData);
router.get('/member-growth', validateQueryParams, dashboardController.getMemberGrowthData);

// Estatísticas e performance
router.get('/statistics', validateDateRange, dashboardController.getGeneralStatistics);
router.get('/performance', validateQueryParams, dashboardController.getPerformanceData);

// Alertas e notificações
router.get('/alerts', dashboardController.getAlerts);

module.exports = router;
