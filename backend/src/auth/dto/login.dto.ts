import { IsEmail, IsString, MaxLength } from 'class-validator';
import { NormalizeEmail } from '../../common/utils/transforms';

export class LoginDto {
  @NormalizeEmail()
  @IsEmail()
  @MaxLength(254)
  email: string;

  // Generous limit on purpose: accounts created before the 72-char rule must still be able to log in
  @IsString()
  @MaxLength(256)
  password: string;
}
