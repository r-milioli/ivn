const { sequelize } = require('../src/config/database');
const { QueryTypes } = require('sequelize');

async function createAccessRequestsTable() {
  try {
    console.log('🔄 Criando tabela access_requests...');
    
    // SQL para criar a tabela access_requests
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS access_requests (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR(100) NOT NULL,
        email VARCHAR(150) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(20) NOT NULL DEFAULT 'secretary' CHECK (role IN ('admin', 'secretary')),
        status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
        rejection_reason TEXT,
        approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
        approved_at TIMESTAMP,
        ip_address VARCHAR(45),
        user_agent TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP
      );
    `;
    
    await sequelize.query(createTableSQL, { type: QueryTypes.RAW });
    console.log('✅ Tabela access_requests criada!');
    
    // Criar índices
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_access_requests_email ON access_requests(email)',
      'CREATE INDEX IF NOT EXISTS idx_access_requests_status ON access_requests(status)',
      'CREATE INDEX IF NOT EXISTS idx_access_requests_created_at ON access_requests(created_at)',
      'CREATE INDEX IF NOT EXISTS idx_access_requests_deleted_at ON access_requests(deleted_at)'
    ];
    
    for (const indexSQL of indexes) {
      await sequelize.query(indexSQL, { type: QueryTypes.RAW });
      console.log('✅ Índice criado!');
    }
    
    // Verificar se a tabela foi criada
    console.log('\n🔍 Verificando tabela...');
    const tables = await sequelize.query(
      'SELECT table_name FROM information_schema.tables WHERE table_schema = \'public\' AND table_name = \'access_requests\'',
      { type: QueryTypes.SELECT }
    );
    
    if (tables.length > 0) {
      console.log('✅ Tabela access_requests existe!');
      
      // Verificar colunas
      const columns = await sequelize.query(
        'SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = \'access_requests\' ORDER BY ordinal_position',
        { type: QueryTypes.SELECT }
      );
      
      console.log('\n📊 Colunas da tabela:');
      columns.forEach(col => {
        console.log(`  - ${col.column_name} (${col.data_type}) ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'}`);
      });
      
      console.log('\n🎉 Tabela access_requests criada com sucesso!');
      console.log('🚀 O sistema de aprovação está pronto para uso!');
      
    } else {
      console.log('❌ Erro: Tabela access_requests não foi criada!');
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
    if (error.message.includes('already exists')) {
      console.log('ℹ️  A tabela já existe, isso é normal.');
    }
  } finally {
    await sequelize.close();
  }
}

createAccessRequestsTable();
