const winston = require('winston');
const path = require('path');

/**
 * Configuração do sistema de logs
 * Utiliza Winston para logging estruturado
 */

// Define os níveis de log
const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4
};

// Define as cores para cada nível
const logColors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white'
};

// Adiciona as cores ao winston
winston.addColors(logColors);

// Formato personalizado para logs
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.errors({ stack: true }),
  winston.format.printf((info) => {
    if (info.stack) {
      return `${info.timestamp} ${info.level}: ${info.message}\n${info.stack}`;
    }
    return `${info.timestamp} ${info.level}: ${info.message}`;
  })
);

// Formato para arquivo (JSON estruturado)
const fileFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Configuração dos transportes
const transports = [
  // Console transport (apenas em desenvolvimento)
  new winston.transports.Console({
    level: process.env.NODE_ENV === 'production' ? 'warn' : 'debug',
    format: winston.format.combine(
      winston.format.colorize({ all: true }),
      logFormat
    )
  }),

  // Arquivo para todos os logs
  new winston.transports.File({
    filename: path.join(process.cwd(), 'logs', 'app.log'),
    level: 'info',
    format: fileFormat,
    maxsize: 5242880, // 5MB
    maxFiles: 5
  }),

  // Arquivo apenas para erros
  new winston.transports.File({
    filename: path.join(process.cwd(), 'logs', 'error.log'),
    level: 'error',
    format: fileFormat,
    maxsize: 5242880, // 5MB
    maxFiles: 5
  })
];

// Cria o logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  levels: logLevels,
  format: logFormat,
  transports: transports,
  // Não sai do processo em caso de erro
  exitOnError: false
});

// Cria diretório de logs se não existir
const fs = require('fs');
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

/**
 * Middleware para logging de requisições HTTP
 */
const httpLogger = (req, res, next) => {
  const start = Date.now();
  
  // Intercepta o método end para capturar o tempo de resposta
  const originalEnd = res.end;
  res.end = function(chunk, encoding) {
    const duration = Date.now() - start;
    
    logger.http(`${req.method} ${req.originalUrl}`, {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      userId: req.user?.id || 'anonymous'
    });
    
    originalEnd.call(this, chunk, encoding);
  };
  
  next();
};

/**
 * Log estruturado para autenticação
 */
const authLog = (level, message, data = {}) => {
  logger[level](message, {
    type: 'auth',
    ...data
  });
};

/**
 * Log estruturado para operações de banco de dados
 */
const dbLog = (level, message, data = {}) => {
  logger[level](message, {
    type: 'database',
    ...data
  });
};

/**
 * Log estruturado para operações financeiras
 */
const financeLog = (level, message, data = {}) => {
  logger[level](message, {
    type: 'finance',
    ...data
  });
};

/**
 * Log estruturado para operações de membros
 */
const memberLog = (level, message, data = {}) => {
  logger[level](message, {
    type: 'member',
    ...data
  });
};

/**
 * Log de performance
 */
const performanceLog = (operation, duration, data = {}) => {
  logger.info(`Performance: ${operation}`, {
    type: 'performance',
    operation,
    duration: `${duration}ms`,
    ...data
  });
};

/**
 * Log de segurança
 */
const securityLog = (level, message, data = {}) => {
  logger[level](message, {
    type: 'security',
    ...data
  });
};

module.exports = {
  logger,
  httpLogger,
  authLog,
  dbLog,
  financeLog,
  memberLog,
  performanceLog,
  securityLog
};
