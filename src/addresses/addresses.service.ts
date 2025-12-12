import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Address, AddressDocument } from '../schemas/address.schema';
import { BaseResponseTypeDTO } from '../utils';
import { HttpStatus } from '@nestjs/common';

@Injectable()
export class AddressesService {
  constructor(@InjectModel(Address.name) private addressModel: Model<AddressDocument>) {}

  async create(userId: string, addressData: any): Promise<BaseResponseTypeDTO> {
    if (addressData.isDefault) {
      await this.addressModel.updateMany(
        { userId: new Types.ObjectId(userId) },
        { isDefault: false },
      );
    }

    const address = new this.addressModel({
      ...addressData,
      userId: new Types.ObjectId(userId),
    });

    await address.save();

    return {
      success: true,
      code: HttpStatus.CREATED,
      message: 'Address created successfully',
      data: address,
    };
  }

  async findAll(userId: string): Promise<BaseResponseTypeDTO> {
    const addresses = await this.addressModel.find({ userId: new Types.ObjectId(userId) }).sort({ isDefault: -1, createdAt: -1 });

    return {
      success: true,
      code: HttpStatus.OK,
      message: 'Addresses retrieved successfully',
      data: addresses,
    };
  }

  async findOne(id: string, userId: string): Promise<BaseResponseTypeDTO> {
    const address = await this.addressModel.findOne({
      _id: id,
      userId: new Types.ObjectId(userId),
    });

    if (!address) {
      throw new NotFoundException('Address not found');
    }

    return {
      success: true,
      code: HttpStatus.OK,
      message: 'Address retrieved successfully',
      data: address,
    };
  }

  async update(id: string, userId: string, updateData: any): Promise<BaseResponseTypeDTO> {
    if (updateData.isDefault) {
      await this.addressModel.updateMany(
        { userId: new Types.ObjectId(userId), _id: { $ne: id } },
        { isDefault: false },
      );
    }

    const address = await this.addressModel.findOneAndUpdate(
      { _id: id, userId: new Types.ObjectId(userId) },
      updateData,
      { new: true },
    );

    if (!address) {
      throw new NotFoundException('Address not found');
    }

    return {
      success: true,
      code: HttpStatus.OK,
      message: 'Address updated successfully',
      data: address,
    };
  }

  async delete(id: string, userId: string): Promise<BaseResponseTypeDTO> {
    const address = await this.addressModel.findOneAndDelete({
      _id: id,
      userId: new Types.ObjectId(userId),
    });

    if (!address) {
      throw new NotFoundException('Address not found');
    }

    return {
      success: true,
      code: HttpStatus.OK,
      message: 'Address deleted successfully',
    };
  }
}

