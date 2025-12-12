import { Controller, Get, Patch, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UsersService } from './users.service';
import { BaseResponseTypeDTO } from '../utils';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  @ApiOperation({ summary: 'Get user profile' })
  @ApiResponse({ status: 200, description: 'Profile retrieved successfully' })
  async getProfile(@Request() req): Promise<BaseResponseTypeDTO> {
    const user = await this.usersService.findById(req.user.id);
    return {
      success: true,
      code: 200,
      message: 'Profile retrieved successfully',
      data: user,
    };
  }

  @Patch('profile')
  @ApiOperation({ summary: 'Update user profile' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  async updateProfile(@Request() req, @Body() updateData: any): Promise<BaseResponseTypeDTO> {
    return this.usersService.updateProfile(req.user.id, updateData);
  }

  @Patch('change-password')
  @ApiOperation({ summary: 'Change user password' })
  @ApiResponse({ status: 200, description: 'Password changed successfully' })
  async changePassword(@Request() req, @Body() body: { oldPassword: string; newPassword: string }): Promise<BaseResponseTypeDTO> {
    return this.usersService.changePassword(req.user.id, body.oldPassword, body.newPassword);
  }
}

