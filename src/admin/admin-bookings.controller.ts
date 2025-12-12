import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AdminAuthGuard } from '../auth/guards/admin-auth.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminService } from './admin.service';
import { BaseResponseTypeDTO } from '../utils';
import { HttpStatus } from '@nestjs/common';

@ApiTags('Admin - Bookings')
@Controller('admin/bookings')
@UseGuards(JwtAuthGuard, AdminAuthGuard)
@ApiBearerAuth()
export class AdminBookingsController {
  constructor(private readonly adminService: AdminService) {}

  @Get('fittings')
  @ApiOperation({ summary: 'Get all bespoke fitting bookings' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Bookings retrieved successfully' })
  async getAllFittings(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ): Promise<BaseResponseTypeDTO> {
    return this.adminService.getAllBookings(page, limit);
  }

  @Get('custom-orders')
  @ApiOperation({ summary: 'Get all custom orders' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Custom orders retrieved successfully' })
  async getAllCustomOrders(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ): Promise<BaseResponseTypeDTO> {
    return this.adminService.getAllCustomOrders(page, limit);
  }
}

