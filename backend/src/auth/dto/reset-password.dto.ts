import { IsEmail, IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { NormalizeEmail } from '../../common/utils/transforms';

export class ResetPasswordDto {
  @NormalizeEmail()
  @IsEmail()
  @MaxLength(254)
  email: string;

  @Matches(/^\d{6}$/, { message: 'The code is 6 digits.' })
  code: string;

  @IsString()
  @MinLength(8)
  @MaxLength(72)
  newPassword: string;
}
