import { Injectable, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { BespokeFitting, BespokeFittingDocument } from '../schemas/bespoke-fitting.schema';
import { BaseResponseTypeDTO } from '../utils';
import { HttpStatus } from '@nestjs/common';

@Injectable()
export class BespokeFittingsService {
  constructor(@InjectModel(BespokeFitting.name) private bespokeFittingModel: Model<BespokeFittingDocument>) {}

  async create(fittingData: any, userId?: string): Promise<BaseResponseTypeDTO> {
    // Convert date string to Date object
    const appointmentDate = new Date(fittingData.date);
    
    const existing = await this.bespokeFittingModel.findOne({
      date: appointmentDate,
      timeSlot: fittingData.timeSlot,
      status: { $in: ['pending', 'confirmed'] },
    });

    if (existing) {
      throw new ConflictException('This time slot is already booked');
    }

    const fitting = new this.bespokeFittingModel({
      ...fittingData,
      date: appointmentDate,
      userId: userId ? new Types.ObjectId(userId) : undefined,
    });
    await fitting.save();

    return {
      success: true,
      code: HttpStatus.CREATED,
      message: 'Bespoke fitting appointment booked successfully',
      data: fitting,
    };
  }

  async getAvailableSlots(date: string): Promise<BaseResponseTypeDTO> {
    // Parse date string and set to start of day for comparison
    const dateObj = new Date(date);
    dateObj.setHours(0, 0, 0, 0);
    const nextDay = new Date(dateObj);
    nextDay.setDate(nextDay.getDate() + 1);
    
    const bookedSlots = await this.bespokeFittingModel.find({
      date: {
        $gte: dateObj,
        $lt: nextDay,
      },
      status: { $in: ['pending', 'confirmed'] },
    }).select('timeSlot');

    const allSlots = [
      '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
      '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM',
    ];

    const bookedTimeSlots = bookedSlots.map(slot => slot.timeSlot);
    const availableSlots = allSlots.filter(slot => !bookedTimeSlots.includes(slot));

    return {
      success: true,
      code: HttpStatus.OK,
      message: 'Available slots retrieved successfully',
      data: { availableSlots, bookedSlots: bookedTimeSlots },
    };
  }

  async getUserFittings(userId: string): Promise<BaseResponseTypeDTO> {
    const fittings = await this.bespokeFittingModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ date: -1, createdAt: -1 });

    return {
      success: true,
      code: HttpStatus.OK,
      message: 'Bespoke fittings retrieved successfully',
      data: fittings,
    };
  }

  async updateStatus(id: string, status: string): Promise<BaseResponseTypeDTO> {
    const fitting = await this.bespokeFittingModel.findByIdAndUpdate(id, { status }, { new: true });
    if (!fitting) {
      throw new Error('Bespoke fitting not found');
    }

    return {
      success: true,
      code: HttpStatus.OK,
      message: 'Bespoke fitting status updated successfully',
      data: fitting,
    };
  }
}

