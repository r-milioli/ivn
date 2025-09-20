# 🚀 Início Rápido - Sistema de Administração de Igreja

## ⚡ Configuração em 5 Minutos

### 1. Instalar Dependências
```bash
npm install
```

### 2. Configurar Banco no pgAdmin
1. Abra o pgAdmin
2. Crie um banco chamado `igreja_admin`
3. Selecione o banco `igreja_admin`
4. Abra o Query Tool (Ctrl+Shift+Q)
5. Execute o arquivo `database/setup_test_db.sql`

### 3. Configurar Aplicação
```bash
cp config.test.env .env
# Edite o .env e altere 'sua_senha_postgres' pela sua senha real
```

### 4. Iniciar Servidor
```bash
npm run dev
```

### 5. Testar Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@igreja.com","password":"123456"}'
```

## 🎯 Pronto!

- **Servidor:** http://localhost:3001
- **Health Check:** http://localhost:3001/api/health
- **API Info:** http://localhost:3001/api/info

## 👥 Usuários de Teste
- **admin@igreja.com** / 123456 (Admin)
- **maria@igreja.com** / 123456 (Secretária)
- **pastor@igreja.com** / 123456 (Admin)

## 📊 Dados Incluídos
- 6 membros da igreja
- 11 transações financeiras
- Saldo inicial: R$ 4.620,00

## 📚 Documentação Completa
Veja o [README.md](README.md) para documentação detalhada.

---
**Desenvolvido com ❤️ para administração de igrejas**
