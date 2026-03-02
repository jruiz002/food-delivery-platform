import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  UnauthorizedException,
  Query,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
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
}
