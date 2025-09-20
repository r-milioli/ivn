const { Transaction, User } = require('../models');
const { Op } = require('sequelize');
const { financeLog } = require('../utils/logger');
const { getPagination, createSearchFilter, createDateFilter } = require('../utils/helpers');

/**
 * Service para operações financeiras
 * Contém toda a lógica de negócio relacionada às transações financeiras
 */

/**
 * Lista transações com paginação e filtros
 * @param {Object} options - Opções de paginação e filtros
 * @returns {Object} Lista paginada de transações
 */
const listTransactions = async (options = {}) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      type = '', 
      category = '',
      startDate = null, 
      endDate = null,
      search = '',
      sortBy = 'date',
      sortOrder = 'DESC'
    } = options;
    
    const whereClause = {};
    
    // Filtro por tipo (receita/despesa)
    if (type) {
      whereClause.type = type;
    }
    
    // Filtro por categoria
    if (category) {
      whereClause.category = {
        [Op.iLike]: `%${category}%`
      };
    }
    
    // Filtro por período
    if (startDate || endDate) {
      const dateFilter = createDateFilter(startDate, endDate, 'date');
      Object.assign(whereClause, dateFilter);
    }
    
    // Filtro por busca (descrição, categoria)
    if (search) {
      const searchFilter = createSearchFilter(search, ['description', 'category']);
      Object.assign(whereClause, searchFilter);
    }

    const { count, rows } = await Transaction.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'name', 'email']
        }
      ],
      order: [[sortBy, sortOrder]],
      limit: parseInt(limit),
      offset: (page - 1) * limit
    });

    financeLog('info', 'Lista de transações consultada', {
      totalTransactions: count,
      filters: options
    });

    return {
      transactions: rows,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: limit
      }
    };
  } catch (error) {
    financeLog('error', 'Erro na listagem de transações', {
      error: error.message,
      options
    });
    throw error;
  }
};

/**
 * Cria uma nova transação
 * @param {Object} transactionData - Dados da transação
 * @param {Object} creator - Usuário que está criando
 * @returns {Object} Dados da transação criada
 */
const createTransaction = async (transactionData, creator) => {
  try {
    // Adiciona informações do criador
    const dataWithCreator = {
      ...transactionData,
      createdBy: creator.id
    };

    const newTransaction = await Transaction.create(dataWithCreator);

    // Busca a transação com dados do criador
    const transactionWithCreator = await Transaction.findByPk(newTransaction.id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    financeLog('info', 'Nova transação criada', {
      transactionId: newTransaction.id,
      type: newTransaction.type,
      category: newTransaction.category,
      amount: newTransaction.amount,
      createdBy: creator.id,
      createdByEmail: creator.email
    });

    return transactionWithCreator;
  } catch (error) {
    financeLog('error', 'Erro na criação de transação', {
      transactionData: transactionData.category,
      createdBy: creator.id,
      error: error.message
    });
    throw error;
  }
};

/**
 * Busca transação por ID
 * @param {String} transactionId - ID da transação
 * @returns {Object} Dados da transação
 */
const getTransactionById = async (transactionId) => {
  try {
    const transaction = await Transaction.findByPk(transactionId, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'name', 'email']
        },
        {
          model: User,
          as: 'lastModifier',
          attributes: ['id', 'name', 'email'],
          required: false
        }
      ]
    });
    
    if (!transaction) {
      throw new Error('Transação não encontrada');
    }

    financeLog('info', 'Transação consultada', {
      transactionId: transaction.id,
      type: transaction.type,
      category: transaction.category,
      amount: transaction.amount
    });

    return transaction;
  } catch (error) {
    financeLog('error', 'Erro ao buscar transação por ID', {
      transactionId,
      error: error.message
    });
    throw error;
  }
};

/**
 * Atualiza uma transação
 * @param {String} transactionId - ID da transação
 * @param {Object} updateData - Dados para atualizar
 * @param {Object} updater - Usuário que está atualizando
 * @returns {Object} Dados da transação atualizada
 */
const updateTransaction = async (transactionId, updateData, updater) => {
  try {
    const transaction = await Transaction.findByPk(transactionId);
    
    if (!transaction) {
      throw new Error('Transação não encontrada');
    }

    // Adiciona informação do último modificador
    const dataWithModifier = {
      ...updateData,
      lastModifiedBy: updater.id
    };

    await transaction.update(dataWithModifier);

    // Busca a transação atualizada com dados do criador e modificador
    const updatedTransaction = await Transaction.findByPk(transactionId, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'name', 'email']
        },
        {
          model: User,
          as: 'lastModifier',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    financeLog('info', 'Transação atualizada', {
      transactionId: transaction.id,
      updatedBy: updater.id,
      updatedByEmail: updater.email,
      changes: Object.keys(updateData)
    });

    return updatedTransaction;
  } catch (error) {
    financeLog('error', 'Erro na atualização de transação', {
      transactionId,
      updatedBy: updater.id,
      error: error.message
    });
    throw error;
  }
};

/**
 * Remove uma transação (soft delete)
 * @param {String} transactionId - ID da transação
 * @param {String} reason - Motivo da remoção
 * @param {Object} remover - Usuário que está removendo
 * @returns {Boolean} Sucesso da operação
 */
const deleteTransaction = async (transactionId, reason, remover) => {
  try {
    const transaction = await Transaction.findByPk(transactionId);
    
    if (!transaction) {
      throw new Error('Transação não encontrada');
    }

    await transaction.markAsDeleted(remover.id, reason);

    financeLog('info', 'Transação removida', {
      transactionId: transaction.id,
      type: transaction.type,
      amount: transaction.amount,
      reason,
      deletedBy: remover.id,
      deletedByEmail: remover.email
    });

    return true;
  } catch (error) {
    financeLog('error', 'Erro na remoção de transação', {
      transactionId,
      deletedBy: remover.id,
      error: error.message
    });
    throw error;
  }
};

/**
 * Obtém resumo financeiro
 * @param {String} startDate - Data inicial
 * @param {String} endDate - Data final
 * @returns {Object} Resumo financeiro
 */
const getFinancialSummary = async (startDate = null, endDate = null) => {
  try {
    const summary = await Transaction.getFinancialSummary(startDate, endDate);
    
    // Estatísticas adicionais
    const totalTransactions = await Transaction.count({
      where: startDate && endDate ? {
        date: {
          [Op.between]: [startDate, endDate]
        }
      } : {}
    });

    const summaryWithStats = {
      ...summary,
      totalTransactions,
      averageIncome: summary.transactionCount > 0 ? summary.totalIncome / summary.transactionCount : 0,
      averageExpense: summary.transactionCount > 0 ? summary.totalExpense / summary.transactionCount : 0
    };

    financeLog('info', 'Resumo financeiro consultado', {
      startDate,
      endDate,
      summary: summaryWithStats
    });

    return summaryWithStats;
  } catch (error) {
    financeLog('error', 'Erro ao obter resumo financeiro', {
      startDate,
      endDate,
      error: error.message
    });
    throw error;
  }
};

/**
 * Obtém relatório de transações por categoria
 * @param {String} startDate - Data inicial
 * @param {String} endDate - Data final
 * @param {String} type - Tipo de transação (opcional)
 * @returns {Array} Relatório por categoria
 */
const getTransactionsByCategory = async (startDate = null, endDate = null, type = null) => {
  try {
    const report = await Transaction.getTransactionsByCategory(startDate, endDate, type);

    financeLog('info', 'Relatório por categoria consultado', {
      startDate,
      endDate,
      type,
      categoriesCount: report.length
    });

    return report;
  } catch (error) {
    financeLog('error', 'Erro ao obter relatório por categoria', {
      startDate,
      endDate,
      type,
      error: error.message
    });
    throw error;
  }
};

/**
 * Obtém relatório mensal
 * @param {Number} year - Ano para o relatório
 * @returns {Array} Relatório mensal
 */
const getMonthlyReport = async (year = new Date().getFullYear()) => {
  try {
    const report = await Transaction.getMonthlyReport(year);

    financeLog('info', 'Relatório mensal consultado', {
      year,
      monthsCount: report.length
    });

    return report;
  } catch (error) {
    financeLog('error', 'Erro ao obter relatório mensal', {
      year,
      error: error.message
    });
    throw error;
  }
};

/**
 * Registra uma receita
 * @param {Object} incomeData - Dados da receita
 * @param {Object} creator - Usuário que está criando
 * @returns {Object} Dados da receita criada
 */
const registerIncome = async (incomeData, creator) => {
  try {
    const dataWithType = {
      ...incomeData,
      type: 'income'
    };

    return await createTransaction(dataWithType, creator);
  } catch (error) {
    financeLog('error', 'Erro no registro de receita', {
      incomeData: incomeData.category,
      createdBy: creator.id,
      error: error.message
    });
    throw error;
  }
};

/**
 * Registra uma despesa
 * @param {Object} expenseData - Dados da despesa
 * @param {Object} creator - Usuário que está criando
 * @returns {Object} Dados da despesa criada
 */
const registerExpense = async (expenseData, creator) => {
  try {
    const dataWithType = {
      ...expenseData,
      type: 'expense'
    };

    return await createTransaction(dataWithType, creator);
  } catch (error) {
    financeLog('error', 'Erro no registro de despesa', {
      expenseData: expenseData.category,
      createdBy: creator.id,
      error: error.message
    });
    throw error;
  }
};

/**
 * Busca transação por número de referência
 * @param {String} referenceNumber - Número de referência
 * @returns {Object} Dados da transação
 */
const getTransactionByReference = async (referenceNumber) => {
  try {
    const transaction = await Transaction.findByReference(referenceNumber);
    
    if (!transaction) {
      throw new Error('Transação não encontrada');
    }

    financeLog('info', 'Transação consultada por referência', {
      referenceNumber,
      transactionId: transaction.id
    });

    return transaction;
  } catch (error) {
    financeLog('error', 'Erro ao buscar transação por referência', {
      referenceNumber,
      error: error.message
    });
    throw error;
  }
};

/**
 * Obtém dados para gráficos financeiros
 * @param {String} period - Período (monthly, yearly)
 * @param {Number} months - Número de meses para análise
 * @returns {Object} Dados para gráficos
 */
const getFinancialChartData = async (period = 'monthly', months = 12) => {
  try {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);
    
    const transactions = await Transaction.findAll({
      attributes: [
        [Transaction.sequelize.fn('DATE_TRUNC', period, Transaction.sequelize.col('date')), 'period'],
        'type',
        [Transaction.sequelize.fn('SUM', Transaction.sequelize.col('amount')), 'total']
      ],
      where: {
        date: {
          [Op.gte]: startDate
        }
      },
      group: [
        Transaction.sequelize.fn('DATE_TRUNC', period, Transaction.sequelize.col('date')),
        'type'
      ],
      order: [[Transaction.sequelize.fn('DATE_TRUNC', period, Transaction.sequelize.col('date')), 'ASC']],
      raw: true
    });

    // Processa os dados para o formato do gráfico
    const chartData = {
      labels: [],
      income: [],
      expense: [],
      balance: []
    };

    const dataMap = new Map();
    
    transactions.forEach(item => {
      const periodKey = item.period.toISOString().split('T')[0];
      if (!dataMap.has(periodKey)) {
        dataMap.set(periodKey, { income: 0, expense: 0 });
      }
      
      const data = dataMap.get(periodKey);
      data[item.type] = parseFloat(item.total);
    });

    dataMap.forEach((data, period) => {
      chartData.labels.push(period);
      chartData.income.push(data.income);
      chartData.expense.push(data.expense);
      chartData.balance.push(data.income - data.expense);
    });

    financeLog('info', 'Dados para gráficos consultados', {
      period,
      months,
      dataPoints: chartData.labels.length
    });

    return chartData;
  } catch (error) {
    financeLog('error', 'Erro ao obter dados para gráficos', {
      period,
      months,
      error: error.message
    });
    throw error;
  }
};

module.exports = {
  listTransactions,
  createTransaction,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
  getFinancialSummary,
  getTransactionsByCategory,
  getMonthlyReport,
  registerIncome,
  registerExpense,
  getTransactionByReference,
  getFinancialChartData
};
