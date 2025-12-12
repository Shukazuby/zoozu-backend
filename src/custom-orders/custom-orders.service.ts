import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CustomOrder, CustomOrderDocument } from '../schemas/custom-order.schema';
import { BaseResponseTypeDTO } from '../utils';
import { HttpStatus } from '@nestjs/common';
import { CreateCustomOrderDto } from './dto/create-custom-order.dto';

@Injectable()
export class CustomOrdersService {
  constructor(@InjectModel(CustomOrder.name) private customOrderModel: Model<CustomOrderDocument>) {}

  async create(userId: string, createCustomOrderDto: CreateCustomOrderDto): Promise<BaseResponseTypeDTO> {
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }

    const customOrder = new this.customOrderModel({
      ...createCustomOrderDto,
      userId: new Types.ObjectId(userId),
      productId: createCustomOrderDto.productId ? new Types.ObjectId(createCustomOrderDto.productId) : undefined,
    });
    await customOrder.save();

    return {
      success: true,
      code: HttpStatus.CREATED,
      message: 'Custom order request submitted successfully',
      data: customOrder,
    };
  }

  async findAll(userId?: string, page: number = 1, limit: number = 10): Promise<BaseResponseTypeDTO> {
    const skip = (page - 1) * limit;
    const filter: any = {};
    if (userId) {
      filter.userId = new Types.ObjectId(userId);
    }

    const [orders, total] = await Promise.all([
      this.customOrderModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).exec(),
      this.customOrderModel.countDocuments(filter),
    ]);

    return {
      success: true,
      code: HttpStatus.OK,
      message: 'Custom orders retrieved successfully',
      data: orders,
      totalCount: total,
      page,
      limit,
    };
  }

  async updateStatus(id: string, status: string, quote?: number): Promise<BaseResponseTypeDTO> {
    const updateData: any = { status };
    if (quote) {
      updateData.quote = quote;
    }

    const order = await this.customOrderModel.findByIdAndUpdate(id, updateData, { new: true });
    if (!order) {
      throw new Error('Custom order not found');
    }

    return {
      success: true,
      code: HttpStatus.OK,
      message: 'Custom order status updated successfully',
      data: order,
    };
  }
}

