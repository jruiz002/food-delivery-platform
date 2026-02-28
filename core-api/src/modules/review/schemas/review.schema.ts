import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ReviewDocument = Review & Document;

@Schema({ collection: 'reviews', timestamps: true })
export class Review {
  @Prop({ type: Types.ObjectId, required: true, ref: 'User' })
  user_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true, ref: 'Restaurant' })
  restaurant_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, default: null }) // Opcional
  menu_item_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, default: null }) // Opcional
  order_id: Types.ObjectId;

  @Prop({ required: true, type: Number, min: 1, max: 5 })
  rating: number;

  @Prop()
  comment: string;
}

export const ReviewSchema = SchemaFactory.createForClass(Review);
