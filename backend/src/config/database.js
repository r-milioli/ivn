const { Sequelize } = require('sequelize');
require('dotenv').config();

/**
 * Configuração do banco de dados PostgreSQL
 * Utiliza Sequelize como ORM para gerenciar as conexões
 */
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: process.env.DB_DIALECT,
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    define: {
      timestamps: true,
      underscored: true,
      paranoid: true, // Soft delete
      freezeTableName: true
    },
    dialectOptions: {
      ssl: process.env.NODE_ENV === 'production' ? {
        require: true,
        rejectUnauthorized: false
      } : false
    }
  }
);

/**
 * Testa a conexão com o banco de dados
 */
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexão com banco de dados estabelecida com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao conectar com banco de dados:', error.message);
    process.exit(1);
  }
};

module.exports = {
  sequelize,
  testConnection
};
