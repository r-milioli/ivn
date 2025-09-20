const { logger } = require('../utils/logger');

/**
 * Middleware global de tratamento de erros
 * Captura e trata todos os erros da aplicação de forma centralizada
 */

/**
 * Middleware principal de tratamento de erros
 * Deve ser o último middleware registrado
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log do erro
  logger.error('Erro capturado pelo middleware:', {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.user?.id
  });

  // Erro de validação do Sequelize
  if (err.name === 'SequelizeValidationError') {
    const message = err.errors.map(error => error.message).join(', ');
    error = {
      message: 'Erro de validação dos dados',
      errors: err.errors.map(error => ({
        field: error.path,
        message: error.message,
        value: error.value
      }))
    };
    return res.status(400).json({
      success: false,
      message: error.message,
      errors: error.errors
    });
  }

  // Erro de chave duplicada do Sequelize
  if (err.name === 'SequelizeUniqueConstraintError') {
    const field = err.errors[0].path;
    const message = `O ${field} informado já está sendo utilizado`;
    error = {
      message: message,
      field: field
    };
    return res.status(409).json({
      success: false,
      message: error.message,
      field: error.field
    });
  }

  // Erro de foreign key do Sequelize
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    const message = 'Erro de referência: registro relacionado não encontrado';
    error = {
      message: message
    };
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }

  // Erro de banco de dados do Sequelize
  if (err.name === 'SequelizeDatabaseError') {
    const message = 'Erro interno do banco de dados';
    error = {
      message: message
    };
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }

  // Erro de conexão com banco de dados
  if (err.name === 'SequelizeConnectionError') {
    const message = 'Erro de conexão com banco de dados';
    error = {
      message: message
    };
    return res.status(503).json({
      success: false,
      message: error.message
    });
  }

  // Erro JWT
  if (err.name === 'JsonWebTokenError') {
    const message = 'Token inválido';
    error = {
      message: message
    };
    return res.status(401).json({
      success: false,
      message: error.message
    });
  }

  // Erro de token expirado
  if (err.name === 'TokenExpiredError') {
    const message = 'Token expirado';
    error = {
      message: message
    };
    return res.status(401).json({
      success: false,
      message: error.message
    });
  }

  // Erro de cast (ObjectId inválido)
  if (err.name === 'CastError') {
    const message = 'Formato de ID inválido';
    error = {
      message: message
    };
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }

  // Erro de sintaxe JSON
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    const message = 'JSON inválido no corpo da requisição';
    error = {
      message: message
    };
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }

  // Erro de arquivo muito grande
  if (err.code === 'LIMIT_FILE_SIZE') {
    const message = 'Arquivo muito grande';
    error = {
      message: message
    };
    return res.status(413).json({
      success: false,
      message: error.message
    });
  }

  // Erro de rate limiting
  if (err.status === 429) {
    return res.status(429).json({
      success: false,
      message: 'Muitas tentativas de acesso. Tente novamente em alguns minutos.',
      retryAfter: err.retryAfter
    });
  }

  // Erro padrão (500)
  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Erro interno do servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

/**
 * Middleware para capturar rotas não encontradas
 * Deve ser registrado antes do errorHandler
 */
const notFound = (req, res, next) => {
  const error = new Error(`Rota não encontrada: ${req.originalUrl}`);
  error.statusCode = 404;
  
  logger.warn('Rota não encontrada:', {
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  next(error);
};

/**
 * Middleware para capturar erros assíncronos
 * Envolve funções async para capturar erros automaticamente
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Middleware para validação de dados obrigatórios
 */
const validateRequiredFields = (fields) => {
  return (req, res, next) => {
    const missingFields = [];
    
    fields.forEach(field => {
      if (!req.body[field]) {
        missingFields.push(field);
      }
    });

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Campos obrigatórios não fornecidos',
        missingFields: missingFields
      });
    }

    next();
  };
};

/**
 * Middleware para sanitização básica de dados
 */
const sanitizeInput = (req, res, next) => {
  // Remove espaços em branco do início e fim
  const sanitize = (obj) => {
    for (const key in obj) {
      if (typeof obj[key] === 'string') {
        obj[key] = obj[key].trim();
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        sanitize(obj[key]);
      }
    }
  };

  if (req.body) {
    sanitize(req.body);
  }

  if (req.query) {
    sanitize(req.query);
  }

  next();
};

module.exports = {
  errorHandler,
  notFound,
  asyncHandler,
  validateRequiredFields,
  sanitizeInput
};
