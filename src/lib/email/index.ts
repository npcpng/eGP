/**
 * PNG eGP System - Email Module
 *
 * Automatically configures email service from environment variables
 */

export * from './email-service';
export * from './email-templates';

import { getEmailService, type EmailConfig } from './email-service';

/**
 * Get email service configured from environment variables
 */
export function getConfiguredEmailService() {
  // Determine provider from available API keys
  let provider: EmailConfig['provider'] = 'console';
  let apiKey: string | undefined;

  if (process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== 're_xxxxxxxxxxxxxxxxxxxxxxxxxxxx') {
    provider = 'resend';
    apiKey = process.env.RESEND_API_KEY;
  } else if (process.env.SENDGRID_API_KEY && process.env.SENDGRID_API_KEY !== 'SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxx') {
    provider = 'sendgrid';
    apiKey = process.env.SENDGRID_API_KEY;
  }

  return getEmailService({
    provider,
    apiKey,
    from: {
      name: process.env.EMAIL_FROM_NAME || 'PNG eGP System',
      email: process.env.EMAIL_FROM_ADDRESS || 'noreply@npc.gov.pg',
    },
    replyTo: 'support@npc.gov.pg',
  });
}
