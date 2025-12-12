import { Injectable, Logger } from '@nestjs/common';
import { sendEmail } from '../utils/utils.functions';
import { getWelcomeEmailTemplate, getOrderConfirmationEmailTemplate, getNewsletterSubscriptionEmailTemplate, WelcomeEmailData, OrderConfirmationEmailData, NewsletterSubscriptionEmailData } from './email-templates';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  /**
   * Send welcome email to newly registered user
   * Non-blocking: runs asynchronously without blocking the API response
   */
  async sendWelcomeEmail(data: WelcomeEmailData): Promise<void> {
    try {
      const html = getWelcomeEmailTemplate(data);
      const subject = 'Welcome to Zoozu!';
      
      // Send email asynchronously (fire and forget)
      sendEmail(html, subject, data.userEmail)
        .then((result) => {
          if (result.success) {
            this.logger.log(`Welcome email sent successfully to ${data.userEmail}`);
          } else {
            this.logger.warn(`Failed to send welcome email to ${data.userEmail}: ${result.message}`);
          }
        })
        .catch((error) => {
          this.logger.error(`Error sending welcome email to ${data.userEmail}:`, error);
        });
    } catch (error) {
      this.logger.error(`Error preparing welcome email for ${data.userEmail}:`, error);
      // Don't throw - email failure shouldn't break registration
    }
  }

  /**
   * Send order confirmation email after successful payment
   * Non-blocking: runs asynchronously without blocking the API response
   */
  async sendOrderConfirmationEmail(data: OrderConfirmationEmailData): Promise<void> {
    try {
      const html = getOrderConfirmationEmailTemplate(data);
      const subject = `Order Confirmation - ${data.orderNumber}`;
      
      // Send email asynchronously (fire and forget)
      sendEmail(html, subject, data.userEmail)
        .then((result) => {
          if (result.success) {
            this.logger.log(`Order confirmation email sent successfully to ${data.userEmail} for order ${data.orderNumber}`);
          } else {
            this.logger.warn(`Failed to send order confirmation email to ${data.userEmail}: ${result.message}`);
          }
        })
        .catch((error) => {
          this.logger.error(`Error sending order confirmation email to ${data.userEmail}:`, error);
        });
    } catch (error) {
      this.logger.error(`Error preparing order confirmation email for ${data.userEmail}:`, error);
      // Don't throw - email failure shouldn't break order processing
    }
  }

  /**
   * Send newsletter subscription confirmation email
   * Non-blocking: runs asynchronously without blocking the API response
   */
  async sendNewsletterSubscriptionEmail(data: NewsletterSubscriptionEmailData): Promise<void> {
    try {
      const html = getNewsletterSubscriptionEmailTemplate(data);
      const subject = 'Welcome to the Inner Circle!';
      
      // Send email asynchronously (fire and forget)
      sendEmail(html, subject, data.userEmail)
        .then((result) => {
          if (result.success) {
            this.logger.log(`Newsletter subscription email sent successfully to ${data.userEmail}`);
          } else {
            this.logger.warn(`Failed to send newsletter subscription email to ${data.userEmail}: ${result.message}`);
          }
        })
        .catch((error) => {
          this.logger.error(`Error sending newsletter subscription email to ${data.userEmail}:`, error);
        });
    } catch (error) {
      this.logger.error(`Error preparing newsletter subscription email for ${data.userEmail}:`, error);
      // Don't throw - email failure shouldn't break subscription
    }
  }
}

