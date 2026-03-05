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

@Schema({ collection: 'restaurants', timestamps: true })
export class Restaurant {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  owner_id: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ type: [MenuItem], default: [] })
  menu: MenuItem[];

  @Prop({ required: true, default: true })
  isActive: boolean;
}

export const RestaurantSchema = SchemaFactory.createForClass(Restaurant);

// A. Índice Multikey para búsqueda eficiente en el menú por tags
RestaurantSchema.index({ 'menu.tags': 1 }); // Permite búsqueda eficiente en arrays

// B. Índice en owner_id para filtrar restaurantes por dueño (crítico para consultas de restaurantes)
RestaurantSchema.index({ owner_id: 1 });

// C. Índice en isActive para filtrar por status (activo/inactivo)
RestaurantSchema.index({ isActive: 1 });

// D. Índice compuesto para ordenar por fecha de creación
RestaurantSchema.index({ createdAt: -1 });

// E. Índice de Texto para búsqueda por palabras clave en descripciones/nombres
RestaurantSchema.index({ name: 'text', description: 'text' });

// F. Índice compuesto para consultas comunes (owner + status)
RestaurantSchema.index({ owner_id: 1, isActive: 1 });
