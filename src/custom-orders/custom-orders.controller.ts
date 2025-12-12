import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { CustomOrdersService } from './custom-orders.service';
import { BaseResponseTypeDTO } from '../utils';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateCustomOrderDto } from './dto/create-custom-order.dto';

@ApiTags('Custom Orders')
@Controller('custom-orders')
export class CustomOrdersController {
  constructor(private readonly customOrdersService: CustomOrdersService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Submit a custom order request (requires authentication)' })
  @ApiResponse({ status: 201, description: 'Custom order request submitted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized - authentication required' })
  async create(@Body() createCustomOrderDto: CreateCustomOrderDto, @Request() req): Promise<BaseResponseTypeDTO> {
    return this.customOrdersService.create(req.user.id, createCustomOrderDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get custom orders' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Custom orders retrieved successfully' })
  async findAll(@Request() req, @Query('page') page?: number, @Query('limit') limit?: number): Promise<BaseResponseTypeDTO> {
    return this.customOrdersService.findAll(req.user?.id, page || 1, limit || 10);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update custom order status (Admin only)' })
  @ApiResponse({ status: 200, description: 'Custom order status updated successfully' })
  async updateStatus(@Param('id') id: string, @Body() body: { status: string; quote?: number }): Promise<BaseResponseTypeDTO> {
    return this.customOrdersService.updateStatus(id, body.status, body.quote);
  }
}

