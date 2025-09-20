const express = require('express');
const router = express.Router();
const financeController = require('../controllers/financeController');
const { authenticateToken, requireAdminOrSecretary } = require('../middlewares/auth');
const {
  validateTransaction,
  validateQueryParams,
  validateDateRange,
  validateUUID
} = require('../middlewares/validation');
const { sanitizeInput } = require('../middlewares/errorHandler');

/**
 * Rotas financeiras
 * Gerencia CRUD de transações e relatórios financeiros
 */

// Aplicar autenticação e sanitização em todas as rotas
router.use(authenticateToken);
router.use(requireAdminOrSecretary);
router.use(sanitizeInput);

// Rotas de listagem e relatórios
router.get('/transactions', validateQueryParams, validateDateRange, financeController.listTransactions);
router.get('/summary', validateDateRange, financeController.getFinancialSummary);
router.get('/reports', validateDateRange, financeController.getFinancialReports);
router.get('/reports/category', validateDateRange, financeController.getTransactionsByCategory);
router.get('/reports/monthly', validateQueryParams, financeController.getMonthlyReport);
router.get('/statistics', validateDateRange, financeController.getFinancialStatistics);
router.get('/export', validateDateRange, financeController.exportTransactions);

// Rotas por tipo de transação
router.get('/income', validateQueryParams, validateDateRange, financeController.getIncomeTransactions);
router.post('/income', validateTransaction, financeController.registerIncome);
router.get('/expense', validateQueryParams, validateDateRange, financeController.getExpenseTransactions);
router.post('/expense', validateTransaction, financeController.registerExpense);

// Rotas de dados para gráficos
router.get('/chart-data', validateQueryParams, financeController.getChartData);
router.get('/balance/monthly', validateQueryParams, financeController.getMonthlyBalance);

// Rotas de categorias
router.get('/categories', financeController.getCategories);

// CRUD de transações
router.post('/transactions', validateTransaction, financeController.createTransaction);
router.get('/transactions/:id', validateUUID('id'), financeController.getTransactionById);
router.put('/transactions/:id', validateUUID('id'), validateTransaction, financeController.updateTransaction);
router.delete('/transactions/:id', validateUUID('id'), financeController.deleteTransaction);

// Busca por referência
router.get('/transactions/reference/:referenceNumber', financeController.getTransactionByReference);

module.exports = router;
