import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsDateString } from 'class-validator';

export class CreateBespokeFittingDto {
  @ApiProperty({ example: 'John Doe', description: 'Full name of the person booking the fitting' })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({ example: 'john.doe@example.com', description: 'Email address' })
  @IsString()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: '+2348012345678', description: 'Phone number' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ example: '2024-10-11', description: 'Date of the fitting appointment (ISO date string)' })
  @IsDateString()
  @IsNotEmpty()
  date: string;

  @ApiProperty({ example: '11:00 AM', description: 'Time slot for the fitting', enum: ['9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'] })
  @IsString()
  @IsNotEmpty()
  timeSlot: string;

  @ApiProperty({ example: 'Tell us about the event, palette, fit preferences, or any inspiration links.', required: false, description: 'Specific requests or notes for the fitting' })
  @IsString()
  @IsOptional()
  specificRequests?: string;
}

