import { Controller, Get, Post, Body, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ShippingService } from './shipping.service';
import { CreateShippingDto } from './dto/create-shipping.dto';
import { BaseResponseTypeDTO } from 'src/utils';

@ApiTags('Shipping')
@Controller('shipping')
export class ShippingController {
  constructor(private readonly shippingService: ShippingService) {}

  @Post()
  @ApiOperation({ summary: 'Create shipping cost configuration' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Shipping cost saved' })
  create(@Body() payload: CreateShippingDto): Promise<BaseResponseTypeDTO> {
    return this.shippingService.create(payload);
  }

  @Get('current')
  @ApiOperation({ summary: 'Get current shipping cost' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Shipping cost fetched' })
  getCurrent(): Promise<BaseResponseTypeDTO> {
    return this.shippingService.getCurrent();
  }
}

