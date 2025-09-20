const { sequelize } = require('../config/database');

// Importar todos os models
const User = require('./User');
const Member = require('./Member');
const Transaction = require('./Transaction');
const AccessRequest = require('./AccessRequest');

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

// Relacionamento: User -> AccessRequest (1:N) - Approved By
// Um usuário pode aprovar várias solicitações
User.hasMany(AccessRequest, {
  foreignKey: 'approvedBy',
  as: 'approvedRequests',
  onDelete: 'SET NULL',
  onUpdate: 'CASCADE'
});

AccessRequest.belongsTo(User, {
  foreignKey: 'approvedBy',
  as: 'approver',
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
      await sequelize.sync({ force: true });
    } else if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: true });
    } else {
      // Em produção, apenas sincronizar sem alterar estrutura
      await sequelize.sync();
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
  } catch (error) {
    console.error('❌ Erro ao fechar conexão:', error.message);
  }
};

module.exports = {
  sequelize,
  User,
  Member,
  Transaction,
  AccessRequest,
  initializeDatabase,
  closeDatabase,
  syncDatabase
};
