import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

export default {
  env: process.env.NODE_ENV,
  port: process.env.PORT,
  database_url: process.env.DATABASE_URL,
  jwt_secret: process.env.JWT_SECRET,
  ip_geolocation_api_url: process.env.IP_GEOLOCATION_API_URL,
  brevo_api_key: process.env.BREVO_API_KEY,
  brevo_sender_email: process.env.BREVO_SENDER_EMAIL || process.env.SMTP_FROM_EMAIL || 'rashedulhaque.bdcalling@gmail.com',
  brevo_sender_name: process.env.BREVO_SENDER_NAME || process.env.SMTP_FROM_NAME || 'Blank Notes',
  otp_expires_in_minutes: Number(process.env.OTP_EXPIRES_IN_MINUTES) || 5,
  otp_max_attempts_per_window: Number(process.env.OTP_MAX_ATTEMPTS_PER_WINDOW) || 5,
  smtp_host: process.env.SMTP_HOST,
  smtp_port: Number(process.env.SMTP_PORT) || 587,
  smtp_secure: process.env.SMTP_SECURE === 'true',
  smtp_require_tls: process.env.SMTP_REQUIRE_TLS !== 'false',
  smtp_user: process.env.SMTP_USER,
  smtp_pass: process.env.SMTP_PASS,
  smtp_from_name: process.env.SMTP_FROM_NAME || 'Blank Notes',
  smtp_from_email: process.env.SMTP_FROM_EMAIL || 'rashedulhaque.bdcalling@gmail.com',
  server_url: process.env.SERVER_URL || 'http://localhost:5000',
};

