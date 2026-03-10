import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrdersRepository } from './orders.repository';
import { RestaurantService } from '../restaurant/restaurant.service';
import { Types } from 'mongoose';
import { Order } from './schemas/order.schema';

@Injectable()
export class OrdersService {
  constructor(
    private readonly ordersRepository: OrdersRepository,
    private readonly restaurantService: RestaurantService,
  ) {}

  async createOrder(
    userId: string,
    createOrderDto: CreateOrderDto,
  ): Promise<Order> {
    // Buscar el restaurante para verificar que existe y obtener su menú
    const restaurant = await this.restaurantService.findOne(
      createOrderDto.restaurant_id,
    );

    if (!restaurant.isActive) {
      throw new BadRequestException(
        'El restaurante no está activo en este momento.',
      );
    }

    let totalAmount = 0;
    const finalItems: any[] = [];

    // Validar y calcular precios
    for (const itemDto of createOrderDto.items) {
      const menuItem = restaurant.menu.find(
        (m) => m._id.toString() === itemDto.menu_item_id,
      );

      if (!menuItem) {
        throw new NotFoundException(
          `Item del menú con ID ${itemDto.menu_item_id} no encontrado en el restaurante.`,
        );
      }

      if (!menuItem.available) {
        throw new BadRequestException(
          `El item ${menuItem.name} no está disponible.`,
        );
      }

      const itemTotal = menuItem.price * itemDto.quantity;
      totalAmount += itemTotal;

      finalItems.push({
        menu_item_id: new Types.ObjectId(itemDto.menu_item_id),
        name: menuItem.name,
        quantity: itemDto.quantity,
        price: Types.Decimal128.fromString(menuItem.price.toString()),
      });
    }

    const orderData = {
      user_id: new Types.ObjectId(userId),
      restaurant_id: new Types.ObjectId(createOrderDto.restaurant_id),
      items: finalItems,
      totalAmount: Types.Decimal128.fromString(totalAmount.toString()),
      status: 'Pending',
    };

    return this.ordersRepository.create(orderData);
  }

  async getUserHistory(
    userId: string,
    query: {
      page?: number;
      limit?: number;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
      restaurant_id?: string;
    } = {},
  ) {
    return this.ordersRepository.findByUserId(userId, query);
  }

  async verifyUserPurchasedFromRestaurant(
    userId: string,
    restaurantId: string,
  ): Promise<boolean> {
    return this.ordersRepository.userHasOrdered(userId, restaurantId);
  }

  async getRestaurantAnalytics(restaurantId: string) {
    // Ejecutamos ambas consultas analíticas en paralelo para mayor eficiencia
    const [metrics, topDishes] = await Promise.all([
      this.ordersRepository.getRestaurantMetrics(restaurantId),
      this.ordersRepository.getTopDishes(restaurantId, 5),
    ]);

    return {
      metrics,
      topDishes,
    };
  }

  async getRestaurantOrders(
    restaurantId: string,
    userId: string,
    query: {
      page?: number;
      limit?: number;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
      status?: string;
    } = {},
  ) {
    const restaurant = await this.restaurantService.findOne(restaurantId);
    if (!restaurant) {
      throw new NotFoundException(
        `Restaurant with ID ${restaurantId} not found`,
      );
    }

    if (restaurant.owner_id.toString() !== userId) {
      throw new ForbiddenException(
        'You are not the owner of this restaurant.',
      );
    }

    return this.ordersRepository.findByRestaurantId(restaurantId, query);
  }

  async updateStatus(
    orderId: string,
    status: string,
    userId: string,
  ): Promise<Order> {
    const order = await this.ordersRepository.findById(orderId);
    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    const restaurant = await this.restaurantService.findOne(
      order.restaurant_id.toString(),
    );
    if (!restaurant) {
      throw new NotFoundException(
        `Restaurant with ID ${order.restaurant_id} not found`,
      );
    }

    if (!restaurant.owner_id) {
      throw new ForbiddenException(
        'The restaurant associated with this order has no owner assigned.',
      );
    }

    if (restaurant.owner_id.toString() !== userId) {
      throw new ForbiddenException(
        'You are not the owner of the restaurant for this order.',
      );
    }

    const updatedOrder = await this.ordersRepository.updateStatus(
      orderId,
      status,
    );
    if (!updatedOrder) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }
    return updatedOrder;
  }
}
