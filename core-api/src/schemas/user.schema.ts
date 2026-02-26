import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ _id: false })
export class Location {
  @Prop({ type: String, enum: ['Point'], required: true, default: 'Point' })
  type: string;

  @Prop({ type: [Number], required: true }) // [longitude, latitude]
  coordinates: number[];
}

@Schema({ _id: false })
export class Address {
  @Prop({ required: true })
  label: string;

  @Prop({ type: Location, required: true })
  location: Location;
}

@Schema({ collection: 'users', timestamps: true }) // createdAt y updatedAt automáticos
export class User {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  passwordHash: string;

  @Prop({ type: [Address], default: [] })
  addresses: Address[];

  // Nuevo campo solicitado: role
  @Prop({
    type: String,
    enum: ['consumer', 'restaurant'],
    required: true,
    default: 'consumer',
  })
  role: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
