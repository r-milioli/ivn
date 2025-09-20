const { authLog } = require('../utils/logger')

/**
 * Serviço de email para notificações
 * Simula envio de emails (em produção, integrar com SendGrid, AWS SES, etc.)
 */
class EmailService {
  /**
   * Envia email de notificação
   * @param {Object} emailData - Dados do email
   * @returns {Promise<boolean>} Sucesso do envio
   */
  async sendEmail(emailData) {
    try {
      const { to, subject, body, type = 'notification' } = emailData
      
      // Simular envio de email
      authLog('info', 'Email enviado (simulado)', {
        to,
        subject,
        type,
        timestamp: new Date().toISOString()
      })

      // Em produção, aqui seria feita a integração com o serviço de email
      // Exemplo com SendGrid:
      // const sgMail = require('@sendgrid/mail')
      // sgMail.setApiKey(process.env.SENDGRID_API_KEY)
      // await sgMail.send(emailData)

      return true
    } catch (error) {
      authLog('error', 'Erro ao enviar email', {
        error: error.message,
        emailData
      })
      throw error
    }
  }

  /**
   * Envia notificação de aprovação de solicitação
   * @param {Object} request - Dados da solicitação
   * @returns {Promise<boolean>} Sucesso do envio
   */
  async sendApprovalNotification(request) {
    const subject = 'Solicitação de Acesso Aprovada - Sistema Igreja Admin'
    const body = `
      <h2>Sua solicitação foi aprovada!</h2>
      <p>Olá ${request.name},</p>
      <p>Sua solicitação de acesso ao sistema administrativo da igreja foi <strong>aprovada</strong>!</p>
      
      <h3>Detalhes da sua conta:</h3>
      <ul>
        <li><strong>Nome:</strong> ${request.name}</li>
        <li><strong>Email:</strong> ${request.email}</li>
        <li><strong>Função:</strong> ${request.role === 'admin' ? 'Administrador' : 'Secretário'}</li>
      </ul>
      
      <p>Você já pode fazer login no sistema usando suas credenciais.</p>
      
      <p><a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/login" 
         style="background-color: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
         Fazer Login
      </a></p>
      
      <p>Se você tiver alguma dúvida, entre em contato com o administrador do sistema.</p>
      
      <hr>
      <p><small>Sistema de Administração da Igreja</small></p>
    `

    return await this.sendEmail({
      to: request.email,
      subject,
      body,
      type: 'approval'
    })
  }

  /**
   * Envia notificação de rejeição de solicitação
   * @param {Object} request - Dados da solicitação
   * @returns {Promise<boolean>} Sucesso do envio
   */
  async sendRejectionNotification(request) {
    const subject = 'Solicitação de Acesso - Informações Importantes'
    const body = `
      <h2>Informações sobre sua solicitação</h2>
      <p>Olá ${request.name},</p>
      <p>Infelizmente, sua solicitação de acesso ao sistema administrativo da igreja não foi aprovada neste momento.</p>
      
      <h3>Motivo da rejeição:</h3>
      <p style="background-color: #fef2f2; padding: 15px; border-left: 4px solid #ef4444; margin: 10px 0;">
        ${request.rejectionReason}
      </p>
      
      <p>Se você acredita que houve um engano ou gostaria de solicitar novamente, entre em contato com o administrador do sistema.</p>
      
      <p>Obrigado por seu interesse em contribuir com nossa comunidade.</p>
      
      <hr>
      <p><small>Sistema de Administração da Igreja</small></p>
    `

    return await this.sendEmail({
      to: request.email,
      subject,
      body,
      type: 'rejection'
    })
  }

  /**
   * Envia notificação de nova solicitação para administradores
   * @param {Object} request - Dados da solicitação
   * @returns {Promise<boolean>} Sucesso do envio
   */
  async sendNewRequestNotification(request) {
    const subject = 'Nova Solicitação de Acesso - Sistema Igreja Admin'
    const body = `
      <h2>Nova solicitação de acesso</h2>
      <p>Uma nova solicitação de acesso foi recebida no sistema.</p>
      
      <h3>Detalhes da solicitação:</h3>
      <ul>
        <li><strong>Nome:</strong> ${request.name}</li>
        <li><strong>Email:</strong> ${request.email}</li>
        <li><strong>Função solicitada:</strong> ${request.role === 'admin' ? 'Administrador' : 'Secretário'}</li>
        <li><strong>Data:</strong> ${new Date(request.createdAt).toLocaleDateString('pt-BR')}</li>
        <li><strong>IP:</strong> ${request.ipAddress || 'Não informado'}</li>
      </ul>
      
      <p><a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/admin/access-requests" 
         style="background-color: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
         Revisar Solicitação
      </a></p>
      
      <hr>
      <p><small>Sistema de Administração da Igreja</small></p>
    `

    // Em produção, enviar para todos os administradores
    const adminEmails = process.env.ADMIN_EMAILS ? process.env.ADMIN_EMAILS.split(',') : ['admin@igreja.com']
    
    const emailPromises = adminEmails.map(email => 
      this.sendEmail({
        to: email.trim(),
        subject,
        body,
        type: 'new_request'
      })
    )

    await Promise.all(emailPromises)
    return true
  }

  /**
   * Envia email de boas-vindas para novo usuário
   * @param {Object} user - Dados do usuário
   * @returns {Promise<boolean>} Sucesso do envio
   */
  async sendWelcomeEmail(user) {
    const subject = 'Bem-vindo ao Sistema Igreja Admin'
    const body = `
      <h2>Bem-vindo ao Sistema de Administração da Igreja!</h2>
      <p>Olá ${user.name},</p>
      <p>Seja bem-vindo ao nosso sistema de administração!</p>
      
      <h3>Suas credenciais de acesso:</h3>
      <ul>
        <li><strong>Nome:</strong> ${user.name}</li>
        <li><strong>Email:</strong> ${user.email}</li>
        <li><strong>Função:</strong> ${user.role === 'admin' ? 'Administrador' : 'Secretário'}</li>
      </ul>
      
      <p><strong>Importante:</strong> Mantenha suas credenciais seguras e não as compartilhe com outras pessoas.</p>
      
      <p><a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/login" 
         style="background-color: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
         Acessar Sistema
      </a></p>
      
      <h3>Próximos passos:</h3>
      <ol>
        <li>Faça login no sistema</li>
        <li>Explore as funcionalidades disponíveis</li>
        <li>Configure seu perfil se necessário</li>
        <li>Entre em contato com o administrador se tiver dúvidas</li>
      </ol>
      
      <p>Estamos aqui para ajudar! Se você tiver alguma dúvida ou precisar de suporte, não hesite em entrar em contato.</p>
      
      <hr>
      <p><small>Sistema de Administração da Igreja</small></p>
    `

    return await this.sendEmail({
      to: user.email,
      subject,
      body,
      type: 'welcome'
    })
  }
}

module.exports = new EmailService()
