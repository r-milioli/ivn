const { verifyToken, extractTokenFromHeader } = require('../config/auth');
const { User } = require('../models');
const logger = require('../utils/logger');

/**
 * Middleware de autenticação JWT
 * Verifica se o usuário está autenticado e válido
 */
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token de acesso não fornecido',
        error: 'MISSING_TOKEN'
      });
    }

    // Verifica o token
    const decoded = verifyToken(token);
    
    // Verifica se o token é do tipo access
    if (decoded.type !== 'access') {
      return res.status(401).json({
        success: false,
        message: 'Tipo de token inválido',
        error: 'INVALID_TOKEN_TYPE'
      });
    }

    // Busca o usuário no banco de dados
    const user = await User.findByPk(decoded.id, {
      attributes: ['id', 'name', 'email', 'role', 'active', 'lastLogin']
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não encontrado',
        error: 'USER_NOT_FOUND'
      });
    }

    if (!user.active) {
      return res.status(401).json({
        success: false,
        message: 'Usuário inativo',
        error: 'USER_INACTIVE'
      });
    }

    // Adiciona o usuário ao request
    req.user = user;
    
    logger.info(`Usuário autenticado: ${user.email}`, {
      userId: user.id,
      userRole: user.role,
      endpoint: req.originalUrl,
      method: req.method
    });

    next();
  } catch (error) {
    logger.error('Erro na autenticação:', {
      error: error.message,
      endpoint: req.originalUrl,
      method: req.method,
      ip: req.ip
    });

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token inválido',
        error: 'INVALID_TOKEN'
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expirado',
        error: 'TOKEN_EXPIRED'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: 'INTERNAL_SERVER_ERROR'
    });
  }
};

/**
 * Middleware para verificar se o usuário é administrador
 */
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Usuário não autenticado',
      error: 'NOT_AUTHENTICATED'
    });
  }

  if (req.user.role !== 'admin') {
    logger.warn(`Tentativa de acesso não autorizado: ${req.user.email}`, {
      userId: req.user.id,
      userRole: req.user.role,
      requiredRole: 'admin',
      endpoint: req.originalUrl,
      method: req.method
    });

    return res.status(403).json({
      success: false,
      message: 'Acesso negado. Apenas administradores podem realizar esta ação',
      error: 'INSUFFICIENT_PERMISSIONS'
    });
  }

  next();
};

/**
 * Middleware para verificar se o usuário é admin ou secretary
 */
const requireAdminOrSecretary = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Usuário não autenticado',
      error: 'NOT_AUTHENTICATED'
    });
  }

  if (!['admin', 'secretary'].includes(req.user.role)) {
    logger.warn(`Tentativa de acesso com role inválida: ${req.user.email}`, {
      userId: req.user.id,
      userRole: req.user.role,
      endpoint: req.originalUrl,
      method: req.method
    });

    return res.status(403).json({
      success: false,
      message: 'Acesso negado. Role de usuário inválida',
      error: 'INVALID_USER_ROLE'
    });
  }

  next();
};

/**
 * Middleware opcional de autenticação
 * Não bloqueia se não houver token, mas adiciona usuário se houver
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return next();
    }

    const decoded = verifyToken(token);
    
    if (decoded.type !== 'access') {
      return next();
    }

    const user = await User.findByPk(decoded.id, {
      attributes: ['id', 'name', 'email', 'role', 'active']
    });

    if (user && user.active) {
      req.user = user;
    }

    next();
  } catch (error) {
    // Em caso de erro, continua sem autenticação
    next();
  }
};

/**
 * Middleware para verificar refresh token
 */
const authenticateRefreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token não fornecido',
        error: 'MISSING_REFRESH_TOKEN'
      });
    }

    // Verifica o refresh token
    const decoded = verifyToken(refreshToken, true);
    
    if (decoded.type !== 'refresh') {
      return res.status(401).json({
        success: false,
        message: 'Tipo de token inválido',
        error: 'INVALID_TOKEN_TYPE'
      });
    }

    // Busca o usuário
    const user = await User.findByPk(decoded.id, {
      attributes: ['id', 'name', 'email', 'role', 'active', 'refreshToken']
    });

    if (!user || !user.active) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não encontrado ou inativo',
        error: 'USER_NOT_FOUND_OR_INACTIVE'
      });
    }

    // Verifica se o refresh token armazenado confere
    if (user.refreshToken !== refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token inválido',
        error: 'INVALID_REFRESH_TOKEN'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    logger.error('Erro na verificação do refresh token:', {
      error: error.message,
      ip: req.ip
    });

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Refresh token inválido',
        error: 'INVALID_REFRESH_TOKEN'
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Refresh token expirado',
        error: 'REFRESH_TOKEN_EXPIRED'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: 'INTERNAL_SERVER_ERROR'
    });
  }
};

module.exports = {
  authenticateToken,
  requireAdmin,
  requireAdminOrSecretary,
  optionalAuth,
  authenticateRefreshToken
};
