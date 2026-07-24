import {
  Body,
  Controller,
  Get,
  Headers,
  Post,
  Query,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChatService } from './chat.service';
import { SendMessageDto } from './dto/send-message.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('chat')
export class ChatController {
  constructor(
    private chatService: ChatService,
    private config: ConfigService,
  ) {}

  // Public — the widget calls this to send a message
  @Post('messages')
  sendMessage(@Body() dto: SendMessageDto) {
    return this.chatService.sendCustomerMessage(dto);
  }

  // Public — the widget polls this to fetch the conversation
  @Get('messages')
  getMessages(@Query('sessionId') sessionId: string) {
    return this.chatService.getMessages(sessionId);
  }

  // Called by Telegram, not by the browser. Protected by a shared secret
  // Telegram sends back in a header, set when the webhook is registered.
  @Post('webhook')
  handleWebhook(
    @Body() update: any,
    @Headers('x-telegram-bot-api-secret-token') secretHeader: string,
  ) {
    const expected = this.config.get('TELEGRAM_WEBHOOK_SECRET');
    if (expected && secretHeader !== expected) {
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
