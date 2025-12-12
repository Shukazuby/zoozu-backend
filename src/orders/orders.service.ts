import { HttpStatus, Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { BaseResponseTypeDTO, generateUniqueKey } from 'src/utils';
import { CreateOrderDto, OrderFilterDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Order, OrderDocument, OrderItem } from '../schemas/order.schema';
import { Product, ProductDocument } from 'src/schemas/product.entity';
import { User, UserDocument } from 'src/schemas/user.schema';
import { CartItem, CartItemDocument } from 'src/cart-item/entities/cart-item.entity';
import * as crypto from 'crypto';
import { ShippingService } from 'src/shipping/shipping.service';
import { EmailService } from '../email/email.service';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private readonly orderModel: Model<OrderDocument>,
    @InjectModel(Product.name) private readonly productModel: Model<ProductDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(CartItem.name) private readonly cartItemModel: Model<CartItemDocument>,
    private readonly shippingService: ShippingService,
    private readonly emailService: EmailService,
  ) {}

  async create(userId: string, payload: CreateOrderDto): Promise<BaseResponseTypeDTO> {
    if (!payload.cartItemIds || payload.cartItemIds.length === 0) {
      throw new BadRequestException('Order requires at least one cart item');
    }
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const orderItems: OrderItem[] = [];
    let totalAmount = 0;

    const cartItems = await this.cartItemModel
      .find({
        _id: { $in: payload.cartItemIds.map((id) => new Types.ObjectId(id)) },
        userId: new Types.ObjectId(userId),
      })
      .lean();

    if (!cartItems.length) {
      throw new NotFoundException('No cart items found for this order');
    }

    for (const item of cartItems) {
      const product = await this.productModel.findById(item.productId);
      if (!product) {
        throw new NotFoundException(`Product ${item.productId} not found`);
      }

      const price = product.price ?? 0;
      const quantity = Math.max(item.quantity || 1, 1);
      const lineTotal = price * quantity;
      totalAmount += lineTotal;

      orderItems.push({
        productId: new Types.ObjectId(item.productId),
        name: product.name,
        price,
        quantity,
        imageUrl: product.images?.[0] || '',
        category: product.categories?.[0] || '',
      } as OrderItem);
    }

    // Add shipping cost to total amount if provided
    const shippingCost = payload.shippingCost || 0;
    const finalTotalAmount = totalAmount + shippingCost;

    const orderNumber = `ZOZ${generateUniqueKey(5)}`;
      const order = new this.orderModel({
        orderNumber,
        items: orderItems,
        totalAmount: finalTotalAmount,
        status: 'pending',
        paymentStatus: 'pending',
        userId: user._id.toString(),
        shippingAddress: payload.shippingAddress || '',
        contactEmail: user.email,
        contactName: user.fullName,
        notes: payload.notes,
        placedAt: new Date(),
      });

    const saved = await order.save();
    await this.cartItemModel.deleteMany({
      _id: { $in: payload.cartItemIds.map((id) => new Types.ObjectId(id)) },
      userId: new Types.ObjectId(userId),
    });

    return {
      data: saved,
      success: true,
      code: HttpStatus.CREATED,
      message: 'Order Created',
    };
  }

  async findAll(userId: string, filters: OrderFilterDto): Promise<BaseResponseTypeDTO> {
    const query: any = {};
  
    // Find user
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
  
    // Match orders to this user (userId is stored as string, so convert to string for comparison)
    query.userId = user._id.toString();
  
    // Filter by status
    if (filters.status) {
      query.status = filters.status;
    }
  
    // Search
    if (filters.search) {
      query.orderNumber = { $regex: filters.search.trim(), $options: 'i' };
    }
  
    // Date range
    if (filters.startDate || filters.endDate) {
      query.placedAt = {};
      if (filters.startDate) {
        query.placedAt.$gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        query.placedAt.$lte = new Date(filters.endDate);
      }
    }
  
    // Pagination
    const limit = filters.limit || 50;
    const page = filters.page || 1;
    const skip = (page - 1) * limit;
  
    const totalCount = await this.orderModel.countDocuments(query);
  
    const data = await this.orderModel
      .find(query)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
  
    return {
      data: {
        totalCount,
        data,
      },
      success: true,
      code: HttpStatus.OK,
      message: 'Orders fetched',
      limit,
      page,
      search: filters.search,
    };
  }
  
    async findOne(userId: string, id: string): Promise<BaseResponseTypeDTO> {
      const order = await this.orderModel.findById(id);
      if (!order) {
        throw new NotFoundException('Order not found.');
      }

      // Convert both to strings for comparison (userId from JWT might be ObjectId, order.userId is string)
      const userIdStr = userId?.toString();
      const orderUserIdStr = order.userId?.toString();

      if (orderUserIdStr !== userIdStr) {
        throw new ForbiddenException('You are not authorized to access this order.');
      }

      const message =
        order.paymentStatus === 'initiated'
          ? 'Payment was initiated but not completed. Please try again.'
          : 'Order fetched';

      return {
        data: order,
        success: true,
        code: HttpStatus.OK,
        message,
      };
    }

  async update(id: string, payload: UpdateOrderDto): Promise<BaseResponseTypeDTO> {
    const order = await this.orderModel.findById(id);
    if (!order) {
      throw new NotFoundException('Order not found.');
    }

    if (payload.status) {
      order.status = payload.status;
    }

    if (payload.shippingAddress) {
      order.shippingAddress = payload.shippingAddress;
    }

    if (payload.notes) {
      order.notes = payload.notes;
    }

    const updated = await order.save();

    return {
      data: updated,
      success: true,
      code: HttpStatus.OK,
      message: 'Order updated',
    };
  }

  async remove(userId: string, id: string): Promise<BaseResponseTypeDTO> {
    const order = await this.orderModel.findById(id);
    if (!order) {
      throw new NotFoundException('Order not found.');
    }

    await this.orderModel.findByIdAndDelete(id);

    return {
      success: true,
      code: HttpStatus.OK,
      message: 'Order deleted',
    };
  }

    async initiatePaystackPayment(userId: string, orderId: string): Promise<BaseResponseTypeDTO> {
    const order = await this.orderModel.findById(orderId);
    if (!order) {
      throw new NotFoundException('Order not found.');
    }
    if (order.userId !== userId.toString()) {
      throw new ForbiddenException('You are not authorized to pay for this order.');
    }
    if (order.paymentStatus === 'paid') {
      return {
        data: { authorizationUrl: order.paymentAuthorizationUrl, reference: order.paymentReference },
        success: true,
        code: HttpStatus.OK,
        message: 'Order already paid',
      };
    }

      if (order.paymentStatus === 'initiated') {
        // Allow re-initialization but return a clear message
        // (flow continues to create a fresh reference below)
      }

    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!secretKey) {
      throw new BadRequestException('PAYSTACK_SECRET_KEY not configured');
    }

    const reference = `ZOZ-${order.orderNumber}-${Date.now()}`;
    // Construct callback URL with orderId for easy order retrieval
    const baseCallbackUrl = process.env.PAYSTACK_CALLBACK_URL || 'http://localhost:3000/payment/confirmation';
    const callbackUrl = `${baseCallbackUrl}?orderId=${order._id.toString()}`;
    
    const payload = {
      amount: Math.round(order.totalAmount * 100), // kobo
      email: order.contactEmail || 'customer@zoozu.ng',
      reference,
      currency: 'NGN',
      metadata: {
        orderId: order._id.toString(),
        userId,
        orderNumber: order.orderNumber,
      },
      callback_url: callbackUrl,
    };

    const resp = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${secretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const respData = await resp.json();
    const authorizationUrl = respData?.data?.authorization_url;
    if (!resp.ok || !authorizationUrl) {
      throw new BadRequestException('Unable to initialize Paystack payment');
    }

    order.paymentStatus = 'initiated';
    order.paymentReference = reference;
    order.paymentProvider = 'paystack';
    order.paymentAuthorizationUrl = authorizationUrl;
    await order.save();

      return {
        data: {
          authorizationUrl,
          reference,
        },
        success: true,
        code: HttpStatus.OK,
        message:
          order.paymentStatus === 'initiated'
            ? 'Payment was initiated but not completed. Please try again.'
            : 'Paystack payment initialized',
      };
  }

  async handlePaystackWebhook(signature: string, body: any): Promise<void> {
    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!secretKey) {
      throw new BadRequestException('PAYSTACK_SECRET_KEY not configured');
    }

    const computed = crypto
      .createHmac('sha512', secretKey)
      .update(JSON.stringify(body))
      .digest('hex');

    if (computed !== signature) {
      throw new ForbiddenException('Invalid signature');
    }

    const event = body?.event;
    const data = body?.data;
    if (event !== 'charge.success' || !data?.reference) {
      return;
    }

    const reference = data.reference;
    const orderId = data.metadata?.orderId;
    if (!orderId) {
      return;
    }

    const order = await this.orderModel.findOne({ _id: orderId, paymentReference: reference });
    if (!order) return;

    // Only send email if payment status is changing from non-paid to paid (prevent duplicate emails)
    const wasPaid = order.paymentStatus === 'paid';
    order.paymentStatus = 'paid';
    await order.save();

    // Send order confirmation email only if payment was just verified (not already paid)
    if (!wasPaid) {
      try {
        const user = await this.userModel.findById(order.userId);
        if (user) {
          // Calculate shipping cost from order total
          const itemsTotal = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
          const shippingCost = order.totalAmount - itemsTotal;

          this.emailService.sendOrderConfirmationEmail({
            userName: user.fullName || 'Valued Customer',
            userEmail: user.email,
            orderNumber: order.orderNumber,
            orderId: order._id.toString(),
            items: order.items.map(item => ({
              name: item.name,
              quantity: item.quantity,
              price: item.price,
              imageUrl: item.imageUrl,
            })),
            totalAmount: order.totalAmount,
            shippingAddress: order.shippingAddress || 'Address not provided',
            shippingCost: shippingCost,
            expectedDelivery: '5-7 business days', // Can be made dynamic based on shipping service
          }).catch((error) => {
            // Log error but don't fail payment processing
            console.error('Failed to send order confirmation email:', error);
          });
        }
      } catch (error) {
        // Log error but don't fail payment processing
        console.error('Error preparing order confirmation email:', error);
      }
    }
  }

  async calculateShippingEstimate(userId: string, cartItemIds: string[]): Promise<BaseResponseTypeDTO> {
    if (!cartItemIds || cartItemIds.length === 0) {
      return {
        data: { shippingCost: 0 },
        success: true,
        code: HttpStatus.OK,
        message: 'Shipping estimate calculated',
      };
    }

    // Verify cart items belong to user
    const cartItems = await this.cartItemModel
      .find({
        _id: { $in: cartItemIds.map((id) => new Types.ObjectId(id)) },
        userId: new Types.ObjectId(userId),
      })
      .lean();

    if (!cartItems.length) {
      throw new NotFoundException('No cart items found');
    }

    // Dynamic shipping: pull latest configured cost
    const shippingCost = await this.shippingService.getCurrentCostValue();

    return {
      data: { shippingCost },
      success: true,
      code: HttpStatus.OK,
      message: 'Shipping estimate calculated',
    };
  }
}
