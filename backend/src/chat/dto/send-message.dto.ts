import { IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { Trim } from '../../common/utils/transforms';

// Session ids are random UUIDs generated in the browser. Requiring that shape (and
// a sane size) is part of what keeps one visitor from reading another's conversation.
export const SESSION_ID_PATTERN = /^[A-Za-z0-9_-]{16,64}$/;

export class SendMessageDto {
  @Matches(SESSION_ID_PATTERN, { message: 'Invalid chat session.' })
  sessionId: string;

  // Telegram messages cap at 4096 characters; unbounded text just errors out and spams the admin chat
  @Trim()
  @IsString()
  @MinLength(1)
  @MaxLength(1000)
  text: string;

  @IsOptional()
  @Trim()
  @IsString()
  @MaxLength(60)
  customerName?: string;
}

export class GetMessagesDto {
  @Matches(SESSION_ID_PATTERN, { message: 'Invalid chat session.' })
  sessionId: string;
}
