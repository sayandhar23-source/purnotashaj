import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;
  private from: string;
  private logger = new Logger(MailService.name);

  constructor(private config: ConfigService) {
    const gmailUser = this.config.get('GMAIL_USER');
    const gmailAppPassword = this.config.get('GMAIL_APP_PASSWORD');
    const fromName = this.config.get('MAIL_FROM_NAME') || 'Purnota Shaj';

    // Gmail requires the "from" address to match the authenticated account
    // (or a verified alias) — no arbitrary sender addresses like Resend allowed.
    this.from = `"${fromName}" <${gmailUser}>`;

    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: gmailUser,
        pass: gmailAppPassword, // the 16-character App Password, not the normal Gmail password
      },
    });
  }

  async sendOtpEmail(to: string, code: string, purpose: 'register' | 'reset-password') {
    const subject =
      purpose === 'register'
        ? 'Verify your email — your OTP code'
        : 'Reset your password — your OTP code';
    const heading =
      purpose === 'register' ? 'Confirm your email address' : 'Reset your password';

    try {
      const info = await this.transporter.sendMail({
        from: this.from,
        to,
        subject,
        html: `
          <div style="font-family:sans-serif;max-width:480px;margin:auto">
            <h2>${heading}</h2>
            <p>Your one-time verification code is:</p>
            <div style="font-size:32px;font-weight:bold;letter-spacing:8px;padding:16px 0">${code}</div>
            <p>This code expires in 10 minutes. If you didn't request this, you can ignore this email.</p>
          </div>
        `,
      });
      this.logger.log(`OTP email sent to ${to} (id: ${info.messageId})`);
    } catch (err) {
      this.logger.error(`Failed to send OTP email to ${to}: ${err}`);
      throw new BadRequestException(
        'Could not send the verification email. Please try again shortly, or contact support if this keeps happening.',
      );
    }
  }

  // Sent right after a new account finishes OTP verification. Failure here
  // never blocks registration — the account is already created and verified
  // regardless of whether this particular email goes out.
  async sendWelcomeEmail(to: string, name: string) {
    try {
      const info = await this.transporter.sendMail({
        from: this.from,
        to,
        subject: 'Welcome to Purnota Shaj 🎉',
        html: `
          <div style="font-family:sans-serif;max-width:480px;margin:auto">
            <h2>Welcome, ${name}!</h2>
            <p>Your account is verified and ready to go. We're glad to have you.</p>
            <p>Browse our latest collection of clothing, sarees, jewellery, ornaments, makeup and
            perfumes — and don't forget to check the Sale page for current offers.</p>
            <p style="margin-top:24px">— The Purnota Shaj team</p>
          </div>
        `,
      });
      this.logger.log(`Welcome email sent to ${to} (id: ${info.messageId})`);
    } catch (err) {
      this.logger.error(`Failed to send welcome email to ${to}: ${err}`);
    }
  }

  async sendOrderConfirmation(to: string, orderId: string, total: number) {
    try {
      const info = await this.transporter.sendMail({
        from: this.from,
        to,
        subject: `Order confirmed — #${orderId}`,
        html: `<div style="font-family:sans-serif"><h2>Thanks for your order!</h2><p>Order ID: ${orderId}</p><p>Total: ${total}</p></div>`,
      });
      this.logger.log(`Order confirmation sent to ${to} (id: ${info.messageId})`);
    } catch (err) {
      this.logger.error(`Failed to send order confirmation to ${to}: ${err}`);
    }
  }

  // Sent to the store owner as soon as a payment succeeds, so they know to review
  // and confirm the order from the admin dashboard. Does not go to the customer.
  async sendAdminNewOrderNotification(orderId: string, total: number, customerEmail: string) {
    const adminEmail = this.config.get('ADMIN_NOTIFICATION_EMAIL') || this.config.get('ADMIN_SEED_EMAIL');
    if (!adminEmail) return;

    try {
      const info = await this.transporter.sendMail({
        from: this.from,
        to: adminEmail,
        subject: `New order received — #${orderId}`,
        html: `
          <div style="font-family:sans-serif;max-width:480px;margin:auto">
            <h2>New paid order awaiting confirmation</h2>
            <p><strong>Order ID:</strong> ${orderId}</p>
            <p><strong>Customer:</strong> ${customerEmail}</p>
            <p><strong>Total:</strong> ₹${total}</p>
            <p>Log in to the admin dashboard to review and confirm this order — the customer's
            confirmation email is only sent once you confirm it.</p>
          </div>
        `,
      });
      this.logger.log(`Admin order notification sent (id: ${info.messageId})`);
    } catch (err) {
      this.logger.error(`Failed to send admin order notification: ${err}`);
    }
  }
}
