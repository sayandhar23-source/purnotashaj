import { IsBoolean, IsIn, IsOptional, IsString } from 'class-validator';

export class UpdateSaleBannerContentDto {
  @IsOptional()
  @IsString()
  heroTitle?: string;

  @IsOptional()
  @IsString()
  heroSubtitle?: string;

  @IsOptional()
  @IsString()
  ctaText?: string;

  @IsOptional()
  @IsString()
  pageTitle?: string;

  @IsOptional()
  @IsString()
  pageSubtitle?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsIn(['festive-sale', 'normal-day', 'independence-day', 'durga-puja'])
  activeTemplate?: string;
}
