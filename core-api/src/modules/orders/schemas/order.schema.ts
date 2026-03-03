import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type OrderDocument = Order & Document;

@Schema({ _id: false })
export class OrderItem {
  @Prop({ type: Types.ObjectId, required: true })
  menu_item_id: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, type: Number })
  quantity: number;

  @Prop({ required: true, type: Types.Decimal128 })
  price: Types.Decimal128;
}

@Schema({ collection: 'orders', timestamps: true }) // Mongoose gestionará createdAt y updatedAt
export class Order {
  @Prop({ type: Types.ObjectId, required: true, ref: 'User' })
  user_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true, ref: 'Restaurant' })
  restaurant_id: Types.ObjectId;

  @Prop({ type: [OrderItem], required: true })
  items: OrderItem[];

  @Prop({ required: true, type: Types.Decimal128 })
  totalAmount: Types.Decimal128;

  @Prop({
    type: String,
    enum: ['Pending', 'Preparing', 'Delivered', 'Cancelled'],
    required: true,
    default: 'Pending',
  })
  status: string;

  @Prop({ type: Date, default: null })
  deliveredAt: Date;
}

export const OrderSchema = SchemaFactory.createForClass(Order);

// Índices requeridos en Orders
OrderSchema.index({ status: 1 }); // Para búsqueda frecuente de órdenes por estado
OrderSchema.index({ restaurant_id: 1, createdAt: -1 }); // Para ordenamiento histórico por restaurante
