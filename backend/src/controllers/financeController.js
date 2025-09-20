const financeService = require('../services/financeService');
const { sendSuccessResponse, sendErrorResponse } = require('../utils/helpers');
const { asyncHandler } = require('../middlewares/errorHandler');

/**
 * Controller para operações financeiras
 * Gerencia CRUD de transações e relatórios financeiros
 */

/**
 * Listar transações
 * GET /api/finances/transactions
 */
const listTransactions = asyncHandler(async (req, res) => {
  const options = {
    page: req.query.page,
    limit: req.query.limit,
    type: req.query.type,
    category: req.query.category,
    startDate: req.query.startDate,
    endDate: req.query.endDate,
    search: req.query.search,
    sortBy: req.query.sortBy,
    sortOrder: req.query.sortOrder
  };

  const result = await financeService.listTransactions(options);

  sendSuccessResponse(res, result, 'Transações listadas com sucesso');
});

/**
 * Criar nova transação
 * POST /api/finances/transactions
 */
const createTransaction = asyncHandler(async (req, res) => {
  const transactionData = req.body;
  const creator = req.user;

  const newTransaction = await financeService.createTransaction(transactionData, creator);

  sendSuccessResponse(res, newTransaction, 'Transação criada com sucesso', 201);
});

/**
 * Obter transação por ID
 * GET /api/finances/transactions/:id
 */
const getTransactionById = asyncHandler(async (req, res) => {
  const transactionId = req.params.id;

  const transaction = await financeService.getTransactionById(transactionId);

  sendSuccessResponse(res, transaction, 'Transação obtida com sucesso');
});

/**
 * Atualizar transação
 * PUT /api/finances/transactions/:id
 */
const updateTransaction = asyncHandler(async (req, res) => {
  const transactionId = req.params.id;
  const updateData = req.body;
  const updater = req.user;

  const updatedTransaction = await financeService.updateTransaction(transactionId, updateData, updater);

  sendSuccessResponse(res, updatedTransaction, 'Transação atualizada com sucesso');
});

/**
 * Remover transação
 * DELETE /api/finances/transactions/:id
 */
const deleteTransaction = asyncHandler(async (req, res) => {
  const transactionId = req.params.id;
  const reason = req.body.reason || 'Remoção solicitada';
  const remover = req.user;

  await financeService.deleteTransaction(transactionId, reason, remover);

  sendSuccessResponse(res, null, 'Transação removida com sucesso');
});

/**
 * Registrar receita
 * POST /api/finances/income
 */
const registerIncome = asyncHandler(async (req, res) => {
  const incomeData = req.body;
  const creator = req.user;

  const newIncome = await financeService.registerIncome(incomeData, creator);

  sendSuccessResponse(res, newIncome, 'Receita registrada com sucesso', 201);
});

/**
 * Registrar despesa
 * POST /api/finances/expense
 */
const registerExpense = asyncHandler(async (req, res) => {
  const expenseData = req.body;
  const creator = req.user;

  const newExpense = await financeService.registerExpense(expenseData, creator);

  sendSuccessResponse(res, newExpense, 'Despesa registrada com sucesso', 201);
});

/**
 * Obter resumo financeiro
 * GET /api/finances/summary
 */
const getFinancialSummary = asyncHandler(async (req, res) => {
  const startDate = req.query.startDate;
  const endDate = req.query.endDate;

  const summary = await financeService.getFinancialSummary(startDate, endDate);

  sendSuccessResponse(res, summary, 'Resumo financeiro obtido');
});

/**
 * Obter relatórios financeiros
 * GET /api/finances/reports
 */
const getFinancialReports = asyncHandler(async (req, res) => {
  const { 
    type = 'category', 
    startDate, 
    endDate, 
    transactionType 
  } = req.query;

  let report;

  switch (type) {
    case 'category':
      report = await financeService.getTransactionsByCategory(startDate, endDate, transactionType);
      break;
    case 'monthly':
      const year = req.query.year || new Date().getFullYear();
      report = await financeService.getMonthlyReport(year);
      break;
    default:
      return sendErrorResponse(res, 'Tipo de relatório inválido', 400);
  }

  sendSuccessResponse(res, { report, type }, 'Relatório financeiro obtido');
});

/**
 * Obter transações por categoria
 * GET /api/finances/reports/category
 */
const getTransactionsByCategory = asyncHandler(async (req, res) => {
  const startDate = req.query.startDate;
  const endDate = req.query.endDate;
  const type = req.query.type;

  const report = await financeService.getTransactionsByCategory(startDate, endDate, type);

  sendSuccessResponse(res, { report }, 'Relatório por categoria obtido');
});

/**
 * Obter relatório mensal
 * GET /api/finances/reports/monthly
 */
const getMonthlyReport = asyncHandler(async (req, res) => {
  const year = req.query.year || new Date().getFullYear();

  const report = await financeService.getMonthlyReport(year);

  sendSuccessResponse(res, { report, year }, 'Relatório mensal obtido');
});

/**
 * Obter dados para gráficos
 * GET /api/finances/chart-data
 */
const getChartData = asyncHandler(async (req, res) => {
  const period = req.query.period || 'monthly';
  const months = parseInt(req.query.months) || 12;

  const chartData = await financeService.getFinancialChartData(period, months);

  sendSuccessResponse(res, chartData, 'Dados para gráficos obtidos');
});

/**
 * Buscar transação por referência
 * GET /api/finances/transactions/reference/:referenceNumber
 */
const getTransactionByReference = asyncHandler(async (req, res) => {
  const referenceNumber = req.params.referenceNumber;

  const transaction = await financeService.getTransactionByReference(referenceNumber);

  sendSuccessResponse(res, transaction, 'Transação obtida por referência');
});

/**
 * Obter receitas
 * GET /api/finances/income
 */
const getIncomeTransactions = asyncHandler(async (req, res) => {
  const options = {
    ...req.query,
    type: 'income'
  };

  const result = await financeService.listTransactions(options);

  sendSuccessResponse(res, result, 'Receitas listadas com sucesso');
});

/**
 * Obter despesas
 * GET /api/finances/expense
 */
const getExpenseTransactions = asyncHandler(async (req, res) => {
  const options = {
    ...req.query,
    type: 'expense'
  };

  const result = await financeService.listTransactions(options);

  sendSuccessResponse(res, result, 'Despesas listadas com sucesso');
});

/**
 * Obter categorias mais utilizadas
 * GET /api/finances/categories
 */
const getCategories = asyncHandler(async (req, res) => {
  const { Transaction } = require('../models');
  
  const categories = await Transaction.findAll({
    attributes: [
      'category',
      'type',
      [Transaction.sequelize.fn('COUNT', Transaction.sequelize.col('id')), 'count'],
      [Transaction.sequelize.fn('SUM', Transaction.sequelize.col('amount')), 'total']
    ],
    group: ['category', 'type'],
    order: [[Transaction.sequelize.fn('COUNT', Transaction.sequelize.col('id')), 'DESC']],
    raw: true
  });

  sendSuccessResponse(res, { categories }, 'Categorias obtidas');
});

/**
 * Exportar transações
 * GET /api/finances/export
 */
const exportTransactions = asyncHandler(async (req, res) => {
  const { 
    format = 'json', 
    startDate, 
    endDate, 
    type,
    category 
  } = req.query;

  const options = {
    page: 1,
    limit: 10000, // Limite alto para exportação
    type: type || undefined,
    category: category || undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined
  };

  const result = await financeService.listTransactions(options);

  if (format === 'csv') {
    // Implementar exportação CSV se necessário
    return sendErrorResponse(res, 'Exportação CSV não implementada', 501);
  }

  sendSuccessResponse(res, result.transactions, 'Transações exportadas');
});

/**
 * Obter estatísticas financeiras
 * GET /api/finances/statistics
 */
const getFinancialStatistics = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  
  const summary = await financeService.getFinancialSummary(startDate, endDate);
  const categoryReport = await financeService.getTransactionsByCategory(startDate, endDate);
  
  // Calcula estatísticas adicionais
  const statistics = {
    ...summary,
    topCategories: categoryReport.slice(0, 5),
    averageTransactionValue: summary.transactionCount > 0 ? 
      (summary.totalIncome + summary.totalExpense) / summary.transactionCount : 0
  };

  sendSuccessResponse(res, statistics, 'Estatísticas financeiras obtidas');
});

/**
 * Obter balanço mensal
 * GET /api/finances/balance/monthly
 */
const getMonthlyBalance = asyncHandler(async (req, res) => {
  const { year = new Date().getFullYear() } = req.query;

  const report = await financeService.getMonthlyReport(year);

  // Calcula o balanço mensal
  const monthlyBalance = report.map(item => ({
    month: item.month,
    income: parseFloat(item.income) || 0,
    expense: parseFloat(item.expense) || 0,
    balance: (parseFloat(item.income) || 0) - (parseFloat(item.expense) || 0)
  }));

  sendSuccessResponse(res, { monthlyBalance, year }, 'Balanço mensal obtido');
});

module.exports = {
  listTransactions,
  createTransaction,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
  registerIncome,
  registerExpense,
  getFinancialSummary,
  getFinancialReports,
  getTransactionsByCategory,
  getMonthlyReport,
  getChartData,
  getTransactionByReference,
  getIncomeTransactions,
  getExpenseTransactions,
  getCategories,
  exportTransactions,
  getFinancialStatistics,
  getMonthlyBalance
};
