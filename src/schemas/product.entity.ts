import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Product {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  price: number;


  @Prop({ required: true })
  description: string;

  @Prop({ type: [String], default: [] })
  images: string[];


  @Prop({ type: [String], default: [] })
  categories: string[];

  @Prop({ default: 'unisex' })
  gender: string; // 'men' | 'women' | 'unisex'

  @Prop({ type: [String], default: [] })
  sizes: string[]; // ['S', 'M', 'L', 'XL', 'XXL']

  @Prop({ type: [String], default: [] })
  colors: string[]; // Color hex codes or names

  @Prop({ default: 0 })
  stock: number;

  @Prop({ default: true })
  isAvailable: boolean;

  @Prop({ default: false })
  isBespoke: boolean;

  @Prop({ default: false })
  isPreOrder: boolean;

  @Prop()
  badge?: string; // 'New Season', 'Best Seller', etc.

  @Prop()
  tag?: string; // 'Bespoke', etc.

  @Prop({ default: 0 })
  views: number;

  @Prop({ default: 0 })
  sales: number;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: false })
  isNew?: boolean;

  @Prop({ default: false })
  isFeatured?: boolean;

  createdAt: Date;
  updatedAt: Date;
}

export type ProductDocument = Product & Document;
export const ProductSchema = SchemaFactory.createForClass(Product);
ProductSchema.index({ title: 'text', description: 'text' });
ProductSchema.index({ categories: 1, gender: 1, isAvailable: 1 });
