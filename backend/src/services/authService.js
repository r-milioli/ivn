const { User } = require('../models');
const { comparePassword, generateTokens } = require('../config/auth');
const { authLog } = require('../utils/logger');

/**
 * Service para operações de autenticação
 * Contém toda a lógica de negócio relacionada à autenticação
 */

/**
 * Autentica um usuário
 * @param {String} email - Email do usuário
 * @param {String} password - Senha do usuário
 * @returns {Object} Dados do usuário e tokens
 */
const authenticateUser = async (email, password) => {
  try {
    // Busca o usuário pelo email
    const user = await User.findActiveByEmail(email);
    
    if (!user) {
      authLog('warn', 'Tentativa de login com email inexistente', {
        email,
        ip: 'unknown' // Será preenchido pelo controller
      });
      throw new Error('Credenciais inválidas');
    }

    // Verifica a senha
    const isPasswordValid = await comparePassword(password, user.password);
    
    if (!isPasswordValid) {
      authLog('warn', 'Tentativa de login com senha incorreta', {
        userId: user.id,
        email,
        ip: 'unknown'
      });
      throw new Error('Credenciais inválidas');
    }

    // Gera os tokens
    const tokens = generateTokens(user);
    
    // Atualiza o refresh token no banco
    await user.update({ 
      refreshToken: tokens.refreshToken,
      lastLogin: new Date()
    });

    authLog('info', 'Login realizado com sucesso', {
      userId: user.id,
      email: user.email,
      role: user.role
    });

    return {
      user: user.toJSON(),
      tokens
    };
  } catch (error) {
    authLog('error', 'Erro na autenticação', {
      email,
      error: error.message
    });
    throw error;
  }
};

/**
 * Registra um novo usuário (apenas para admins)
 * @param {Object} userData - Dados do usuário
 * @param {Object} creator - Usuário que está criando
 * @returns {Object} Dados do usuário criado
 */
const registerUser = async (userData, creator) => {
  try {
    // Verifica se já existe usuário com este email
    const existingUser = await User.findByEmail(userData.email);
    
    if (existingUser && !existingUser.deletedAt) {
      throw new Error('Email já está sendo utilizado');
    }

    // Cria o novo usuário
    const newUser = await User.create(userData);

    authLog('info', 'Novo usuário registrado', {
      newUserId: newUser.id,
      newUserEmail: newUser.email,
      newUserRole: newUser.role,
      createdBy: creator.id,
      createdByEmail: creator.email
    });

    return newUser.toJSON();
  } catch (error) {
    authLog('error', 'Erro no registro de usuário', {
      email: userData.email,
      createdBy: creator.id,
      error: error.message
    });
    throw error;
  }
};

/**
 * Atualiza um usuário
 * @param {String} userId - ID do usuário
 * @param {Object} updateData - Dados para atualizar
 * @param {Object} updater - Usuário que está atualizando
 * @returns {Object} Dados do usuário atualizado
 */
const updateUser = async (userId, updateData, updater) => {
  try {
    const user = await User.findByPk(userId);
    
    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    // Não permite que um usuário desative a si mesmo
    if (userId === updater.id && updateData.active === false) {
      throw new Error('Você não pode desativar sua própria conta');
    }

    // Não permite alterar role para não-admin
    if (updateData.role && updateData.role !== user.role && updater.role !== 'admin') {
      throw new Error('Apenas administradores podem alterar roles');
    }

    await user.update(updateData);

    authLog('info', 'Usuário atualizado', {
      userId: user.id,
      userEmail: user.email,
      updatedBy: updater.id,
      updatedByEmail: updater.email,
      changes: Object.keys(updateData)
    });

    return user.toJSON();
  } catch (error) {
    authLog('error', 'Erro na atualização de usuário', {
      userId,
      updatedBy: updater.id,
      error: error.message
    });
    throw error;
  }
};

/**
 * Remove um usuário (soft delete)
 * @param {String} userId - ID do usuário
 * @param {Object} remover - Usuário que está removendo
 * @returns {Boolean} Sucesso da operação
 */
const deleteUser = async (userId, remover) => {
  try {
    const user = await User.findByPk(userId);
    
    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    // Não permite que um usuário delete a si mesmo
    if (userId === remover.id) {
      throw new Error('Você não pode deletar sua própria conta');
    }

    await user.destroy();

    authLog('info', 'Usuário removido', {
      deletedUserId: user.id,
      deletedUserEmail: user.email,
      deletedBy: remover.id,
      deletedByEmail: remover.email
    });

    return true;
  } catch (error) {
    authLog('error', 'Erro na remoção de usuário', {
      userId,
      deletedBy: remover.id,
      error: error.message
    });
    throw error;
  }
};

/**
 * Lista usuários com paginação
 * @param {Object} options - Opções de paginação e filtros
 * @returns {Object} Lista paginada de usuários
 */
const listUsers = async (options = {}) => {
  try {
    const { page = 1, limit = 10, search = '', role = '', active = null } = options;
    
    const whereClause = {};
    
    // Filtro por role
    if (role) {
      whereClause.role = role;
    }
    
    // Filtro por status ativo
    if (active !== null) {
      whereClause.active = active;
    }
    
    // Filtro por busca
    if (search) {
      whereClause[sequelize.Op.or] = [
        { name: { [sequelize.Op.iLike]: `%${search}%` } },
        { email: { [sequelize.Op.iLike]: `%${search}%` } }
      ];
    }

    const { count, rows } = await User.findAndCountAll({
      where: whereClause,
      attributes: { exclude: ['password', 'refreshToken'] },
      order: [['name', 'ASC']],
      limit: parseInt(limit),
      offset: (page - 1) * limit
    });

    return {
      users: rows,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: limit
      }
    };
  } catch (error) {
    authLog('error', 'Erro na listagem de usuários', {
      error: error.message,
      options
    });
    throw error;
  }
};

/**
 * Busca usuário por ID
 * @param {String} userId - ID do usuário
 * @returns {Object} Dados do usuário
 */
const getUserById = async (userId) => {
  try {
    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password', 'refreshToken'] }
    });
    
    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    return user.toJSON();
  } catch (error) {
    authLog('error', 'Erro ao buscar usuário por ID', {
      userId,
      error: error.message
    });
    throw error;
  }
};

/**
 * Atualiza a senha de um usuário
 * @param {String} userId - ID do usuário
 * @param {String} currentPassword - Senha atual
 * @param {String} newPassword - Nova senha
 * @param {Object} updater - Usuário que está atualizando
 * @returns {Boolean} Sucesso da operação
 */
const updatePassword = async (userId, currentPassword, newPassword, updater) => {
  try {
    const user = await User.findByPk(userId);
    
    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    // Verifica se está alterando a própria senha
    const isOwnPassword = userId === updater.id;
    
    // Se está alterando a própria senha, verifica a senha atual
    if (isOwnPassword) {
      const isCurrentPasswordValid = await comparePassword(currentPassword, user.password);
      
      if (!isCurrentPasswordValid) {
        throw new Error('Senha atual incorreta');
      }
    }

    await user.update({ password: newPassword });

    authLog('info', 'Senha atualizada', {
      userId: user.id,
      userEmail: user.email,
      updatedBy: updater.id,
      updatedByEmail: updater.email,
      isOwnPassword
    });

    return true;
  } catch (error) {
    authLog('error', 'Erro na atualização de senha', {
      userId,
      updatedBy: updater.id,
      error: error.message
    });
    throw error;
  }
};

/**
 * Desativa refresh tokens (logout)
 * @param {String} userId - ID do usuário
 * @returns {Boolean} Sucesso da operação
 */
const logoutUser = async (userId) => {
  try {
    const user = await User.findByPk(userId);
    
    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    await user.update({ refreshToken: null });

    authLog('info', 'Logout realizado', {
      userId: user.id,
      userEmail: user.email
    });

    return true;
  } catch (error) {
    authLog('error', 'Erro no logout', {
      userId,
      error: error.message
    });
    throw error;
  }
};

module.exports = {
  authenticateUser,
  registerUser,
  updateUser,
  deleteUser,
  listUsers,
  getUserById,
  updatePassword,
  logoutUser
};
