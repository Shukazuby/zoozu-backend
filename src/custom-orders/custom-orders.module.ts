import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CustomOrdersController } from './custom-orders.controller';
import { CustomOrdersService } from './custom-orders.service';
import { CustomOrder, CustomOrderSchema } from '../schemas/custom-order.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: CustomOrder.name, schema: CustomOrderSchema }])],
  controllers: [CustomOrdersController],
  providers: [CustomOrdersService],
  exports: [CustomOrdersService],
})
export class CustomOrdersModule {}

