import { Controller, Get, Post, Body, Param, Headers, RawBodyRequest, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { PaystackService } from './paystack.service';
import { InitializePaymentDto } from './dto/initialize-payment.dto';
import { BaseResponseTypeDTO } from '../utils';
import { HttpStatus } from '@nestjs/common';

@ApiTags('Paystack')
@Controller('paystack')
export class PaystackController {
  constructor(private readonly paystackService: PaystackService) {}

  @Post('initialize')
  @ApiOperation({ summary: 'Initialize Paystack payment' })
  @ApiResponse({ status: 200, description: 'Payment initialized successfully' })
  @ApiResponse({ status: 400, description: 'Failed to initialize payment' })
  async initializePayment(@Body() paymentData: InitializePaymentDto): Promise<BaseResponseTypeDTO> {
    const result = await this.paystackService.initializePayment(paymentData);
    return {
      success: result.success,
      code: HttpStatus.OK,
      message: result.message,
      data: result.data,
    };
  }

  @Get('verify/:reference')
  @ApiOperation({ summary: 'Verify Paystack payment' })
  @ApiResponse({ status: 200, description: 'Payment verified successfully' })
  @ApiResponse({ status: 400, description: 'Failed to verify payment' })
  async verifyPayment(@Param('reference') reference: string): Promise<BaseResponseTypeDTO> {
    const result = await this.paystackService.verifyPayment(reference);
    return {
      success: result.status,
      code: HttpStatus.OK,
      message: result.message,
      data: result.data,
    };
  }

  @Get('transaction/:reference')
  @ApiOperation({ summary: 'Get transaction details' })
  @ApiResponse({ status: 200, description: 'Transaction retrieved successfully' })
  async getTransaction(@Param('reference') reference: string): Promise<BaseResponseTypeDTO> {
    const result = await this.paystackService.getTransaction(reference);
    return {
      success: result.status,
      code: HttpStatus.OK,
      message: 'Transaction retrieved successfully',
      data: result.data,
    };
  }

  @Get('transactions')
  @ApiOperation({ summary: 'List all transactions' })
  @ApiResponse({ status: 200, description: 'Transactions retrieved successfully' })
  async listTransactions(): Promise<BaseResponseTypeDTO> {
    const result = await this.paystackService.listTransactions();
    return {
      success: result.status,
      code: HttpStatus.OK,
      message: 'Transactions retrieved successfully',
      data: result.data,
    };
  }

  @Get('public-key')
  @ApiOperation({ summary: 'Get Paystack public key' })
  @ApiResponse({ status: 200, description: 'Public key retrieved successfully' })
  async getPublicKey(): Promise<BaseResponseTypeDTO> {
    return {
      success: true,
      code: HttpStatus.OK,
      message: 'Public key retrieved successfully',
      data: {
        publicKey: this.paystackService.getPublicKey(),
      },
    };
  }

  @Post('webhook')
  @ApiOperation({ summary: 'Paystack webhook endpoint' })
  @ApiResponse({ status: 200, description: 'Webhook processed successfully' })
  @ApiBody({ schema: { type: 'object' } })
  async webhook(@Req() req: RawBodyRequest<Request>, @Headers('x-paystack-signature') signature?: string): Promise<BaseResponseTypeDTO> {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const result = await this.paystackService.handleWebhook(body, signature);
    return {
      success: true,
      code: HttpStatus.OK,
      message: 'Webhook processed successfully',
      data: result,
    };
  }
}

