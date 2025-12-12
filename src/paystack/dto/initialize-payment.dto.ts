import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNumber, IsString, IsOptional, IsObject, Min } from 'class-validator';

export class InitializePaymentDto {
  @ApiProperty({ example: 'user@example.com', description: 'Customer email address' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 50000, description: 'Amount in kobo (NGN). e.g., 50000 = ₦500.00' })
  @IsNumber()
  @Min(1)
  amount: number;

  @ApiProperty({ example: 'ZOZ-1234567890', required: false, description: 'Unique transaction reference' })
  @IsString()
  @IsOptional()
  reference?: string;

  @ApiProperty({ example: 'https://example.com/callback', required: false, description: 'Callback URL after payment' })
  @IsString()
  @IsOptional()
  callback_url?: string;

  @ApiProperty({ required: false, description: 'Additional metadata' })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}

