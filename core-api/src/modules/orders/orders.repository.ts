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

  async findByUserId(
    userId: string,
    query: {
      page?: number;
      limit?: number;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
      restaurant_id?: string;
    } = {},
  ): Promise<any[]> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      restaurant_id,
    } = query;

    const skip = (page - 1) * limit;

    const matchStage: any = { user_id: new Types.ObjectId(userId) };

    if (restaurant_id) {
      matchStage.restaurant_id = new Types.ObjectId(restaurant_id);
    }

    const sortStage: any = {};
    // -1 para desc, 1 para asc
    sortStage[sortBy] = sortOrder === 'desc' ? -1 : 1;

    return this.orderModel
      .aggregate([
        { $match: matchStage },
        // Ordenamos y paginamos ANTES del lookup para que sea drásticamente más rápido
        { $sort: sortStage },
        { $skip: skip },
        { $limit: limit },
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
