const { Op } = require('sequelize');

/**
 * Utilitários e funções auxiliares para a aplicação
 */

/**
 * Formata uma resposta de sucesso padronizada
 * @param {Object} res - Objeto response do Express
 * @param {*} data - Dados a serem retornados
 * @param {String} message - Mensagem de sucesso
 * @param {Number} statusCode - Código de status HTTP
 */
const sendSuccessResponse = (res, data = null, message = 'Operação realizada com sucesso', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString()
  });
};

/**
 * Formata uma resposta de erro padronizada
 * @param {Object} res - Objeto response do Express
 * @param {String} message - Mensagem de erro
 * @param {Number} statusCode - Código de status HTTP
 * @param {*} errors - Detalhes dos erros
 */
const sendErrorResponse = (res, message = 'Erro interno do servidor', statusCode = 500, errors = null) => {
  return res.status(statusCode).json({
    success: false,
    message,
    errors,
    timestamp: new Date().toISOString()
  });
};

/**
 * Configuração de paginação para Sequelize
 * @param {Number} page - Página atual
 * @param {Number} limit - Limite de itens por página
 * @returns {Object} Objeto com offset e limit
 */
const getPagination = (page = 1, limit = 10) => {
  const offset = (page - 1) * limit;
  return {
    offset,
    limit: parseInt(limit),
    page: parseInt(page)
  };
};

/**
 * Calcula informações de paginação para resposta
 * @param {Number} total - Total de registros
 * @param {Number} page - Página atual
 * @param {Number} limit - Limite por página
 * @returns {Object} Informações de paginação
 */
const getPaginationInfo = (total, page, limit) => {
  const totalPages = Math.ceil(total / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;
  
  return {
    currentPage: page,
    totalPages,
    totalItems: total,
    itemsPerPage: limit,
    hasNextPage,
    hasPrevPage,
    nextPage: hasNextPage ? page + 1 : null,
    prevPage: hasPrevPage ? page - 1 : null
  };
};

/**
 * Cria filtros de busca para Sequelize
 * @param {String} searchTerm - Termo de busca
 * @param {Array} fields - Campos para buscar
 * @returns {Object} Objeto de filtros
 */
const createSearchFilter = (searchTerm, fields) => {
  if (!searchTerm || !fields.length) {
    return {};
  }

  return {
    [Op.or]: fields.map(field => ({
      [field]: {
        [Op.iLike]: `%${searchTerm}%`
      }
    }))
  };
};

/**
 * Cria filtros de data para Sequelize
 * @param {String} startDate - Data inicial
 * @param {String} endDate - Data final
 * @param {String} field - Campo de data (padrão: 'date')
 * @returns {Object} Objeto de filtros
 */
const createDateFilter = (startDate, endDate, field = 'date') => {
  const filter = {};
  
  if (startDate && endDate) {
    filter[field] = {
      [Op.between]: [startDate, endDate]
    };
  } else if (startDate) {
    filter[field] = {
      [Op.gte]: startDate
    };
  } else if (endDate) {
    filter[field] = {
      [Op.lte]: endDate
    };
  }
  
  return filter;
};

/**
 * Sanitiza string removendo caracteres especiais
 * @param {String} str - String para sanitizar
 * @returns {String} String sanitizada
 */
const sanitizeString = (str) => {
  if (!str) return '';
  return str.trim().replace(/[<>\"']/g, '');
};

/**
 * Formata número como moeda brasileira
 * @param {Number} value - Valor numérico
 * @returns {String} Valor formatado como moeda
 */
const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value || 0);
};

/**
 * Formata data para padrão brasileiro
 * @param {Date|String} date - Data para formatar
 * @returns {String} Data formatada (DD/MM/YYYY)
 */
const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('pt-BR');
};

/**
 * Formata data e hora para padrão brasileiro
 * @param {Date|String} date - Data para formatar
 * @returns {String} Data e hora formatadas
 */
const formatDateTime = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleString('pt-BR');
};

/**
 * Valida se uma string é um email válido
 * @param {String} email - Email para validar
 * @returns {Boolean} Se é um email válido
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Valida se uma string é um telefone válido (formato brasileiro)
 * @param {String} phone - Telefone para validar
 * @returns {Boolean} Se é um telefone válido
 */
const isValidPhone = (phone) => {
  const phoneRegex = /^\(\d{2}\)\s\d{4,5}-\d{4}$/;
  return phoneRegex.test(phone);
};

/**
 * Gera uma string aleatória
 * @param {Number} length - Tamanho da string
 * @returns {String} String aleatória
 */
const generateRandomString = (length = 8) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Calcula a diferença em dias entre duas datas
 * @param {Date|String} date1 - Primeira data
 * @param {Date|String} date2 - Segunda data
 * @returns {Number} Diferença em dias
 */
const daysDifference = (date1, date2) => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = Math.abs(d2 - d1);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Retorna o primeiro dia do mês
 * @param {Date|String} date - Data de referência
 * @returns {Date} Primeiro dia do mês
 */
const getFirstDayOfMonth = (date = new Date()) => {
  const d = new Date(date);
  return new Date(d.getFullYear(), d.getMonth(), 1);
};

/**
 * Retorna o último dia do mês
 * @param {Date|String} date - Data de referência
 * @returns {Date} Último dia do mês
 */
const getLastDayOfMonth = (date = new Date()) => {
  const d = new Date(date);
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
};

/**
 * Retorna o primeiro dia do ano
 * @param {Date|String} date - Data de referência
 * @returns {Date} Primeiro dia do ano
 */
const getFirstDayOfYear = (date = new Date()) => {
  const d = new Date(date);
  return new Date(d.getFullYear(), 0, 1);
};

/**
 * Retorna o último dia do ano
 * @param {Date|String} date - Data de referência
 * @returns {Date} Último dia do ano
 */
const getLastDayOfYear = (date = new Date()) => {
  const d = new Date(date);
  return new Date(d.getFullYear(), 11, 31);
};

/**
 * Remove propriedades undefined de um objeto
 * @param {Object} obj - Objeto para limpar
 * @returns {Object} Objeto sem propriedades undefined
 */
const removeUndefined = (obj) => {
  const cleaned = {};
  for (const key in obj) {
    if (obj[key] !== undefined) {
      cleaned[key] = obj[key];
    }
  }
  return cleaned;
};

/**
 * Agrupa array de objetos por uma propriedade
 * @param {Array} array - Array para agrupar
 * @param {String} key - Chave para agrupar
 * @returns {Object} Objeto agrupado
 */
const groupBy = (array, key) => {
  return array.reduce((groups, item) => {
    const group = item[key];
    groups[group] = groups[group] || [];
    groups[group].push(item);
    return groups;
  }, {});
};

module.exports = {
  sendSuccessResponse,
  sendErrorResponse,
  getPagination,
  getPaginationInfo,
  createSearchFilter,
  createDateFilter,
  sanitizeString,
  formatCurrency,
  formatDate,
  formatDateTime,
  isValidEmail,
  isValidPhone,
  generateRandomString,
  daysDifference,
  getFirstDayOfMonth,
  getLastDayOfMonth,
  getFirstDayOfYear,
  getLastDayOfYear,
  removeUndefined,
  groupBy
};
