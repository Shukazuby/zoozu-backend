import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, Schema as MongooseSchema } from 'mongoose';

export type CustomOrderDocument = CustomOrder & Document;

const MeasurementsSchema = new MongooseSchema({
  chest: { type: Number },
  waist: { type: Number },
  hip: { type: Number },
  shoulder: { type: Number },
  sleeveLength: { type: Number },
  garmentLength: { type: Number },
}, { _id: false });

@Schema({ timestamps: true })
export class CustomOrder {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Product' })
  productId?: Types.ObjectId;

  @Prop({ required: true })
  occasion: string;

  @Prop({ required: true })
  deliveryWindow: string;

  @Prop()
  budgetRange?: string;

  @Prop({ required: true })
  garmentType: string;

  @Prop({ type: MeasurementsSchema })
  measurements?: {
    chest?: number;
    waist?: number;
    hip?: number;
    shoulder?: number;
    sleeveLength?: number;
    garmentLength?: number;
  };

  @Prop()
  preferredFabric?: string;

  @Prop({ type: [String], default: [] })
  preferredColors: string[];

  @Prop()
  designRequests?: string;

  @Prop({ default: 'pending' })
  status: string;

  @Prop()
  quote?: number;

  @Prop()
  notes?: string;
}

export const CustomOrderSchema = SchemaFactory.createForClass(CustomOrder);

