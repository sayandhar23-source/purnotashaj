import { IsArray, IsIn, IsNumber, IsOptional, IsString, Matches, Max, Min } from 'class-validator';

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

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  referralCommissionPercent?: number;

  @IsOptional()
  @IsString()
  shippingOriginState?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  sameStateDeliveryMinDays?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  sameStateDeliveryMaxDays?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  otherStateDeliveryMinDays?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  otherStateDeliveryMaxDays?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  remoteDeliveryMinDays?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  remoteDeliveryMaxDays?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  remoteStates?: string[];

  @IsOptional()
  @IsIn(['lotus', 'marigold', 'peacock', 'mandala', 'henna', 'diya', 'temple-bell', 'swastika', 'none'])
  activeDivider?: string;
}
