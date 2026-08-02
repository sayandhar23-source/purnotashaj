import { IsOptional, IsString } from 'class-validator';

export class ImageMetaDto {
  @IsString()
  url: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  alt?: string;
}
