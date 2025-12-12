import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AdminAuthGuard } from '../auth/guards/admin-auth.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminService } from './admin.service';
import { BaseResponseTypeDTO } from '../utils';
import { HttpStatus } from '@nestjs/common';

@ApiTags('Admin - Newsletter')
@Controller('admin/newsletter')
@UseGuards(JwtAuthGuard, AdminAuthGuard)
@ApiBearerAuth()
export class AdminNewsletterController {
  constructor(private readonly adminService: AdminService) {}

  @Get('subscribers')
  @ApiOperation({ summary: 'Get all newsletter subscribers' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Subscribers retrieved successfully' })
  async getAllSubscribers(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ): Promise<BaseResponseTypeDTO> {
    return this.adminService.getAllNewsletterSubscribers(page, limit);
  }
}

