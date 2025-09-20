const bcrypt = require('bcryptjs');

async function generateHash() {
    const password = '123456';
    
    try {
        // Gerar hash com salt rounds 12
        const hash = await bcrypt.hash(password, 12);
        
        console.log('====================================');
        console.log('HASH GERADO PARA A SENHA:', password);
        console.log('====================================');
        console.log('Hash:', hash);
        console.log('====================================');
        
        // Verificar se o hash funciona
        const isValid = await bcrypt.compare(password, hash);
        console.log('Hash válido:', isValid ? '✅ SIM' : '❌ NÃO');
        
        console.log('====================================');
        console.log('COMANDO SQL PARA ATUALIZAR:');
        console.log('====================================');
        console.log(`UPDATE users SET password = '${hash}' WHERE email IN ('admin@igreja.com', 'maria@igreja.com', 'pastor@igreja.com');`);
        
    } catch (error) {
        console.error('Erro:', error);
    }
}

generateHash();
