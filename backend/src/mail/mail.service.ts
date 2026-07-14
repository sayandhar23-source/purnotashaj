import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class MailService {
  private resend: Resend;
  private from: string;
  private logger = new Logger(MailService.name);

  constructor(private config: ConfigService) {
    this.resend = new Resend(this.config.get('RESEND_API_KEY'));
    this.from = this.config.get('MAIL_FROM') || 'no-reply@yourdomain.com';
  }

  async sendOtpEmail(to: string, code: string, purpose: 'register' | 'reset-password') {
    const subject =
      purpose === 'register'
        ? 'Verify your email — your OTP code'
        : 'Reset your password — your OTP code';
    const heading =
      purpose === 'register' ? 'Confirm your email address' : 'Reset your password';

    try {
      await this.resend.emails.send({
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
    } catch (err) {
      this.logger.error('Failed to send OTP email', err);
      throw err;
    }
  }

  async sendOrderConfirmation(to: string, orderId: string, total: number) {
    try {
      await this.resend.emails.send({
        from: this.from,
        to,
        subject: `Order confirmed — #${orderId}`,
        html: `<div style="font-family:sans-serif"><h2>Thanks for your order!</h2><p>Order ID: ${orderId}</p><p>Total: ${total}</p></div>`,
      });
    } catch (err) {
      this.logger.error('Failed to send order confirmation', err);
    }
  }

  // Sent to the store owner as soon as a payment succeeds, so they know to review
  // and confirm the order from the admin dashboard. Does not go to the customer.
  async sendAdminNewOrderNotification(orderId: string, total: number, customerEmail: string) {
    const adminEmail = this.config.get('ADMIN_NOTIFICATION_EMAIL') || this.config.get('ADMIN_SEED_EMAIL');
    if (!adminEmail) return;
    try {
      await this.resend.emails.send({
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
    } catch (err) {
      this.logger.error('Failed to send admin order notification', err);
    }
  }
}
