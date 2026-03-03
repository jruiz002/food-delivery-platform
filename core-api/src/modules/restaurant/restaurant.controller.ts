import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Put,
  ParseArrayPipe,
  Query,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { RestaurantService } from './restaurant.service';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { Types } from 'mongoose';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { GetUser } from '../../common/decorators/get-user.decorator';

@Controller('restaurant')
export class RestaurantController {
  constructor(private readonly restaurantService: RestaurantService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(
    @GetUser('sub') userId: string,
    @GetUser('role') role: string,
    @Body() createRestaurantDto: CreateRestaurantDto,
  ) {
    if (role === 'consumer') {
      throw new ForbiddenException('Consumers cannot create restaurants');
    }
    return this.restaurantService.create(userId, createRestaurantDto);
  }

  @Get()
  async findAll(
    @Query('search') search?: string,
    @Query('status') status: 'active' | 'inactive' | 'all' = 'all',
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('sortBy') sortBy: string = 'name',
    @Query('order') order: 'asc' | 'desc' = 'asc',
    @Query('ownerId') ownerId?: string,
  ) {
    const filter: any = {};
    const sort: any = {};
    const limitNum = Number(limit);
    const skip = (page - 1) * limitNum;

    // Filter by ownerId
    if (ownerId) {
      filter.owner_id = new Types.ObjectId(ownerId);
    }

    // Filter by status
    if (status === 'active') {
      filter.isActive = true;
    } else if (status === 'inactive') {
      filter.isActive = false;
    }

    // Search by name or description
    if (search) {
      filter.$text = { $search: search }; // Using text index created in schema
    }

    // Sort
    sort[sortBy] = order === 'asc' ? 1 : -1;

    return this.restaurantService.findAll(filter, {}, sort, limitNum, skip);
  }

  @Get('menu')
  async findMenuItems(
    @Query('search') search?: string,
    @Query('status') status: 'available' | 'unavailable' | 'all' = 'all',
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('sortBy') sortBy: string = 'name',
    @Query('order') order: 'asc' | 'desc' = 'asc',
  ) {
    return this.restaurantService.findAllMenuItems(
      search,
      status,
      Number(page),
      Number(limit),
      sortBy,
      order,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.restaurantService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id') id: string,
    @Body() updateRestaurantDto: UpdateRestaurantDto,
    @GetUser('role') role: string,
  ) {
    if (role === 'consumer') {
      throw new ForbiddenException('Consumers cannot update restaurants');
    }
    return this.restaurantService.update(id, updateRestaurantDto);
  }

  @Put(':id/menu')
  @UseGuards(JwtAuthGuard)
  updateMenu(
    @Param('id') id: string,
    @Body(new ParseArrayPipe({ items: CreateMenuItemDto }))
    menuItems: CreateMenuItemDto[],
    @GetUser('role') role: string,
  ) {
    if (role === 'consumer') {
      throw new ForbiddenException('Consumers cannot update menu');
    }
    return this.restaurantService.updateMenu(id, menuItems);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string,  @GetUser('role') role: string) {
    if (role === 'consumer') {
      throw new ForbiddenException('Consumers cannot delete restaurants');
    }
    return this.restaurantService.remove(id);
  }
}
