import { IsEmail, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { NormalizeEmail, Trim } from '../../common/utils/transforms';

export class UpdateProfileDto {
  @IsOptional()
  @Trim()
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  name?: string;
}

export class ChangeEmailDto {
  @NormalizeEmail()
  @IsEmail()
  @MaxLength(254)
  newEmail: string;

  @IsString()
  @MaxLength(256)
  currentPassword: string;
}

export class ChangePasswordDto {
  @IsString()
  @MaxLength(256)
  currentPassword: string;

  @IsString()
  @MinLength(8)
  @MaxLength(72)
  newPassword: string;
}
