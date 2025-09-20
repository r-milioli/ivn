const { sequelize } = require('./src/config/database');
const { User } = require('./src/models');

async function resetUserPassword() {
  try {
    console.log('🔧 Redefinindo senha do usuário...');
    
    // Buscar o usuário
    const user = await User.findOne({
      where: { email: 'robson.milioli@gmail.com' }
    });
    
    if (!user) {
      console.log('❌ Usuário não encontrado');
      return;
    }
    
    console.log(`✅ Usuário encontrado: ${user.name} (${user.email})`);
    
    // Definir senha temporária
    const tempPassword = '123456';
    await user.update({ password: tempPassword });
    
    console.log(`🔐 Senha temporária definida: ${tempPassword}`);
    console.log('✅ Agora você pode fazer login com esta senha');
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await sequelize.close();
  }
}

resetUserPassword();
