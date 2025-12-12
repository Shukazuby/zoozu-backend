import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiBody } from '@nestjs/swagger';
import { BespokeFittingsService } from './bespoke-fittings.service';
import { BaseResponseTypeDTO } from '../utils';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateBespokeFittingDto } from './dto/create-bespoke-fitting.dto';

@ApiTags('Bespoke Fittings')
@Controller('bespoke-fittings')
export class BespokeFittingsController {
  constructor(private readonly bespokeFittingsService: BespokeFittingsService) {}

  @Post()
  @ApiOperation({ summary: 'Book a bespoke fitting appointment' })
  @ApiBody({ type: CreateBespokeFittingDto })
  @ApiResponse({ status: 201, description: 'Appointment booked successfully' })
  async create(@Request() req, @Body() fittingData: CreateBespokeFittingDto): Promise<BaseResponseTypeDTO> {
    // If user is authenticated, include userId
    const userId = req.user?.id;
    return this.bespokeFittingsService.create(fittingData, userId);
  }

  @Get('available-slots')
  @ApiOperation({ summary: 'Get available time slots for a date' })
  @ApiQuery({ name: 'date', required: true })
  @ApiResponse({ status: 200, description: 'Available slots retrieved successfully' })
  async getAvailableSlots(@Query('date') date: string): Promise<BaseResponseTypeDTO> {
    return this.bespokeFittingsService.getAvailableSlots(date);
  }

  @Get('my-fittings')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user bespoke fittings' })
  @ApiResponse({ status: 200, description: 'Bespoke fittings retrieved successfully' })
  async getUserFittings(@Request() req): Promise<BaseResponseTypeDTO> {
    return this.bespokeFittingsService.getUserFittings(req.user.id);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update bespoke fitting status (Admin only)' })
  @ApiResponse({ status: 200, description: 'Status updated successfully' })
  async updateStatus(@Param('id') id: string, @Body() body: { status: string }): Promise<BaseResponseTypeDTO> {
    return this.bespokeFittingsService.updateStatus(id, body.status);
  }
}

