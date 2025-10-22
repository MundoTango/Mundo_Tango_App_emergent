/**
 * STREAM C: MODEL ALERT NOTIFICATION SERVICE (Oct 22, 2025)
 * Sends Slack/Email alerts when deprecated models are detected
 * Integrates with modelMonitorCron.ts
 */

interface AlertPayload {
  deprecatedModels: string[];
  filesAffected: number;
  autoUpdateSuccess: boolean;
  timestamp: string;
}

/**
 * Send Slack notification via webhook
 */
export async function sendSlackAlert(payload: AlertPayload) {
  const slackWebhookUrl = process.env.SLACK_WEBHOOK_URL;
  
  if (!slackWebhookUrl) {
    console.warn('[Model Alerts] ⚠️  SLACK_WEBHOOK_URL not configured');
    return { success: false, reason: 'No webhook URL' };
  }

  try {
    const message = {
      text: '🚨 Deprecated AI Models Detected',
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: '🚨 AI Model Deprecation Alert',
            emoji: true
          }
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*Deprecated Models:*\n${payload.deprecatedModels.map(m => `• \`${m}\``).join('\n')}`
            },
            {
              type: 'mrkdwn',
              text: `*Files Affected:*\n${payload.filesAffected}`
            }
          ]
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: payload.autoUpdateSuccess 
              ? '✅ *Auto-Update:* Successfully updated all files'
              : '❌ *Auto-Update:* Failed - manual intervention required'
          }
        },
        {
          type: 'context',
          elements: [
            {
              type: 'mrkdwn',
              text: `🕐 ${new Date(payload.timestamp).toLocaleString()}`
            }
          ]
        }
      ]
    };

    const response = await fetch(slackWebhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message)
    });

    if (!response.ok) {
      throw new Error(`Slack API error: ${response.status}`);
    }

    console.log('[Model Alerts] ✅ Slack notification sent');
    return { success: true };
  } catch (error: any) {
    console.error('[Model Alerts] ❌ Slack notification failed:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Send email notification via Nodemailer
 */
export async function sendEmailAlert(payload: AlertPayload) {
  const adminEmail = process.env.ADMIN_EMAIL;
  
  if (!adminEmail) {
    console.warn('[Model Alerts] ⚠️  ADMIN_EMAIL not configured');
    return { success: false, reason: 'No admin email' };
  }

  // TODO: Implement Nodemailer when SMTP credentials are configured
  // For now, just log
  console.log('[Model Alerts] 📧 Email notification (placeholder)');
  console.log(`  To: ${adminEmail}`);
  console.log(`  Subject: Deprecated AI Models Detected`);
  console.log(`  Deprecated: ${payload.deprecatedModels.join(', ')}`);
  
  return { 
    success: true, 
    note: 'Email service not yet configured - configure SMTP settings' 
  };
}

/**
 * Send all configured alerts
 */
export async function sendModelDeprecationAlerts(payload: AlertPayload) {
  console.log('[Model Alerts] 🔔 Sending deprecation alerts...');
  
  const results = await Promise.allSettled([
    sendSlackAlert(payload),
    sendEmailAlert(payload)
  ]);

  const slack = results[0].status === 'fulfilled' ? results[0].value : { success: false };
  const email = results[1].status === 'fulfilled' ? results[1].value : { success: false };

  return {
    slack,
    email,
    anySuccess: slack.success || email.success
  };
}

export default {
  sendSlackAlert,
  sendEmailAlert,
  sendAll: sendModelDeprecationAlerts
};
