import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument } from '../schemas/order.schema';
import { User, UserDocument } from '../schemas/user.schema';
import { Product, ProductDocument } from '../schemas/product.entity';
import { Newsletter, NewsletterDocument } from '../schemas/newsletter.schema';
import { CustomOrder, CustomOrderDocument } from '../schemas/custom-order.schema';
import { BespokeFitting, BespokeFittingDocument } from '../schemas/bespoke-fitting.schema';
import { CartItem, CartItemDocument } from '../cart-item/entities/cart-item.entity';
import { BaseResponseTypeDTO } from '../utils';
import { HttpStatus } from '@nestjs/common';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(Order.name) private readonly orderModel: Model<OrderDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Product.name) private readonly productModel: Model<ProductDocument>,
    @InjectModel(Newsletter.name) private readonly newsletterModel: Model<NewsletterDocument>,
    @InjectModel(CustomOrder.name) private readonly customOrderModel: Model<CustomOrderDocument>,
    @InjectModel(BespokeFitting.name) private readonly bespokeFittingModel: Model<BespokeFittingDocument>,
    @InjectModel(CartItem.name) private readonly cartItemModel: Model<CartItemDocument>,
  ) {}

  async getDashboardStats(): Promise<BaseResponseTypeDTO> {
    try {
      const [
        totalOrders,
        totalRevenue,
        totalUsers,
        totalProducts,
        activeCarts,
        totalSubscribers,
        pendingOrders,
        completedOrders,
        totalBookings,
        recentOrders,
      ] = await Promise.all([
        this.orderModel.countDocuments(),
        this.orderModel.aggregate([
          { $match: { paymentStatus: 'paid' } },
          { $group: { _id: null, total: { $sum: '$totalAmount' } } },
        ]),
        this.userModel.countDocuments({ role: 'USER' }),
        this.productModel.countDocuments({ isActive: true }),
        this.cartItemModel.distinct('userId').then(users => users.length),
        this.newsletterModel.countDocuments({ isActive: true }),
        this.orderModel.countDocuments({ status: { $in: ['pending', 'processing'] } }),
        this.orderModel.countDocuments({ status: 'delivered' }),
        this.bespokeFittingModel.countDocuments(),
        this.orderModel
          .find()
          .sort({ createdAt: -1 })
          .limit(10)
          .populate('userId', 'fullName email')
          .lean(),
      ]);

      const revenue = totalRevenue[0]?.total || 0;

      // Calculate growth metrics (last 30 days vs previous 30 days)
      const now = new Date();
      const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const previous30Days = new Date(last30Days.getTime() - 30 * 24 * 60 * 60 * 1000);

      const [recentOrdersCount, previousOrdersCount] = await Promise.all([
        this.orderModel.countDocuments({ createdAt: { $gte: last30Days } }),
        this.orderModel.countDocuments({
          createdAt: { $gte: previous30Days, $lt: last30Days },
        }),
      ]);

      const ordersGrowth = previousOrdersCount > 0
        ? ((recentOrdersCount - previousOrdersCount) / previousOrdersCount) * 100
        : recentOrdersCount > 0 ? 100 : 0;

      const [recentRevenue, previousRevenue] = await Promise.all([
        this.orderModel.aggregate([
          { $match: { createdAt: { $gte: last30Days }, paymentStatus: 'paid' } },
          { $group: { _id: null, total: { $sum: '$totalAmount' } } },
        ]),
        this.orderModel.aggregate([
          {
            $match: {
              createdAt: { $gte: previous30Days, $lt: last30Days },
              paymentStatus: 'paid',
            },
          },
          { $group: { _id: null, total: { $sum: '$totalAmount' } } },
        ]),
      ]);

      const revenueGrowth = previousRevenue[0]?.total > 0
        ? ((recentRevenue[0]?.total || 0) - previousRevenue[0].total) / previousRevenue[0].total * 100
        : (recentRevenue[0]?.total || 0) > 0 ? 100 : 0;

      return {
        success: true,
        code: HttpStatus.OK,
        message: 'Dashboard stats retrieved successfully',
        data: {
          overview: {
            totalOrders,
            totalRevenue: revenue,
            totalUsers,
            totalProducts,
            activeCarts,
            totalSubscribers,
            pendingOrders,
            completedOrders,
            totalBookings,
          },
          growth: {
            ordersGrowth: Math.round(ordersGrowth * 100) / 100,
            revenueGrowth: Math.round(revenueGrowth * 100) / 100,
          },
          recentOrders: recentOrders.map(order => ({
            _id: order._id,
            orderNumber: order.orderNumber,
            totalAmount: order.totalAmount,
            status: order.status,
            paymentStatus: order.paymentStatus,
            createdAt: order.createdAt,
            contactEmail: (order as any).contactEmail || null,
            user: order.userId ? {
              fullName: (order.userId as any).fullName,
              email: (order.userId as any).email,
            } : null,
          })),
        },
      };
    } catch (error: any) {
      throw error;
    }
  }

  async getSalesAnalytics(startDate?: Date, endDate?: Date): Promise<BaseResponseTypeDTO> {
    try {
      const matchStage: any = { paymentStatus: 'paid' };
      if (startDate || endDate) {
        matchStage.createdAt = {};
        if (startDate) matchStage.createdAt.$gte = startDate;
        if (endDate) matchStage.createdAt.$lte = endDate;
      }

      const salesData = await this.orderModel.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
              day: { $dayOfMonth: '$createdAt' },
            },
            totalRevenue: { $sum: '$totalAmount' },
            orderCount: { $sum: 1 },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
      ]);

      const topProducts = await this.orderModel.aggregate([
        { $match: matchStage },
        { $unwind: '$items' },
        {
          $group: {
            _id: '$items.productId',
            totalSold: { $sum: '$items.quantity' },
            totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
            productName: { $first: '$items.name' },
          },
        },
        { $sort: { totalSold: -1 } },
        { $limit: 10 },
      ]);

      return {
        success: true,
        code: HttpStatus.OK,
        message: 'Sales analytics retrieved successfully',
        data: {
          salesData,
          topProducts,
        },
      };
    } catch (error: any) {
      throw error;
    }
  }

  async getAllUsers(page: number = 1, limit: number = 20, search?: string): Promise<BaseResponseTypeDTO> {
    try {
      const skip = (page - 1) * limit;
      const query: any = { role: 'USER' };

      if (search) {
        query.$or = [
          { email: { $regex: search, $options: 'i' } },
          { fullName: { $regex: search, $options: 'i' } },
        ];
      }

      const [users, total] = await Promise.all([
        this.userModel
          .find(query)
          .select('-password')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        this.userModel.countDocuments(query),
      ]);

      return {
        success: true,
        code: HttpStatus.OK,
        message: 'Users retrieved successfully',
        data: {
          users,
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error: any) {
      throw error;
    }
  }

  async getUserById(id: string): Promise<BaseResponseTypeDTO> {
    try {
      const user = await this.userModel.findById(id).select('-password').lean();
      if (!user) {
        throw new Error('User not found');
      }

      // Get user's orders count
      const ordersCount = await this.orderModel.countDocuments({ userId: id });

      return {
        success: true,
        code: HttpStatus.OK,
        message: 'User retrieved successfully',
        data: {
          ...user,
          ordersCount,
        },
      };
    } catch (error: any) {
      throw error;
    }
  }

  async updateUser(id: string, updateData: any): Promise<BaseResponseTypeDTO> {
    try {
      if (updateData.email) {
        const existing = await this.userModel.findOne({ email: updateData.email.toLowerCase() });
        if (existing && existing._id.toString() !== id) {
          throw new Error('Email already exists');
        }
        updateData.email = updateData.email.toLowerCase();
      }

      const user = await this.userModel
        .findByIdAndUpdate(id, updateData, { new: true })
        .select('-password')
        .lean();

      if (!user) {
        throw new Error('User not found');
      }

      return {
        success: true,
        code: HttpStatus.OK,
        message: 'User updated successfully',
        data: user,
      };
    } catch (error: any) {
      throw error;
    }
  }

  async toggleUserStatus(id: string, isActive: boolean): Promise<BaseResponseTypeDTO> {
    try {
      const user = await this.userModel.findByIdAndUpdate(
        id,
        { isActive },
        { new: true },
      ).select('-password').lean();

      if (!user) {
        throw new Error('User not found');
      }

      return {
        success: true,
        code: HttpStatus.OK,
        message: `User ${isActive ? 'activated' : 'suspended'} successfully`,
        data: user,
      };
    } catch (error: any) {
      throw error;
    }
  }

  async deleteUser(id: string): Promise<BaseResponseTypeDTO> {
    try {
      const user = await this.userModel.findByIdAndDelete(id);
      if (!user) {
        throw new Error('User not found');
      }

      return {
        success: true,
        code: HttpStatus.OK,
        message: 'User deleted successfully',
      };
    } catch (error: any) {
      throw error;
    }
  }

  async getAllOrders(page: number = 1, limit: number = 20, filters?: any): Promise<BaseResponseTypeDTO> {
    try {
      const skip = (page - 1) * limit;
      const query: any = {};

      if (filters?.status) query.status = filters.status;
      if (filters?.paymentStatus) query.paymentStatus = filters.paymentStatus;
      if (filters?.search) {
        query.$or = [
          { orderNumber: { $regex: filters.search, $options: 'i' } },
        ];
      }

      const [orders, total] = await Promise.all([
        this.orderModel
          .find(query)
          .populate('userId', 'fullName email')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        this.orderModel.countDocuments(query),
      ]);

      return {
        success: true,
        code: HttpStatus.OK,
        message: 'Orders retrieved successfully',
        data: {
          orders,
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error: any) {
      throw error;
    }
  }

  async getOrderById(id: string): Promise<BaseResponseTypeDTO> {
    try {
      const order = await this.orderModel
        .findById(id)
        .populate('userId', 'fullName email')
        .lean();

      if (!order) {
        throw new NotFoundException('Order not found');
      }

      return {
        success: true,
        code: HttpStatus.OK,
        message: 'Order retrieved successfully',
        data: order,
      };
    } catch (error: any) {
      throw error;
    }
  }

  async updateOrderStatus(id: string, status: string): Promise<BaseResponseTypeDTO> {
    try {
      const order = await this.orderModel.findByIdAndUpdate(
        id,
        { status },
        { new: true },
      ).populate('userId', 'fullName email').lean();

      if (!order) {
        throw new Error('Order not found');
      }

      return {
        success: true,
        code: HttpStatus.OK,
        message: 'Order status updated successfully',
        data: order,
      };
    } catch (error: any) {
      throw error;
    }
  }

  async getAllNewsletterSubscribers(page: number = 1, limit: number = 20): Promise<BaseResponseTypeDTO> {
    try {
      const skip = (page - 1) * limit;

      const [subscribers, total] = await Promise.all([
        this.newsletterModel
          .find({ isActive: true })
          .sort({ subscribedAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        this.newsletterModel.countDocuments({ isActive: true }),
      ]);

      return {
        success: true,
        code: HttpStatus.OK,
        message: 'Newsletter subscribers retrieved successfully',
        data: {
          subscribers,
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error: any) {
      throw error;
    }
  }

  async getAllBookings(page: number = 1, limit: number = 20): Promise<BaseResponseTypeDTO> {
    try {
      const skip = (page - 1) * limit;

      const [bookings, total] = await Promise.all([
        this.bespokeFittingModel
          .find()
          .populate('userId', 'fullName email phone')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        this.bespokeFittingModel.countDocuments(),
      ]);

      return {
        success: true,
        code: HttpStatus.OK,
        message: 'Bookings retrieved successfully',
        data: {
          bookings,
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error: any) {
      throw error;
    }
  }

  async getAllCustomOrders(page: number = 1, limit: number = 20): Promise<BaseResponseTypeDTO> {
    try {
      const skip = (page - 1) * limit;

      const [customOrders, total] = await Promise.all([
        this.customOrderModel
          .find()
          .populate('userId', 'fullName email phone')
          .populate('productId', 'name images')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        this.customOrderModel.countDocuments(),
      ]);

      return {
        success: true,
        code: HttpStatus.OK,
        message: 'Custom orders retrieved successfully',
        data: {
          customOrders,
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error: any) {
      throw error;
    }
  }
}

