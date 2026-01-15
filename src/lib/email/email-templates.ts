/**
 * PNG eGP System - Email Notification Templates
 *
 * Templates for procurement workflow notifications
 */

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

export interface EmailData {
  recipientName: string;
  recipientEmail: string;
  [key: string]: unknown;
}

// Base email wrapper
function wrapInTemplate(content: string, title: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif; line-height: 1.6; color: #1e293b; margin: 0; padding: 0; background-color: #f1f5f9; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
    .header { background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); padding: 24px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 24px; }
    .header p { color: #fecaca; margin: 8px 0 0 0; font-size: 14px; }
    .content { padding: 32px 24px; }
    .content h2 { color: #0f172a; margin: 0 0 16px 0; font-size: 20px; }
    .content p { margin: 0 0 16px 0; color: #475569; }
    .info-box { background-color: #f8fafc; border-left: 4px solid #dc2626; padding: 16px; margin: 24px 0; border-radius: 0 8px 8px 0; }
    .info-box p { margin: 4px 0; font-size: 14px; }
    .info-box .label { color: #64748b; }
    .info-box .value { color: #0f172a; font-weight: 600; }
    .button { display: inline-block; background-color: #dc2626; color: #ffffff !important; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; margin: 16px 0; }
    .button:hover { background-color: #b91c1c; }
    .footer { background-color: #f8fafc; padding: 24px; text-align: center; border-top: 1px solid #e2e8f0; }
    .footer p { margin: 4px 0; font-size: 12px; color: #64748b; }
    .footer a { color: #dc2626; text-decoration: none; }
    .alert { padding: 12px 16px; border-radius: 8px; margin: 16px 0; }
    .alert-warning { background-color: #fef3c7; border: 1px solid #f59e0b; color: #92400e; }
    .alert-success { background-color: #dcfce7; border: 1px solid #22c55e; color: #166534; }
    .alert-info { background-color: #dbeafe; border: 1px solid #3b82f6; color: #1e40af; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>PNG eGP</h1>
      <p>National e-Government Procurement System</p>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p>National Procurement Commission of Papua New Guinea</p>
      <p>Vulupindi Haus, Waigani, Port Moresby</p>
      <p><a href="https://npc.gov.pg">npc.gov.pg</a> | <a href="mailto:support@npc.gov.pg">support@npc.gov.pg</a></p>
      <p style="margin-top: 16px; font-size: 11px;">This is an automated message. Please do not reply directly to this email.</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

// =============================================================================
// TENDER NOTIFICATIONS
// =============================================================================

export function tenderPublishedTemplate(data: {
  recipientName: string;
  tenderRef: string;
  tenderTitle: string;
  category: string;
  estimatedValue: string;
  deadline: string;
  portalUrl: string;
}): EmailTemplate {
  const content = `
    <h2>New Tender Published</h2>
    <p>Dear ${data.recipientName},</p>
    <p>A new tender matching your registered categories has been published on the PNG eGP System.</p>

    <div class="info-box">
      <p><span class="label">Reference:</span> <span class="value">${data.tenderRef}</span></p>
      <p><span class="label">Title:</span> <span class="value">${data.tenderTitle}</span></p>
      <p><span class="label">Category:</span> <span class="value">${data.category}</span></p>
      <p><span class="label">Estimated Value:</span> <span class="value">${data.estimatedValue}</span></p>
      <p><span class="label">Submission Deadline:</span> <span class="value">${data.deadline}</span></p>
    </div>

    <p>To view the full tender details and submit your bid, please visit the Bidder Portal.</p>

    <a href="${data.portalUrl}" class="button">View Tender Details</a>

    <p style="font-size: 14px; color: #64748b;">Ensure you have an active subscription to submit bids.</p>
  `;

  return {
    subject: `New Tender: ${data.tenderRef} - ${data.tenderTitle}`,
    html: wrapInTemplate(content, 'New Tender Published'),
    text: `New Tender Published\n\nRef: ${data.tenderRef}\nTitle: ${data.tenderTitle}\nCategory: ${data.category}\nValue: ${data.estimatedValue}\nDeadline: ${data.deadline}\n\nView at: ${data.portalUrl}`,
  };
}

export function tenderDeadlineReminderTemplate(data: {
  recipientName: string;
  tenderRef: string;
  tenderTitle: string;
  deadline: string;
  hoursRemaining: number;
  portalUrl: string;
}): EmailTemplate {
  const content = `
    <h2>Tender Deadline Reminder</h2>
    <p>Dear ${data.recipientName},</p>

    <div class="alert alert-warning">
      <strong>⏰ ${data.hoursRemaining} hours remaining</strong> to submit your bid for this tender.
    </div>

    <div class="info-box">
      <p><span class="label">Reference:</span> <span class="value">${data.tenderRef}</span></p>
      <p><span class="label">Title:</span> <span class="value">${data.tenderTitle}</span></p>
      <p><span class="label">Submission Deadline:</span> <span class="value">${data.deadline}</span></p>
    </div>

    <p>If you have not yet submitted your bid, please do so before the deadline. Late submissions will not be accepted.</p>

    <a href="${data.portalUrl}" class="button">Submit Bid Now</a>
  `;

  return {
    subject: `⏰ Deadline Reminder: ${data.tenderRef} - ${data.hoursRemaining}h remaining`,
    html: wrapInTemplate(content, 'Tender Deadline Reminder'),
    text: `Tender Deadline Reminder\n\n${data.hoursRemaining} hours remaining!\n\nRef: ${data.tenderRef}\nTitle: ${data.tenderTitle}\nDeadline: ${data.deadline}\n\nSubmit at: ${data.portalUrl}`,
  };
}

// =============================================================================
// BID NOTIFICATIONS
// =============================================================================

export function bidSubmittedTemplate(data: {
  recipientName: string;
  bidRef: string;
  tenderRef: string;
  tenderTitle: string;
  submittedAt: string;
  bidAmount: string;
}): EmailTemplate {
  const content = `
    <h2>Bid Submission Confirmed</h2>
    <p>Dear ${data.recipientName},</p>

    <div class="alert alert-success">
      <strong>✓ Your bid has been successfully submitted and sealed.</strong>
    </div>

    <p>Your bid will remain encrypted until the official bid opening time. No one can view your submission until then.</p>

    <div class="info-box">
      <p><span class="label">Bid Reference:</span> <span class="value">${data.bidRef}</span></p>
      <p><span class="label">Tender Reference:</span> <span class="value">${data.tenderRef}</span></p>
      <p><span class="label">Tender Title:</span> <span class="value">${data.tenderTitle}</span></p>
      <p><span class="label">Submitted At:</span> <span class="value">${data.submittedAt}</span></p>
      <p><span class="label">Bid Amount:</span> <span class="value">${data.bidAmount}</span></p>
    </div>

    <p>Please keep this confirmation for your records. You will be notified when the bid opening takes place.</p>
  `;

  return {
    subject: `Bid Confirmed: ${data.bidRef} for ${data.tenderRef}`,
    html: wrapInTemplate(content, 'Bid Submission Confirmed'),
    text: `Bid Submission Confirmed\n\nBid Ref: ${data.bidRef}\nTender: ${data.tenderRef}\nTitle: ${data.tenderTitle}\nAmount: ${data.bidAmount}\nSubmitted: ${data.submittedAt}`,
  };
}

export function bidOpeningNotificationTemplate(data: {
  recipientName: string;
  tenderRef: string;
  tenderTitle: string;
  openingDate: string;
  venue: string;
  totalBids: number;
}): EmailTemplate {
  const content = `
    <h2>Bid Opening Scheduled</h2>
    <p>Dear ${data.recipientName},</p>

    <p>The bid opening for the following tender has been scheduled. You are invited to attend or observe online.</p>

    <div class="info-box">
      <p><span class="label">Tender Reference:</span> <span class="value">${data.tenderRef}</span></p>
      <p><span class="label">Title:</span> <span class="value">${data.tenderTitle}</span></p>
      <p><span class="label">Opening Date/Time:</span> <span class="value">${data.openingDate}</span></p>
      <p><span class="label">Venue:</span> <span class="value">${data.venue}</span></p>
      <p><span class="label">Total Bids Received:</span> <span class="value">${data.totalBids}</span></p>
    </div>

    <p>All sealed bids will be decrypted and read aloud during the opening ceremony.</p>
  `;

  return {
    subject: `Bid Opening: ${data.tenderRef} - ${data.openingDate}`,
    html: wrapInTemplate(content, 'Bid Opening Scheduled'),
    text: `Bid Opening Scheduled\n\nTender: ${data.tenderRef}\nTitle: ${data.tenderTitle}\nDate: ${data.openingDate}\nVenue: ${data.venue}\nTotal Bids: ${data.totalBids}`,
  };
}

// =============================================================================
// AWARD NOTIFICATIONS
// =============================================================================

export function awardNotificationTemplate(data: {
  recipientName: string;
  tenderRef: string;
  tenderTitle: string;
  contractValue: string;
  awardDate: string;
  contractRef: string;
}): EmailTemplate {
  const content = `
    <h2>Congratulations - Contract Awarded!</h2>
    <p>Dear ${data.recipientName},</p>

    <div class="alert alert-success">
      <strong>🎉 Your bid has been selected for contract award!</strong>
    </div>

    <p>We are pleased to inform you that your submission has been evaluated as the most responsive bid, and you have been awarded the contract.</p>

    <div class="info-box">
      <p><span class="label">Tender Reference:</span> <span class="value">${data.tenderRef}</span></p>
      <p><span class="label">Title:</span> <span class="value">${data.tenderTitle}</span></p>
      <p><span class="label">Contract Reference:</span> <span class="value">${data.contractRef}</span></p>
      <p><span class="label">Contract Value:</span> <span class="value">${data.contractValue}</span></p>
      <p><span class="label">Award Date:</span> <span class="value">${data.awardDate}</span></p>
    </div>

    <p>Our team will contact you shortly to proceed with contract signing and other formalities.</p>

    <p>Thank you for participating in the PNG Government procurement process.</p>
  `;

  return {
    subject: `🎉 Contract Awarded: ${data.contractRef} - ${data.tenderTitle}`,
    html: wrapInTemplate(content, 'Contract Awarded'),
    text: `Contract Awarded!\n\nTender: ${data.tenderRef}\nTitle: ${data.tenderTitle}\nContract: ${data.contractRef}\nValue: ${data.contractValue}\nAward Date: ${data.awardDate}`,
  };
}

export function bidUnsuccessfulTemplate(data: {
  recipientName: string;
  tenderRef: string;
  tenderTitle: string;
  reason?: string;
}): EmailTemplate {
  const content = `
    <h2>Bid Evaluation Result</h2>
    <p>Dear ${data.recipientName},</p>

    <p>Thank you for submitting your bid for the following tender. After careful evaluation, we regret to inform you that your bid was not selected for contract award.</p>

    <div class="info-box">
      <p><span class="label">Tender Reference:</span> <span class="value">${data.tenderRef}</span></p>
      <p><span class="label">Title:</span> <span class="value">${data.tenderTitle}</span></p>
      ${data.reason ? `<p><span class="label">Feedback:</span> <span class="value">${data.reason}</span></p>` : ''}
    </div>

    <p>We encourage you to continue participating in future procurement opportunities. You may request a detailed debriefing within 14 days of this notification.</p>

    <p>Thank you for your interest in doing business with the PNG Government.</p>
  `;

  return {
    subject: `Bid Result: ${data.tenderRef} - ${data.tenderTitle}`,
    html: wrapInTemplate(content, 'Bid Evaluation Result'),
    text: `Bid Evaluation Result\n\nTender: ${data.tenderRef}\nTitle: ${data.tenderTitle}\n\nUnfortunately, your bid was not selected.${data.reason ? `\n\nFeedback: ${data.reason}` : ''}`,
  };
}

// =============================================================================
// SUBSCRIPTION NOTIFICATIONS
// =============================================================================

export function subscriptionActivatedTemplate(data: {
  recipientName: string;
  planName: string;
  startDate: string;
  endDate: string;
  maxBids: string;
  portalUrl: string;
}): EmailTemplate {
  const content = `
    <h2>Subscription Activated</h2>
    <p>Dear ${data.recipientName},</p>

    <div class="alert alert-success">
      <strong>✓ Your eGP subscription is now active!</strong>
    </div>

    <p>Thank you for subscribing to the PNG eGP System. Your subscription has been activated and you can now bid on government tenders.</p>

    <div class="info-box">
      <p><span class="label">Plan:</span> <span class="value">${data.planName}</span></p>
      <p><span class="label">Valid From:</span> <span class="value">${data.startDate}</span></p>
      <p><span class="label">Valid Until:</span> <span class="value">${data.endDate}</span></p>
      <p><span class="label">Bid Allowance:</span> <span class="value">${data.maxBids}</span></p>
    </div>

    <a href="${data.portalUrl}" class="button">Start Bidding</a>

    <p style="font-size: 14px; color: #64748b;">For any subscription queries, contact support@npc.gov.pg</p>
  `;

  return {
    subject: `Subscription Activated - ${data.planName} Plan`,
    html: wrapInTemplate(content, 'Subscription Activated'),
    text: `Subscription Activated\n\nPlan: ${data.planName}\nValid: ${data.startDate} to ${data.endDate}\nBids: ${data.maxBids}\n\nStart bidding at: ${data.portalUrl}`,
  };
}

export function subscriptionExpiringTemplate(data: {
  recipientName: string;
  planName: string;
  endDate: string;
  daysRemaining: number;
  renewUrl: string;
}): EmailTemplate {
  const content = `
    <h2>Subscription Expiring Soon</h2>
    <p>Dear ${data.recipientName},</p>

    <div class="alert alert-warning">
      <strong>⚠️ Your subscription expires in ${data.daysRemaining} days</strong>
    </div>

    <p>Your ${data.planName} subscription will expire on <strong>${data.endDate}</strong>. To continue bidding on government tenders without interruption, please renew your subscription.</p>

    <div class="info-box">
      <p><span class="label">Current Plan:</span> <span class="value">${data.planName}</span></p>
      <p><span class="label">Expiry Date:</span> <span class="value">${data.endDate}</span></p>
      <p><span class="label">Days Remaining:</span> <span class="value">${data.daysRemaining}</span></p>
    </div>

    <a href="${data.renewUrl}" class="button">Renew Subscription</a>

    <p style="font-size: 14px; color: #64748b;">After expiry, you will not be able to submit new bids until you renew.</p>
  `;

  return {
    subject: `⚠️ Subscription Expiring: ${data.daysRemaining} days remaining`,
    html: wrapInTemplate(content, 'Subscription Expiring'),
    text: `Subscription Expiring Soon\n\nYour ${data.planName} subscription expires in ${data.daysRemaining} days on ${data.endDate}.\n\nRenew at: ${data.renewUrl}`,
  };
}

// =============================================================================
// APPROVAL WORKFLOW NOTIFICATIONS
// =============================================================================

export function approvalRequiredTemplate(data: {
  recipientName: string;
  entityType: string;
  entityRef: string;
  entityTitle: string;
  requestedBy: string;
  requestedValue: string;
  approvalUrl: string;
}): EmailTemplate {
  const content = `
    <h2>Approval Required</h2>
    <p>Dear ${data.recipientName},</p>

    <div class="alert alert-info">
      <strong>📋 Your approval is required for the following ${data.entityType.toLowerCase()}.</strong>
    </div>

    <div class="info-box">
      <p><span class="label">Type:</span> <span class="value">${data.entityType}</span></p>
      <p><span class="label">Reference:</span> <span class="value">${data.entityRef}</span></p>
      <p><span class="label">Title:</span> <span class="value">${data.entityTitle}</span></p>
      <p><span class="label">Requested By:</span> <span class="value">${data.requestedBy}</span></p>
      <p><span class="label">Value:</span> <span class="value">${data.requestedValue}</span></p>
    </div>

    <p>Please review and take appropriate action.</p>

    <a href="${data.approvalUrl}" class="button">Review & Approve</a>
  `;

  return {
    subject: `Approval Required: ${data.entityRef} - ${data.entityTitle}`,
    html: wrapInTemplate(content, 'Approval Required'),
    text: `Approval Required\n\nType: ${data.entityType}\nRef: ${data.entityRef}\nTitle: ${data.entityTitle}\nRequested By: ${data.requestedBy}\nValue: ${data.requestedValue}\n\nReview at: ${data.approvalUrl}`,
  };
}

export function approvalDecisionTemplate(data: {
  recipientName: string;
  entityType: string;
  entityRef: string;
  entityTitle: string;
  decision: 'APPROVED' | 'REJECTED' | 'RETURNED';
  decidedBy: string;
  comments?: string;
}): EmailTemplate {
  const decisionConfig = {
    APPROVED: { icon: '✓', color: 'alert-success', text: 'Approved' },
    REJECTED: { icon: '✗', color: 'alert-warning', text: 'Rejected' },
    RETURNED: { icon: '↩', color: 'alert-info', text: 'Returned for revision' },
  };

  const config = decisionConfig[data.decision];

  const content = `
    <h2>${data.entityType} ${config.text}</h2>
    <p>Dear ${data.recipientName},</p>

    <div class="alert ${config.color}">
      <strong>${config.icon} Your ${data.entityType.toLowerCase()} has been ${config.text.toLowerCase()}.</strong>
    </div>

    <div class="info-box">
      <p><span class="label">Reference:</span> <span class="value">${data.entityRef}</span></p>
      <p><span class="label">Title:</span> <span class="value">${data.entityTitle}</span></p>
      <p><span class="label">Decision By:</span> <span class="value">${data.decidedBy}</span></p>
      ${data.comments ? `<p><span class="label">Comments:</span> <span class="value">${data.comments}</span></p>` : ''}
    </div>

    ${data.decision === 'RETURNED' ? '<p>Please review the comments and make the necessary revisions before resubmitting.</p>' : ''}
  `;

  return {
    subject: `${config.icon} ${data.entityType} ${config.text}: ${data.entityRef}`,
    html: wrapInTemplate(content, `${data.entityType} ${config.text}`),
    text: `${data.entityType} ${config.text}\n\nRef: ${data.entityRef}\nTitle: ${data.entityTitle}\nDecision By: ${data.decidedBy}${data.comments ? `\nComments: ${data.comments}` : ''}`,
  };
}

// =============================================================================
// CONTRACT NOTIFICATIONS
// =============================================================================

export function contractMilestoneReminderTemplate(data: {
  recipientName: string;
  contractRef: string;
  contractTitle: string;
  milestoneTitle: string;
  dueDate: string;
  daysRemaining: number;
}): EmailTemplate {
  const content = `
    <h2>Contract Milestone Reminder</h2>
    <p>Dear ${data.recipientName},</p>

    <div class="alert alert-warning">
      <strong>📅 Milestone due in ${data.daysRemaining} days</strong>
    </div>

    <div class="info-box">
      <p><span class="label">Contract:</span> <span class="value">${data.contractRef}</span></p>
      <p><span class="label">Title:</span> <span class="value">${data.contractTitle}</span></p>
      <p><span class="label">Milestone:</span> <span class="value">${data.milestoneTitle}</span></p>
      <p><span class="label">Due Date:</span> <span class="value">${data.dueDate}</span></p>
    </div>

    <p>Please ensure all deliverables are completed and submitted before the due date.</p>
  `;

  return {
    subject: `📅 Milestone Reminder: ${data.milestoneTitle} - ${data.daysRemaining} days`,
    html: wrapInTemplate(content, 'Contract Milestone Reminder'),
    text: `Contract Milestone Reminder\n\nContract: ${data.contractRef}\nMilestone: ${data.milestoneTitle}\nDue: ${data.dueDate} (${data.daysRemaining} days)`,
  };
}

// Export all templates
export const EmailTemplates = {
  tenderPublished: tenderPublishedTemplate,
  tenderDeadlineReminder: tenderDeadlineReminderTemplate,
  bidSubmitted: bidSubmittedTemplate,
  bidOpeningNotification: bidOpeningNotificationTemplate,
  awardNotification: awardNotificationTemplate,
  bidUnsuccessful: bidUnsuccessfulTemplate,
  subscriptionActivated: subscriptionActivatedTemplate,
  subscriptionExpiring: subscriptionExpiringTemplate,
  approvalRequired: approvalRequiredTemplate,
  approvalDecision: approvalDecisionTemplate,
  contractMilestoneReminder: contractMilestoneReminderTemplate,
};
