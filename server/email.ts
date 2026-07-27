import nodemailer from "nodemailer";

// Email configuration from environment variables
const SMTP_HOST = process.env.SMTP_HOST || "smtp.gmail.com";
const SMTP_PORT = parseInt(process.env.SMTP_PORT || "587");
const SMTP_USER = process.env.SMTP_USER || "";
const SMTP_PASS = process.env.SMTP_PASS || "";
const SMTP_FROM = process.env.SMTP_FROM || "noreply@patanyumba.com";
const APP_URL = process.env.APP_URL || "http://localhost:3000";

// Create transporter
let transporter: nodemailer.Transporter | null = null;

export function initializeEmailService() {
  if (!SMTP_USER || !SMTP_PASS) {
    console.warn("⚠ Email service not configured. Set SMTP_USER and SMTP_PASS to enable.");
    return;
  }

  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465, // true for 465, false for other ports
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });

  console.log("✓ Email service initialized");
}

// ---------------------------------------------------------------------------
// Send verification email
// ---------------------------------------------------------------------------

export async function sendVerificationEmail(
  email: string,
  code: string
): Promise<{ success: boolean; error?: string }> {
  if (!transporter) {
    console.warn("Email service not configured. Verification code:", code);
    return { success: false, error: "Email service not configured" };
  }

  try {
    const verifyUrl = `${APP_URL}/verify-email?email=${encodeURIComponent(email)}&code=${code}`;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .code-box { background: white; border: 2px solid #667eea; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
            .code { font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #667eea; font-family: monospace; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; border-radius: 6px; text-decoration: none; margin: 20px 0; }
            .footer { text-align: center; font-size: 12px; color: #999; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>PataNyumba</h1>
              <p>Email Verification</p>
            </div>
            <div class="content">
              <p>Hi there,</p>
              <p>Thank you for registering with PataNyumba! To complete your registration, please verify your email address using the code below:</p>
              
              <div class="code-box">
                <p style="margin: 0; font-size: 14px; color: #999;">Your verification code</p>
                <div class="code">${code}</div>
              </div>
              
              <p>This code will expire in 15 minutes.</p>
              
              <p>Or click the button below to verify directly:</p>
              <div style="text-align: center;">
                <a href="${verifyUrl}" class="button">Verify Email</a>
              </div>
              
              <p style="margin-top: 30px; font-size: 14px; color: #666;">
                If you didn't create this account, you can safely ignore this email.
              </p>
            </div>
            <div class="footer">
              <p>&copy; 2024 PataNyumba. All rights reserved.</p>
              <p>This is an automated email. Please do not reply to this address.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const result = await transporter.sendMail({
      from: SMTP_FROM,
      to: email,
      subject: "Verify Your PataNyumba Email Address",
      html: htmlContent,
      text: `Your PataNyumba verification code is: ${code}\n\nThis code will expire in 15 minutes.\n\nIf you didn't create this account, you can safely ignore this email.`,
    });

    console.log("✓ Verification email sent:", result.messageId);
    return { success: true };
  } catch (error) {
    console.error("Failed to send verification email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to send email",
    };
  }
}

// ---------------------------------------------------------------------------
// Send welcome email
// ---------------------------------------------------------------------------

export async function sendWelcomeEmail(
  email: string,
  name: string
): Promise<{ success: boolean; error?: string }> {
  if (!transporter) {
    console.warn("Email service not configured. Skipping welcome email.");
    return { success: false, error: "Email service not configured" };
  }

  try {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; border-radius: 6px; text-decoration: none; margin: 20px 0; }
            .footer { text-align: center; font-size: 12px; color: #999; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to PataNyumba!</h1>
            </div>
            <div class="content">
              <p>Hi ${name},</p>
              <p>Your email has been successfully verified! Your PataNyumba account is now active and ready to use.</p>
              
              <p>You can now:</p>
              <ul>
                <li>Browse available properties</li>
                <li>Save your favorite listings</li>
                <li>Contact landlords directly</li>
                <li>List your own properties (if you're a landlord)</li>
              </ul>
              
              <div style="text-align: center;">
                <a href="${APP_URL}/dashboard" class="button">Go to Dashboard</a>
              </div>
              
              <p>If you have any questions, feel free to contact our support team.</p>
            </div>
            <div class="footer">
              <p>&copy; 2024 PataNyumba. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const result = await transporter.sendMail({
      from: SMTP_FROM,
      to: email,
      subject: "Welcome to PataNyumba!",
      html: htmlContent,
      text: `Welcome to PataNyumba, ${name}!\n\nYour account is now active. Visit ${APP_URL}/dashboard to get started.`,
    });

    console.log("✓ Welcome email sent:", result.messageId);
    return { success: true };
  } catch (error) {
    console.error("Failed to send welcome email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to send email",
    };
  }
}

// ---------------------------------------------------------------------------
// Send password reset email
// ---------------------------------------------------------------------------

export async function sendPasswordResetEmail(
  email: string,
  resetToken: string
): Promise<{ success: boolean; error?: string }> {
  if (!transporter) {
    console.warn("Email service not configured. Skipping password reset email.");
    return { success: false, error: "Email service not configured" };
  }

  try {
    const resetUrl = `${APP_URL}/reset-password?token=${resetToken}`;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; border-radius: 6px; text-decoration: none; margin: 20px 0; }
            .footer { text-align: center; font-size: 12px; color: #999; margin-top: 20px; }
            .warning { background: #fff3cd; border: 1px solid #ffc107; padding: 15px; border-radius: 6px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Password Reset Request</h1>
            </div>
            <div class="content">
              <p>Hi,</p>
              <p>We received a request to reset your PataNyumba account password. Click the button below to create a new password:</p>
              
              <div style="text-align: center;">
                <a href="${resetUrl}" class="button">Reset Password</a>
              </div>
              
              <div class="warning">
                <strong>Security Notice:</strong> This link will expire in 1 hour. If you didn't request this, please ignore this email and your password will remain unchanged.
              </div>
              
              <p>If the button doesn't work, copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #667eea;">${resetUrl}</p>
            </div>
            <div class="footer">
              <p>&copy; 2024 PataNyumba. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const result = await transporter.sendMail({
      from: SMTP_FROM,
      to: email,
      subject: "Reset Your PataNyumba Password",
      html: htmlContent,
      text: `Click here to reset your password: ${resetUrl}\n\nThis link expires in 1 hour.`,
    });

    console.log("✓ Password reset email sent:", result.messageId);
    return { success: true };
  } catch (error) {
    console.error("Failed to send password reset email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to send email",
    };
  }
}
