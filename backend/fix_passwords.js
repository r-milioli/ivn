const bcrypt = require('bcryptjs');

// Gerar hash correto para a senha "123456"
async function generatePasswordHash() {
    const password = '123456';
    const saltRounds = 12;
    
    try {
        const hash = await bcrypt.hash(password, saltRounds);
        console.log('Senha:', password);
        console.log('Hash gerado:', hash);
        
        // Verificar se o hash está correto
        const isValid = await bcrypt.compare(password, hash);
        console.log('Hash válido:', isValid);
        
        return hash;
    } catch (error) {
        console.error('Erro ao gerar hash:', error);
    }
}

generatePasswordHash();
