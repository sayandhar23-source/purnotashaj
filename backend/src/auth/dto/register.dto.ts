import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';
import { NormalizeEmail, Trim } from '../../common/utils/transforms';

export class RegisterDto {
  @Trim()
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  name: string;

  @NormalizeEmail()
  @IsEmail()
  @MaxLength(254)
  email: string;

  // bcrypt only uses the first 72 bytes, and hashing huge strings is a CPU-cost attack
  @IsString()
  @MinLength(8)
  @MaxLength(72)
  password: string;
}
