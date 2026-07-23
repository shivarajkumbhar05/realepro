// server/routes/contactRoutes.js
const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');

// ─── Email Transporter ──────────────────────────────────────────────────────
// Check if email credentials are configured
const isEmailConfigured = process.env.EMAIL_USER && process.env.EMAIL_PASS;

let transporter = null;

if (isEmailConfigured) {
  try {
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT) || 587,
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Verify email configuration
    transporter.verify((error, success) => {
      if (error) {
        console.error('❌ Email configuration error:', error.message);
      } else {
        console.log('✅ Email server is ready');
      }
    });
  } catch (error) {
    console.error('❌ Email setup error:', error.message);
  }
} else {
  console.warn('⚠️ Email not configured. Contact form will log to console only.');
}

// ─── Test Route ─────────────────────────────────────────────────────────────
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Contact API is working!',
    emailConfigured: isEmailConfigured,
    timestamp: new Date().toISOString()
  });
});

// ─── Health Check ──────────────────────────────────────────────────────────
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Contact API is running',
    emailConfigured: isEmailConfigured,
    timestamp: new Date().toISOString(),
  });
});

// ─── Contact Form Submission ──────────────────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const { name, email, message } = req.body;

    console.log('📝 Contact form received:', { name, email, message });

    // Validate input
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and message',
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address',
      });
    }

    // If email is not configured, just log and return success
    if (!isEmailConfigured || !transporter) {
      console.log('📝 Contact form submission (email not configured):', {
        name,
        email,
        message,
        timestamp: new Date().toISOString(),
      });
      
      return res.status(200).json({
        success: true,
        message: 'Message received successfully! We will get back to you soon.',
        data: { name, email, message }
      });
    }

    // ─── Send Email to Admin ──────────────────────────────────────────────
    const adminMailOptions = {
      from: `"PropEstate Contact" <${process.env.EMAIL_USER}>`,
      to: 'realestateproperty605@gmail.com',
      replyTo: email,
      subject: `📬 New Contact: ${name}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #1a56db; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
            .field { margin-bottom: 15px; }
            .label { font-weight: bold; color: #374151; }
            .value { color: #1f2937; padding: 8px; background: white; border-radius: 4px; }
            .message-box { background: white; padding: 15px; border-radius: 4px; border-left: 4px solid #1a56db; }
            .footer { margin-top: 20px; font-size: 12px; color: #6b7280; text-align: center; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>📬 New Contact Form Submission</h2>
              <p style="margin: 0; opacity: 0.8;">From PropEstate Website</p>
            </div>
            <div class="content">
              <div class="field">
                <div class="label">👤 Name</div>
                <div class="value">${name}</div>
              </div>
              <div class="field">
                <div class="label">📧 Email</div>
                <div class="value"><a href="mailto:${email}">${email}</a></div>
              </div>
              <div class="field">
                <div class="label">💬 Message</div>
                <div class="message-box">${message.replace(/\n/g, '<br>')}</div>
              </div>
              <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 13px; color: #6b7280;">
                <p>📅 Submitted: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</p>
              </div>
            </div>
            <div class="footer">
              <p>This message was sent from the PropEstate contact form.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    // ─── Auto-reply to User ──────────────────────────────────────────────
    const userMailOptions = {
      from: `"PropEstate Team" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Thank you for contacting PropEstate',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #1a56db; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
            .message-box { background: white; padding: 15px; border-radius: 4px; border-left: 4px solid #10b981; }
            .footer { margin-top: 20px; font-size: 12px; color: #6b7280; text-align: center; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>🙏 Thank You for Contacting PropEstate!</h2>
            </div>
            <div class="content">
              <p>Dear ${name},</p>
              <p>Thank you for reaching out to PropEstate. We have received your message and our team will get back to you within <strong>1-2 business days</strong>.</p>
              
              <div style="margin: 20px 0;">
                <p style="font-weight: bold; color: #374151;">📝 Your Message:</p>
                <div class="message-box">${message.replace(/\n/g, '<br>')}</div>
              </div>
              
              <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0; color: #92400e; font-size: 14px;">
                  💡 <strong>Quick Tip:</strong> While you wait, browse more properties or chat with our AI assistant for instant help!
                </p>
              </div>
              
              <p style="margin-top: 20px;">Best regards,</p>
              <p style="font-weight: bold; margin: 0;">The PropEstate Team</p>
              <p style="color: #6b7280; font-size: 13px; margin: 5px 0 0 0;">🏠 India's Trusted Real Estate Platform</p>
            </div>
            <div class="footer">
              <p>This is an automated response. Please do not reply to this email.</p>
              <p>© ${new Date().getFullYear()} PropEstate. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    // ─── Send Both Emails ─────────────────────────────────────────────────
    await transporter.sendMail(adminMailOptions);
    await transporter.sendMail(userMailOptions);

    console.log(`✅ Contact form sent by ${email}`);

    res.status(200).json({
      success: true,
      message: 'Message sent successfully! We will get back to you soon.',
    });

  } catch (error) {
    console.error('❌ Contact form error:', error);
    
    let errorMessage = 'Failed to send message. Please try again later.';
    if (error.code === 'EAUTH') {
      errorMessage = 'Email configuration error. Please contact support.';
    } else if (error.code === 'ECONNECTION') {
      errorMessage = 'Unable to connect to email server. Please try again later.';
    }
    
    res.status(500).json({
      success: false,
      message: errorMessage,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

module.exports = router;