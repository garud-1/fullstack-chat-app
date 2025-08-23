// Enhanced Email Verification Service
import nodemailer from "nodemailer";
import crypto from "crypto";

// Email template with professional design
const getVerificationEmailTemplate = (code, userEmail, companyName = "Your Company", companyLogo = "", supportEmail = "support@yourcompany.com") => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>Email Verification</title>
    <style>
        /* Reset and base styles */
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333333;
            background-color: #f8fafc;
        }
        
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
        }
        
        .email-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 40px 30px;
            text-align: center;
            color: white;
        }
        
        .logo {
            max-height: 50px;
            margin-bottom: 20px;
        }
        
        .header-title {
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 10px;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .header-subtitle {
            font-size: 16px;
            opacity: 0.9;
            font-weight: 300;
        }
        
        .email-body {
            padding: 40px 30px;
            text-align: center;
        }
        
        .greeting {
            font-size: 20px;
            font-weight: 600;
            color: #2d3748;
            margin-bottom: 20px;
        }
        
        .message {
            font-size: 16px;
            color: #4a5568;
            margin-bottom: 30px;
            line-height: 1.7;
        }
        
        .verification-code-container {
            background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
            border: 2px dashed #cbd5e0;
            border-radius: 12px;
            padding: 25px;
            margin: 30px 0;
            position: relative;
            overflow: hidden;
        }
        
        .verification-code-container::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle, rgba(102, 126, 234, 0.05) 0%, transparent 50%);
            animation: shimmer 3s ease-in-out infinite;
        }
        
        @keyframes shimmer {
            0%, 100% { transform: scale(0.8) rotate(0deg); opacity: 0.5; }
            50% { transform: scale(1.2) rotate(180deg); opacity: 0.8; }
        }
        
        .verification-code-label {
            font-size: 14px;
            font-weight: 600;
            color: #718096;
            margin-bottom: 10px;
            text-transform: uppercase;
            letter-spacing: 1px;
            position: relative;
            z-index: 1;
        }
        
        .verification-code {
            font-size: 36px;
            font-weight: 800;
            color: #2d3748;
            font-family: 'Courier New', monospace;
            letter-spacing: 6px;
            margin: 15px 0;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            position: relative;
            z-index: 1;
        }
        
        .copy-button {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            position: relative;
            z-index: 1;
        }
        
        .copy-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }
        
        .expiry-notice {
            background: #fff5f5;
            border-left: 4px solid #f56565;
            padding: 15px 20px;
            margin: 25px 0;
            border-radius: 0 8px 8px 0;
        }
        
        .expiry-notice .icon {
            display: inline-block;
            margin-right: 8px;
            font-size: 18px;
        }
        
        .expiry-text {
            color: #c53030;
            font-weight: 600;
            font-size: 14px;
        }
        
        .security-tips {
            background: #f0fff4;
            border-radius: 12px;
            padding: 20px;
            margin: 25px 0;
            text-align: left;
        }
        
        .security-tips h3 {
            color: #22543d;
            font-size: 16px;
            margin-bottom: 15px;
            display: flex;
            align-items: center;
        }
        
        .security-tips h3::before {
            content: '🔒';
            margin-right: 8px;
        }
        
        .security-tips ul {
            color: #2f855a;
            font-size: 14px;
            padding-left: 20px;
        }
        
        .security-tips li {
            margin-bottom: 8px;
        }
        
        .email-footer {
            background: #2d3748;
            padding: 30px;
            text-align: center;
            color: #a0aec0;
        }
        
        .footer-content {
            font-size: 14px;
            line-height: 1.6;
        }
        
        .footer-content a {
            color: #81e6d9;
            text-decoration: none;
        }
        
        .footer-content a:hover {
            text-decoration: underline;
        }
        
        .social-links {
            margin: 20px 0;
        }
        
        .social-links a {
            display: inline-block;
            margin: 0 10px;
            padding: 8px;
            border-radius: 50%;
            background: #4a5568;
            transition: background 0.3s ease;
        }
        
        .social-links a:hover {
            background: #667eea;
        }
        
        .divider {
            height: 1px;
            background: linear-gradient(to right, transparent, #e2e8f0, transparent);
            margin: 20px 0;
        }
        
        /* Mobile responsiveness */
        @media (max-width: 600px) {
            .email-container {
                margin: 10px;
                border-radius: 8px;
            }
            
            .email-header, .email-body, .email-footer {
                padding: 25px 20px;
            }
            
            .header-title {
                font-size: 24px;
            }
            
            .verification-code {
                font-size: 28px;
                letter-spacing: 4px;
            }
            
            .greeting {
                font-size: 18px;
            }
            
            .message {
                font-size: 15px;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <!-- Header Section -->
        <div class="email-header">
            ${companyLogo ? `<img src="${companyLogo}" alt="${companyName}" class="logo">` : ''}
            <div class="header-title">Email Verification</div>
            <div class="header-subtitle">Secure your account with us</div>
        </div>
        
        <!-- Body Section -->
        <div class="email-body">
            <div class="greeting">Hello there! 👋</div>
            <div class="message">
                We received a request to verify your email address <strong>${userEmail}</strong>. 
                To complete the verification process, please use the code below:
            </div>
            
            <!-- Verification Code Container -->
            <div class="verification-code-container">
                <div class="verification-code-label">Your Verification Code</div>
                <div class="verification-code" id="verificationCode">${code}</div>
                <button class="copy-button" onclick="copyToClipboard()">Copy Code</button>
            </div>
            
            <!-- Expiry Notice -->
            <div class="expiry-notice">
                <span class="icon">⏰</span>
                <span class="expiry-text">This code will expire in 10 minutes</span>
            </div>
            
            <!-- Security Tips -->
            <div class="security-tips">
                <h3>Security Tips</h3>
                <ul>
                    <li>Never share this code with anyone</li>
                    <li>We will never ask for this code via phone or email</li>
                    <li>If you didn't request this, please ignore this email</li>
                    <li>Contact support if you have any concerns</li>
                </ul>
            </div>
            
            <div class="divider"></div>
            
            <div style="color: #718096; font-size: 14px;">
                Having trouble? Contact our support team at 
                <a href="mailto:${supportEmail}" style="color: #667eea;">${supportEmail}</a>
            </div>
        </div>
        
        <!-- Footer Section -->
        <div class="email-footer">
            <div class="footer-content">
                <strong>${companyName}</strong><br>
                This is an automated message, please do not reply to this email.<br>
                © ${new Date().getFullYear()} ${companyName}. All rights reserved.
            </div>
            
            <div class="divider"></div>
            
            <div style="font-size: 12px; color: #718096;">
                You received this email because you requested email verification.<br>
                If you have questions, contact us at <a href="mailto:${supportEmail}">${supportEmail}</a>
            </div>
        </div>
    </div>
    
    <script>
        function copyToClipboard() {
            const code = document.getElementById('verificationCode').textContent;
            navigator.clipboard.writeText(code).then(function() {
                const button = document.querySelector('.copy-button');
                const originalText = button.textContent;
                button.textContent = 'Copied!';
                button.style.background = '#48bb78';
                setTimeout(() => {
                    button.textContent = originalText;
                    button.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
                }, 2000);
            });
        }
    </script>
</body>
</html>
  `;
};

// Enhanced email service class
class EmailVerificationService {
  constructor(config = {}) {
    this.config = {
      companyName: config.companyName || "Your Company",
      companyLogo: config.companyLogo || "",
      supportEmail: config.supportEmail || "support@yourcompany.com",
      fromName: config.fromName || "Your Company Team",
      ...config
    };
    
  this.transporter = this.createTransporter();
  }
  
  createTransporter() {
    
    const transporterConfig = {
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, 
      },
      tls: {
        rejectUnauthorized: false
      }
    };
    
  
    if (process.env.SMTP_HOST) {
  return nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT || 587,
        secure: process.env.SMTP_SECURE === 'true', 
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
        tls: {
          rejectUnauthorized: false
        }
      });
    }
    
  return nodemailer.createTransport(transporterConfig);
  }
  
  // Generate secure verification code
  generateVerificationCode(length = 6) {
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let result = '';
    const randomArray = crypto.randomBytes(length);
    
    for (let i = 0; i < length; i++) {
      result += chars[randomArray[i] % chars.length];
    }
    
    return result;
  }
  
  // Main function to send verification email
  async sendVerificationEmail(to, code = null, options = {}) {
    try {
      // Generate code if not provided
      const verificationCode = code || this.generateVerificationCode();
      
      // Validate email format
      if (!this.isValidEmail(to)) {
        throw new Error('Invalid email address format');
      }
      
      const mailOptions = {
        from: {
          name: this.config.fromName,
          address: process.env.EMAIL_USER
        },
        to: to,
        subject: options.subject || '🔐 Verify Your Email Address',
        html: getVerificationEmailTemplate(
          verificationCode,
          to,
          this.config.companyName,
          this.config.companyLogo,
          this.config.supportEmail
        ),
        // Enhanced headers for better deliverability
        headers: {
          'X-Priority': '1',
          'X-MSMail-Priority': 'High',
          'Importance': 'High',
          'X-Mailer': 'Professional Email Service v1.0'
        },
        // Add text version for better compatibility
        text: `
          Email Verification Required
          
          Hello,
          
          Your verification code is: ${verificationCode}
          
          This code will expire in 10 minutes. Please use this code to verify your email address.
          
          If you didn't request this verification, please ignore this email.
          
          Best regards,
          ${this.config.companyName} Team
          
          Support: ${this.config.supportEmail}
        `
      };
      
      // Send email with retry mechanism
      const result = await this.sendWithRetry(mailOptions, 3);
      
      return {
        success: true,
        messageId: result.messageId,
        verificationCode: verificationCode,
        recipient: to,
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      console.error('Email sending failed:', error);
      throw new Error(`Failed to send verification email: ${error.message}`);
    }
  }
  
  // Send email with retry mechanism
  async sendWithRetry(mailOptions, maxRetries = 3) {
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const result = await this.transporter.sendMail(mailOptions);
        console.log(`✅ Email sent successfully on attempt ${attempt}:`, result.messageId);
        return result;
      } catch (error) {
        lastError = error;
        console.error(`❌ Email sending attempt ${attempt} failed:`, error.message);
        
        if (attempt < maxRetries) {
          // Wait before retry (exponential backoff)
          const delay = Math.pow(2, attempt) * 1000;
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    throw lastError;
  }
  
  // Validate email format
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
  
  // Verify transporter connection
  async verifyConnection() {
    try {
      await this.transporter.verify();
      console.log('✅ Email transporter is ready to send emails');
      return true;
    } catch (error) {
      console.error('❌ Email transporter verification failed:', error);
      return false;
    }
  }
  
  // Send welcome email after successful verification
  async sendWelcomeEmail(to, username = 'User') {
    const welcomeTemplate = `
      <!-- Welcome email template would go here -->
      <h2>Welcome to ${this.config.companyName}, ${username}!</h2>
      <p>Your email has been successfully verified.</p>
    `;
    
    const mailOptions = {
      from: {
        name: this.config.fromName,
        address: process.env.EMAIL_USER
      },
      to: to,
      subject: `🎉 Welcome to ${this.config.companyName}!`,
      html: welcomeTemplate
    };
    
    return await this.transporter.sendMail(mailOptions);
  }
}

// Usage examples:

// 1. Basic usage (maintains backward compatibility)
export const sendVerificationEmail = async (to, code) => {
  const emailService = new EmailVerificationService({
    companyName: "Your Company Name",
    companyLogo: "https://yourcompany.com/logo.png",
    supportEmail: "support@yourcompany.com",
    fromName: "Your Company Team"
  });
  
  return await emailService.sendVerificationEmail(to, code);
};

// 2. Advanced usage with custom configuration
export const createEmailService = (config) => {
  return new EmailVerificationService(config);
};

// 3. Example of how to use in your application
/*
// In your route handler or service:
import { createEmailService } from './emailService.js';

const emailService = createEmailService({
  companyName: "TechCorp Solutions",
  companyLogo: "https://techcorp.com/assets/logo.png",
  supportEmail: "support@techcorp.com",
  fromName: "TechCorp Team"
});

// Verify connection on startup
await emailService.verifyConnection();

// Send verification email
const result = await emailService.sendVerificationEmail(
  'user@example.com',
  null, // Will generate code automatically
  { subject: 'Verify Your TechCorp Account' }
);

console.log('Verification email sent:', result);
*/

export { EmailVerificationService };