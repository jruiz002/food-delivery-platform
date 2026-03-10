import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Order, OrderDocument } from './schemas/order.schema';

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
        user_id: new Types.ObjectId(userId),
        restaurant_id: new Types.ObjectId(restaurantId),
        status: { $ne: 'Cancelled' },
      })
      .exec();
    return count > 0;
  }

  // Agregaciones Simples (countDocuments, distinct)
  async getRestaurantMetrics(restaurantId: string) {
    const totalOrders = await this.orderModel
      .countDocuments({ restaurant_id: new Types.ObjectId(restaurantId) })
      .exec();

    // distinct devuelve un array de objects/ids únicos. Medimos su longitud.
    const uniqueCustomersArray = await this.orderModel
      .distinct('user_id', { restaurant_id: new Types.ObjectId(restaurantId) })
      .exec();

    return {
      totalOrders,
      uniqueCustomers: uniqueCustomersArray.length,
    };
  }

  async updateStatus(
    orderId: string,
    status: string,
  ): Promise<OrderDocument | null> {
    return this.orderModel
      .findByIdAndUpdate(
        orderId,
        { status, deliveredAt: status === 'Delivered' ? new Date() : null },
        { new: true },
      )
      .exec();
  }

  async findByRestaurantId(
    restaurantId: string,
    query: {
      page?: number;
      limit?: number;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
      status?: string;
    } = {},
  ): Promise<any[]> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      status,
    } = query;

    const skip = (page - 1) * limit;
    const matchStage: any = { restaurant_id: new Types.ObjectId(restaurantId) };

    if (status) {
      matchStage.status = status;
    }

    const sortStage: any = {};
    sortStage[sortBy] = sortOrder === 'desc' ? -1 : 1;

    return this.orderModel
      .aggregate([
        { $match: matchStage },
        { $sort: sortStage },
        { $skip: skip },
        { $limit: limit },
        {
          $lookup: {
            from: 'users',
            localField: 'user_id',
            foreignField: '_id',
            as: 'consumerData',
          },
        },
        { $unwind: { path: '$consumerData', preserveNullAndEmptyArrays: true } },
        {
          $project: {
            _id: 1,
            totalAmount: 1,
            status: 1,
            items: 1,
            createdAt: 1,
            'consumer._id': '$consumerData._id',
            'consumer.name': '$consumerData.name',
            'consumer.email': '$consumerData.email',
          },
        },
      ])
      .exec();
  }

  async getTopDishes(restaurantId: string, limit: number = 5): Promise<any[]> {
    return this.orderModel
      .aggregate([
        { $match: { restaurant_id: new Types.ObjectId(restaurantId) } },
        { $unwind: '$items' },
        {
          $group: {
            // Agrupamos por ID del platillo
            _id: '$items.menu_item_id',
            name: { $first: '$items.name' },
            // Sumamos cuántas veces se pidió
            totalQuantitySold: { $sum: '$items.quantity' },
            // Calculamos cuánto dinero generó el platillo
            totalRevenue: {
              $sum: { $multiply: ['$items.quantity', '$items.price'] },
            },
          },
        },
        // Ordenar del más vendido al menos vendido
        { $sort: { totalQuantitySold: -1 } },
        { $limit: limit },
      ])
      .exec();
  }
}
