import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SavedItemsController } from './saved-items.controller';
import { SavedItemsService } from './saved-items.service';
import { SavedItem, SavedItemSchema } from '../schemas/saved-item.schema';
import { Product, ProductSchema } from '../schemas/product.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SavedItem.name, schema: SavedItemSchema },
      { name: Product.name, schema: ProductSchema },
    ]),
  ],
  controllers: [SavedItemsController],
  providers: [SavedItemsService],
  exports: [SavedItemsService],
})
export class SavedItemsModule {}

