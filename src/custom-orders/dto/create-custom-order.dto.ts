import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsNumber, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class MeasurementsDto {
  @ApiProperty({ required: false, description: 'Chest measurement in inches' })
  @IsOptional()
  @IsNumber()
  chest?: number;

  @ApiProperty({ required: false, description: 'Waist measurement in inches' })
  @IsOptional()
  @IsNumber()
  waist?: number;

  @ApiProperty({ required: false, description: 'Hip measurement in inches' })
  @IsOptional()
  @IsNumber()
  hip?: number;

  @ApiProperty({ required: false, description: 'Shoulder measurement in inches' })
  @IsOptional()
  @IsNumber()
  shoulder?: number;

  @ApiProperty({ required: false, description: 'Sleeve length in inches' })
  @IsOptional()
  @IsNumber()
  sleeveLength?: number;

  @ApiProperty({ required: false, description: 'Garment length in inches' })
  @IsOptional()
  @IsNumber()
  garmentLength?: number;
}

export class CreateCustomOrderDto {
  @ApiProperty({ example: '6651f9d8c0a5a2b3c4d5e6f7', required: false, description: 'Product ID if this custom order is tied to a specific product' })
  @IsOptional()
  @IsString()
  productId?: string;

  @ApiProperty({ example: 'Wedding guest, business event, casual, etc.', description: 'Occasion or use case for the garment' })
  @IsString()
  @IsNotEmpty()
  occasion: string;

  @ApiProperty({ example: '2 weeks', description: 'Preferred delivery window', enum: ['2 weeks', '3-4 weeks', '5-6 weeks', 'Flexible'] })
  @IsString()
  @IsNotEmpty()
  deliveryWindow: string;

  @ApiProperty({ example: '₦80,000 - ₦150,000', required: false, description: 'Budget range (optional)' })
  @IsString()
  @IsOptional()
  budgetRange?: string;

  @ApiProperty({ example: 'Senator Set', description: 'Type of garment', enum: ['Senator Set', 'Agbada', 'Ankara Dress', 'Kaftan Tunic', 'Other'] })
  @IsString()
  @IsNotEmpty()
  garmentType: string;

  @ApiProperty({ type: MeasurementsDto, required: false, description: 'Custom measurements in inches' })
  @IsOptional()
  @ValidateNested()
  @Type(() => MeasurementsDto)
  measurements?: MeasurementsDto;

  @ApiProperty({ example: 'Silk', required: false, description: 'Preferred fabric type', enum: ['Silk', 'Linen', 'Cashmere', 'Ankara', 'Other'] })
  @IsString()
  @IsOptional()
  preferredFabric?: string;

  @ApiProperty({ type: [String], example: ['#1f2937', '#0f766e'], required: false, description: 'Preferred colors (hex codes or color names)' })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  preferredColors?: string[];

  @ApiProperty({ example: 'Describe your ideal design, specific embroidery, fit preferences...', required: false, description: 'Detailed design requests and specifications' })
  @IsString()
  @IsOptional()
  designRequests?: string;
}

