import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Contact, ContactDocument } from '../schemas/contact.schema';
import { BaseResponseTypeDTO } from '../utils';
import { HttpStatus } from '@nestjs/common';

@Injectable()
export class ContactService {
  constructor(@InjectModel(Contact.name) private contactModel: Model<ContactDocument>) {}

  async getContactInfo(): Promise<BaseResponseTypeDTO> {
    // Return company contact information from environment variables or defaults
    const contactInfo = {
      email: process.env.CONTACT_EMAIL || 'info@zoozu_ng.com',
      phone: process.env.CONTACT_PHONE || '+234 706 820 9546',
      address: process.env.CONTACT_ADDRESS || '123 Fashion Ave, Ikoyi, Lagos, Nigeria',
      whatsapp: process.env.CONTACT_WHATSAPP || process.env.CONTACT_PHONE || '+234 706 820 9546',
      socialLinks: {
        facebook: process.env.SOCIAL_FACEBOOK || '',
        instagram: process.env.SOCIAL_INSTAGRAM || '',
        twitter: process.env.SOCIAL_TWITTER || '',
        linkedin: process.env.SOCIAL_LINKEDIN || '',
      },
    };

    return {
      success: true,
      code: HttpStatus.OK,
      message: 'Contact information retrieved successfully',
      data: contactInfo,
    };
  }

  async create(contactData: any): Promise<BaseResponseTypeDTO> {
    const contact = new this.contactModel(contactData);
    await contact.save();

    return {
      success: true,
      code: HttpStatus.CREATED,
      message: 'Contact message submitted successfully',
      data: contact,
    };
  }

  async findAll(page: number = 1, limit: number = 20): Promise<BaseResponseTypeDTO> {
    const skip = (page - 1) * limit;
    const [contacts, total] = await Promise.all([
      this.contactModel.find().sort({ createdAt: -1 }).skip(skip).limit(limit).exec(),
      this.contactModel.countDocuments(),
    ]);

    return {
      success: true,
      code: HttpStatus.OK,
      message: 'Contact messages retrieved successfully',
      data: contacts,
      totalCount: total,
      page,
      limit,
    };
  }

  async markAsRead(id: string): Promise<BaseResponseTypeDTO> {
    const contact = await this.contactModel.findByIdAndUpdate(id, { isRead: true }, { new: true });
    if (!contact) {
      throw new Error('Contact message not found');
    }

    return {
      success: true,
      code: HttpStatus.OK,
      message: 'Contact message marked as read',
      data: contact,
    };
  }
}

