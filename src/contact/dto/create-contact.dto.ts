import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEmail, IsOptional } from 'class-validator';

export class CreateContactDto {
  @ApiProperty({ example: 'John Doe', description: 'Full name of the person contacting' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'john.doe@example.com', description: 'Email address' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'Product Inquiry', required: false, description: 'Subject of the message' })
  @IsString()
  @IsOptional()
  subject?: string;

  @ApiProperty({ example: 'I would like to know more about your products...', description: 'Message content' })
  @IsString()
  @IsNotEmpty()
  message: string;
}

