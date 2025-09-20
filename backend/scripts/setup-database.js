const { sequelize } = require('../src/config/database');
const { QueryTypes } = require('sequelize');

async function setupDatabase() {
  try {
    console.log('🔄 Configurando banco de dados...');
    
    // 1. Habilitar extensão UUID
    console.log('📦 Habilitando extensão UUID...');
    await sequelize.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"', { type: QueryTypes.RAW });
    console.log('✅ Extensão UUID habilitada!');
    
    // 2. Criar tabela users
    console.log('👤 Criando tabela users...');
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR(100) NOT NULL,
        email VARCHAR(150) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(20) NOT NULL DEFAULT 'secretary' CHECK (role IN ('admin', 'secretary')),
        active BOOLEAN NOT NULL DEFAULT true,
        last_login TIMESTAMP,
        refresh_token TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP
      );
    `, { type: QueryTypes.RAW });
    console.log('✅ Tabela users criada!');
    
    // 3. Criar tabela members
    console.log('👥 Criando tabela members...');
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS members (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        full_name VARCHAR(150) NOT NULL,
        email VARCHAR(150),
        phone VARCHAR(20),
        address TEXT,
        birth_date DATE,
        baptism_date DATE,
        status VARCHAR(20) NOT NULL DEFAULT 'visitor' CHECK (status IN ('active', 'inactive', 'visitor')),
        member_since DATE,
        notes TEXT,
        family_members JSON,
        emergency_contact JSON,
        attendance_count INTEGER NOT NULL DEFAULT 0,
        last_attendance TIMESTAMP,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP
      );
    `, { type: QueryTypes.RAW });
    console.log('✅ Tabela members criada!');
    
    // 4. Criar tabela transactions
    console.log('💰 Criando tabela transactions...');
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        type VARCHAR(10) NOT NULL CHECK (type IN ('income', 'expense')),
        category VARCHAR(100) NOT NULL,
        subcategory VARCHAR(100),
        amount DECIMAL(15,2) NOT NULL CHECK (amount > 0),
        description TEXT,
        date DATE NOT NULL DEFAULT CURRENT_DATE,
        payment_method VARCHAR(20) NOT NULL DEFAULT 'cash' CHECK (payment_method IN ('cash', 'transfer', 'check', 'pix', 'credit_card')),
        reference_number VARCHAR(50),
        tags JSON,
        created_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
        last_modified_by UUID REFERENCES users(id) ON DELETE SET NULL,
        deleted_reason TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP
      );
    `, { type: QueryTypes.RAW });
    console.log('✅ Tabela transactions criada!');
    
    // 5. Criar tabela access_requests
    console.log('🔐 Criando tabela access_requests...');
    await sequelize.query(`
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
    `, { type: QueryTypes.RAW });
    console.log('✅ Tabela access_requests criada!');
    
    // 6. Criar índices básicos
    console.log('📊 Criando índices...');
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)',
      'CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)',
      'CREATE INDEX IF NOT EXISTS idx_members_full_name ON members(full_name)',
      'CREATE INDEX IF NOT EXISTS idx_members_email ON members(email)',
      'CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type)',
      'CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date)',
      'CREATE INDEX IF NOT EXISTS idx_access_requests_email ON access_requests(email)',
      'CREATE INDEX IF NOT EXISTS idx_access_requests_status ON access_requests(status)'
    ];
    
    for (const indexSQL of indexes) {
      await sequelize.query(indexSQL, { type: QueryTypes.RAW });
    }
    console.log('✅ Índices criados!');
    
    // 7. Verificar tabelas criadas
    console.log('\n🔍 Verificando tabelas...');
    const tables = await sequelize.query(
      'SELECT table_name FROM information_schema.tables WHERE table_schema = \'public\' ORDER BY table_name',
      { type: QueryTypes.SELECT }
    );
    
    console.log('📋 Tabelas no banco:');
    tables.forEach(table => {
      const icons = {
        'users': '👤',
        'members': '👥', 
        'transactions': '💰',
        'access_requests': '🔐'
      };
      const icon = icons[table.table_name] || '📄';
      console.log(`  ${icon} ${table.table_name}`);
    });
    
    const expectedTables = ['users', 'members', 'transactions', 'access_requests'];
    const existingTables = tables.map(t => t.table_name);
    const allTablesExist = expectedTables.every(table => existingTables.includes(table));
    
    if (allTablesExist) {
      console.log('\n🎉 Banco de dados configurado com sucesso!');
      console.log('✅ Todas as tabelas necessárias estão criadas!');
      console.log('🚀 O sistema está pronto para uso!');
    } else {
      console.log('\n❌ Algumas tabelas não foram criadas corretamente.');
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
    if (error.message.includes('already exists')) {
      console.log('ℹ️  As tabelas já existem, isso é normal.');
    }
  } finally {
    await sequelize.close();
  }
}

setupDatabase();
