const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * Model Member - Membros da igreja
 * Representa os membros da congregação com suas informações pessoais
 */
const Member = sequelize.define('Member', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false
  },
  fullName: {
    type: DataTypes.STRING(150),
    allowNull: false,
    field: 'full_name', // Mapear para snake_case no banco
    validate: {
      notEmpty: {
        msg: 'Nome completo é obrigatório'
      },
      len: {
        args: [2, 150],
        msg: 'Nome completo deve ter entre 2 e 150 caracteres'
      }
    }
  },
  email: {
    type: DataTypes.STRING(150),
    allowNull: true,
    validate: {
      isEmail: {
        msg: 'Email deve ter um formato válido'
      }
    }
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true,
    validate: {
      len: {
        args: [10, 20],
        msg: 'Telefone deve ter entre 10 e 20 caracteres'
      }
    }
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  birthDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    field: 'birth_date', // Mapear para snake_case no banco
    validate: {
      isDate: {
        msg: 'Data de nascimento deve ser uma data válida'
      },
      isBefore: {
        args: new Date().toISOString().split('T')[0],
        msg: 'Data de nascimento deve ser anterior à data atual'
      }
    }
  },
  baptismDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    field: 'baptism_date', // Mapear para snake_case no banco
    validate: {
      isDate: {
        msg: 'Data de batismo deve ser uma data válida'
      }
    }
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'visitor'),
    allowNull: false,
    defaultValue: 'visitor',
    validate: {
      isIn: {
        args: [['active', 'inactive', 'visitor']],
        msg: 'Status deve ser active, inactive ou visitor'
      }
    }
  },
  memberSince: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    field: 'member_since', // Mapear para snake_case no banco
    validate: {
      isDate: {
        msg: 'Data de membro deve ser uma data válida'
      }
    }
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  // Campos adicionais para controle
  familyMembers: {
    type: DataTypes.JSON,
    allowNull: true,
    field: 'family_members', // Mapear para snake_case no banco
    comment: 'Lista de membros da família'
  },
  emergencyContact: {
    type: DataTypes.JSON,
    allowNull: true,
    field: 'emergency_contact', // Mapear para snake_case no banco
    comment: 'Contato de emergência com nome e telefone'
  },
  // Campos para estatísticas
  attendanceCount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'attendance_count' // Mapear para snake_case no banco
  },
  lastAttendance: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'last_attendance' // Mapear para snake_case no banco
  }
}, {
  tableName: 'members',
  paranoid: true, // Soft delete para preservar histórico
  indexes: [
    {
      fields: ['status']
    },
    {
      fields: ['full_name']
    },
    {
      fields: ['email']
    },
    {
      fields: ['member_since']
    }
  ],
  scopes: {
    // Scope para membros ativos
    active: {
      where: {
        status: 'active'
      }
    },
    // Scope para visitantes
    visitors: {
      where: {
        status: 'visitor'
      }
    },
    // Scope para membros inativos
    inactive: {
      where: {
        status: 'inactive'
      }
    },
    // Scope para busca por nome
    searchByName: (name) => ({
      where: {
        fullName: {
          [sequelize.Sequelize.Op.iLike]: `%${name}%`
        }
      }
    })
  }
});

// Métodos de instância
Member.prototype.getAge = function() {
  if (!this.birthDate) return null;
  const today = new Date();
  const birthDate = new Date(this.birthDate);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};

Member.prototype.getMemberYears = function() {
  if (!this.memberSince) return null;
  const today = new Date();
  const memberDate = new Date(this.memberSince);
  let years = today.getFullYear() - memberDate.getFullYear();
  const monthDiff = today.getMonth() - memberDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < memberDate.getDate())) {
    years--;
  }
  
  return years;
};

Member.prototype.updateAttendance = function() {
  this.attendanceCount += 1;
  this.lastAttendance = new Date();
  return this.save();
};

Member.prototype.promoteToMember = function() {
  this.status = 'active';
  if (!this.memberSince) {
    this.memberSince = new Date().toISOString().split('T')[0];
  }
  return this.save();
};

// Métodos estáticos
Member.getStatistics = async function() {
  const stats = await this.findAll({
    attributes: [
      [sequelize.fn('COUNT', sequelize.col('id')), 'total'],
      [sequelize.fn('COUNT', sequelize.literal('CASE WHEN status = \'active\' THEN 1 END')), 'active'],
      [sequelize.fn('COUNT', sequelize.literal('CASE WHEN status = \'visitor\' THEN 1 END')), 'visitors'],
      [sequelize.fn('COUNT', sequelize.literal('CASE WHEN status = \'inactive\' THEN 1 END')), 'inactive']
    ],
    raw: true
  });

  return stats[0] || { total: 0, active: 0, visitors: 0, inactive: 0 };
};

Member.findByStatus = function(status) {
  return this.findAll({
    where: { status },
    order: [['fullName', 'ASC']]
  });
};

Member.searchMembers = function(searchTerm) {
  return this.findAll({
    where: {
      [sequelize.Sequelize.Op.or]: [
        { fullName: { [sequelize.Sequelize.Op.iLike]: `%${searchTerm}%` } },
        { email: { [sequelize.Sequelize.Op.iLike]: `%${searchTerm}%` } },
        { phone: { [sequelize.Sequelize.Op.iLike]: `%${searchTerm}%` } }
      ]
    },
    order: [['fullName', 'ASC']]
  });
};

module.exports = Member;
