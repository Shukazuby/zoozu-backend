import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type BespokeFittingDocument = BespokeFitting & Document;

@Schema({ timestamps: true })
export class BespokeFitting {
  @Prop({ type: Types.ObjectId, ref: 'User' })
  userId?: Types.ObjectId;

  @Prop({ required: true })
  fullName: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  phone: string;

  @Prop({ required: true })
  date: Date;

  @Prop({ required: true })
  timeSlot: string;

  @Prop()
  specificRequests?: string;

  @Prop({ default: 'pending' })
  status: string;

  @Prop()
  notes?: string;
}

export const BespokeFittingSchema = SchemaFactory.createForClass(BespokeFitting);
BespokeFittingSchema.index({ date: 1, timeSlot: 1 });

