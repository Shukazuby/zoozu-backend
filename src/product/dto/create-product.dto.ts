import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, IsArray, IsOptional, IsBoolean } from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ example: 'The Lagos Edit Senator Set' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 85000 })
  @IsNumber()
  @IsNotEmpty()
  price: number;


  @ApiProperty({ example: 'Premium breathable fabric with intricate placket embroidery.' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ type: [String], example: ['https://cloudinary.com/image1', 'https://cloudinary.com/image2'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  images?: string[];

  @ApiProperty({ type: [String], example: ['Senator Sets', 'Ready-to-Wear'], required: false })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  categories?: string[];


  @ApiProperty({ example: 'men', required: false, default: 'men' })
  @IsString()
  @IsOptional()
  gender?: string;

  @ApiProperty({ type: [String], example: ['S', 'M', 'L', 'XL'], required: false })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  sizes?: string[];

  @ApiProperty({ type: [String], example: ['#115e2a', '#0c4cb0'], required: false })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  colors?: string[];

  @ApiProperty({ example: 10, required: false, default: 0 })
  @IsNumber()
  @IsOptional()
  stock?: number;

  @ApiProperty({ example: true, required: false, default: true })
  @IsBoolean()
  @IsOptional()
  isAvailable?: boolean;

  @ApiProperty({ example: false, required: false, default: false })
  @IsBoolean()
  @IsOptional()
  isBespoke?: boolean;

  @ApiProperty({ example: false, required: false, default: false })
  @IsBoolean()
  @IsOptional()
  isPreOrder?: boolean;

  @ApiProperty({ example: 'New Season', required: false })
  @IsString()
  @IsOptional()
  badge?: string;

  @ApiProperty({ example: 'Bespoke', required: false })
  @IsString()
  @IsOptional()
  tag?: string;

  @ApiProperty({ required: false, example: true })
  @IsBoolean()
  @IsOptional()
  isNew?: boolean;

  @ApiProperty({ required: false, example: true })
  @IsBoolean()
  @IsOptional()
  isFeatured?: boolean;
}

export class PaginationFilterDTO {
  @ApiProperty({
    required: false,
    description: 'Number of records per page',
    type: Number,
  })
  limit?: number;

  @ApiProperty({
    required: false,
    description: 'Page number for pagination',
    type: Number,
  })
  page?: number;

  @ApiProperty({
    required: false,
    description: 'Search term to filter the results',
    type: String,
  })
  search?: string;

  @ApiProperty({
    required: false,
    description: 'Category',
    type: String,
  })
  category?: string;

  @ApiProperty({
    required: false,
    description: 'Gender filter (men, women, unisex)',
    type: String,
  })
  gender?: string;

  @ApiProperty({
    required: false,
    description: 'Minimum price',
    type: Number,
  })
  minPrice?: number;

  @ApiProperty({
    required: false,
    description: 'Maximum price',
    type: Number,
  })
  maxPrice?: number;

  @ApiProperty({
    required: false,
    description: 'Availability filter (in-stock, pre-order, bespoke)',
    type: String,
  })
  availability?: string;

  @ApiProperty({
    required: false,
    description: 'Sort by (price-low, price-high, popular, name)',
    type: String,
  })
  sortBy?: string;

  @ApiProperty({
    required: false,
    description: 'Filter by active status (true/false)',
    type: Boolean,
  })
  @IsOptional()
  isActive?: boolean | string;

  @ApiProperty({
    required: false,
    description: 'Filter by new arrivals (true/false)',
    type: Boolean,
  })
  @IsOptional()
  isNew?: boolean | string;

  @ApiProperty({
    required: false,
    description: 'Filter by featured products (true/false)',
    type: Boolean,
  })
  @IsOptional()
  isFeatured?: boolean | string;
}
