import nodemailer from 'nodemailer';
import config from '../config';
import ApiError from '../errors/ApiError';

const isSmtpConfigured = Boolean(
  config.smtp_host &&
  config.smtp_port &&
  config.smtp_user &&
  config.smtp_pass &&
  config.smtp_from_name &&
  config.smtp_from_email
);

const getTransporter = () => {
  if (!isSmtpConfigured) {
    return null;
  }

  return nodemailer.createTransport({
    host: config.smtp_host,
    port: config.smtp_port,
    secure: config.smtp_secure || config.smtp_port === 465,
    requireTLS: config.smtp_require_tls,
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
    auth: {
      user: config.smtp_user,
      pass: config.smtp_pass,
    },
  });
};

/**
 * Direct email sender using Brevo Transactional Email REST API (v3)
 */
export const sendBrevoEmail = async ({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}): Promise<boolean> => {
  if (!config.brevo_api_key) {
    return false;
  }

  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'api-key': config.brevo_api_key,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      sender: {
        name: config.brevo_sender_name,
        email: config.brevo_sender_email,
      },
      to: [{ email: to }],
      subject,
      htmlContent: html,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error('Brevo API email send error:', errorData);
    throw new ApiError(
      response.status,
      `Brevo Email failed: ${errorData.message || response.statusText}`
    );
  }

  return true;
};

/**
 * Universal email sender prioritizing Brevo API, then SMTP, then dev log.
 */
export const sendMail = async ({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}): Promise<{ sent: boolean }> => {
  if (config.brevo_api_key) {
    await sendBrevoEmail({ to, subject, html });
    return { sent: true };
  }

  const transporter = getTransporter();
  if (transporter) {
    await transporter.sendMail({
      from: `"${config.smtp_from_name}" <${config.smtp_from_email}>`,
      to,
      subject,
      html,
    });
    return { sent: true };
  }

  return { sent: false };
};

/**
 * Send Minimalist & Professional OTP Verification Email via Brevo API
 * Subject format: "Blank Notes Verification Code: 123456"
 */
export const sendVerificationEmail = async (
  toEmail: string,
  code: string
): Promise<{ sent: boolean; devCode?: string }> => {
  const expiryMinutes = config.otp_expires_in_minutes || 5;
  const senderName = config.brevo_sender_name || 'Blank Notes';
  const subject = `${senderName} Verification Code: ${code}`;

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>${senderName} — Verification Code</title>
    </head>
    <body style="margin:0;padding:0;background-color:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'SF Pro Text','Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#18181b;-webkit-font-smoothing:antialiased;">
      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#f4f4f5;padding:48px 16px;">
        <tr>
          <td align="center">
            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width:440px;background-color:#ffffff;border:1px solid #e4e4e7;border-radius:14px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.04);">
              
              <!-- Header Section -->
              <tr>
                <td style="padding:32px 32px 20px 32px;text-align:left;border-bottom:1px solid #f4f4f5;">
                  <table border="0" cellspacing="0" cellpadding="0">
                    <tr>
                      <td style="width:24px;height:24px;background-color:#09090b;border-radius:6px;text-align:center;vertical-align:middle;color:#ffffff;font-size:12px;font-weight:700;">
                        B
                      </td>
                      <td style="padding-left:10px;font-size:16px;font-weight:600;letter-spacing:-0.3px;color:#09090b;">
                        ${senderName}
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Main Content -->
              <tr>
                <td style="padding:32px 32px 28px 32px;text-align:left;">
                  <h1 style="margin:0 0 10px 0;font-size:20px;font-weight:600;color:#09090b;letter-spacing:-0.4px;">
                    Email Verification
                  </h1>
                  <p style="margin:0 0 20px 0;font-size:14px;line-height:1.55;color:#71717a;">
                    Use the following OTP code to verify your email address:
                  </p>

                  <!-- Clean Monospace OTP Box with full text selection -->
                  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#fafafa;border:1px solid #e4e4e7;border-radius:10px;margin-bottom:24px;">
                    <tr>
                      <td align="center" style="padding:24px 20px;">
                        <!-- 6-digit OTP Code: One-click / Tap to select -->
                        <div style="font-family:ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;font-size:38px;font-weight:700;letter-spacing:10px;color:#09090b;display:inline-block;padding-left:10px;user-select:all;-webkit-user-select:all;-moz-user-select:all;-ms-user-select:all;cursor:pointer;" title="Tap or click code to select">
                          ${code}
                        </div>
                      </td>
                    </tr>
                  </table>

                  <!-- Expiry & Notice -->
                  <div style="font-size:13px;line-height:1.5;color:#dc2626;font-weight:500;margin-bottom:14px;">
                    ⏱️ Code expires in ${expiryMinutes} minutes
                  </div>

                  <p style="margin:0;font-size:13px;line-height:1.5;color:#a1a1aa;">
                    If you did not request this code, please safely ignore this email.
                  </p>
                </td>
              </tr>

              <!-- Footer Section -->
              <tr>
                <td style="padding:20px 32px;background-color:#fafafa;border-top:1px solid #f4f4f5;text-align:left;font-size:12px;color:#a1a1aa;line-height:1.4;">
                  © ${new Date().getFullYear()} ${senderName}. Minimalist Writing & Notes.
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  if (!config.brevo_api_key && !isSmtpConfigured) {
    console.log(`[DEV EMAIL] ${senderName} verification code for ${toEmail}: ${code}`);
    return { sent: false, devCode: code };
  }

  try {
    await sendMail({ to: toEmail, subject, html });
  } catch (error) {
    console.error('Failed to send verification email:', error);
    throw new ApiError(500, `Could not send OTP email: ${(error as Error).message}`);
  }

  return { sent: true };
};

/**
 * Universal OTP Email sender function
 */
export const sendOtpEmail = async (
  toEmail: string,
  code: string,
  purpose: string = 'Verification'
): Promise<{ sent: boolean; devCode?: string }> => {
  return sendVerificationEmail(toEmail, code);
};

/**
 * Send Minimalist & Professional Welcome Email via Brevo API
 */
export const sendThankYouEmail = async (toEmail: string): Promise<void> => {
  const unsubscribeLink = `${config.server_url}/api/v1/subscribers/unsubscribe?email=${encodeURIComponent(toEmail)}`;
  const senderName = config.brevo_sender_name || 'Blank Notes';

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Welcome to ${senderName}</title>
    </head>
    <body style="margin:0;padding:0;background-color:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'SF Pro Text','Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#18181b;-webkit-font-smoothing:antialiased;">
      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#f4f4f5;padding:48px 16px;">
        <tr>
          <td align="center">
            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width:440px;background-color:#ffffff;border:1px solid #e4e4e7;border-radius:14px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.04);">
              
              <!-- Header -->
              <tr>
                <td style="padding:32px 32px 20px 32px;text-align:left;border-bottom:1px solid #f4f4f5;">
                  <table border="0" cellspacing="0" cellpadding="0">
                    <tr>
                      <td style="width:24px;height:24px;background-color:#09090b;border-radius:6px;text-align:center;vertical-align:middle;color:#ffffff;font-size:12px;font-weight:700;">
                        B
                      </td>
                      <td style="padding-left:10px;font-size:16px;font-weight:600;letter-spacing:-0.3px;color:#09090b;">
                        ${senderName}
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Body -->
              <tr>
                <td style="padding:32px;text-align:left;">
                  <h1 style="margin:0 0 10px 0;font-size:20px;font-weight:600;color:#09090b;letter-spacing:-0.4px;">
                    Email Verified
                  </h1>
                  <p style="margin:0 0 16px 0;font-size:14px;line-height:1.55;color:#71717a;">
                    Your email has been successfully verified with <strong>${senderName}</strong>.
                  </p>
                  <p style="margin:0 0 24px 0;font-size:14px;line-height:1.55;color:#71717a;">
                    Cloud backup and synchronization are now active for your documents.
                  </p>

                  <div style="margin-bottom:24px;">
                    <a href="https://blank-page-v1.vercel.app/" style="display:inline-block;background-color:#09090b;color:#ffffff !important;font-size:14px;font-weight:500;padding:12px 22px;border-radius:8px;text-decoration:none;">
                      Open ${senderName} →
                    </a>
                  </div>

                  <p style="margin:0;font-size:12px;color:#a1a1aa;">
                    Want to opt out? <a href="${unsubscribeLink}" style="color:#71717a;text-decoration:underline;">Unsubscribe</a>
                  </p>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="padding:20px 32px;background-color:#fafafa;border-top:1px solid #f4f4f5;text-align:left;font-size:12px;color:#a1a1aa;">
                  © ${new Date().getFullYear()} ${senderName}. Minimalist Writing & Notes.
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  if (!config.brevo_api_key && !isSmtpConfigured) {
    console.log(`[DEV EMAIL] Thank you email for ${toEmail}`);
    return;
  }

  try {
    await sendMail({
      to: toEmail,
      subject: `Welcome to ${senderName}`,
      html,
    });
  } catch (error) {
    console.error('Failed to send thank you email:', error);
  }
};

/**
 * Verifies email service configuration on server startup.
 */
export const verifyEmailService = async (): Promise<void> => {
  if (config.brevo_api_key) {
    try {
      const response = await fetch('https://api.brevo.com/v3/account', {
        method: 'GET',
        headers: {
          'accept': 'application/json',
          'api-key': config.brevo_api_key,
        },
      });
      if (response.ok) {
        const accountInfo = await response.json();
        console.log(`⚡ Brevo API connected successfully! Account: ${accountInfo.email || config.brevo_sender_email}`);
      } else {
        console.warn(`⚠️ Brevo API key check returned status: ${response.status}`);
      }
    } catch (err) {
      console.warn('⚠️ Brevo API verification failed:', (err as Error).message);
    }
  } else if (isSmtpConfigured) {
    const transporter = getTransporter();
    if (transporter) {
      await transporter.verify();
      console.log('📧 SMTP connection verified');
    }
  } else {
    console.log('ℹ️ Neither Brevo API key nor SMTP is configured. Dev mode active.');
  }
};

export const verifySmtpConnection = verifyEmailService;
