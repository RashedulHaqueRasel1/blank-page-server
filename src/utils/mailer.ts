import nodemailer from 'nodemailer';
import config from '../config';

const transporter = nodemailer.createTransport({
  host: config.smtp_host,
  port: config.smtp_port,
  secure: config.smtp_port === 465,
  auth: {
    user: config.smtp_user,
    pass: config.smtp_pass,
  },
});

export const sendThankYouEmail = async (toEmail: string): Promise<void> => {
  const unsubscribeLink = `${config.server_url}/api/v1/subscribers/unsubscribe?email=${encodeURIComponent(toEmail)}`;

  const mailOptions = {
    from: `"${config.smtp_from_name}" <${config.smtp_from_email}>`,
    to: toEmail,
    subject: '🎉 Thanks for Subscribing to Blank Page!',
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Thank You for Subscribing</title>
        <style>
          body {
            margin: 0;
            padding: 0;
            background-color: #f8fafc;
            font-family: Arial, sans-serif;
            color: #334155;
          }
          .container {
            max-width: 600px;
            margin: 40px auto;
            background: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            overflow: hidden;
          }
          .header {
            padding: 40px 30px 20px;
            text-align: center;
            border-bottom: 1px solid #e2e8f0;
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
            color: #0f172a;
          }
          .content {
            padding: 30px;
            line-height: 1.7;
            font-size: 15px;
          }
          .content p {
            margin-bottom: 18px;
          }
          .button {
            display: inline-block;
            padding: 14px 28px;
            background-color: #0f172a;
            color: #ffffff !important;
            text-decoration: none;
            border-radius: 8px;
            font-weight: bold;
            margin: 20px 0;
          }
          .unsubscribe {
            display: inline-block;
            margin-top: 20px;
            color: #64748b;
            font-size: 13px;
            text-decoration: underline;
          }
          .footer {
            padding: 20px 30px;
            text-align: center;
            font-size: 12px;
            color: #94a3b8;
            border-top: 1px solid #e2e8f0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to Blank Page ✨</h1>
          </div>
          <div class="content">
            <p>Hello,</p>
            <p>
              Thank you for subscribing to <strong>Blank Page</strong>. Your subscription has been successfully confirmed.
            </p>
            <p>
              From now on, you'll receive our latest updates, new features, announcements, and important news directly
              in your inbox.
            </p>
            <p>Start exploring our platform and stay connected with us:</p>
            <center>
              <a href="https://blank-page-v1.vercel.app/" class="button"> Visit Blank Page </a>
            </center>
            <p>
              We're excited to have you with us and look forward to helping you create amazing things.
            </p>
            <center>
              <a href="${unsubscribeLink}" class="unsubscribe"> Unsubscribe </a>
            </center>
          </div>
          <div class="footer">
            © ${new Date().getFullYear()} Blank Page. All rights reserved.
          </div>
        </div>
      </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
};