const Joi = require('joi');
const { Request, Response } = require('express');

/**
 * Middleware para validação de dados de entrada
 * Utiliza Joi para validação robusta dos dados
 */

/**
 * Validação para solicitação de acesso
 */
const validateAccessRequest = (req, res, next) => {
  
  const schema = Joi.object({
    name: Joi.string()
      .min(2)
      .max(100)
      .required()
      .messages({
        'string.min': 'Nome deve ter pelo menos 2 caracteres',
        'string.max': 'Nome deve ter no máximo 100 caracteres',
        'any.required': 'Nome é obrigatório'
      }),
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'Email deve ter um formato válido',
        'any.required': 'Email é obrigatório'
      }),
    password: Joi.string()
      .min(6)
      .max(50)
      .required()
      .messages({
        'string.min': 'Senha deve ter pelo menos 6 caracteres',
        'string.max': 'Senha deve ter no máximo 50 caracteres',
        'any.required': 'Senha é obrigatória'
      }),
    role: Joi.string()
      .valid('admin', 'secretary')
      .default('secretary')
      .messages({
        'any.only': 'Função deve ser admin ou secretary'
      })
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Dados inválidos',
      details: error.details.map(detail => ({
        field: detail.path[0],
        message: detail.message
      }))
    });
  }

  next();
};

/**
 * Validação para registro de usuário
 */
const validateUserRegistration = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string()
      .min(2)
      .max(100)
      .required()
      .messages({
        'string.min': 'Nome deve ter pelo menos 2 caracteres',
        'string.max': 'Nome deve ter no máximo 100 caracteres',
        'any.required': 'Nome é obrigatório'
      }),
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'Email deve ter um formato válido',
        'any.required': 'Email é obrigatório'
      }),
    password: Joi.string()
      .min(6)
      .max(50)
      .required()
      .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)'))
      .messages({
        'string.min': 'Senha deve ter pelo menos 6 caracteres',
        'string.max': 'Senha deve ter no máximo 50 caracteres',
        'string.pattern.base': 'Senha deve conter pelo menos uma letra minúscula, uma maiúscula e um número',
        'any.required': 'Senha é obrigatória'
      }),
    role: Joi.string()
      .valid('admin', 'secretary')
      .default('secretary')
      .messages({
        'any.only': 'Role deve ser admin ou secretary'
      })
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Dados de entrada inválidos',
      errors: error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }))
    });
  }

  next();
};

/**
 * Validação para login de usuário
 */
const validateUserLogin = (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'Email deve ter um formato válido',
        'any.required': 'Email é obrigatório'
      }),
    password: Joi.string()
      .required()
      .messages({
        'any.required': 'Senha é obrigatória'
      })
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Dados de entrada inválidos',
      errors: error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }))
    });
  }

  next();
};

/**
 * Validação para criação/atualização de membro
 */
const validateMember = (req, res, next) => {
  const schema = Joi.object({
    fullName: Joi.string()
      .min(2)
      .max(150)
      .required()
      .messages({
        'string.min': 'Nome completo deve ter pelo menos 2 caracteres',
        'string.max': 'Nome completo deve ter no máximo 150 caracteres',
        'any.required': 'Nome completo é obrigatório'
      }),
    email: Joi.string()
      .email()
      .allow('')
      .optional()
      .messages({
        'string.email': 'Email deve ter um formato válido'
      }),
    phone: Joi.string()
      .pattern(/^\(\d{2}\)\s\d{4,5}-\d{4}$/)
      .allow('')
      .optional()
      .messages({
        'string.pattern.base': 'Telefone deve estar no formato (XX) XXXXX-XXXX ou (XX) XXXX-XXXX'
      }),
    address: Joi.string()
      .allow('')
      .optional(),
    birthDate: Joi.date()
      .iso()
      .max('now')
      .optional()
      .messages({
        'date.max': 'Data de nascimento deve ser anterior à data atual'
      }),
    baptismDate: Joi.date()
      .iso()
      .optional(),
    status: Joi.string()
      .valid('active', 'inactive', 'visitor')
      .default('visitor')
      .messages({
        'any.only': 'Status deve ser active, inactive ou visitor'
      }),
    memberSince: Joi.date()
      .iso()
      .optional(),
    notes: Joi.string()
      .allow('')
      .optional(),
    familyMembers: Joi.array()
      .items(Joi.string())
      .optional(),
    emergencyContact: Joi.object({
      name: Joi.string().required(),
      phone: Joi.string().required()
    }).optional()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Dados de entrada inválidos',
      errors: error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }))
    });
  }

  next();
};

/**
 * Validação para transações financeiras
 */
const validateTransaction = (req, res, next) => {
  const schema = Joi.object({
    type: Joi.string()
      .valid('income', 'expense')
      .required()
      .messages({
        'any.only': 'Tipo deve ser income (receita) ou expense (despesa)',
        'any.required': 'Tipo é obrigatório'
      }),
    category: Joi.string()
      .min(2)
      .max(100)
      .required()
      .messages({
        'string.min': 'Categoria deve ter pelo menos 2 caracteres',
        'string.max': 'Categoria deve ter no máximo 100 caracteres',
        'any.required': 'Categoria é obrigatória'
      }),
    subcategory: Joi.string()
      .max(100)
      .allow('')
      .optional(),
    amount: Joi.number()
      .positive()
      .precision(2)
      .required()
      .messages({
        'number.positive': 'Valor deve ser maior que zero',
        'any.required': 'Valor é obrigatório'
      }),
    description: Joi.string()
      .allow('')
      .optional(),
    date: Joi.date()
      .iso()
      .max('now')
      .default(Date.now)
      .messages({
        'date.max': 'Data não pode ser futura'
      }),
    paymentMethod: Joi.string()
      .valid('cash', 'transfer', 'check', 'pix', 'credit_card')
      .default('cash')
      .messages({
        'any.only': 'Método de pagamento deve ser válido'
      }),
    referenceNumber: Joi.string()
      .max(50)
      .allow('')
      .optional(),
    tags: Joi.array()
      .items(Joi.string())
      .optional()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Dados de entrada inválidos',
      errors: error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }))
    });
  }

  next();
};

/**
 * Validação para parâmetros de query (paginação, filtros)
 */
const validateQueryParams = (req, res, next) => {
  const schema = Joi.object({
    page: Joi.number()
      .integer()
      .min(1)
      .default(1)
      .messages({
        'number.base': 'Página deve ser um número',
        'number.min': 'Página deve ser maior que zero'
      }),
    limit: Joi.number()
      .integer()
      .min(1)
      .max(100)
      .default(10)
      .messages({
        'number.base': 'Limite deve ser um número',
        'number.min': 'Limite deve ser maior que zero',
        'number.max': 'Limite deve ser no máximo 100'
      }),
    search: Joi.string()
      .allow('')
      .optional(),
    sortBy: Joi.string()
      .allow('')
      .optional(),
    sortOrder: Joi.string()
      .valid('ASC', 'DESC')
      .default('DESC')
      .messages({
        'any.only': 'Ordem deve ser ASC ou DESC'
      })
  });

  const { error } = schema.validate(req.query);
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Parâmetros de query inválidos',
      errors: error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }))
    });
  }

  next();
};

/**
 * Validação para filtros de data
 */
const validateDateRange = (req, res, next) => {
  const schema = Joi.object({
    startDate: Joi.date()
      .iso()
      .optional()
      .messages({
        'date.format': 'Data inicial deve estar no formato ISO (YYYY-MM-DD)'
      }),
    endDate: Joi.date()
      .iso()
      .min(Joi.ref('startDate'))
      .optional()
      .messages({
        'date.format': 'Data final deve estar no formato ISO (YYYY-MM-DD)',
        'date.min': 'Data final deve ser posterior à data inicial'
      })
  });

  const { error } = schema.validate(req.query);
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Período de data inválido',
      errors: error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }))
    });
  }

  next();
};

/**
 * Validação para UUID
 */
const validateUUID = (paramName) => {
  return (req, res, next) => {
    const schema = Joi.string()
      .uuid()
      .required()
      .messages({
        'string.guid': `${paramName} deve ser um UUID válido`,
        'any.required': `${paramName} é obrigatório`
      });

    const { error } = schema.validate(req.params[paramName]);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Parâmetro inválido',
        errors: error.details.map(detail => ({
          field: paramName,
          message: detail.message
        }))
      });
    }

    next();
  };
};

module.exports = {
  validateAccessRequest,
  validateUserRegistration,
  validateUserLogin,
  validateMember,
  validateTransaction,
  validateQueryParams,
  validateDateRange,
  validateUUID
};
