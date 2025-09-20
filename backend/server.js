const express = require('express');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

// Importar configurações
const { corsOptions, rateLimitConfig, morganConfig, helmetConfig } = require('./src/config/express');
const { initializeDatabase } = require('./src/models');

// Importar middlewares
const { errorHandler, notFound } = require('./src/middlewares/errorHandler');
const { httpLogger } = require('./src/utils/logger');

// Importar rotas
const routes = require('./src/routes');

/**
 * Configuração e inicialização do servidor Express
 */

// Criar aplicação Express
const app = express();

// Configurar middlewares de parsing (devem vir primeiro)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Configurar middlewares de segurança
app.use(helmetConfig);
app.use(cors(corsOptions));
app.use(rateLimitConfig);

// Configurar middlewares de logging (apenas um para evitar duplicação)
app.use(httpLogger);

// Middleware para adicionar informações da requisição
app.use((req, res, next) => {
  req.startTime = Date.now();
  next();
});

// Middleware para servir arquivos estáticos (apenas se necessário)
// app.use(express.static(path.join(__dirname, 'public')));

// Configurar rotas da API
app.use('/api', routes);

// Middleware para rotas não encontradas
app.use(notFound);

// Middleware global de tratamento de erros
app.use(errorHandler);

/**
 * Inicializar servidor
 */
const startServer = async () => {
  try {
    // Inicializar banco de dados
    console.log('🔄 Inicializando banco de dados...');
    const dbInitialized = await initializeDatabase();
    
    if (!dbInitialized) {
      console.error('❌ Falha ao inicializar banco de dados');
      process.exit(1);
    }

    // Configurar porta
    const PORT = process.env.PORT || 3000;
    const HOST = process.env.HOST || 'localhost';

    // Iniciar servidor
    const server = app.listen(PORT, HOST, () => {
      console.log('🚀 Servidor iniciado com sucesso!');
      console.log(`📍 URL: http://${HOST}:${PORT}`);
      console.log(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📊 Health Check: http://${HOST}:${PORT}/api/health`);
      console.log(`📚 API Info: http://${HOST}:${PORT}/api/info`);
      console.log('='.repeat(50));
    });

    // Configurar tratamento de sinais para shutdown graceful
    const gracefulShutdown = (signal) => {
      console.log(`\n🔄 Recebido sinal ${signal}. Iniciando shutdown graceful...`);
      
      server.close((err) => {
        if (err) {
          console.error('❌ Erro durante shutdown:', err);
          process.exit(1);
        }
        
        console.log('✅ Servidor fechado com sucesso');
        
        // Fechar conexão com banco de dados
        const { closeDatabase } = require('./src/models');
        closeDatabase().then(() => {
          console.log('✅ Conexão com banco de dados fechada');
          process.exit(0);
        }).catch((error) => {
          console.error('❌ Erro ao fechar conexão com banco:', error);
          process.exit(1);
        });
      });

      // Forçar shutdown após 30 segundos
      setTimeout(() => {
        console.error('❌ Forçando shutdown após timeout');
        process.exit(1);
      }, 30000);
    };

    // Escutar sinais de shutdown
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Tratamento de erros não capturados
    process.on('uncaughtException', (error) => {
      console.error('❌ Erro não capturado:', error);
      gracefulShutdown('uncaughtException');
    });

    process.on('unhandledRejection', (reason, promise) => {
      console.error('❌ Promise rejeitada não tratada:', reason);
      console.error('Promise:', promise);
      gracefulShutdown('unhandledRejection');
    });

  } catch (error) {
    console.error('❌ Erro ao iniciar servidor:', error);
    process.exit(1);
  }
};

// Iniciar servidor se este arquivo for executado diretamente
if (require.main === module) {
  startServer();
}

module.exports = app;
