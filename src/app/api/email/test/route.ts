import { NextResponse } from 'next/server';
import { getConfiguredEmailService, EmailTemplates } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, name } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email address required' },
        { status: 400 }
      );
    }

    const emailService = getConfiguredEmailService();

    // Send test email
    const template = EmailTemplates.subscriptionActivated({
      recipientName: name || 'Test User',
      planName: 'Premium',
      startDate: new Date().toLocaleDateString(),
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      maxBids: '50',
      portalUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    });

    const result = await emailService.send({
      to: email,
      ...template,
      tags: ['test'],
    });

    return NextResponse.json({
      success: result.success,
      messageId: result.messageId,
      error: result.error,
      provider: process.env.RESEND_API_KEY ? 'resend' :
                process.env.SENDGRID_API_KEY ? 'sendgrid' : 'console',
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  // Check email configuration status
  const hasResend = !!process.env.RESEND_API_KEY &&
                    process.env.RESEND_API_KEY !== 're_xxxxxxxxxxxxxxxxxxxxxxxxxxxx';
  const hasSendGrid = !!process.env.SENDGRID_API_KEY &&
                      process.env.SENDGRID_API_KEY !== 'SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxx';

  return NextResponse.json({
    configured: hasResend || hasSendGrid,
    provider: hasResend ? 'resend' : hasSendGrid ? 'sendgrid' : 'console',
    fromAddress: process.env.EMAIL_FROM_ADDRESS || 'noreply@npc.gov.pg',
    fromName: process.env.EMAIL_FROM_NAME || 'PNG eGP System',
    recommendation: !hasResend && !hasSendGrid
      ? 'Add RESEND_API_KEY or SENDGRID_API_KEY to .env.local to enable email sending'
      : 'Email provider configured successfully',
  });
}
