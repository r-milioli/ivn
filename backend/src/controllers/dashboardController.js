const memberService = require('../services/memberService');
const financeService = require('../services/financeService');
const { sendSuccessResponse } = require('../utils/helpers');
const { asyncHandler } = require('../middlewares/errorHandler');

/**
 * Controller para operações do dashboard
 * Gerencia dados consolidados para a tela principal
 */

/**
 * Obter resumo geral do dashboard
 * GET /api/dashboard/summary
 */
const getDashboardSummary = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;

  // Busca dados em paralelo
  const [
    memberStats,
    financialSummary,
    recentMembers,
    recentTransactions
  ] = await Promise.all([
    memberService.getMemberStatistics(),
    financeService.getFinancialSummary(startDate, endDate),
    getRecentMembers(),
    getRecentTransactions()
  ]);

  const summary = {
    members: {
      total: memberStats.total,
      active: memberStats.active,
      visitors: memberStats.visitors,
      newThisMonth: memberStats.newLastMonth
    },
    finances: {
      totalIncome: financialSummary.totalIncome,
      totalExpense: financialSummary.totalExpense,
      balance: financialSummary.balance,
      transactionCount: financialSummary.totalTransactions
    },
    recent: {
      members: recentMembers,
      transactions: recentTransactions
    }
  };

  sendSuccessResponse(res, summary, 'Resumo do dashboard obtido');
});

/**
 * Obter dados para gráficos financeiros
 * GET /api/dashboard/financial-chart
 */
const getFinancialChartData = asyncHandler(async (req, res) => {
  const period = req.query.period || 'monthly';
  const months = parseInt(req.query.months) || 12;

  const chartData = await financeService.getFinancialChartData(period, months);

  sendSuccessResponse(res, chartData, 'Dados para gráficos financeiros obtidos');
});

/**
 * Obter dados de crescimento de membros
 * GET /api/dashboard/member-growth
 */
const getMemberGrowthData = asyncHandler(async (req, res) => {
  const period = req.query.period || 'monthly';
  const months = parseInt(req.query.months) || 12;

  const growthData = await memberService.getMemberGrowth(period, months);

  sendSuccessResponse(res, { growthData }, 'Dados de crescimento de membros obtidos');
});

/**
 * Obter estatísticas gerais
 * GET /api/dashboard/statistics
 */
const getGeneralStatistics = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;

  const [
    memberStats,
    financialSummary,
    categoryReport,
    monthlyReport
  ] = await Promise.all([
    memberService.getMemberStatistics(),
    financeService.getFinancialSummary(startDate, endDate),
    financeService.getTransactionsByCategory(startDate, endDate),
    financeService.getMonthlyReport(new Date().getFullYear())
  ]);

  // Calcula métricas adicionais
  const currentMonth = new Date().getMonth();
  const currentMonthData = monthlyReport.find(item => 
    parseInt(item.month) === currentMonth + 1
  ) || { income: 0, expense: 0 };

  const statistics = {
    members: memberStats,
    finances: {
      ...financialSummary,
      currentMonthIncome: parseFloat(currentMonthData.income) || 0,
      currentMonthExpense: parseFloat(currentMonthData.expense) || 0,
      currentMonthBalance: (parseFloat(currentMonthData.income) || 0) - (parseFloat(currentMonthData.expense) || 0)
    },
    categories: categoryReport.slice(0, 10), // Top 10 categorias
    trends: {
      memberGrowthRate: calculateGrowthRate(memberStats.total, memberStats.newLastMonth),
      financialGrowthRate: calculateFinancialGrowthRate(monthlyReport)
    }
  };

  sendSuccessResponse(res, statistics, 'Estatísticas gerais obtidas');
});

/**
 * Obter alertas e notificações
 * GET /api/dashboard/alerts
 */
const getAlerts = asyncHandler(async (req, res) => {
  const alerts = [];

  // Verifica saldo negativo
  const financialSummary = await financeService.getFinancialSummary();
  if (financialSummary.balance < 0) {
    alerts.push({
      type: 'warning',
      title: 'Saldo Negativo',
      message: `O saldo atual é negativo: R$ ${financialSummary.balance.toFixed(2)}`,
      priority: 'high'
    });
  }

  // Verifica aniversariantes do mês
  const { Member } = require('../models');
  const currentMonth = new Date().getMonth() + 1;
  
  const birthdayMembers = await Member.findAll({
    where: {
      birthDate: {
        [require('sequelize').Op.ne]: null
      }
    },
    attributes: ['id', 'fullName', 'birthDate']
  });

  const thisMonthBirthdays = birthdayMembers.filter(member => {
    if (!member.birthDate) return false;
    const birthMonth = new Date(member.birthDate).getMonth() + 1;
    return birthMonth === currentMonth;
  });

  if (thisMonthBirthdays.length > 0) {
    alerts.push({
      type: 'info',
      title: 'Aniversariantes do Mês',
      message: `${thisMonthBirthdays.length} membro(s) fazem aniversário este mês`,
      priority: 'medium',
      data: thisMonthBirthdays.map(m => ({
        name: m.fullName,
        date: m.birthDate
      }))
    });
  }

  // Verifica visitantes há muito tempo sem promoção
  const visitors = await Member.findAll({
    where: {
      status: 'visitor',
      createdAt: {
        [require('sequelize').Op.lte]: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) // 90 dias
      }
    },
    attributes: ['id', 'fullName', 'createdAt']
  });

  if (visitors.length > 0) {
    alerts.push({
      type: 'info',
      title: 'Visitantes para Revisão',
      message: `${visitors.length} visitante(s) há mais de 90 dias sem promoção`,
      priority: 'medium',
      data: visitors.map(v => ({
        name: v.fullName,
        memberSince: v.createdAt
      }))
    });
  }

  // Verifica transações recentes sem descrição
  const { Transaction } = require('../models');
  const recentTransactionsWithoutDescription = await Transaction.count({
    where: {
      description: {
        [require('sequelize').Op.or]: [null, '']
      },
      createdAt: {
        [require('sequelize').Op.gte]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 dias
      }
    }
  });

  if (recentTransactionsWithoutDescription > 0) {
    alerts.push({
      type: 'warning',
      title: 'Transações sem Descrição',
      message: `${recentTransactionsWithoutDescription} transação(ões) recente(s) sem descrição`,
      priority: 'low'
    });
  }

  sendSuccessResponse(res, { alerts }, 'Alertas obtidos');
});

/**
 * Obter dados de performance
 * GET /api/dashboard/performance
 */
const getPerformanceData = asyncHandler(async (req, res) => {
  const { period = '6' } = req.query; // meses

  const [
    memberGrowthData,
    financialChartData,
    monthlyReport
  ] = await Promise.all([
    memberService.getMemberGrowth('monthly', parseInt(period)),
    financeService.getFinancialChartData('monthly', parseInt(period)),
    financeService.getMonthlyReport(new Date().getFullYear())
  ]);

  const performance = {
    memberGrowth: memberGrowthData,
    financialTrend: financialChartData,
    monthlyPerformance: monthlyReport,
    metrics: {
      averageMonthlyIncome: calculateAverage(monthlyReport.map(m => parseFloat(m.income) || 0)),
      averageMonthlyExpense: calculateAverage(monthlyReport.map(m => parseFloat(m.expense) || 0)),
      averageMonthlyBalance: calculateAverage(monthlyReport.map(m => 
        (parseFloat(m.income) || 0) - (parseFloat(m.expense) || 0)
      ))
    }
  };

  sendSuccessResponse(res, performance, 'Dados de performance obtidos');
});

// Funções auxiliares

/**
 * Busca membros recentes
 */
const getRecentMembers = async () => {
  const { Member } = require('../models');
  
  const members = await Member.findAll({
    order: [['createdAt', 'DESC']],
    limit: 5,
    attributes: ['id', 'fullName', 'status', 'createdAt']
  });

  return members;
};

/**
 * Busca transações recentes
 */
const getRecentTransactions = async () => {
  const { Transaction } = require('../models');
  
  const transactions = await Transaction.findAll({
    order: [['createdAt', 'DESC']],
    limit: 5,
    attributes: ['id', 'type', 'category', 'amount', 'description', 'date', 'createdAt'],
    include: [{
      model: require('../models').User,
      as: 'creator',
      attributes: ['name']
    }]
  });

  return transactions;
};

/**
 * Calcula taxa de crescimento
 */
const calculateGrowthRate = (total, newMembers) => {
  if (total === 0) return 0;
  return ((newMembers / total) * 100).toFixed(2);
};

/**
 * Calcula taxa de crescimento financeiro
 */
const calculateFinancialGrowthRate = (monthlyData) => {
  if (monthlyData.length < 2) return 0;
  
  const current = monthlyData[monthlyData.length - 1];
  const previous = monthlyData[monthlyData.length - 2];
  
  const currentBalance = (parseFloat(current.income) || 0) - (parseFloat(current.expense) || 0);
  const previousBalance = (parseFloat(previous.income) || 0) - (parseFloat(previous.expense) || 0);
  
  if (previousBalance === 0) return 0;
  
  return (((currentBalance - previousBalance) / previousBalance) * 100).toFixed(2);
};

/**
 * Calcula média de um array
 */
const calculateAverage = (array) => {
  if (array.length === 0) return 0;
  const sum = array.reduce((a, b) => a + b, 0);
  return (sum / array.length).toFixed(2);
};

module.exports = {
  getDashboardSummary,
  getFinancialChartData,
  getMemberGrowthData,
  getGeneralStatistics,
  getAlerts,
  getPerformanceData
};
