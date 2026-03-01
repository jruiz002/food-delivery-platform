import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type RestaurantDocument = Restaurant & Document;

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
export class Location {
  @Prop({ type: String, enum: ['Point'], required: true })
  type: string;

  @Prop({ type: [Number], required: true })
  coordinates: number[];
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

  @Prop({ required: true, default: true })
  isActive: boolean;
}

export const RestaurantSchema = SchemaFactory.createForClass(Restaurant);

// A. Índice Multikey para búsqueda eficiente en el menú por tags
RestaurantSchema.index({ 'menu.tags': 1 }); // Permite búsqueda eficiente en arrays

// B. Índice Geoespacial para buscar restaurantes por cercanía
RestaurantSchema.index({ location: '2dsphere' }); // Para consultas $near optimizadas

// C. Índice de Texto para búsqueda por palabras clave en descripciones/nombres
RestaurantSchema.index({ name: 'text', description: 'text' });
