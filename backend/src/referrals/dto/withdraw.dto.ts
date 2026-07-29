import { IsIn, IsNumber, IsOptional, IsString, Min, ValidateIf } from 'class-validator';

export class WithdrawDto {
  @IsNumber()
  @Min(1)
  amount: number;

  @IsIn(['upi', 'bank'])
  method: 'upi' | 'bank';

  @ValidateIf((o) => o.method === 'upi')
  @IsString()
  upiId?: string;

  @ValidateIf((o) => o.method === 'bank')
  @IsString()
  bankAccountName?: string;

  @ValidateIf((o) => o.method === 'bank')
  @IsString()
  bankAccountNumber?: string;

  @ValidateIf((o) => o.method === 'bank')
  @IsString()
  bankIfsc?: string;
}

export class UpdateWithdrawalDto {
  @IsIn(['paid', 'rejected'])
  status: 'paid' | 'rejected';

  @IsOptional()
  @IsString()
  adminNote?: string;
}
