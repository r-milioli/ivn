const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken, requireAdmin, authenticateRefreshToken } = require('../middlewares/auth');
const {
  validateUserLogin,
  validateUserRegistration,
  validateQueryParams,
  validateUUID
} = require('../middlewares/validation');
const { sanitizeInput } = require('../middlewares/errorHandler');

/**
 * Rotas de autenticação
 * Gerencia login, registro, refresh token e operações de usuários
 */

// Aplicar sanitização em todas as rotas
router.use(sanitizeInput);

// Rotas públicas
router.post('/login', validateUserLogin, authController.login);
router.post('/refresh', authenticateRefreshToken, authController.refreshToken);

// Rotas protegidas - requerem autenticação
router.use(authenticateToken);

// Perfil do usuário logado
router.get('/profile', authController.getProfile);
router.put('/profile', authController.updateProfile);
router.put('/change-password', authController.changePassword);
router.post('/logout', authController.logout);

// Verificação de email
router.get('/check-email/:email', authController.checkEmail);

// Rotas de administração - requerem role de admin
router.get('/users', requireAdmin, validateQueryParams, authController.listUsers);
router.get('/users/statistics', requireAdmin, authController.getUserStatistics);
router.post('/users', requireAdmin, validateUserRegistration, authController.register);
router.get('/users/:id', requireAdmin, validateUUID('id'), authController.getUserById);
router.put('/users/:id', requireAdmin, validateUUID('id'), authController.updateUserById);
router.delete('/users/:id', requireAdmin, validateUUID('id'), authController.deleteUserById);
router.put('/users/:id/password', requireAdmin, validateUUID('id'), authController.changeUserPassword);

module.exports = router;
