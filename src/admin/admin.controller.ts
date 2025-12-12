import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AdminAuthGuard } from '../auth/guards/admin-auth.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminService } from './admin.service';
import { BaseResponseTypeDTO } from '../utils';
import { HttpStatus } from '@nestjs/common';

@ApiTags('Admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, AdminAuthGuard)
@ApiBearerAuth()
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard/stats')
  @ApiOperation({ summary: 'Get dashboard statistics' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Dashboard stats retrieved successfully' })
  async getDashboardStats(): Promise<BaseResponseTypeDTO> {
    return this.adminService.getDashboardStats();
  }

  @Get('analytics/sales')
  @ApiOperation({ summary: 'Get sales analytics' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Sales analytics retrieved successfully' })
  async getSalesAnalytics(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<BaseResponseTypeDTO> {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    return this.adminService.getSalesAnalytics(start, end);
  }
}

