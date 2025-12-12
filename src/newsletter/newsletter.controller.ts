import { Controller, Post, Body, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { NewsletterService } from './newsletter.service';
import { SubscribeNewsletterDto } from './dto/subscribe-newsletter.dto';
import { BaseResponseTypeDTO } from '../utils';

@ApiTags('Newsletter')
@Controller('newsletter')
export class NewsletterController {
  constructor(private readonly newsletterService: NewsletterService) {}

  @Post('subscribe')
  @ApiOperation({ summary: 'Subscribe to newsletter' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Successfully subscribed to newsletter',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Email already subscribed',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid email or validation error',
  })
  async subscribe(
    @Body() subscribeDto: SubscribeNewsletterDto,
  ): Promise<BaseResponseTypeDTO> {
    return this.newsletterService.subscribe(subscribeDto);
  }

  @Post('unsubscribe')
  @ApiOperation({ summary: 'Unsubscribe from newsletter' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Successfully unsubscribed from newsletter',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Email not found or invalid',
  })
  async unsubscribe(@Body('email') email: string): Promise<BaseResponseTypeDTO> {
    return this.newsletterService.unsubscribe(email);
  }
}

