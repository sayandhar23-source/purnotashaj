import { IsEmail, MaxLength } from 'class-validator';
import { NormalizeEmail } from '../common/utils/transforms';

export class EmailDto {
  @NormalizeEmail()
  @IsEmail()
  @MaxLength(254)
  email: string;
}
