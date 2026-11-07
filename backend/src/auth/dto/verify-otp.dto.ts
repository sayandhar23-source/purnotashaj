import { IsEmail, Matches, MaxLength } from 'class-validator';
import { NormalizeEmail } from '../../common/utils/transforms';

export class VerifyOtpDto {
  @NormalizeEmail()
  @IsEmail()
  @MaxLength(254)
  email: string;

  @Matches(/^\d{6}$/, { message: 'The code is 6 digits.' })
  code: string;
}
