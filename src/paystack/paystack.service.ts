import { Injectable, BadRequestException } from '@nestjs/common';
import axios from 'axios';

export interface InitializePaymentDto {
  email: string;
  amount: number;
  reference?: string;
  callback_url?: string;
  metadata?: Record<string, any>;
}

@Injectable()
export class PaystackService {
  private readonly secretKey: string;
  private readonly publicKey: string;
  private readonly baseUrl = 'https://api.paystack.co';

  constructor() {
    this.secretKey = process.env.PAYSTACK_SECRET_KEY || '';
    this.publicKey = process.env.PAYSTACK_PUBLIC_KEY || '';
  }

  async initializePayment(paymentData: InitializePaymentDto): Promise<any> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/transaction/initialize`,
        {
          email: paymentData.email,
          amount: paymentData.amount,
          reference: paymentData.reference,
          callback_url: paymentData.callback_url,
          metadata: paymentData.metadata || {},
        },
        {
          headers: {
            Authorization: `Bearer ${this.secretKey}`,
            'Content-Type': 'application/json',
          },
        },
      );

      if (response.data.status) {
        return {
          success: true,
          message: 'Payment initialized successfully',
          data: {
            authorization_url: response.data.data.authorization_url,
            access_code: response.data.data.access_code,
            reference: response.data.data.reference,
          },
        };
      }

      throw new BadRequestException(response.data.message || 'Failed to initialize payment');
    } catch (error: any) {
      throw new BadRequestException(
        error.response?.data?.message || 'Failed to initialize payment',
      );
    }
  }

  async verifyPayment(reference: string): Promise<any> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/transaction/verify/${reference}`,
        {
          headers: {
            Authorization: `Bearer ${this.secretKey}`,
          },
        },
      );

      return response.data;
    } catch (error: any) {
      throw new BadRequestException('Failed to verify payment');
    }
  }

  async getTransaction(reference: string): Promise<any> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/transaction/${reference}`,
        {
          headers: {
            Authorization: `Bearer ${this.secretKey}`,
          },
        },
      );

      return response.data;
    } catch (error: any) {
      throw new BadRequestException('Failed to retrieve transaction');
    }
  }

  async listTransactions(page: number = 1, perPage: number = 50): Promise<any> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/transaction`,
        {
          params: {
            page,
            perPage,
          },
          headers: {
            Authorization: `Bearer ${this.secretKey}`,
          },
        },
      );

      return response.data;
    } catch (error: any) {
      throw new BadRequestException('Failed to retrieve transactions');
    }
  }

  async handleWebhook(body: any, signature?: string): Promise<any> {
    try {
      // Verify webhook signature if provided
      if (signature && process.env.PAYSTACK_SECRET_KEY) {
        const crypto = require('crypto');
        const hash = crypto
          .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY)
          .update(JSON.stringify(body))
          .digest('hex');
        
        if (hash !== signature) {
          throw new BadRequestException('Invalid webhook signature');
        }
      }

      const event = body.event;
      const data = body.data;

      if (event === 'charge.success') {
        return {
          event,
          reference: data.reference,
          status: 'success',
          message: 'Payment successful',
          data,
        };
      }

      if (event === 'charge.failed') {
        return {
          event,
          reference: data.reference,
          status: 'failed',
          message: 'Payment failed',
          data,
        };
      }

      if (event === 'transfer.success') {
        return {
          event,
          message: 'Transfer successful',
          data,
        };
      }

      return {
        event,
        message: 'Webhook received',
        data,
      };
    } catch (error: any) {
      throw new BadRequestException('Failed to process webhook');
    }
  }

  getPublicKey(): string {
    return this.publicKey;
  }
}

