"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendVerificationEmail = exports.verifySmtpConnection = exports.sendThankYouEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const config_1 = __importDefault(require("../config"));
const ApiError_1 = __importDefault(require("../errors/ApiError"));
const isSmtpConfigured = Boolean(config_1.default.smtp_host &&
    config_1.default.smtp_port &&
    config_1.default.smtp_user &&
    config_1.default.smtp_pass &&
    config_1.default.smtp_from_name &&
    config_1.default.smtp_from_email);
const getTransporter = () => {
    if (!isSmtpConfigured) {
        if (config_1.default.env === 'production') {
            throw new ApiError_1.default(500, 'SMTP is not configured. Please set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM_NAME, and SMTP_FROM_EMAIL.');
        }
        return null;
    }
    return nodemailer_1.default.createTransport({
        host: config_1.default.smtp_host,
        port: config_1.default.smtp_port,
        secure: config_1.default.smtp_secure || config_1.default.smtp_port === 465,
        requireTLS: config_1.default.smtp_require_tls,
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 15000,
        auth: {
            user: config_1.default.smtp_user,
            pass: config_1.default.smtp_pass,
        },
    });
};
const sendThankYouEmail = (toEmail) => __awaiter(void 0, void 0, void 0, function* () {
    const transporter = getTransporter();
    if (!transporter)
        return;
    const unsubscribeLink = `${config_1.default.server_url}/api/v1/subscribers/unsubscribe?email=${encodeURIComponent(toEmail)}`;
    const mailOptions = {
        from: `"${config_1.default.smtp_from_name}" <${config_1.default.smtp_from_email}>`,
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
    yield transporter.sendMail(mailOptions);
});
exports.sendThankYouEmail = sendThankYouEmail;
const verifySmtpConnection = () => __awaiter(void 0, void 0, void 0, function* () {
    const transporter = getTransporter();
    if (!transporter)
        return;
    yield transporter.verify();
});
exports.verifySmtpConnection = verifySmtpConnection;
const sendVerificationEmail = (toEmail, code) => __awaiter(void 0, void 0, void 0, function* () {
    const transporter = getTransporter();
    if (!transporter) {
        console.log(`[DEV EMAIL] Blank Page verification code for ${toEmail}: ${code}`);
        return { sent: false, devCode: code };
    }
    const mailOptions = {
        from: `"${config_1.default.smtp_from_name}" <${config_1.default.smtp_from_email}>`,
        to: toEmail,
        subject: 'Your Blank Page verification code',
        html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Verify your email</title>
      </head>
      <body style="margin:0;padding:0;background:#f8fafc;font-family:Arial,sans-serif;color:#1e293b;">
        <div style="max-width:560px;margin:40px auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:14px;overflow:hidden;">
          <div style="padding:32px 28px 14px;text-align:center;border-bottom:1px solid #e2e8f0;">
            <h1 style="margin:0;font-size:24px;color:#0f172a;">Verify your Blank Page email</h1>
          </div>
          <div style="padding:28px;text-align:center;line-height:1.6;font-size:15px;">
            <p style="margin:0 0 18px;">Use this 6-digit code to finish setting up backup access.</p>
            <div style="display:inline-block;letter-spacing:8px;font-size:30px;font-weight:700;color:#0f172a;background:#f1f5f9;border:1px solid #e2e8f0;border-radius:12px;padding:16px 20px;margin:6px 0 18px;">
              ${code}
            </div>
            <p style="margin:0;color:#64748b;font-size:13px;">This code expires in 10 minutes. If you did not request this, you can ignore this email.</p>
          </div>
          <div style="padding:18px 28px;text-align:center;font-size:12px;color:#94a3b8;border-top:1px solid #e2e8f0;">
            © ${new Date().getFullYear()} Blank Page
          </div>
        </div>
      </body>
      </html>
    `,
    };
    try {
        yield transporter.sendMail(mailOptions);
    }
    catch (error) {
        console.error('Failed to send verification email:', error);
        throw new ApiError_1.default(500, 'Could not send verification email. Please check SMTP settings.');
    }
    return { sent: true };
});
exports.sendVerificationEmail = sendVerificationEmail;
