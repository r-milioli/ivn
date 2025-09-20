const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const { hashPassword } = require('../config/auth');

/**
 * Model User - Usuários do sistema administrativo
 * Representa administradores e secretários que têm acesso ao sistema
 */
const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Nome é obrigatório'
      },
      len: {
        args: [2, 100],
        msg: 'Nome deve ter entre 2 e 100 caracteres'
      }
    }
  },
  email: {
    type: DataTypes.STRING(150),
    allowNull: false,
    unique: {
      name: 'unique_email',
      msg: 'Este email já está sendo utilizado'
    },
    validate: {
      isEmail: {
        msg: 'Email deve ter um formato válido'
      },
      notEmpty: {
        msg: 'Email é obrigatório'
      }
    }
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Senha é obrigatória'
      },
      len: {
        args: [6, 255],
        msg: 'Senha deve ter pelo menos 6 caracteres'
      }
    }
  },
  role: {
    type: DataTypes.ENUM('admin', 'secretary'),
    allowNull: false,
    defaultValue: 'secretary',
    validate: {
      isIn: {
        args: [['admin', 'secretary']],
        msg: 'Role deve ser admin ou secretary'
      }
    }
  },
  active: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  lastLogin: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'last_login' // Mapear para snake_case no banco
  },
  refreshToken: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'refresh_token' // Mapear para snake_case no banco
  }
}, {
  tableName: 'users',
  paranoid: true, // Soft delete
  hooks: {
    // Hash da senha antes de salvar
    beforeCreate: async (user) => {
      if (user.password) {
        user.password = await hashPassword(user.password);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        user.password = await hashPassword(user.password);
      }
    }
  },
  scopes: {
    // Scope para retornar usuários ativos
    active: {
      where: {
        active: true
      }
    },
    // Scope para retornar usuários com dados sensíveis removidos
    public: {
      attributes: {
        exclude: ['password', 'refreshToken']
      }
    }
  }
});

// Métodos de instância
User.prototype.toJSON = function() {
  const values = Object.assign({}, this.get());
  delete values.password;
  delete values.refreshToken;
  return values;
};

User.prototype.updateLastLogin = function() {
  this.lastLogin = new Date();
  return this.save();
};

// Métodos estáticos
User.findByEmail = function(email) {
  return this.findOne({
    where: { email: email.toLowerCase() },
    paranoid: false // Inclui usuários deletados para verificação
  });
};

User.findActiveByEmail = function(email) {
  return this.findOne({
    where: { 
      email: email.toLowerCase(),
      active: true
    }
  });
};

module.exports = User;
