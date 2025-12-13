import { Controller, Get, Patch, Param, Query, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AdminAuthGuard } from '../auth/guards/admin-auth.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminService } from './admin.service';
import { BaseResponseTypeDTO } from '../utils';
import { HttpStatus } from '@nestjs/common';

@ApiTags('Admin - Orders')
@Controller('admin/orders')
@UseGuards(JwtAuthGuard, AdminAuthGuard)
@ApiBearerAuth()
export class AdminOrdersController {
  constructor(private readonly adminService: AdminService) {}

  @Get()
  @ApiOperation({ summary: 'Get all orders with filters' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Orders retrieved successfully' })
  async getAllOrders(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: string,
    @Query('paymentStatus') paymentStatus?: string,
    @Query('search') search?: string,
  ): Promise<BaseResponseTypeDTO> {
    return this.adminService.getAllOrders(page, limit, { status, paymentStatus, search });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get order by ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Order retrieved successfully' })
  async getOrderById(@Param('id') id: string): Promise<BaseResponseTypeDTO> {
    return this.adminService.getOrderById(id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update order status' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Order status updated successfully' })
  async updateOrderStatus(
    @Param('id') id: string,
    @Body() body: { status: string },
  ): Promise<BaseResponseTypeDTO> {
    return this.adminService.updateOrderStatus(id, body.status);
  }
}

