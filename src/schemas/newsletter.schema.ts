import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type NewsletterDocument = Newsletter & Document;

@Schema({ timestamps: true })
export class Newsletter {
  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({ trim: true })
  name?: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  subscribedAt?: Date;
}

export const NewsletterSchema = SchemaFactory.createForClass(Newsletter);

