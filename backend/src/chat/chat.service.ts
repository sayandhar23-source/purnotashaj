import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ChatMessage, ChatMessageDocument } from '../common/schemas/chat-message.schema';
import { StoreSettings, StoreSettingsDocument } from '../common/schemas/store-settings.schema';
import { SendMessageDto } from './dto/send-message.dto';

@Injectable()
export class ChatService {
  private logger = new Logger(ChatService.name);

  constructor(
    @InjectModel(ChatMessage.name) private chatModel: Model<ChatMessageDocument>,
    @InjectModel(StoreSettings.name) private settingsModel: Model<StoreSettingsDocument>,
    private config: ConfigService,
  ) {}

  private get botToken() {
    return this.config.get('TELEGRAM_BOT_TOKEN');
  }

  private async telegramApi(method: string, body: Record<string, any>) {
    if (!this.botToken) {
      this.logger.warn('TELEGRAM_BOT_TOKEN is not set — chat messages will not reach Telegram.');
      return null;
    }
    try {
      const res = await fetch(`https://api.telegram.org/bot${this.botToken}/${method}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!data.ok) {
        this.logger.error(`Telegram API error (${method}): ${JSON.stringify(data)}`);
        return null;
      }
      return data.result;
    } catch (err) {
      this.logger.error(`Telegram API request failed (${method})`, err as Error);
      return null;
    }
  }

  async sendCustomerMessage(dto: SendMessageDto) {
    const saved = await this.chatModel.create({
      sessionId: dto.sessionId,
      sender: 'customer',
      text: dto.text,
      customerName: dto.customerName,
    });

    const settings = await this.settingsModel.findOne();
    const chatId = settings?.telegramChatId;

    if (chatId) {
      const label = dto.customerName ? dto.customerName : `Guest (${dto.sessionId.slice(0, 8)})`;
      const result = await this.telegramApi('sendMessage', {
        chat_id: chatId,
        text: `💬 ${label}:\n\n${dto.text}\n\n— Reply to this message to respond.`,
      });
      if (result?.message_id) {
        saved.telegramMessageId = result.message_id;
        await saved.save();
      }
    }

    return saved;
  }

  async getMessages(sessionId: string) {
    return this.chatModel.find({ sessionId }).sort({ createdAt: 1 });
  }

  // Called by Telegram's webhook whenever a message is sent in the configured
  // chat. Only messages that are a native Telegram "reply" to one of our
  // forwarded customer messages get routed back — anything else is ignored,
  // since there'd be no way to know which customer it's meant for.
  async handleTelegramWebhook(update: any) {
    const message = update?.message;
    const replyToId = message?.reply_to_message?.message_id;
    const text = message?.text;
    if (!replyToId || !text) return { ok: true };

    const original = await this.chatModel.findOne({ telegramMessageId: replyToId });
    if (!original) return { ok: true };

    await this.chatModel.create({
      sessionId: original.sessionId,
      sender: 'admin',
      text,
    });

    return { ok: true };
  }

  // Registers the backend's webhook URL with Telegram — a one-click convenience
  // so the admin doesn't have to call Telegram's API by hand.
  async setupWebhook() {
    const backendUrl = this.config.get('BACKEND_URL');
    const secret = this.config.get('TELEGRAM_WEBHOOK_SECRET');
    if (!backendUrl) {
      return { ok: false, message: 'Set BACKEND_URL in the backend environment first.' };
    }
    const result = await this.telegramApi('setWebhook', {
      url: `${backendUrl.replace(/\/+$/, '')}/api/chat/webhook`,
      secret_token: secret || undefined,
    });
    return result ? { ok: true } : { ok: false, message: 'Telegram rejected the webhook — check TELEGRAM_BOT_TOKEN.' };
  }

  // One-way admin alert (not part of the two-way customer chat thread) — sent
  // the moment a payment succeeds, reusing the same bot/chat already
  // configured for live chat, so there's nothing extra to set up.
  async sendOrderAlert(params: {
    orderId: string;
    customerName?: string;
    customerEmail: string;
    items: { title: string; quantity: number; price: number }[];
    totalAmount: number;
  }) {
    const settings = await this.settingsModel.findOne();
    const chatId = settings?.telegramChatId;
    if (!chatId) return; // Telegram not set up — the email alert still covers this

    const itemLines = params.items
      .map((i) => `• ${i.title} × ${i.quantity} — ₹${i.price}`)
      .join('\n');

    const text = [
      '🛍️ New order received!',
      '',
      `Order ID: #${params.orderId.slice(-8)}`,
      `Customer: ${params.customerName || params.customerEmail}`,
      `Email: ${params.customerEmail}`,
      '',
      'Items:',
      itemLines,
      '',
      `Total: ₹${params.totalAmount}`,
      '',
      'Go to Admin → Orders to confirm.',
    ].join('\n');

    await this.telegramApi('sendMessage', { chat_id: chatId, text });
  }
}
