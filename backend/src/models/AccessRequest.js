const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * Model AccessRequest - Solicitações de acesso ao sistema
 * Representa solicitações de novos usuários que aguardam aprovação
 */
const AccessRequest = sequelize.define('AccessRequest', {
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
      name: 'unique_access_request_email',
      msg: 'Já existe uma solicitação com este email'
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
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    allowNull: false,
    defaultValue: 'pending',
    validate: {
      isIn: {
        args: [['pending', 'approved', 'rejected']],
        msg: 'Status deve ser pending, approved ou rejected'
      }
    }
  },
  rejectionReason: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'rejection_reason' // Mapear para snake_case no banco
  },
  approvedBy: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'approved_by', // Mapear para snake_case no banco
    references: {
      model: 'users',
      key: 'id'
    }
  },
  approvedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'approved_at' // Mapear para snake_case no banco
  },
  ipAddress: {
    type: DataTypes.STRING(45),
    allowNull: true,
    field: 'ip_address' // Mapear para snake_case no banco
  },
  userAgent: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'user_agent' // Mapear para snake_case no banco
  }
}, {
  tableName: 'access_requests',
  paranoid: true, // Soft delete
  hooks: {
    // Não hashear a senha aqui - será hasheada quando o usuário for criado
    // A senha fica em texto plano temporariamente para ser transferida para o User
  },
  scopes: {
    // Scope para retornar solicitações pendentes
    pending: {
      where: {
        status: 'pending'
      }
    },
    // Scope para retornar solicitações aprovadas
    approved: {
      where: {
        status: 'approved'
      }
    },
    // Scope para retornar solicitações rejeitadas
    rejected: {
      where: {
        status: 'rejected'
      }
    }
  }
});

// Métodos de instância
AccessRequest.prototype.toJSON = function() {
  const values = Object.assign({}, this.get());
  delete values.password; // Nunca retornar a senha
  return values;
};

// Métodos estáticos
AccessRequest.findByEmail = function(email) {
  return this.findOne({
    where: { email: email.toLowerCase() },
    paranoid: false // Inclui solicitações deletadas para verificação
  });
};

AccessRequest.findPendingByEmail = function(email) {
  return this.findOne({
    where: { 
      email: email.toLowerCase(),
      status: 'pending'
    }
  });
};

module.exports = AccessRequest;
