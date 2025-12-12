import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AddressesService } from './addresses.service';
import { BaseResponseTypeDTO } from '../utils';

@ApiTags('Addresses')
@Controller('addresses')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AddressesController {
  constructor(private readonly addressesService: AddressesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new address' })
  @ApiResponse({ status: 201, description: 'Address created successfully' })
  async create(@Request() req, @Body() addressData: any): Promise<BaseResponseTypeDTO> {
    return this.addressesService.create(req.user.id, addressData);
  }

  @Get()
  @ApiOperation({ summary: 'Get all user addresses' })
  @ApiResponse({ status: 200, description: 'Addresses retrieved successfully' })
  async findAll(@Request() req): Promise<BaseResponseTypeDTO> {
    return this.addressesService.findAll(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get address by ID' })
  @ApiResponse({ status: 200, description: 'Address retrieved successfully' })
  async findOne(@Request() req, @Param('id') id: string): Promise<BaseResponseTypeDTO> {
    return this.addressesService.findOne(id, req.user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update address' })
  @ApiResponse({ status: 200, description: 'Address updated successfully' })
  async update(@Request() req, @Param('id') id: string, @Body() updateData: any): Promise<BaseResponseTypeDTO> {
    return this.addressesService.update(id, req.user.id, updateData);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete address' })
  @ApiResponse({ status: 200, description: 'Address deleted successfully' })
  async delete(@Request() req, @Param('id') id: string): Promise<BaseResponseTypeDTO> {
    return this.addressesService.delete(id, req.user.id);
  }
}

