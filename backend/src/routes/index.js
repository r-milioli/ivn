const express = require('express');
const router = express.Router();

// Importar todas as rotas
const authRoutes = require('./authRoutes');
const memberRoutes = require('./memberRoutes');
const financeRoutes = require('./financeRoutes');
const dashboardRoutes = require('./dashboardRoutes');
const accessRequestRoutes = require('./accessRequestRoutes');

/**
 * Centralizador de rotas da API
 * Organiza todas as rotas em um local central
 */

// Rotas de autenticação
router.use('/auth', authRoutes);

// Rotas de solicitações de acesso
router.use('/access-requests', accessRequestRoutes);

// Rotas de membros
router.use('/members', memberRoutes);

// Rotas financeiras
router.use('/finances', financeRoutes);

// Rotas do dashboard
router.use('/dashboard', dashboardRoutes);

// Rota de health check
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API funcionando corretamente',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Rota de informações da API
router.get('/info', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Sistema de Administração de Igreja - API Backend',
    version: '1.0.0',
    description: 'API REST para sistema de administração de igreja com controle financeiro e gestão de membros',
    endpoints: {
      auth: '/api/auth',
      accessRequests: '/api/access-requests',
      members: '/api/members',
      finances: '/api/finances',
      dashboard: '/api/dashboard'
    },
    documentation: 'Consulte a documentação da API para mais detalhes',
    support: 'Para suporte, entre em contato com a equipe de desenvolvimento'
  });
});

// Rota 404 para endpoints não encontrados
router.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint não encontrado',
    path: req.originalUrl,
    method: req.method,
    availableEndpoints: [
      'GET /api/health',
      'GET /api/info',
      'POST /api/auth/login',
      'POST /api/auth/refresh',
      'POST /api/access-requests',
      'GET /api/members',
      'GET /api/finances',
      'GET /api/dashboard'
    ]
  });
});

module.exports = router;
