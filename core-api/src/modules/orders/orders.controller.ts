import {
  Body,
  Controller,
  Get,
  Post,
  Patch,
  UseGuards,
  UnauthorizedException,
  Query,
  Param,
  ForbiddenException,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { GetUser } from '../../common/decorators/get-user.decorator';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async createOrder(
    @GetUser('sub') userId: string,
    @Body() createOrderDto: CreateOrderDto,
  ) {
    if (!userId) {
      throw new UnauthorizedException(
        'No se pudo identificar al usuario desde el token.',
      );
    }

    return this.ordersService.createOrder(userId, createOrderDto);
  }

  @Get('history')
  @UseGuards(JwtAuthGuard)
  async getHistory(
    @GetUser('sub') userId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
    @Query('restaurant_id') restaurant_id?: string,
  ) {
    if (!userId) {
      throw new UnauthorizedException(
        'No se pudo identificar al usuario desde el token.',
      );
    }

    const parsedPage = page ? parseInt(page, 10) : 1;
    const parsedLimit = limit ? parseInt(limit, 10) : 10;

    return this.ordersService.getUserHistory(userId, {
      page: parsedPage,
      limit: parsedLimit,
      sortBy,
      sortOrder,
      restaurant_id,
    });
  }

  @Get('restaurant/:restaurantId/analytics')
  @UseGuards(JwtAuthGuard)
  async getAnalytics(
    @Param('restaurantId') restaurantId: string,
    @GetUser('role') role: string,
  ) {
    // Restricción de Dominio: Sólo los restaurantes deberían ver sus propias analíticas
    if (role !== 'restaurant') {
      throw new UnauthorizedException(
        'Acceso denegado: Se requiere ser un restaurante para ver analíticas.',
      );
    }

    return this.ordersService.getRestaurantAnalytics(restaurantId);
  }

  @Get('restaurant/:restaurantId/orders')
  @UseGuards(JwtAuthGuard)
  async getRestaurantOrders(
    @Param('restaurantId') restaurantId: string,
    @GetUser('sub') userId: string,
    @GetUser('role') role: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
    @Query('status') status?: string,
  ) {
    if (role !== 'restaurant') {
      throw new ForbiddenException(
        'Solo los usuarios restaurante pueden ver sus pedidos entrantes.',
      );
    }

    const parsedPage = page ? parseInt(page, 10) : 1;
    const parsedLimit = limit ? parseInt(limit, 10) : 10;

    return this.ordersService.getRestaurantOrders(restaurantId, userId, {
      page: parsedPage,
      limit: parsedLimit,
      sortBy,
      sortOrder,
      status,
    });
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard)
  async updateStatus(
    @Param('id') orderId: string,
    @Body() updateOrderStatusDto: UpdateOrderStatusDto,
    @GetUser('role') role: string,
    @GetUser('sub') userId: string,
  ) {
    if (role !== 'restaurant') {
      throw new ForbiddenException(
        'Only restaurant users can update order status.',
      );
    }
    return this.ordersService.updateStatus(
      orderId,
      updateOrderStatusDto.status,
      userId,
    );
  }
}
