import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type UserDocument = User & Document;

const PreferencesSchema = new MongooseSchema({
  primarySize: { type: String },
  favoriteColors: { type: [String], default: [] },
  stylePreferences: { type: [String], default: [] },
}, { _id: false });

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  fullName: string;

  @Prop()
  phone?: string;

  @Prop()
  profilePicture?: string;

  @Prop({ default: false })
  isEmailVerified: boolean;

  @Prop({ default: 'USER' })
  role: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: PreferencesSchema })
  preferences?: {
    primarySize?: string;
    favoriteColors?: string[];
    stylePreferences?: string[];
  };
}

export const UserSchema = SchemaFactory.createForClass(User);

