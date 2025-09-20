const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

/**
 * Configurações e utilitários para autenticação JWT
 */

// Configurações JWT
const JWT_CONFIG = {
  secret: process.env.JWT_SECRET,
  refreshSecret: process.env.JWT_REFRESH_SECRET,
  expiresIn: process.env.JWT_EXPIRES_IN || '1h',
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
};

// Configurações do bcrypt
const BCRYPT_CONFIG = {
  rounds: parseInt(process.env.BCRYPT_ROUNDS) || 12
};

/**
 * Gera um token JWT de acesso
 * @param {Object} payload - Dados do usuário
 * @returns {String} Token JWT
 */
const generateAccessToken = (payload) => {
  return jwt.sign(
    { 
      id: payload.id, 
      email: payload.email, 
      role: payload.role,
      type: 'access'
    },
    JWT_CONFIG.secret,
    { expiresIn: JWT_CONFIG.expiresIn }
  );
};

/**
 * Gera um token JWT de refresh
 * @param {Object} payload - Dados do usuário
 * @returns {String} Refresh token JWT
 */
const generateRefreshToken = (payload) => {
  return jwt.sign(
    { 
      id: payload.id, 
      email: payload.email,
      type: 'refresh'
    },
    JWT_CONFIG.refreshSecret,
    { expiresIn: JWT_CONFIG.refreshExpiresIn }
  );
};

/**
 * Gera ambos os tokens (access e refresh)
 * @param {Object} user - Dados do usuário
 * @returns {Object} Objeto com accessToken e refreshToken
 */
const generateTokens = (user) => {
  return {
    accessToken: generateAccessToken(user),
    refreshToken: generateRefreshToken(user)
  };
};

/**
 * Verifica e decodifica um token JWT
 * @param {String} token - Token JWT
 * @param {Boolean} isRefresh - Se é um refresh token
 * @returns {Object} Dados decodificados do token
 */
const verifyToken = (token, isRefresh = false) => {
  const secret = isRefresh ? JWT_CONFIG.refreshSecret : JWT_CONFIG.secret;
  return jwt.verify(token, secret);
};

/**
 * Hash de senha usando bcrypt
 * @param {String} password - Senha em texto plano
 * @returns {String} Senha hasheada
 */
const hashPassword = async (password) => {
  return await bcrypt.hash(password, BCRYPT_CONFIG.rounds);
};

/**
 * Compara senha com hash
 * @param {String} password - Senha em texto plano
 * @param {String} hash - Hash da senha
 * @returns {Boolean} Se a senha confere
 */
const comparePassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

/**
 * Extrai token do header Authorization
 * @param {String} authHeader - Header Authorization
 * @returns {String|null} Token extraído ou null
 */
const extractTokenFromHeader = (authHeader) => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
};

module.exports = {
  JWT_CONFIG,
  BCRYPT_CONFIG,
  generateAccessToken,
  generateRefreshToken,
  generateTokens,
  verifyToken,
  hashPassword,
  comparePassword,
  extractTokenFromHeader
};
