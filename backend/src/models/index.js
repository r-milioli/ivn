const { sequelize } = require('../config/database');

// Importar todos os models
const User = require('./User');
const Member = require('./Member');
const Transaction = require('./Transaction');

/**
 * Configuração das associações entre models
 * Define os relacionamentos entre as tabelas do banco de dados
 */

// Relacionamento: User -> Transaction (1:N)
// Um usuário pode criar várias transações
User.hasMany(Transaction, {
  foreignKey: 'createdBy',
  as: 'createdTransactions',
  onDelete: 'RESTRICT',
  onUpdate: 'CASCADE'
});

Transaction.belongsTo(User, {
  foreignKey: 'createdBy',
  as: 'creator',
  onDelete: 'RESTRICT',
  onUpdate: 'CASCADE'
});

// Relacionamento: User -> Transaction (1:N) - Last Modified By
// Um usuário pode ter modificado várias transações
User.hasMany(Transaction, {
  foreignKey: 'lastModifiedBy',
  as: 'modifiedTransactions',
  onDelete: 'SET NULL',
  onUpdate: 'CASCADE'
});

Transaction.belongsTo(User, {
  foreignKey: 'lastModifiedBy',
  as: 'lastModifier',
  onDelete: 'SET NULL',
  onUpdate: 'CASCADE'
});

/**
 * Sincroniza os models com o banco de dados
 * Cria as tabelas se não existirem (apenas em desenvolvimento)
 */
const syncDatabase = async (force = false) => {
  try {
    if (process.env.NODE_ENV === 'development' && force) {
      console.log('🔄 Forçando sincronização do banco de dados...');
      await sequelize.sync({ force: true });
      console.log('✅ Banco de dados sincronizado com sucesso!');
    } else if (process.env.NODE_ENV === 'development') {
      console.log('🔄 Sincronizando modelos com banco de dados...');
      await sequelize.sync({ alter: true });
      console.log('✅ Modelos sincronizados com sucesso!');
    }
  } catch (error) {
    console.error('❌ Erro ao sincronizar banco de dados:', error.message);
    throw error;
  }
};

/**
 * Inicializa o banco de dados
 * Verifica conexão e sincroniza os models
 */
const initializeDatabase = async () => {
  try {
    // Testa a conexão
    await sequelize.authenticate();
    console.log('✅ Conexão com banco de dados estabelecida!');
    
    // Sincroniza os models
    await syncDatabase();
    
    return true;
  } catch (error) {
    console.error('❌ Erro ao inicializar banco de dados:', error.message);
    return false;
  }
};

/**
 * Fecha a conexão com o banco de dados
 */
const closeDatabase = async () => {
  try {
    await sequelize.close();
    console.log('✅ Conexão com banco de dados fechada!');
  } catch (error) {
    console.error('❌ Erro ao fechar conexão:', error.message);
  }
};

module.exports = {
  sequelize,
  User,
  Member,
  Transaction,
  initializeDatabase,
  closeDatabase,
  syncDatabase
};
