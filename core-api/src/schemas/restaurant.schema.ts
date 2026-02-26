import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type RestaurantDocument = Restaurant & Document;

@Schema({ _id: false })
export class Location {
  @Prop({ type: String, enum: ['Point'], required: true, default: 'Point' })
  type: string;

  @Prop({ type: [Number], required: true }) // [longitude, latitude]
  coordinates: number[];
}

@Schema()
export class MenuItem {
  @Prop({ type: Types.ObjectId, default: () => new Types.ObjectId() })
  _id: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, type: Number })
  price: number;

  @Prop()
  description: string;

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ required: true, default: true })
  available: boolean;
}

@Schema({ _id: false })
export class Stats {
  @Prop({ type: Number, default: 0 })
  averageRating: number;

  @Prop({ type: Number, default: 0 })
  totalReviews: number;
}

@Schema({ collection: 'restaurants', timestamps: true })
export class Restaurant {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ type: Location, required: true })
  location: Location;

  @Prop({ type: [MenuItem], default: [] })
  menu: MenuItem[];

  @Prop({ type: Stats, default: () => ({}) })
  stats: Stats;

  @Prop({ required: true, default: true })
  isActive: boolean;
}

export const RestaurantSchema = SchemaFactory.createForClass(Restaurant);

// Índices requeridos (Se pueden definir a nivel DB o esquema)
RestaurantSchema.index({ 'menu.tags': 1 });
RestaurantSchema.index({ location: '2dsphere' });
RestaurantSchema.index({ name: 'text', description: 'text' });
