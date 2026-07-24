import { IsOptional, IsString, Matches } from 'class-validator';

export class UpdateSettingsDto {
  @IsOptional()
  @IsString()
  @Matches(/^[0-9]{7,15}$/, {
    message: 'WhatsApp number must be digits only, with country code, no spaces or +. e.g. 919999999999',
  })
  whatsappNumber?: string;

  @IsOptional()
  @IsString()
  instagramUrl?: string;

  @IsOptional()
  @IsString()
  facebookUrl?: string;

  @IsOptional()
  @IsString()
  youtubeUrl?: string;

  @IsOptional()
  @IsString()
  pinterestUrl?: string;

  @IsOptional()
  @IsString()
  telegramChatId?: string;
}
