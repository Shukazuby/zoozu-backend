import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminController } from './admin.controller';
import { AdminUsersController } from './admin-users.controller';
import { AdminOrdersController } from './admin-orders.controller';
import { AdminNewsletterController } from './admin-newsletter.controller';
import { AdminBookingsController } from './admin-bookings.controller';
import { AdminService } from './admin.service';
import { Order, OrderSchema } from '../schemas/order.schema';
import { User, UserSchema } from '../schemas/user.schema';
import { Product, ProductSchema } from '../schemas/product.entity';
import { Newsletter, NewsletterSchema } from '../schemas/newsletter.schema';
import { CustomOrder, CustomOrderSchema } from '../schemas/custom-order.schema';
import { BespokeFitting, BespokeFittingSchema } from '../schemas/bespoke-fitting.schema';
import { CartItem, CartItemSchema } from '../cart-item/entities/cart-item.entity';
import { UsersModule } from '../users/users.module';
import { AdminAuthGuard } from '../auth/guards/admin-auth.guard';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Order.name, schema: OrderSchema },
      { name: User.name, schema: UserSchema },
      { name: Product.name, schema: ProductSchema },
      { name: Newsletter.name, schema: NewsletterSchema },
      { name: CustomOrder.name, schema: CustomOrderSchema },
      { name: BespokeFitting.name, schema: BespokeFittingSchema },
      { name: CartItem.name, schema: CartItemSchema },
    ]),
    forwardRef(() => UsersModule),
  ],
  controllers: [
    AdminController,
    AdminUsersController,
    AdminOrdersController,
    AdminNewsletterController,
    AdminBookingsController,
  ],
  providers: [AdminService, AdminAuthGuard],
  exports: [AdminService],
})
export class AdminModule {}

