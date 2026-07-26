import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  private apiKey: string;
  private fromEmail: string;
  private fromName: string;
  private logger = new Logger(MailService.name);

  constructor(private config: ConfigService) {
    this.apiKey = this.config.get('BREVO_API_KEY');
    this.fromEmail = this.config.get('MAIL_FROM_EMAIL');
    this.fromName = this.config.get('MAIL_FROM_NAME') || 'Purnota Shaj';
  }

  // Sends via Brevo's transactional email HTTP API (https://api.brevo.com) —
  // plain HTTPS, not SMTP, so it isn't affected by hosts (Render, Railway, etc.)
  // that block outbound SMTP ports on free/cheap tiers.
  private async sendViaBrevo(to: string, subject: string, html: string) {
    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': this.apiKey,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        sender: { name: this.fromName, email: this.fromEmail },
        to: [{ email: to }],
        subject,
        htmlContent: html,
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Brevo API error (${res.status}): ${body}`);
    }

    return res.json();
  }

  async sendOtpEmail(to: string, code: string, purpose: 'register' | 'reset-password') {
    const subject =
      purpose === 'register'
        ? 'Verify your email — your OTP code'
        : 'Reset your password — your OTP code';
    const heading =
      purpose === 'register' ? 'Confirm your email address' : 'Reset your password';

    try {
      const result: any = await this.sendViaBrevo(
        to,
        subject,
        `
          <div style="font-family:sans-serif;max-width:480px;margin:auto">
            <h2>${heading}</h2>
            <p>Your one-time verification code is:</p>
            <div style="font-size:32px;font-weight:bold;letter-spacing:8px;padding:16px 0">${code}</div>
            <p>This code expires in 10 minutes. If you didn't request this, you can ignore this email.</p>
          </div>
        `,
      );
      this.logger.log(`OTP email sent to ${to} (messageId: ${result?.messageId})`);
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
      const result: any = await this.sendViaBrevo(
        to,
        'Welcome to Purnota Shaj 🎉',
        `
          <div style="font-family:sans-serif;max-width:480px;margin:auto">
            <h2>Welcome, ${name}!</h2>
            <p>Your account is verified and ready to go. We're glad to have you.</p>
            <p>Browse our latest collection of clothing, sarees, jewellery, ornaments, makeup and
            perfumes — and don't forget to check the Sale page for current offers.</p>
            <p style="margin-top:24px">— The Purnota Shaj team</p>
          </div>
        `,
      );
      this.logger.log(`Welcome email sent to ${to} (messageId: ${result?.messageId})`);
    } catch (err) {
      this.logger.error(`Failed to send welcome email to ${to}: ${err}`);
    }
  }

  async sendOrderConfirmation(to: string, orderId: string, total: number) {
    try {
      const result: any = await this.sendViaBrevo(
        to,
        `Order confirmed — #${orderId}`,
        `<div style="font-family:sans-serif"><h2>Thanks for your order!</h2><p>Order ID: ${orderId}</p><p>Total: ${total}</p></div>`,
      );
      this.logger.log(`Order confirmation sent to ${to} (messageId: ${result?.messageId})`);
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
      const result: any = await this.sendViaBrevo(
        adminEmail,
        `New order received — #${orderId}`,
        `
          <div style="font-family:sans-serif;max-width:480px;margin:auto">
            <h2>New paid order awaiting confirmation</h2>
            <p><strong>Order ID:</strong> ${orderId}</p>
            <p><strong>Customer:</strong> ${customerEmail}</p>
            <p><strong>Total:</strong> ₹${total}</p>
            <p>Log in to the admin dashboard to review and confirm this order — the customer's
            confirmation email is only sent once you confirm it.</p>
          </div>
        `,
      );
      this.logger.log(`Admin order notification sent (messageId: ${result?.messageId})`);
    } catch (err) {
      this.logger.error(`Failed to send admin order notification: ${err}`);
    }
  }
}
