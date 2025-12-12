import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { SavedItem, SavedItemDocument } from '../schemas/saved-item.schema';
import { Product, ProductDocument } from '../schemas/product.entity';
import { BaseResponseTypeDTO } from '../utils';
import { HttpStatus } from '@nestjs/common';

@Injectable()
export class SavedItemsService {
  constructor(
    @InjectModel(SavedItem.name) private savedItemModel: Model<SavedItemDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}

  async addToSavedItems(userId: string, productId: string): Promise<BaseResponseTypeDTO> {
    const product = await this.productModel.findById(productId);
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const existing = await this.savedItemModel.findOne({
      userId: new Types.ObjectId(userId),
      productId: new Types.ObjectId(productId),
    });

    if (existing) {
      throw new ConflictException('Product already in saved items');
    }

    const savedItem = new this.savedItemModel({
      userId: new Types.ObjectId(userId),
      productId: new Types.ObjectId(productId),
    });

    await savedItem.save();
    await savedItem.populate('productId');

    return {
      success: true,
      code: HttpStatus.CREATED,
      message: 'Item added to saved items successfully',
      data: savedItem,
    };
  }

  async getSavedItems(userId: string, page: number = 1, limit: number = 12): Promise<BaseResponseTypeDTO> {
    const skip = (page - 1) * limit;
    const [savedItems, total] = await Promise.all([
      this.savedItemModel
        .find({ userId: new Types.ObjectId(userId) })
        .populate('productId')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.savedItemModel.countDocuments({ userId: new Types.ObjectId(userId) }),
    ]);

    return {
      success: true,
      code: HttpStatus.OK,
      message: 'Saved items retrieved successfully',
      data: savedItems,
      totalCount: total,
      page,
      limit,
    };
  }

  async removeFromSavedItems(userId: string, productId: string): Promise<BaseResponseTypeDTO> {
    const savedItem = await this.savedItemModel.findOneAndDelete({
      userId: new Types.ObjectId(userId),
      productId: new Types.ObjectId(productId),
    });

    if (!savedItem) {
      throw new NotFoundException('Saved item not found');
    }

    return {
      success: true,
      code: HttpStatus.OK,
      message: 'Item removed from saved items successfully',
    };
  }

  async checkIfSaved(userId: string, productId: string): Promise<BaseResponseTypeDTO> {
    const savedItem = await this.savedItemModel.findOne({
      userId: new Types.ObjectId(userId),
      productId: new Types.ObjectId(productId),
    });

    return {
      success: true,
      code: HttpStatus.OK,
      message: 'Check completed',
      data: { isSaved: !!savedItem },
    };
  }
}

