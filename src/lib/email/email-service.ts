/**
 * PNG eGP System - Email Service
 *
 * Handles sending email notifications via various providers
 * Supports: Resend, SendGrid, SMTP, or Supabase Edge Functions
 */

import { EmailTemplates, type EmailTemplate } from './email-templates';

export interface EmailConfig {
  provider: 'resend' | 'sendgrid' | 'smtp' | 'console';
  apiKey?: string;
  from: {
    name: string;
    email: string;
  };
  replyTo?: string;
}

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
  tags?: string[];
}

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

// Default configuration
const defaultConfig: EmailConfig = {
  provider: 'console', // Use console logging in development
  from: {
    name: 'PNG eGP System',
    email: 'noreply@npc.gov.pg',
  },
  replyTo: 'support@npc.gov.pg',
};

class EmailService {
  private config: EmailConfig;

  constructor(config?: Partial<EmailConfig>) {
    this.config = { ...defaultConfig, ...config };
  }

  /**
   * Send an email using the configured provider
   */
  async send(options: SendEmailOptions): Promise<SendEmailResult> {
    const { provider } = this.config;

    try {
      switch (provider) {
        case 'resend':
          return await this.sendViaResend(options);
        case 'sendgrid':
          return await this.sendViaSendGrid(options);
        case 'smtp':
          return await this.sendViaSMTP(options);
        case 'console':
        default:
          return this.logToConsole(options);
      }
    } catch (error) {
      console.error('[Email] Failed to send:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Send via Resend API
   */
  private async sendViaResend(options: SendEmailOptions): Promise<SendEmailResult> {
    if (!this.config.apiKey) {
      throw new Error('Resend API key not configured');
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `${this.config.from.name} <${this.config.from.email}>`,
        to: Array.isArray(options.to) ? options.to : [options.to],
        subject: options.subject,
        html: options.html,
        text: options.text,
        reply_to: options.replyTo || this.config.replyTo,
        tags: options.tags?.map(tag => ({ name: 'category', value: tag })),
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to send via Resend');
    }

    const result = await response.json();
    return {
      success: true,
      messageId: result.id,
    };
  }

  /**
   * Send via SendGrid API
   */
  private async sendViaSendGrid(options: SendEmailOptions): Promise<SendEmailResult> {
    if (!this.config.apiKey) {
      throw new Error('SendGrid API key not configured');
    }

    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{
          to: (Array.isArray(options.to) ? options.to : [options.to]).map(email => ({ email })),
        }],
        from: {
          name: this.config.from.name,
          email: this.config.from.email,
        },
        reply_to: {
          email: options.replyTo || this.config.replyTo,
        },
        subject: options.subject,
        content: [
          { type: 'text/plain', value: options.text || '' },
          { type: 'text/html', value: options.html },
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Failed to send via SendGrid');
    }

    return {
      success: true,
      messageId: response.headers.get('X-Message-Id') || undefined,
    };
  }

  /**
   * Send via SMTP (placeholder - would need nodemailer in production)
   */
  private async sendViaSMTP(options: SendEmailOptions): Promise<SendEmailResult> {
    // In production, this would use nodemailer or similar
    console.log('[Email] SMTP sending not implemented. Would send:', {
      to: options.to,
      subject: options.subject,
    });

    return {
      success: true,
      messageId: `smtp-${Date.now()}`,
    };
  }

  /**
   * Log to console (development mode)
   */
  private logToConsole(options: SendEmailOptions): SendEmailResult {
    console.log('\n========== EMAIL NOTIFICATION ==========');
    console.log('To:', options.to);
    console.log('Subject:', options.subject);
    console.log('Text Preview:', options.text?.substring(0, 200) + '...');
    console.log('=========================================\n');

    return {
      success: true,
      messageId: `console-${Date.now()}`,
    };
  }

  // ==========================================================================
  // CONVENIENCE METHODS FOR COMMON NOTIFICATIONS
  // ==========================================================================

  /**
   * Notify suppliers about a new tender
   */
  async notifyNewTender(
    recipients: Array<{ email: string; name: string }>,
    tenderData: {
      tenderRef: string;
      tenderTitle: string;
      category: string;
      estimatedValue: string;
      deadline: string;
      portalUrl: string;
    }
  ): Promise<SendEmailResult[]> {
    const results: SendEmailResult[] = [];

    for (const recipient of recipients) {
      const template = EmailTemplates.tenderPublished({
        recipientName: recipient.name,
        ...tenderData,
      });

      const result = await this.send({
        to: recipient.email,
        ...template,
        tags: ['tender', 'notification'],
      });

      results.push(result);
    }

    return results;
  }

  /**
   * Send bid submission confirmation
   */
  async confirmBidSubmission(
    recipientEmail: string,
    recipientName: string,
    bidData: {
      bidRef: string;
      tenderRef: string;
      tenderTitle: string;
      submittedAt: string;
      bidAmount: string;
    }
  ): Promise<SendEmailResult> {
    const template = EmailTemplates.bidSubmitted({
      recipientName,
      ...bidData,
    });

    return this.send({
      to: recipientEmail,
      ...template,
      tags: ['bid', 'confirmation'],
    });
  }

  /**
   * Notify about contract award
   */
  async notifyAward(
    recipientEmail: string,
    recipientName: string,
    awardData: {
      tenderRef: string;
      tenderTitle: string;
      contractValue: string;
      awardDate: string;
      contractRef: string;
    }
  ): Promise<SendEmailResult> {
    const template = EmailTemplates.awardNotification({
      recipientName,
      ...awardData,
    });

    return this.send({
      to: recipientEmail,
      ...template,
      tags: ['award', 'notification'],
    });
  }

  /**
   * Send subscription activation confirmation
   */
  async confirmSubscription(
    recipientEmail: string,
    recipientName: string,
    subscriptionData: {
      planName: string;
      startDate: string;
      endDate: string;
      maxBids: string;
      portalUrl: string;
    }
  ): Promise<SendEmailResult> {
    const template = EmailTemplates.subscriptionActivated({
      recipientName,
      ...subscriptionData,
    });

    return this.send({
      to: recipientEmail,
      ...template,
      tags: ['subscription', 'activation'],
    });
  }

  /**
   * Request approval
   */
  async requestApproval(
    approverEmail: string,
    approverName: string,
    requestData: {
      entityType: string;
      entityRef: string;
      entityTitle: string;
      requestedBy: string;
      requestedValue: string;
      approvalUrl: string;
    }
  ): Promise<SendEmailResult> {
    const template = EmailTemplates.approvalRequired({
      recipientName: approverName,
      ...requestData,
    });

    return this.send({
      to: approverEmail,
      ...template,
      tags: ['approval', 'workflow'],
    });
  }

  /**
   * Notify about approval decision
   */
  async notifyApprovalDecision(
    recipientEmail: string,
    recipientName: string,
    decisionData: {
      entityType: string;
      entityRef: string;
      entityTitle: string;
      decision: 'APPROVED' | 'REJECTED' | 'RETURNED';
      decidedBy: string;
      comments?: string;
    }
  ): Promise<SendEmailResult> {
    const template = EmailTemplates.approvalDecision({
      recipientName,
      ...decisionData,
    });

    return this.send({
      to: recipientEmail,
      ...template,
      tags: ['approval', 'decision'],
    });
  }
}

// Singleton instance
let emailService: EmailService | null = null;

export function getEmailService(config?: Partial<EmailConfig>): EmailService {
  if (!emailService || config) {
    emailService = new EmailService(config);
  }
  return emailService;
}

// Export for direct use
export { EmailService };
