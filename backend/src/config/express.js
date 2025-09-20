const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const path = require('path');

/**
 * Configurações do Express
 * Inclui middlewares de segurança, CORS e rate limiting
 */

// Configuração do CORS
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://seudominio.com'] 
    : ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-refresh-token']
};

// Configuração do Rate Limiting
const rateLimitConfig = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutos
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // máximo 100 requests por IP
  message: {
    error: 'Muitas tentativas de acesso. Tente novamente em alguns minutos.',
    retryAfter: Math.ceil(parseInt(process.env.RATE_LIMIT_WINDOW_MS) / 60000) || 15
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Pula rate limiting em ambiente de desenvolvimento para testes
    return process.env.NODE_ENV === 'development' && req.ip === '127.0.0.1';
  }
});

// Configuração do Morgan (logs HTTP)
const morganConfig = morgan(
  process.env.NODE_ENV === 'production' 
    ? 'combined' 
    : 'dev',
  {
    skip: (req, res) => {
      // Pula logs para health check
      return req.url === '/api/health';
    }
  }
);

// Configuração do Helmet (headers de segurança)
const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
});

module.exports = {
  corsOptions,
  rateLimitConfig,
  morganConfig,
  helmetConfig
};
