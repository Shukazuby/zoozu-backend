import { Controller, Get, Post, Delete, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SavedItemsService } from './saved-items.service';
import { BaseResponseTypeDTO } from '../utils';

@ApiTags('Saved Items')
@Controller('saved-items')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SavedItemsController {
  constructor(private readonly savedItemsService: SavedItemsService) {}

  @Post(':productId')
  @ApiOperation({ summary: 'Add product to saved items' })
  @ApiResponse({ status: 201, description: 'Item added to saved items successfully' })
  async addToSavedItems(@Request() req, @Param('productId') productId: string): Promise<BaseResponseTypeDTO> {
    return this.savedItemsService.addToSavedItems(req.user.id, productId);
  }

  @Get()
  @ApiOperation({ summary: 'Get user saved items' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Saved items retrieved successfully' })
  async getSavedItems(@Request() req, @Query('page') page?: number, @Query('limit') limit?: number): Promise<BaseResponseTypeDTO> {
    return this.savedItemsService.getSavedItems(req.user.id, page || 1, limit || 12);
  }

  @Delete(':productId')
  @ApiOperation({ summary: 'Remove product from saved items' })
  @ApiResponse({ status: 200, description: 'Item removed from saved items successfully' })
  async removeFromSavedItems(@Request() req, @Param('productId') productId: string): Promise<BaseResponseTypeDTO> {
    return this.savedItemsService.removeFromSavedItems(req.user.id, productId);
  }

  @Get('check/:productId')
  @ApiOperation({ summary: 'Check if product is saved' })
  @ApiResponse({ status: 200, description: 'Check completed' })
  async checkIfSaved(@Request() req, @Param('productId') productId: string): Promise<BaseResponseTypeDTO> {
    return this.savedItemsService.checkIfSaved(req.user.id, productId);
  }
}

