import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AddressDocument = Address & Document;

@Schema({ timestamps: true })
export class Address {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop()
  name?: string;

  @Prop({ required: true })
  street: string;

  @Prop()
  apartment?: string;

  @Prop({ required: true })
  city: string;

  @Prop({ required: true })
  state: string;

  @Prop({ required: true })
  country: string;

  @Prop()
  postalCode?: string;

  @Prop()
  phone?: string;

  @Prop({ default: false })
  isDefault: boolean;

  @Prop()
  label?: string;
}

export const AddressSchema = SchemaFactory.createForClass(Address);
AddressSchema.index({ userId: 1 });

