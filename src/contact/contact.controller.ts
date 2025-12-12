import { Controller, Get, Post, Patch, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBody } from '@nestjs/swagger';
import { ContactService } from './contact.service';
import { BaseResponseTypeDTO } from '../utils';
import { CreateContactDto } from './dto/create-contact.dto';

@ApiTags('Contact')
@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Get('info')
  @ApiOperation({ summary: 'Get company contact information' })
  @ApiResponse({ status: 200, description: 'Contact information retrieved successfully' })
  async getContactInfo(): Promise<BaseResponseTypeDTO> {
    return this.contactService.getContactInfo();
  }

  @Post()
  @ApiOperation({ summary: 'Submit a contact message' })
  @ApiBody({ type: CreateContactDto })
  @ApiResponse({ status: 201, description: 'Contact message submitted successfully' })
  async create(@Body() contactData: CreateContactDto): Promise<BaseResponseTypeDTO> {
    return this.contactService.create(contactData);
  }

  @Get()
  @ApiOperation({ summary: 'Get all contact messages (Admin only)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Contact messages retrieved successfully' })
  async findAll(@Query('page') page?: number, @Query('limit') limit?: number): Promise<BaseResponseTypeDTO> {
    return this.contactService.findAll(page || 1, limit || 20);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark contact message as read (Admin only)' })
  @ApiResponse({ status: 200, description: 'Contact message marked as read' })
  async markAsRead(@Param('id') id: string): Promise<BaseResponseTypeDTO> {
    return this.contactService.markAsRead(id);
  }
}

