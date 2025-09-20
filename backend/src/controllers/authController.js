const authService = require('../services/authService');
const { generateTokens } = require('../config/auth');
const { sendSuccessResponse, sendErrorResponse } = require('../utils/helpers');
const { asyncHandler } = require('../middlewares/errorHandler');
const { authLog } = require('../utils/logger');

/**
 * Controller para operações de autenticação
 * Gerencia login, registro, refresh token e operações de usuários
 */

/**
 * Login de usuário
 * POST /api/auth/login
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  
  // Log da tentativa de login
  authLog('info', 'Tentativa de login', {
    email,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  const result = await authService.authenticateUser(email, password);
  
  authLog('info', 'Login realizado com sucesso', {
    userId: result.user.id,
    email: result.user.email,
    role: result.user.role,
    ip: req.ip
  });

  sendSuccessResponse(res, {
    user: result.user,
    tokens: result.tokens
  }, 'Login realizado com sucesso');
});

/**
 * Registro de usuário (apenas para admins)
 * POST /api/auth/register
 */
const register = asyncHandler(async (req, res) => {
  const userData = req.body;
  const creator = req.user;

  const newUser = await authService.registerUser(userData, creator);

  sendSuccessResponse(res, newUser, 'Usuário registrado com sucesso', 201);
});

/**
 * Refresh token
 * POST /api/auth/refresh
 */
const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  const user = req.user;

  // Gera novos tokens
  const tokens = generateTokens(user);

  // Atualiza o refresh token no banco
  await user.update({ refreshToken: tokens.refreshToken });

  authLog('info', 'Token renovado', {
    userId: user.id,
    email: user.email,
    ip: req.ip
  });

  sendSuccessResponse(res, { tokens }, 'Token renovado com sucesso');
});

/**
 * Logout de usuário
 * POST /api/auth/logout
 */
const logout = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  await authService.logoutUser(userId);

  authLog('info', 'Logout realizado', {
    userId: req.user.id,
    email: req.user.email,
    ip: req.ip
  });

  sendSuccessResponse(res, null, 'Logout realizado com sucesso');
});

/**
 * Obter perfil do usuário logado
 * GET /api/auth/profile
 */
const getProfile = asyncHandler(async (req, res) => {
  const user = req.user;

  sendSuccessResponse(res, user, 'Perfil obtido com sucesso');
});

/**
 * Atualizar perfil do usuário logado
 * PUT /api/auth/profile
 */
const updateProfile = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const updateData = req.body;

  // Remove campos que não podem ser alterados pelo próprio usuário
  delete updateData.role;
  delete updateData.active;

  const updatedUser = await authService.updateUser(userId, updateData, req.user);

  sendSuccessResponse(res, updatedUser, 'Perfil atualizado com sucesso');
});

/**
 * Alterar senha do usuário logado
 * PUT /api/auth/change-password
 */
const changePassword = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { currentPassword, newPassword } = req.body;

  await authService.updatePassword(userId, currentPassword, newPassword, req.user);

  sendSuccessResponse(res, null, 'Senha alterada com sucesso');
});

/**
 * Listar usuários (apenas para admins)
 * GET /api/auth/users
 */
const listUsers = asyncHandler(async (req, res) => {
  const options = {
    page: req.query.page,
    limit: req.query.limit,
    search: req.query.search,
    role: req.query.role,
    active: req.query.active
  };

  const result = await authService.listUsers(options);

  sendSuccessResponse(res, result, 'Usuários listados com sucesso');
});

/**
 * Obter usuário por ID (apenas para admins)
 * GET /api/auth/users/:id
 */
const getUserById = asyncHandler(async (req, res) => {
  const userId = req.params.id;

  const user = await authService.getUserById(userId);

  sendSuccessResponse(res, user, 'Usuário obtido com sucesso');
});

/**
 * Atualizar usuário por ID (apenas para admins)
 * PUT /api/auth/users/:id
 */
const updateUserById = asyncHandler(async (req, res) => {
  const userId = req.params.id;
  const updateData = req.body;

  const updatedUser = await authService.updateUser(userId, updateData, req.user);

  sendSuccessResponse(res, updatedUser, 'Usuário atualizado com sucesso');
});

/**
 * Remover usuário por ID (apenas para admins)
 * DELETE /api/auth/users/:id
 */
const deleteUserById = asyncHandler(async (req, res) => {
  const userId = req.params.id;

  await authService.deleteUser(userId, req.user);

  sendSuccessResponse(res, null, 'Usuário removido com sucesso');
});

/**
 * Alterar senha de usuário por ID (apenas para admins)
 * PUT /api/auth/users/:id/password
 */
const changeUserPassword = asyncHandler(async (req, res) => {
  const userId = req.params.id;
  const { newPassword } = req.body;

  // Para admins alterando senha de outros usuários, não precisa da senha atual
  await authService.updatePassword(userId, null, newPassword, req.user);

  sendSuccessResponse(res, null, 'Senha alterada com sucesso');
});

/**
 * Verificar se email está disponível
 * GET /api/auth/check-email/:email
 */
const checkEmail = asyncHandler(async (req, res) => {
  const { email } = req.params;
  
  // Busca usuário com email fornecido (incluindo deletados)
  const { User } = require('../models');
  const existingUser = await User.findByEmail(email);

  const isAvailable = !existingUser || existingUser.deletedAt !== null;

  sendSuccessResponse(res, { 
    email, 
    available: isAvailable 
  }, 'Verificação de email realizada');
});

/**
 * Obter estatísticas de usuários (apenas para admins)
 * GET /api/auth/statistics
 */
const getUserStatistics = asyncHandler(async (req, res) => {
  const { User } = require('../models');
  
  const totalUsers = await User.count();
  const activeUsers = await User.count({ where: { active: true } });
  const adminUsers = await User.count({ where: { role: 'admin' } });
  const secretaryUsers = await User.count({ where: { role: 'secretary' } });
  
  // Usuários criados no último mês
  const lastMonth = new Date();
  lastMonth.setMonth(lastMonth.getMonth() - 1);
  
  const newUsersLastMonth = await User.count({
    where: {
      createdAt: {
        [require('sequelize').Op.gte]: lastMonth
      }
    }
  });

  const statistics = {
    total: totalUsers,
    active: activeUsers,
    inactive: totalUsers - activeUsers,
    admins: adminUsers,
    secretaries: secretaryUsers,
    newLastMonth: newUsersLastMonth
  };

  sendSuccessResponse(res, statistics, 'Estatísticas de usuários obtidas');
});

module.exports = {
  login,
  register,
  refreshToken,
  logout,
  getProfile,
  updateProfile,
  changePassword,
  listUsers,
  getUserById,
  updateUserById,
  deleteUserById,
  changeUserPassword,
  checkEmail,
  getUserStatistics
};
