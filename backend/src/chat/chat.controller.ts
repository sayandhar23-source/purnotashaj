import {
  Body,
  Controller,
  Get,
  Headers,
  Post,
  Query,
  ServiceUnavailableException,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChatService } from './chat.service';
import { GetMessagesDto, SendMessageDto } from './dto/send-message.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RateLimit } from '../common/throttle/rate-limit';
import { safeEqual } from '../common/utils/crypto.util';

@Controller('chat')
export class ChatController {
  constructor(
    private chatService: ChatService,
    private config: ConfigService,
  ) {}

  // Public — the widget calls this to send a message
  @RateLimit(20)
  @Post('messages')
  sendMessage(@Body() dto: SendMessageDto) {
    return this.chatService.sendCustomerMessage(dto);
  }

  // Public — the widget polls this (every few seconds) to fetch the conversation.
  // The session id is now validated: with it unchecked, ?sessionId[$ne]=x matched
  // EVERY customer's messages and returned them to anyone, unauthenticated.
  @RateLimit(120)
  @Get('messages')
  getMessages(@Query() query: GetMessagesDto) {
    return this.chatService.getMessages(query.sessionId);
  }

  // Called by Telegram, not by the browser. Protected by a shared secret
  // Telegram sends back in a header, set when the webhook is registered.
  // If the secret isn't configured this now REFUSES requests; it used to accept
  // anything, which would let anyone post fake "admin replies" into customers' chats.
  @Post('webhook')
  handleWebhook(
    @Body() update: any,
    @Headers('x-telegram-bot-api-secret-token') secretHeader: string,
  ) {
    const expected = this.config.get('TELEGRAM_WEBHOOK_SECRET');
    if (!expected) throw new ServiceUnavailableException('Chat webhook is not configured.');
    if (!safeEqual(String(secretHeader || ''), expected)) {
      throw new UnauthorizedException('Invalid webhook secret');
    }
    return this.chatService.handleTelegramWebhook(update);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post('setup-webhook')
  setupWebhook() {
    return this.chatService.setupWebhook();
  }
}
