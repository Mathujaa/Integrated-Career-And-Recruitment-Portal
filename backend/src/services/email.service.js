import transporter from '../config/mailer.config.js';
import '../config/env.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
const smtpFrom = process.env.SMTP_FROM || 'no-reply@careerportal.com';

const writeMailLog = (message) => {
  try {
    const logDir = path.resolve(__dirname, '../../logs');
    const logFile = path.resolve(logDir, 'mail-debug.log');
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    fs.appendFileSync(logFile, `[${new Date().toISOString()}] ${message}\n`);
  } catch (error) {
    console.error('Failed to write to mail-debug.log:', error);
  }
};

class EmailService {
  _printVerificationLink(token, email) {
    const url = `http://localhost:5000/api/v1/auth/verify-email?token=${token}`;
    const consoleMsg = `
========================================
EMAIL VERIFICATION LINK
${url}
========================================`;
    console.log(consoleMsg);
    writeMailLog(`EMAIL VERIFICATION LINK (Recipient: ${email}): ${url}`);
  }

  _printResetLink(token, email) {
    const url = `http://localhost:5000/api/v1/auth/reset-password?token=${token}`;
    const consoleMsg = `
========================================
PASSWORD RESET LINK
${url}
========================================`;
    console.log(consoleMsg);
    writeMailLog(`PASSWORD RESET LINK (Recipient: ${email}): ${url}`);
  }

  async sendVerificationEmail(email, token, firstName) {
    const verificationUrl = `${clientUrl}/verify-email?token=${token}`;
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Verify Your Email Address</title>
        <style>
          body {
            font-family: 'Inter', system-ui, sans-serif;
            background-color: #f4f5f7;
            margin: 0;
            padding: 40px 20px;
            color: #1e293b;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 16px;
            padding: 40px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05);
          }
          .logo {
            text-align: center;
            font-weight: 800;
            font-size: 24px;
            color: #4f46e5;
            margin-bottom: 30px;
          }
          .welcome {
            font-size: 20px;
            font-weight: 600;
            margin-bottom: 20px;
          }
          .text {
            font-size: 16px;
            line-height: 1.6;
            margin-bottom: 30px;
            color: #475569;
          }
          .btn-container {
            text-align: center;
            margin-bottom: 30px;
          }
          .btn {
            display: inline-block;
            background-color: #4f46e5;
            color: #ffffff !important;
            text-decoration: none;
            padding: 14px 28px;
            font-weight: 600;
            border-radius: 8px;
            box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.2);
          }
          .btn:hover {
            background-color: #4338ca;
          }
          .footer {
            text-align: center;
            font-size: 13px;
            color: #94a3b8;
            border-top: 1px solid #e2e8f0;
            padding-top: 20px;
            margin-top: 30px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">CAREER PORTAL</div>
          <div class="welcome">Hi ${firstName},</div>
          <div class="text">
            Thank you for registering! Please verify your email address to complete your account setup. This link will expire in 24 hours.
          </div>
          <div class="btn-container">
            <a href="${verificationUrl}" class="btn" target="_blank">Verify Email Address</a>
          </div>
          <div class="text">
            If you did not request this email, please ignore it.
          </div>
          <div class="footer">
            &copy; ${new Date().getFullYear()} Integrated Career & Recruitment Portal. All rights reserved.
          </div>
        </div>
      </body>
      </html>
    `;

    // Local Development Fallback: bypass SMTP entirely
    if (process.env.NODE_ENV === 'development') {
      this._printVerificationLink(token, email);
      return;
    }

    // Production SMTP Delivery
    try {
      return await transporter.sendMail({
        from: smtpFrom,
        to: email,
        subject: 'Verify Your Email Address - Career Portal',
        html: htmlContent
      });
    } catch (error) {
      console.warn(`[SMTP FAILURE] Failed to send verification email to ${email}:`, error.message);
      // Fallback print and log
      this._printVerificationLink(token, email);
    }
  }

  async sendPasswordResetEmail(email, token, firstName) {
    const resetUrl = `${clientUrl}/reset-password?token=${token}`;
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Reset Your Password</title>
        <style>
          body {
            font-family: 'Inter', system-ui, sans-serif;
            background-color: #f4f5f7;
            margin: 0;
            padding: 40px 20px;
            color: #1e293b;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 16px;
            padding: 40px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05);
          }
          .logo {
            text-align: center;
            font-weight: 800;
            font-size: 24px;
            color: #4f46e5;
            margin-bottom: 30px;
          }
          .welcome {
            font-size: 20px;
            font-weight: 600;
            margin-bottom: 20px;
          }
          .text {
            font-size: 16px;
            line-height: 1.6;
            margin-bottom: 30px;
            color: #475569;
          }
          .btn-container {
            text-align: center;
            margin-bottom: 30px;
          }
          .btn {
            display: inline-block;
            background-color: #4f46e5;
            color: #ffffff !important;
            text-decoration: none;
            padding: 14px 28px;
            font-weight: 600;
            border-radius: 8px;
            box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.2);
          }
          .btn:hover {
            background-color: #4338ca;
          }
          .footer {
            text-align: center;
            font-size: 13px;
            color: #94a3b8;
            border-top: 1px solid #e2e8f0;
            padding-top: 20px;
            margin-top: 30px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">CAREER PORTAL</div>
          <div class="welcome">Hi ${firstName || 'User'},</div>
          <div class="text">
            We received a request to reset your password. Click the button below to configure a new password. This link is valid for 1 hour.
          </div>
          <div class="btn-container">
            <a href="${resetUrl}" class="btn" target="_blank">Reset Password</a>
          </div>
          <div class="text">
            If you did not request a password reset, you can safely ignore this email.
          </div>
          <div class="footer">
            &copy; ${new Date().getFullYear()} Integrated Career & Recruitment Portal. All rights reserved.
          </div>
        </div>
      </body>
      </html>
    `;

    // Local Development Fallback: bypass SMTP entirely
    if (process.env.NODE_ENV === 'development') {
      this._printResetLink(token, email);
      return;
    }

    // Production SMTP Delivery
    try {
      return await transporter.sendMail({
        from: smtpFrom,
        to: email,
        subject: 'Reset Your Password - Career Portal',
        html: htmlContent
      });
    } catch (error) {
      console.warn(`[SMTP FAILURE] Failed to send password reset email to ${email}:`, error.message);
      // Fallback print and log
      this._printResetLink(token, email);
    }
  }

  async sendApplicationReceived(email, details) {
    const msg = `Application Received: Candidate ${details.candidateName || 'Student'} applied for "${details.jobTitle || 'Position'}" at "${details.companyName || 'Company'}".`;
    console.log(`\n========================================\n[EMAIL] ${msg}\n========================================\n`);
    writeMailLog(`Recipient: ${email} | ${msg}`);
  }

  async sendAssessmentAssigned(email, details) {
    const msg = `Assessment Assigned: A new test "${details.title || 'Skills Assessment'}" has been published. Duration: ${details.duration || 30} mins.`;
    console.log(`\n========================================\n[EMAIL] ${msg}\n========================================\n`);
    writeMailLog(`Recipient: ${email} | ${msg}`);
  }

  async sendAssessmentResult(email, details) {
    const msg = `Assessment Result: You scored ${details.score || 0}% on the assessment: "${details.title || 'Quiz'}". Status: ${details.status || 'completed'}.`;
    console.log(`\n========================================\n[EMAIL] ${msg}\n========================================\n`);
    writeMailLog(`Recipient: ${email} | ${msg}`);
  }

  async sendInterviewScheduled(email, details) {
    const msg = `Interview Scheduled: Date: ${details.date || 'TBD'} Time: ${details.time || 'TBD'}. Mode: ${details.mode || 'online'}. Link: ${details.link || 'None'}.`;
    console.log(`\n========================================\n[EMAIL] ${msg}\n========================================\n`);
    writeMailLog(`Recipient: ${email} | ${msg}`);
  }

  async sendInterviewReminder(email, details) {
    const msg = `Interview Reminder: Reminder for your upcoming scheduled slot for ${details.jobTitle || 'Position'} on ${details.date || 'TBD'} at ${details.time || 'TBD'}.`;
    console.log(`\n========================================\n[EMAIL] ${msg}\n========================================\n`);
    writeMailLog(`Recipient: ${email} | ${msg}`);
  }

  async sendOfferSent(email, details) {
    const msg = `Offer Letter Extended: Offer issued for the role of "${details.role || 'Engineer'}" at "${details.companyName || 'Company'}" with salary Package INR ${details.salary || '0'}.`;
    console.log(`\n========================================\n[EMAIL] ${msg}\n========================================\n`);
    writeMailLog(`Recipient: ${email} | ${msg}`);
  }

  async sendOfferAccepted(email, details) {
    const msg = `Offer Accepted: The candidate has accepted the placement offer for ${details.role || 'Engineer'}.`;
    console.log(`\n========================================\n[EMAIL] ${msg}\n========================================\n`);
    writeMailLog(`Recipient: ${email} | ${msg}`);
  }

  async sendOfferRejected(email, details) {
    const msg = `Offer Declined: The candidate has declined the placement offer for ${details.role || 'Engineer'}.`;
    console.log(`\n========================================\n[EMAIL] ${msg}\n========================================\n`);
    writeMailLog(`Recipient: ${email} | ${msg}`);
  }
}

export default new EmailService();
