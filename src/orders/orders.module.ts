import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Product, ProductSchema } from 'src/schemas/product.entity';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { Order, OrderSchema } from '../schemas/order.schema';
import { User, UserSchema } from 'src/schemas/user.schema';
import { CartItem, CartItemSchema } from 'src/cart-item/entities/cart-item.entity';
import { CartItemModule } from 'src/cart-item/cart-item.module';
import { ShippingModule } from 'src/shipping/shipping.module';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Order.name, schema: OrderSchema },
      { name: Product.name, schema: ProductSchema },
      { name: User.name, schema: UserSchema },
      { name: CartItem.name, schema: CartItemSchema },
    ]),
    CartItemModule,
    ShippingModule,
    EmailModule,
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
