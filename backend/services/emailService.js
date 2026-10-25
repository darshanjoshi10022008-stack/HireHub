const nodemailer = require("nodemailer");

/**
 * Configure Nodemailer transport if SMTP credentials are provided,
 * otherwise return null to trigger safe development logger.
 */
const getTransporter = () => {
  const host = process.env.EMAIL_HOST || "smtp.gmail.com";
  const port = process.env.EMAIL_PORT ? parseInt(process.env.EMAIL_PORT, 10) : 587;
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASSWORD || process.env.EMAIL_PASS;

  if (user && pass) {
    const isGmail = host.toLowerCase().includes("gmail.com");

    if (isGmail) {
      return nodemailer.createTransport({
        service: "gmail",
        auth: { user, pass },
      });
    }

    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });
  }

  return null;
};

/**
 * Send account email verification link
 */
const sendVerificationEmail = async ({ to, name, token }) => {
  const frontendUrl = (process.env.FRONTEND_URL || "http://localhost:5173").replace(/\/+$/, "");
  const verificationUrl = `${frontendUrl}/verify-email/${token}`;
  const fromEmail = process.env.EMAIL_FROM || (process.env.EMAIL_USER ? `"HireHub" <${process.env.EMAIL_USER}>` : '"HireHub" <no-reply@hirehub.com>');

  const transporter = getTransporter();

  // If no SMTP credentials configured, use development console logger
  if (!transporter) {
    console.log("\n=======================================================");
    console.log(" [HIREHUB DEV MAIL] EMAIL VERIFICATION LINK");
    console.log(` Recipient: ${to} (${name || "User"})`);
    console.log(` Verification URL: ${verificationUrl}`);
    console.log(" Mode: Local Development Preview");
    console.log(" Note: Configure EMAIL_USER and EMAIL_PASSWORD in backend/.env for live delivery.");
    console.log("=======================================================\n");

    return {
      success: true,
      delivered: false,
      mode: "development_log",
      verificationUrl,
    };
  }

  const plainText = `
Hello ${name || "there"},

Welcome to HireHub! Please verify your email address to activate your account and access all platform features.

Verify your email by clicking the link below:
${verificationUrl}

This verification link will expire in 24 hours.

If you did not register for a HireHub account, you can safely disregard this email.

Best regards,
The HireHub Team
`;

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verify your HireHub account</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b; }
        .container { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -2px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; }
        .header { background: #0b2749; padding: 32px 24px; text-align: center; }
        .logo-text { color: #ffffff; font-size: 24px; font-weight: 700; letter-spacing: -0.5px; margin: 0; }
        .content { padding: 36px 32px; }
        .title { color: #0f172a; font-size: 20px; font-weight: 600; margin-top: 0; margin-bottom: 16px; }
        .paragraph { color: #475569; font-size: 15px; line-height: 1.6; margin-bottom: 24px; }
        .button-wrapper { text-align: center; margin: 32px 0; }
        .button { background-color: #1264c8; color: #ffffff !important; text-decoration: none; padding: 14px 32px; font-size: 15px; font-weight: 600; border-radius: 8px; display: inline-block; transition: background-color 0.2s; }
        .fallback-box { background: #f1f5f9; border-radius: 8px; padding: 16px; font-size: 13px; color: #64748b; word-break: break-all; margin-top: 24px; }
        .fallback-box a { color: #1264c8; text-decoration: underline; }
        .footer { padding: 24px 32px; background: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center; font-size: 12px; color: #94a3b8; }
        .badge { display: inline-block; padding: 4px 12px; background: #e0f2fe; color: #0369a1; border-radius: 9999px; font-size: 12px; font-weight: 600; margin-bottom: 16px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 class="logo-text">HireHub</h1>
        </div>
        <div class="content">
          <span class="badge">Account Verification</span>
          <h2 class="title">Welcome to HireHub, ${name || "there"}!</h2>
          <p class="paragraph">
            Thank you for creating an account with HireHub. To protect your security and access all job search and hiring tools, please verify your email address.
          </p>
          <div class="button-wrapper">
            <a href="${verificationUrl}" class="button" target="_blank" rel="noopener noreferrer">
              Verify Email Address
            </a>
          </div>
          <div class="fallback-box">
            <p style="margin: 0 0 8px 0; font-weight: 600; color: #334155;">Having trouble with the button?</p>
            <p style="margin: 0;">Copy and paste this link into your browser:</p>
            <p style="margin: 6px 0 0 0;"><a href="${verificationUrl}">${verificationUrl}</a></p>
          </div>
          <p class="paragraph" style="font-size: 13px; color: #64748b; margin-top: 24px; margin-bottom: 0;">
            This link expires in <strong>24 hours</strong>. If you did not create a HireHub account, no further action is required and you can safely ignore this email.
          </p>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} HireHub. All rights reserved.<br/>
          Secure Authentication & Career Platform
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const info = await transporter.sendMail({
      from: fromEmail,
      to,
      subject: "Verify your email address - HireHub",
      text: plainText,
      html,
    });

    console.log(`[HIREHUB EMAIL] Verification dispatched to ${to} (MessageId: ${info.messageId})`);

    return {
      success: true,
      delivered: true,
      mode: "smtp",
      messageId: info.messageId,
    };
  } catch (err) {
    console.error("Nodemailer verification email error:", err.message);
    // Provide fallback link in server console so developers and admins can continue testing
    console.log(`[FALLBACK DEV LINK] Verification link for ${to}: ${verificationUrl}`);

    return {
      success: false,
      delivered: false,
      error: err.message,
      verificationUrl,
    };
  }
};

/**
 * Send password reset link
 */
const sendPasswordResetEmail = async ({ to, name, token }) => {
  const frontendUrl = (process.env.FRONTEND_URL || "http://localhost:5173").replace(/\/+$/, "");
  const resetUrl = `${frontendUrl}/reset-password/${token}`;
  const fromEmail = process.env.EMAIL_FROM || (process.env.EMAIL_USER ? `"HireHub" <${process.env.EMAIL_USER}>` : '"HireHub" <no-reply@hirehub.com>');

  const transporter = getTransporter();

  if (!transporter) {
    console.log("\n=======================================================");
    console.log(" [HIREHUB DEV MAIL] PASSWORD RESET LINK");
    console.log(` Recipient: ${to} (${name || "User"})`);
    console.log(` Reset URL: ${resetUrl}`);
    console.log(" Mode: Local Development Preview");
    console.log(" Note: Configure EMAIL_USER and EMAIL_PASSWORD in backend/.env for live delivery.");
    console.log("=======================================================\n");

    return {
      success: true,
      delivered: false,
      mode: "development_log",
      resetUrl,
    };
  }

  const plainText = `
Hello ${name || "there"},

We received a request to reset the password for your HireHub account. Click the link below to set a new password:
${resetUrl}

This link is single-use and will expire in 1 hour.

If you did not request a password reset, please ignore this email. Your password will remain unchanged.

Best regards,
The HireHub Security Team
`;

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset Your Password - HireHub</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b; }
        .container { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -2px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; }
        .header { background: #0b2749; padding: 32px 24px; text-align: center; }
        .logo-text { color: #ffffff; font-size: 24px; font-weight: 700; letter-spacing: -0.5px; margin: 0; }
        .content { padding: 36px 32px; }
        .title { color: #0f172a; font-size: 20px; font-weight: 600; margin-top: 0; margin-bottom: 16px; }
        .paragraph { color: #475569; font-size: 15px; line-height: 1.6; margin-bottom: 24px; }
        .button-wrapper { text-align: center; margin: 32px 0; }
        .button { background-color: #1264c8; color: #ffffff !important; text-decoration: none; padding: 14px 32px; font-size: 15px; font-weight: 600; border-radius: 8px; display: inline-block; }
        .fallback-box { background: #f1f5f9; border-radius: 8px; padding: 16px; font-size: 13px; color: #64748b; word-break: break-all; margin-top: 24px; }
        .fallback-box a { color: #1264c8; text-decoration: underline; }
        .footer { padding: 24px 32px; background: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center; font-size: 12px; color: #94a3b8; }
        .badge { display: inline-block; padding: 4px 12px; background: #fef3c7; color: #92400e; border-radius: 9999px; font-size: 12px; font-weight: 600; margin-bottom: 16px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 class="logo-text">HireHub</h1>
        </div>
        <div class="content">
          <span class="badge">Password Recovery</span>
          <h2 class="title">Reset Your Password</h2>
          <p class="paragraph">
            Hello ${name || "there"}, we received a request to reset your password for your HireHub account. Click the button below to choose a new password:
          </p>
          <div class="button-wrapper">
            <a href="${resetUrl}" class="button" target="_blank" rel="noopener noreferrer">
              Reset Password
            </a>
          </div>
          <div class="fallback-box">
            <p style="margin: 0 0 8px 0; font-weight: 600; color: #334155;">Or copy and paste this link:</p>
            <p style="margin: 6px 0 0 0;"><a href="${resetUrl}">${resetUrl}</a></p>
          </div>
          <p class="paragraph" style="font-size: 13px; color: #64748b; margin-top: 24px; margin-bottom: 0;">
            This single-use link expires in <strong>1 hour</strong>. If you did not request this change, please ignore this email. Your current password remains safe and active.
          </p>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} HireHub. All rights reserved.
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const info = await transporter.sendMail({
      from: fromEmail,
      to,
      subject: "Password Reset Request - HireHub",
      text: plainText,
      html,
    });

    console.log(`[HIREHUB EMAIL] Password reset dispatched to ${to} (MessageId: ${info.messageId})`);

    return {
      success: true,
      delivered: true,
      mode: "smtp",
      messageId: info.messageId,
    };
  } catch (err) {
    console.error("Nodemailer password reset email error:", err.message);
    console.log(`[FALLBACK DEV LINK] Reset link for ${to}: ${resetUrl}`);

    return {
      success: false,
      delivered: false,
      error: err.message,
      resetUrl,
    };
  }
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
};
