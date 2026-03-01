import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrdersRepository } from './orders.repository';
import { RestaurantService } from '../restaurant/restaurant.service';
import { Types } from 'mongoose';
import { Order } from '../../schemas/order.schema';

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

  async getUserHistory(userId: string) {
    return this.ordersRepository.findByUserId(userId);
  }

  async verifyUserPurchasedFromRestaurant(
    userId: string,
    restaurantId: string,
  ): Promise<boolean> {
    return this.ordersRepository.userHasOrdered(userId, restaurantId);
  }
}
