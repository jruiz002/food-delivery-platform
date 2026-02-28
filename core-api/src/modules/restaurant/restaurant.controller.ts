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
} from '@nestjs/common';
import { RestaurantService } from './restaurant.service';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';

@Controller('restaurant')
export class RestaurantController {
  constructor(private readonly restaurantService: RestaurantService) {}

  @Post()
  create(@Body() createRestaurantDto: CreateRestaurantDto) {
    return this.restaurantService.create(createRestaurantDto);
  }

  @Get()
  async findAll(
    @Query('search') search?: string,
    @Query('status') status: 'active' | 'inactive' | 'all' = 'all',
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('sortBy') sortBy: string = 'name',
    @Query('order') order: 'asc' | 'desc' = 'asc',
  ) {
    const filter: any = {};
    const sort: any = {};
    const limitNum = Number(limit);
    const skip = (page - 1) * limitNum;

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
  update(
    @Param('id') id: string,
    @Body() updateRestaurantDto: UpdateRestaurantDto,
  ) {
    return this.restaurantService.update(id, updateRestaurantDto);
  }

  @Put(':id/menu')
  updateMenu(
    @Param('id') id: string,
    @Body(new ParseArrayPipe({ items: CreateMenuItemDto }))
    menuItems: CreateMenuItemDto[],
  ) {
    return this.restaurantService.updateMenu(id, menuItems);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.restaurantService.remove(id);
  }
}
