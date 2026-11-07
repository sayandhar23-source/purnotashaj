import { IsIn, IsNumber, IsOptional, IsString, Matches, Max, MaxLength, Min, MinLength, ValidateIf } from 'class-validator';
import { Transform } from 'class-transformer';
import { Trim } from '../../common/utils/transforms';

export class WithdrawDto {
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(1)
  @Max(1000000)
  amount: number;

  @IsIn(['upi', 'bank'])
  method: 'upi' | 'bank';

  @ValidateIf((o) => o.method === 'upi')
  @Trim()
  @Matches(/^[a-zA-Z0-9.\-_]{2,64}@[a-zA-Z]{2,64}$/, { message: 'Please enter a valid UPI ID (like name@bank).' })
  upiId?: string;

  @ValidateIf((o) => o.method === 'bank')
  @Trim()
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  bankAccountName?: string;

  @ValidateIf((o) => o.method === 'bank')
  @Trim()
  @Matches(/^\d{6,18}$/, { message: 'Please enter a valid bank account number.' })
  bankAccountNumber?: string;

  @ValidateIf((o) => o.method === 'bank')
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toUpperCase() : value))
  @Matches(/^[A-Z]{4}0[A-Z0-9]{6}$/, { message: 'Please enter a valid IFSC code.' })
  bankIfsc?: string;
}

export class UpdateWithdrawalDto {
  @IsIn(['paid', 'rejected'])
  status: 'paid' | 'rejected';

  @IsOptional()
  @IsString()
  @MaxLength(300)
  adminNote?: string;
}
