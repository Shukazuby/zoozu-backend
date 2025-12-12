import { Controller, Get, Patch, Delete, Param, Query, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AdminAuthGuard } from '../auth/guards/admin-auth.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminService } from './admin.service';
import { BaseResponseTypeDTO } from '../utils';
import { HttpStatus } from '@nestjs/common';

@ApiTags('Admin - Users')
@Controller('admin/users')
@UseGuards(JwtAuthGuard, AdminAuthGuard)
@ApiBearerAuth()
export class AdminUsersController {
  constructor(private readonly adminService: AdminService) {}

  @Get()
  @ApiOperation({ summary: 'Get all users with pagination' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Users retrieved successfully' })
  async getAllUsers(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
  ): Promise<BaseResponseTypeDTO> {
    return this.adminService.getAllUsers(page, limit, search);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'User retrieved successfully' })
  async getUserById(@Param('id') id: string): Promise<BaseResponseTypeDTO> {
    return this.adminService.getUserById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update user' })
  @ApiResponse({ status: HttpStatus.OK, description: 'User updated successfully' })
  async updateUser(
    @Param('id') id: string,
    @Body() updateData: any,
  ): Promise<BaseResponseTypeDTO> {
    return this.adminService.updateUser(id, updateData);
  }

  @Patch(':id/suspend')
  @ApiOperation({ summary: 'Suspend or activate user' })
  @ApiResponse({ status: HttpStatus.OK, description: 'User status updated successfully' })
  async toggleUserStatus(
    @Param('id') id: string,
    @Body() body: { isActive: boolean },
  ): Promise<BaseResponseTypeDTO> {
    return this.adminService.toggleUserStatus(id, body.isActive);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete user' })
  @ApiResponse({ status: HttpStatus.OK, description: 'User deleted successfully' })
  async deleteUser(@Param('id') id: string): Promise<BaseResponseTypeDTO> {
    return this.adminService.deleteUser(id);
  }
}

