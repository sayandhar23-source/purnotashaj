import { IsEmail, MaxLength } from 'class-validator';
import { NormalizeEmail } from '../../common/utils/transforms';

// resend-otp used a raw @Body('email') with no validation at all, which let an
// attacker send an object like {"$ne": null} instead of an email address.
export class ResendOtpDto {
  @NormalizeEmail()
  @IsEmail()
  @MaxLength(254)
  email: string;
}
