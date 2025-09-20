const { sequelize } = require('../src/config/database');
const { AccessRequest } = require('../src/models');
const bcrypt = require('bcryptjs');

async function fixAccessRequestPasswords() {
  try {
    console.log('🔧 Corrigindo senhas das solicitações de acesso...');
    
    // Buscar todas as solicitações pendentes
    const requests = await AccessRequest.findAll({
      where: { status: 'pending' }
    });
    
    console.log(`📋 Encontradas ${requests.length} solicitações pendentes`);
    
    for (const request of requests) {
      console.log(`🔍 Verificando solicitação: ${request.email}`);
      
      // Verificar se a senha já está hasheada (começa com $2a$ ou $2b$)
      if (request.password.startsWith('$2a$') || request.password.startsWith('$2b$')) {
        console.log(`⚠️  Senha já hasheada para ${request.email} - removendo hash...`);
        
        // Para solicitações já hasheadas, vamos definir uma senha padrão
        // que será alterada no primeiro login
        const defaultPassword = 'temp123456';
        await request.update({ password: defaultPassword });
        console.log(`✅ Senha temporária definida para ${request.email}`);
      } else {
        console.log(`✅ Senha já em texto plano para ${request.email}`);
      }
    }
    
    console.log('🎉 Correção concluída!');
    
  } catch (error) {
    console.error('❌ Erro ao corrigir senhas:', error);
  } finally {
    await sequelize.close();
  }
}

fixAccessRequestPasswords();
