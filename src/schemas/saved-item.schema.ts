import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type SavedItemDocument = SavedItem & Document;

@Schema({ timestamps: true })
export class SavedItem {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
  productId: Types.ObjectId;
}

export const SavedItemSchema = SchemaFactory.createForClass(SavedItem);
SavedItemSchema.index({ userId: 1, productId: 1 }, { unique: true });

