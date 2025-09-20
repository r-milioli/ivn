const fs = require('fs');
const path = require('path');
const { sequelize } = require('../src/config/database');
const { QueryTypes } = require('sequelize');

async function updateDatabase() {
  try {
    console.log('🔄 Iniciando atualização do banco de dados...');
    
    // Ler o arquivo schema.sql
    const schemaPath = path.join(__dirname, '../database/schema.sql');
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
    
    // Dividir o SQL em comandos individuais
    const commands = schemaSQL
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));
    
    console.log(`📝 Executando ${commands.length} comandos SQL...`);
    
    // Executar cada comando
    for (let i = 0; i < commands.length; i++) {
      const command = commands[i];
      
      // Pular comandos de comentário e SELECT de verificação
      if (command.includes('--') || command.startsWith('SELECT')) {
        continue;
      }
      
      try {
        console.log(`  ${i + 1}/${commands.length}: Executando comando...`);
        await sequelize.query(command, { type: QueryTypes.RAW });
      } catch (error) {
        // Ignorar erros de "já existe" (IF NOT EXISTS)
        if (!error.message.includes('already exists') && 
            !error.message.includes('já existe')) {
          console.warn(`    ⚠️  Aviso: ${error.message}`);
        }
      }
    }
    
    // Verificar se as tabelas foram criadas
    console.log('\n🔍 Verificando tabelas criadas...');
    const tables = await sequelize.query(
      'SELECT table_name FROM information_schema.tables WHERE table_schema = \'public\' ORDER BY table_name',
      { type: QueryTypes.SELECT }
    );
    
    console.log('📋 Tabelas existentes:');
    tables.forEach(table => {
      const icon = table.table_name === 'access_requests' ? '✅' : '📄';
      console.log(`  ${icon} ${table.table_name}`);
    });
    
    // Verificar especificamente a tabela access_requests
    const hasAccessRequests = tables.some(t => t.table_name === 'access_requests');
    
    if (hasAccessRequests) {
      console.log('\n🎉 Tabela access_requests criada com sucesso!');
      
      // Verificar colunas
      const columns = await sequelize.query(
        'SELECT column_name, data_type FROM information_schema.columns WHERE table_name = \'access_requests\' ORDER BY ordinal_position',
        { type: QueryTypes.SELECT }
      );
      
      console.log('📊 Colunas da tabela access_requests:');
      columns.forEach(col => console.log(`  - ${col.column_name} (${col.data_type})`));
    } else {
      console.log('\n❌ Erro: Tabela access_requests não foi criada!');
    }
    
    console.log('\n✅ Atualização do banco de dados concluída!');
    
  } catch (error) {
    console.error('❌ Erro durante a atualização:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await sequelize.close();
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  updateDatabase();
}

module.exports = updateDatabase;
