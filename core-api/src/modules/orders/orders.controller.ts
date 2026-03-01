import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  UnauthorizedException,
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
  async getHistory(@GetUser('sub') userId: string) {
    if (!userId) {
      throw new UnauthorizedException(
        'No se pudo identificar al usuario desde el token.',
      );
    }

    return this.ordersService.getUserHistory(userId);
  }
}
