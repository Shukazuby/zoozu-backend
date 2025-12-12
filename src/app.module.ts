import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import * as dotenv from 'dotenv';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductModule } from './product/product.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CartModule } from './cart/cart.module';
import { OrdersModule } from './orders/orders.module';
import { AddressesModule } from './addresses/addresses.module';
import { SavedItemsModule } from './saved-items/saved-items.module';
import { CustomOrdersModule } from './custom-orders/custom-orders.module';
import { BespokeFittingsModule } from './bespoke-fittings/bespoke-fittings.module';
import { ContactModule } from './contact/contact.module';
import { PaystackModule } from './paystack/paystack.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { ShippingModule } from './shipping/shipping.module';

dotenv.config();

@Module({
  imports: [
    MongooseModule.forRoot(String(process.env.MONGODB_URL).trim()),
    ProductModule,
    AuthModule,
    UsersModule,
    CartModule,
    OrdersModule,
    AddressesModule,
    SavedItemsModule,
    CustomOrdersModule,
    BespokeFittingsModule,
    ContactModule,
    PaystackModule,
    CloudinaryModule,
    ShippingModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
