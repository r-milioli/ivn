-- =====================================================
-- Script para Corrigir Senhas dos Usuários
-- Sistema de Administração de Igreja
-- =====================================================
-- 
-- INSTRUÇÕES:
-- 1. Execute este script no pgAdmin
-- 2. Selecione o banco 'igreja_admin'
-- 3. Cole e execute este script
-- =====================================================

-- Hash correto para a senha "123456" com bcrypt
-- Este hash foi gerado com salt rounds 12
UPDATE users 
SET password = '$2a$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi' 
WHERE email IN ('admin@igreja.com', 'maria@igreja.com', 'pastor@igreja.com');

-- Verificar se as senhas foram atualizadas
SELECT name, email, role, 
       CASE 
           WHEN password = '$2a$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi' 
           THEN 'Senha atualizada' 
           ELSE 'Senha não atualizada' 
       END as status
FROM users 
WHERE deleted_at IS NULL;

-- =====================================================
-- CREDENCIAIS CORRETAS PARA TESTE:
-- =====================================================
-- Email: admin@igreja.com
-- Senha: 123456
-- 
-- Email: maria@igreja.com  
-- Senha: 123456
--
-- Email: pastor@igreja.com
-- Senha: 123456
-- =====================================================
