import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Order, OrderDocument } from '../../schemas/order.schema';

@Injectable()
export class OrdersRepository {
  constructor(
    @InjectModel(Order.name) private readonly orderModel: Model<OrderDocument>,
  ) {}

  async create(orderData: Partial<Order>): Promise<OrderDocument> {
    const createdOrder = new this.orderModel(orderData);
    return createdOrder.save();
  }

  async findByUserId(userId: string): Promise<any[]> {
    return this.orderModel
      .aggregate([
        { $match: { user_id: new Types.ObjectId(userId) } },
        {
          $lookup: {
            from: 'restaurants',
            localField: 'restaurant_id',
            foreignField: '_id',
            as: 'restaurantData',
          },
        },
        { $unwind: '$restaurantData' },
        {
          $project: {
            _id: 1,
            totalAmount: 1,
            status: 1,
            items: 1,
            createdAt: 1,
            'restaurant._id': '$restaurantData._id',
            'restaurant.name': '$restaurantData.name',
            'restaurant.location': '$restaurantData.location',
          },
        },
        { $sort: { createdAt: -1 } },
      ])
      .exec();
  }

  async findById(orderId: string): Promise<OrderDocument | null> {
    return this.orderModel.findById(orderId).exec();
  }

  // Se utilizará para validar si un usuario pidió de un restaurante o de un platillo
  async userHasOrdered(userId: string, restaurantId: string): Promise<boolean> {
    const count = await this.orderModel
      .countDocuments({
        user_id: userId,
        restaurant_id: restaurantId,
        status: { $ne: 'Cancelled' },
      })
      .exec();
    return count > 0;
  }
}
