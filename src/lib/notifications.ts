/**
 * Email Notification Engine
 * Handles email notifications for workflow approvals, bid submissions, and system events
 */

export type NotificationType =
  | 'WORKFLOW_PENDING'
  | 'WORKFLOW_APPROVED'
  | 'WORKFLOW_REJECTED'
  | 'WORKFLOW_RETURNED'
  | 'BID_SUBMITTED'
  | 'BID_OPENED'
  | 'TENDER_PUBLISHED'
  | 'TENDER_CLOSING_SOON'
  | 'CONTRACT_SIGNED'
  | 'DEADLINE_REMINDER';

export interface NotificationRecipient {
  email: string;
  name: string;
  userId: string;
  role?: string;
}

export interface NotificationPayload {
  id: string;
  type: NotificationType;
  recipients: NotificationRecipient[];
  subject: string;
  templateId: string;
  templateData: Record<string, unknown>;
  priority: 'HIGH' | 'NORMAL' | 'LOW';
  scheduledAt?: Date;
  sentAt?: Date;
  status: 'PENDING' | 'SENT' | 'FAILED' | 'CANCELLED';
  retryCount: number;
  maxRetries: number;
  createdAt: Date;
  error?: string;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  htmlContent: string;
  textContent: string;
  variables: string[];
}

// Email templates for different notification types
export const emailTemplates: Record<string, EmailTemplate> = {
  WORKFLOW_PENDING: {
    id: 'workflow-pending',
    name: 'Workflow Approval Pending',
    subject: 'Action Required: {{entityType}} Pending Your Approval',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #dc2626, #f97316); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">PNG eGP System</h1>
        </div>
        <div style="padding: 30px; background: #ffffff;">
          <h2 style="color: #18181b;">Approval Required</h2>
          <p style="color: #52525b;">Dear {{recipientName}},</p>
          <p style="color: #52525b;">A new {{entityType}} requires your approval:</p>
          <div style="background: #f4f4f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Reference:</strong> {{entityRef}}</p>
            <p style="margin: 5px 0;"><strong>Title:</strong> {{entityTitle}}</p>
            <p style="margin: 5px 0;"><strong>Requested Value:</strong> K {{requestedValue}}</p>
            <p style="margin: 5px 0;"><strong>Submitted By:</strong> {{submittedBy}}</p>
            <p style="margin: 5px 0;"><strong>Due Date:</strong> {{dueDate}}</p>
          </div>
          <a href="{{actionUrl}}" style="display: inline-block; background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 10px;">Review & Approve</a>
        </div>
        <div style="background: #f4f4f5; padding: 15px; text-align: center;">
          <p style="color: #71717a; font-size: 12px; margin: 0;">National Procurement Commission, Papua New Guinea</p>
        </div>
      </div>
    `,
    textContent: `
PNG eGP System - Approval Required

Dear {{recipientName}},

A new {{entityType}} requires your approval:

Reference: {{entityRef}}
Title: {{entityTitle}}
Requested Value: K {{requestedValue}}
Submitted By: {{submittedBy}}
Due Date: {{dueDate}}

Please login to the system to review and take action.

National Procurement Commission, Papua New Guinea
    `,
    variables: ['recipientName', 'entityType', 'entityRef', 'entityTitle', 'requestedValue', 'submittedBy', 'dueDate', 'actionUrl'],
  },

  WORKFLOW_APPROVED: {
    id: 'workflow-approved',
    name: 'Workflow Approved',
    subject: 'Approved: {{entityType}} - {{entityRef}}',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #16a34a, #22c55e); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">PNG eGP System</h1>
        </div>
        <div style="padding: 30px; background: #ffffff;">
          <div style="text-align: center; margin-bottom: 20px;">
            <div style="width: 60px; height: 60px; background: #dcfce7; border-radius: 50%; margin: 0 auto; display: flex; align-items: center; justify-content: center;">
              <span style="font-size: 30px;">✓</span>
            </div>
          </div>
          <h2 style="color: #18181b; text-align: center;">Request Approved</h2>
          <p style="color: #52525b;">Dear {{recipientName}},</p>
          <p style="color: #52525b;">Your {{entityType}} has been approved:</p>
          <div style="background: #f4f4f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Reference:</strong> {{entityRef}}</p>
            <p style="margin: 5px 0;"><strong>Title:</strong> {{entityTitle}}</p>
            <p style="margin: 5px 0;"><strong>Approved By:</strong> {{approvedBy}}</p>
            <p style="margin: 5px 0;"><strong>Approved At:</strong> {{approvedAt}}</p>
            {{#if comments}}<p style="margin: 5px 0;"><strong>Comments:</strong> {{comments}}</p>{{/if}}
          </div>
          <a href="{{actionUrl}}" style="display: inline-block; background: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 10px;">View Details</a>
        </div>
        <div style="background: #f4f4f5; padding: 15px; text-align: center;">
          <p style="color: #71717a; font-size: 12px; margin: 0;">National Procurement Commission, Papua New Guinea</p>
        </div>
      </div>
    `,
    textContent: `
PNG eGP System - Request Approved

Dear {{recipientName}},

Your {{entityType}} has been approved:

Reference: {{entityRef}}
Title: {{entityTitle}}
Approved By: {{approvedBy}}
Approved At: {{approvedAt}}
Comments: {{comments}}

National Procurement Commission, Papua New Guinea
    `,
    variables: ['recipientName', 'entityType', 'entityRef', 'entityTitle', 'approvedBy', 'approvedAt', 'comments', 'actionUrl'],
  },

  WORKFLOW_REJECTED: {
    id: 'workflow-rejected',
    name: 'Workflow Rejected',
    subject: 'Rejected: {{entityType}} - {{entityRef}}',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #dc2626, #ef4444); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">PNG eGP System</h1>
        </div>
        <div style="padding: 30px; background: #ffffff;">
          <div style="text-align: center; margin-bottom: 20px;">
            <div style="width: 60px; height: 60px; background: #fef2f2; border-radius: 50%; margin: 0 auto; display: flex; align-items: center; justify-content: center;">
              <span style="font-size: 30px;">✗</span>
            </div>
          </div>
          <h2 style="color: #18181b; text-align: center;">Request Rejected</h2>
          <p style="color: #52525b;">Dear {{recipientName}},</p>
          <p style="color: #52525b;">Unfortunately, your {{entityType}} has been rejected:</p>
          <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
            <p style="margin: 5px 0;"><strong>Reference:</strong> {{entityRef}}</p>
            <p style="margin: 5px 0;"><strong>Title:</strong> {{entityTitle}}</p>
            <p style="margin: 5px 0;"><strong>Rejected By:</strong> {{rejectedBy}}</p>
            <p style="margin: 5px 0;"><strong>Reason:</strong> {{reason}}</p>
          </div>
          <p style="color: #52525b;">Please review the feedback and resubmit if appropriate.</p>
          <a href="{{actionUrl}}" style="display: inline-block; background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 10px;">View Details</a>
        </div>
        <div style="background: #f4f4f5; padding: 15px; text-align: center;">
          <p style="color: #71717a; font-size: 12px; margin: 0;">National Procurement Commission, Papua New Guinea</p>
        </div>
      </div>
    `,
    textContent: `
PNG eGP System - Request Rejected

Dear {{recipientName}},

Unfortunately, your {{entityType}} has been rejected:

Reference: {{entityRef}}
Title: {{entityTitle}}
Rejected By: {{rejectedBy}}
Reason: {{reason}}

Please review the feedback and resubmit if appropriate.

National Procurement Commission, Papua New Guinea
    `,
    variables: ['recipientName', 'entityType', 'entityRef', 'entityTitle', 'rejectedBy', 'reason', 'actionUrl'],
  },

  BID_SUBMITTED: {
    id: 'bid-submitted',
    name: 'Bid Submission Confirmation',
    subject: 'Bid Submitted Successfully - {{tenderRef}}',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #dc2626, #f97316); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">PNG eGP System</h1>
        </div>
        <div style="padding: 30px; background: #ffffff;">
          <div style="text-align: center; margin-bottom: 20px;">
            <div style="width: 60px; height: 60px; background: #dbeafe; border-radius: 50%; margin: 0 auto; display: flex; align-items: center; justify-content: center;">
              <span style="font-size: 30px;">🔒</span>
            </div>
          </div>
          <h2 style="color: #18181b; text-align: center;">Bid Submitted & Sealed</h2>
          <p style="color: #52525b;">Dear {{supplierName}},</p>
          <p style="color: #52525b;">Your bid has been encrypted and sealed successfully:</p>
          <div style="background: #f4f4f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Bid Reference:</strong> {{bidRef}}</p>
            <p style="margin: 5px 0;"><strong>Tender:</strong> {{tenderRef}}</p>
            <p style="margin: 5px 0;"><strong>Submitted At:</strong> {{submittedAt}}</p>
            <p style="margin: 5px 0;"><strong>Opening Date:</strong> {{openingDate}}</p>
          </div>
          <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="color: #92400e; margin: 0; font-size: 14px;">🔐 Your bid is encrypted and sealed. No one can view it until the official opening time.</p>
          </div>
        </div>
        <div style="background: #f4f4f5; padding: 15px; text-align: center;">
          <p style="color: #71717a; font-size: 12px; margin: 0;">National Procurement Commission, Papua New Guinea</p>
        </div>
      </div>
    `,
    textContent: `
PNG eGP System - Bid Submitted Successfully

Dear {{supplierName}},

Your bid has been encrypted and sealed successfully:

Bid Reference: {{bidRef}}
Tender: {{tenderRef}}
Submitted At: {{submittedAt}}
Opening Date: {{openingDate}}

Your bid is encrypted and sealed. No one can view it until the official opening time.

National Procurement Commission, Papua New Guinea
    `,
    variables: ['supplierName', 'bidRef', 'tenderRef', 'submittedAt', 'openingDate'],
  },

  TENDER_CLOSING_SOON: {
    id: 'tender-closing-soon',
    name: 'Tender Closing Reminder',
    subject: 'Reminder: {{tenderRef}} closing in {{hoursRemaining}} hours',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #f97316, #eab308); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">PNG eGP System</h1>
        </div>
        <div style="padding: 30px; background: #ffffff;">
          <div style="text-align: center; margin-bottom: 20px;">
            <div style="width: 60px; height: 60px; background: #fef3c7; border-radius: 50%; margin: 0 auto; display: flex; align-items: center; justify-content: center;">
              <span style="font-size: 30px;">⏰</span>
            </div>
          </div>
          <h2 style="color: #18181b; text-align: center;">Tender Closing Soon</h2>
          <p style="color: #52525b;">This is a reminder that the following tender is closing soon:</p>
          <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f97316;">
            <p style="margin: 5px 0;"><strong>Reference:</strong> {{tenderRef}}</p>
            <p style="margin: 5px 0;"><strong>Title:</strong> {{tenderTitle}}</p>
            <p style="margin: 5px 0;"><strong>Closing:</strong> {{closingDate}}</p>
            <p style="margin: 5px 0; color: #dc2626; font-weight: bold;">Time Remaining: {{hoursRemaining}} hours</p>
          </div>
          <a href="{{actionUrl}}" style="display: inline-block; background: #f97316; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 10px;">Submit Your Bid Now</a>
        </div>
        <div style="background: #f4f4f5; padding: 15px; text-align: center;">
          <p style="color: #71717a; font-size: 12px; margin: 0;">National Procurement Commission, Papua New Guinea</p>
        </div>
      </div>
    `,
    textContent: `
PNG eGP System - Tender Closing Reminder

This is a reminder that the following tender is closing soon:

Reference: {{tenderRef}}
Title: {{tenderTitle}}
Closing: {{closingDate}}
Time Remaining: {{hoursRemaining}} hours

Submit your bid before the deadline.

National Procurement Commission, Papua New Guinea
    `,
    variables: ['tenderRef', 'tenderTitle', 'closingDate', 'hoursRemaining', 'actionUrl'],
  },
};

/**
 * Notification Queue Manager
 * Manages the queue of notifications to be sent
 */
class NotificationQueue {
  private queue: NotificationPayload[] = [];
  private processing = false;

  add(notification: Omit<NotificationPayload, 'id' | 'createdAt' | 'status' | 'retryCount'>): string {
    const id = `NOTIF-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    const payload: NotificationPayload = {
      ...notification,
      id,
      status: 'PENDING',
      retryCount: 0,
      maxRetries: notification.maxRetries || 3,
      createdAt: new Date(),
    };

    this.queue.push(payload);
    this.processQueue();

    return id;
  }

  private async processQueue(): Promise<void> {
    if (this.processing) return;
    this.processing = true;

    while (this.queue.length > 0) {
      const notification = this.queue.find((n) => n.status === 'PENDING');
      if (!notification) break;

      try {
        await this.sendNotification(notification);
        notification.status = 'SENT';
        notification.sentAt = new Date();
      } catch (error) {
        notification.retryCount++;
        if (notification.retryCount >= notification.maxRetries) {
          notification.status = 'FAILED';
          notification.error = error instanceof Error ? error.message : 'Unknown error';
        }
      }
    }

    this.processing = false;
  }

  private async sendNotification(notification: NotificationPayload): Promise<void> {
    // In production, this would call an email service API (SendGrid, AWS SES, etc.)
    // For now, we'll simulate the API call
    console.log(`[Email] Sending ${notification.type} to ${notification.recipients.map(r => r.email).join(', ')}`);

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Log for demo purposes
    console.log(`[Email] Sent: ${notification.subject}`);
  }

  getStatus(id: string): NotificationPayload | undefined {
    return this.queue.find((n) => n.id === id);
  }

  getPendingCount(): number {
    return this.queue.filter((n) => n.status === 'PENDING').length;
  }

  getAll(): NotificationPayload[] {
    return [...this.queue];
  }
}

// Template rendering function
export function renderTemplate(template: EmailTemplate, data: Record<string, unknown>): { subject: string; html: string; text: string } {
  let subject = template.subject;
  let html = template.htmlContent;
  let text = template.textContent;

  // Replace all template variables
  for (const [key, value] of Object.entries(data)) {
    const regex = new RegExp(`{{${key}}}`, 'g');
    const stringValue = String(value ?? '');
    subject = subject.replace(regex, stringValue);
    html = html.replace(regex, stringValue);
    text = text.replace(regex, stringValue);
  }

  return { subject, html, text };
}

// Export singleton instance
export const notificationQueue = new NotificationQueue();

/**
 * Helper functions for sending specific notification types
 */
export function sendWorkflowPendingNotification(
  recipient: NotificationRecipient,
  workflowData: {
    entityType: string;
    entityRef: string;
    entityTitle: string;
    requestedValue: number;
    submittedBy: string;
    dueDate: string;
    actionUrl: string;
  }
): string {
  const template = emailTemplates.WORKFLOW_PENDING;
  const rendered = renderTemplate(template, {
    recipientName: recipient.name,
    ...workflowData,
  });

  return notificationQueue.add({
    type: 'WORKFLOW_PENDING',
    recipients: [recipient],
    subject: rendered.subject,
    templateId: template.id,
    templateData: workflowData,
    priority: 'HIGH',
    maxRetries: 3,
  });
}

export function sendWorkflowApprovedNotification(
  recipient: NotificationRecipient,
  workflowData: {
    entityType: string;
    entityRef: string;
    entityTitle: string;
    approvedBy: string;
    approvedAt: string;
    comments?: string;
    actionUrl: string;
  }
): string {
  const template = emailTemplates.WORKFLOW_APPROVED;
  const rendered = renderTemplate(template, {
    recipientName: recipient.name,
    ...workflowData,
  });

  return notificationQueue.add({
    type: 'WORKFLOW_APPROVED',
    recipients: [recipient],
    subject: rendered.subject,
    templateId: template.id,
    templateData: workflowData,
    priority: 'NORMAL',
    maxRetries: 3,
  });
}

export function sendBidSubmittedNotification(
  recipient: NotificationRecipient,
  bidData: {
    supplierName: string;
    bidRef: string;
    tenderRef: string;
    submittedAt: string;
    openingDate: string;
  }
): string {
  const template = emailTemplates.BID_SUBMITTED;
  const rendered = renderTemplate(template, bidData);

  return notificationQueue.add({
    type: 'BID_SUBMITTED',
    recipients: [recipient],
    subject: rendered.subject,
    templateId: template.id,
    templateData: bidData,
    priority: 'HIGH',
    maxRetries: 3,
  });
}

export function sendTenderClosingReminder(
  recipients: NotificationRecipient[],
  tenderData: {
    tenderRef: string;
    tenderTitle: string;
    closingDate: string;
    hoursRemaining: number;
    actionUrl: string;
  }
): string {
  const template = emailTemplates.TENDER_CLOSING_SOON;
  const rendered = renderTemplate(template, tenderData);

  return notificationQueue.add({
    type: 'TENDER_CLOSING_SOON',
    recipients,
    subject: rendered.subject,
    templateId: template.id,
    templateData: tenderData,
    priority: 'HIGH',
    maxRetries: 3,
  });
}
