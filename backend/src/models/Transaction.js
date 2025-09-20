const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * Model Transaction - Transações financeiras
 * Representa todas as movimentações financeiras da igreja
 */
const Transaction = sequelize.define('Transaction', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('income', 'expense'),
    allowNull: false,
    validate: {
      isIn: {
        args: [['income', 'expense']],
        msg: 'Tipo deve ser income (receita) ou expense (despesa)'
      }
    }
  },
  category: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Categoria é obrigatória'
      },
      len: {
        args: [2, 100],
        msg: 'Categoria deve ter entre 2 e 100 caracteres'
      }
    }
  },
  subcategory: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  amount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    validate: {
      min: {
        args: [0.01],
        msg: 'Valor deve ser maior que zero'
      },
      isDecimal: {
        msg: 'Valor deve ser um número decimal válido'
      }
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    validate: {
      isDate: {
        msg: 'Data deve ser uma data válida'
      }
    }
  },
  paymentMethod: {
    type: DataTypes.ENUM('cash', 'transfer', 'check', 'pix', 'credit_card'),
    allowNull: false,
    defaultValue: 'cash',
    field: 'payment_method', // Mapear para snake_case no banco
    validate: {
      isIn: {
        args: [['cash', 'transfer', 'check', 'pix', 'credit_card']],
        msg: 'Método de pagamento deve ser válido'
      }
    }
  },
  // Referência para quem criou a transação
  createdBy: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'created_by', // Mapear para snake_case no banco
    references: {
      model: 'users',
      key: 'id'
    }
  },
  // Campos adicionais para controle financeiro
  referenceNumber: {
    type: DataTypes.STRING(50),
    allowNull: true,
    field: 'reference_number', // Mapear para snake_case no banco
    comment: 'Número de referência (nota fiscal, comprovante, etc.)'
  },
  tags: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Tags para categorização adicional'
  },
  // Campo para soft delete com motivo
  deletedReason: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'deleted_reason' // Mapear para snake_case no banco
  },
  // Campos para auditoria
  lastModifiedBy: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'last_modified_by', // Mapear para snake_case no banco
    references: {
      model: 'users',
      key: 'id'
    }
  }
}, {
  tableName: 'transactions',
  paranoid: true, // Soft delete para auditoria
  indexes: [
    {
      fields: ['type']
    },
    {
      fields: ['category']
    },
    {
      fields: ['date']
    },
    {
      fields: ['created_by']
    },
    {
      fields: ['payment_method']
    }
  ],
  scopes: {
    // Scope para receitas
    income: {
      where: {
        type: 'income'
      }
    },
    // Scope para despesas
    expense: {
      where: {
        type: 'expense'
      }
    },
    // Scope para período específico
    byDateRange: (startDate, endDate) => ({
      where: {
        date: {
          [sequelize.Sequelize.Op.between]: [startDate, endDate]
        }
      }
    }),
    // Scope para categoria específica
    byCategory: (category) => ({
      where: {
        category: {
          [sequelize.Sequelize.Op.iLike]: `%${category}%`
        }
      }
    }),
    // Scope para método de pagamento
    byPaymentMethod: (method) => ({
      where: {
        paymentMethod: method
      }
    })
  }
});

// Métodos de instância
Transaction.prototype.isIncome = function() {
  return this.type === 'income';
};

Transaction.prototype.isExpense = function() {
  return this.type === 'expense';
};

Transaction.prototype.getFormattedAmount = function() {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(this.amount);
};

Transaction.prototype.markAsDeleted = function(userId, reason) {
  this.deletedReason = reason;
  this.lastModifiedBy = userId;
  return this.destroy();
};

// Métodos estáticos
Transaction.getFinancialSummary = async function(startDate, endDate) {
  const whereClause = startDate && endDate ? {
    date: {
      [sequelize.Sequelize.Op.between]: [startDate, endDate]
    }
  } : {};

  const [income, expense] = await Promise.all([
    this.sum('amount', {
      where: {
        ...whereClause,
        type: 'income'
      }
    }),
    this.sum('amount', {
      where: {
        ...whereClause,
        type: 'expense'
      }
    })
  ]);

  const totalIncome = parseFloat(income) || 0;
  const totalExpense = parseFloat(expense) || 0;
  const balance = totalIncome - totalExpense;

  return {
    totalIncome,
    totalExpense,
    balance,
    transactionCount: await this.count({ where: whereClause })
  };
};

Transaction.getTransactionsByCategory = async function(startDate, endDate, type = null) {
  const whereClause = { ...(startDate && endDate ? {
    date: {
      [sequelize.Sequelize.Op.between]: [startDate, endDate]
    }
  } : {}) };

  if (type) {
    whereClause.type = type;
  }

  const results = await this.findAll({
    attributes: [
      'category',
      [sequelize.fn('SUM', sequelize.col('amount')), 'total'],
      [sequelize.fn('COUNT', sequelize.col('id')), 'count']
    ],
    where: whereClause,
    group: ['category'],
    order: [[sequelize.fn('SUM', sequelize.col('amount')), 'DESC']],
    raw: true
  });

  return results;
};

Transaction.getMonthlyReport = async function(year) {
  const results = await this.findAll({
    attributes: [
      [sequelize.fn('EXTRACT', sequelize.literal('MONTH FROM date')), 'month'],
      [sequelize.fn('SUM', sequelize.literal('CASE WHEN type = \'income\' THEN amount ELSE 0 END')), 'income'],
      [sequelize.fn('SUM', sequelize.literal('CASE WHEN type = \'expense\' THEN amount ELSE 0 END')), 'expense']
    ],
    where: {
      date: {
        [sequelize.Sequelize.Op.gte]: `${year}-01-01`,
        [sequelize.Sequelize.Op.lt]: `${year + 1}-01-01`
      }
    },
    group: [sequelize.fn('EXTRACT', sequelize.literal('MONTH FROM date'))],
    order: [[sequelize.fn('EXTRACT', sequelize.literal('MONTH FROM date')), 'ASC']],
    raw: true
  });

  return results;
};

Transaction.findByReference = function(referenceNumber) {
  return this.findOne({
    where: {
      referenceNumber: {
        [sequelize.Sequelize.Op.iLike]: `%${referenceNumber}%`
      }
    }
  });
};

module.exports = Transaction;
