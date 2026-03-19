import { IsString, IsNotEmpty, IsNumber, IsDateString, IsOptional, IsEnum } from 'class-validator';

export class CreatePaymentDto {
  @IsString()
  @IsNotEmpty()
  clientId: string;

  @IsNumber()
  amount: number;

  @IsEnum(['bank', 'cash', 'click', 'payme', 'card', 'transfer', 'other'])
  paymentMethod: string;

  @IsDateString()
  paymentDate: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  transactionId?: string;

  @IsOptional()
  @IsString()
  referenceNumber?: string;

  @IsOptional()
  @IsString()
  category?: string;
}
