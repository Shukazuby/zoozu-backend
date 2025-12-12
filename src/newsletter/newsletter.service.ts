import { Injectable, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Newsletter, NewsletterDocument } from '../schemas/newsletter.schema';
import { SubscribeNewsletterDto } from './dto/subscribe-newsletter.dto';
import { BaseResponseTypeDTO } from '../utils';
import { HttpStatus } from '@nestjs/common';
import { EmailService } from '../email/email.service';

@Injectable()
export class NewsletterService {
  constructor(
    @InjectModel(Newsletter.name)
    private readonly newsletterModel: Model<NewsletterDocument>,
    private readonly emailService: EmailService,
  ) {}

  async subscribe(subscribeDto: SubscribeNewsletterDto): Promise<BaseResponseTypeDTO> {
    try {
      // Normalize email to lowercase
      const email = subscribeDto.email.toLowerCase().trim();

      // Check if email already exists
      const existingSubscription = await this.newsletterModel.findOne({ email });

      if (existingSubscription) {
        if (existingSubscription.isActive) {
          throw new ConflictException('This email is already subscribed to our newsletter.');
        } else {
          // Reactivate subscription if it was previously unsubscribed
          existingSubscription.isActive = true;
          if (subscribeDto.name) {
            existingSubscription.name = subscribeDto.name;
          }
          existingSubscription.subscribedAt = new Date();
          await existingSubscription.save();

          // Send welcome email asynchronously (non-blocking)
          this.emailService.sendNewsletterSubscriptionEmail({
            userName: existingSubscription.name,
            userEmail: existingSubscription.email,
          }).catch((error) => {
            // Log error but don't fail subscription
            console.error('Failed to send newsletter subscription email:', error);
          });

          return {
            success: true,
            code: HttpStatus.OK,
            message: 'Thank you for rejoining the Inner Circle!',
            data: {
              email: existingSubscription.email,
              name: existingSubscription.name,
            },
          };
        }
      }

      // Create new subscription
      const newsletter = new this.newsletterModel({
        email,
        name: subscribeDto.name?.trim(),
        isActive: true,
        subscribedAt: new Date(),
      });

      await newsletter.save();

      // Send welcome email asynchronously (non-blocking)
      this.emailService.sendNewsletterSubscriptionEmail({
        userName: newsletter.name,
        userEmail: newsletter.email,
      }).catch((error) => {
        // Log error but don't fail subscription
        console.error('Failed to send newsletter subscription email:', error);
      });

      return {
        success: true,
        code: HttpStatus.CREATED,
        message: 'Thank you for joining the Inner Circle!',
        data: {
          email: newsletter.email,
          name: newsletter.name,
        },
      };
    } catch (error: any) {
      if (error instanceof ConflictException) {
        throw error;
      }
      if (error.code === 11000) {
        // MongoDB duplicate key error
        throw new ConflictException('This email is already subscribed to our newsletter.');
      }
      throw new BadRequestException(
        error.message || 'Failed to subscribe to newsletter. Please try again.',
      );
    }
  }

  async unsubscribe(email: string): Promise<BaseResponseTypeDTO> {
    try {
      const normalizedEmail = email.toLowerCase().trim();
      const subscription = await this.newsletterModel.findOne({ email: normalizedEmail });

      if (!subscription) {
        throw new BadRequestException('Email not found in our newsletter list.');
      }

      if (!subscription.isActive) {
        return {
          success: true,
          code: HttpStatus.OK,
          message: 'You are already unsubscribed.',
        };
      }

      subscription.isActive = false;
      await subscription.save();

      return {
        success: true,
        code: HttpStatus.OK,
        message: 'You have been successfully unsubscribed from our newsletter.',
      };
    } catch (error: any) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to unsubscribe. Please try again.');
    }
  }
}

