import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';
import { Restaurant } from './schemas/restaurant.schema';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { RestaurantRepository } from './repositories/restaurant.repository';
import { Types } from 'mongoose';

@Injectable()
export class RestaurantService {
  constructor(private readonly restaurantRepository: RestaurantRepository) {}

  async create(
    userId: string,
    createRestaurantDto: CreateRestaurantDto,
  ): Promise<Restaurant> {
    const restaurantData = {
      ...createRestaurantDto,
      owner_id: new Types.ObjectId(userId),
    };
    return this.restaurantRepository.create(restaurantData as any);
  }

  async findAll(
    filter: any = {},
    projection: any = {},
    sort: any = {},
    limit: number = 10,
    skip: number = 0,
  ): Promise<{ data: Restaurant[]; total: number }> {
    const [data, total] = await Promise.all([
      this.restaurantRepository.findAll(filter, projection, sort, limit, skip),
      this.restaurantRepository.countDocuments(filter),
    ]);

    return { data, total };
  }

  async findAllMenuItems(
    restaurantId: string,
    search?: string,
    status: 'available' | 'unavailable' | 'all' = 'all',
    page: number = 1,
    limit: number = 10,
    sortBy: string = 'name',
    order: 'asc' | 'desc' = 'asc',
  ): Promise<any[]> {
    const pipeline: any[] = [
      { $match: { _id: new Types.ObjectId(restaurantId) } },
      { $unwind: '$menu' },
    ];

    // Filter by status
    if (status === 'available') {
      pipeline.push({ $match: { 'menu.available': true } });
    } else if (status === 'unavailable') {
      pipeline.push({ $match: { 'menu.available': false } });
    }

    // Search by name, description, tags
    if (search) {
      const regex = new RegExp(search, 'i');
      pipeline.push({
        $match: {
          $or: [
            { 'menu.name': { $regex: regex } },
            { 'menu.description': { $regex: regex } },
            { 'menu.tags': { $regex: regex } },
          ],
        },
      });
    }

    // Sort
    const sortStage: any = {};
    // Ensure sortBy refers to a valid field inside menu or use menu prefix if needed
    // Assuming sortBy comes as 'name' or 'price'
    const sortField = `menu.${sortBy}`;
    sortStage[sortField] = order === 'asc' ? 1 : -1;
    pipeline.push({ $sort: sortStage });

    // Pagination
    pipeline.push({ $skip: (page - 1) * limit });
    pipeline.push({ $limit: Number(limit) });

    // Project
    pipeline.push({
      $project: {
        _id: '$menu._id',
        name: '$menu.name',
        price: '$menu.price',
        description: '$menu.description',
        tags: '$menu.tags',
        available: '$menu.available',
        restaurantId: '$_id',
        restaurantName: '$name',
      },
    });

    return this.restaurantRepository.findAllMenuItems(pipeline);
  }

  async findOne(id: string): Promise<Restaurant> {
    const restaurant = await this.restaurantRepository.findById(id);
    if (!restaurant) {
      throw new NotFoundException(`Restaurant with ID ${id} not found`);
    }
    return restaurant;
  }

  async update(
    id: string,
    updateRestaurantDto: UpdateRestaurantDto,
  ): Promise<Restaurant> {
    const updatedRestaurant = await this.restaurantRepository.update(
      id,
      updateRestaurantDto,
      { new: true },
    );
    if (!updatedRestaurant) {
      throw new NotFoundException(`Restaurant with ID ${id} not found`);
    }
    return updatedRestaurant;
  }

  async updateMenu(
    id: string,
    menuItems: CreateMenuItemDto[],
  ): Promise<Restaurant> {
    const updatedRestaurant = await this.restaurantRepository.update(
      id,
      { $set: { menu: menuItems } },
      { new: true },
    );
    if (!updatedRestaurant) {
      throw new NotFoundException(`Restaurant with ID ${id} not found`);
    }
    return updatedRestaurant;
  }

  async remove(id: string): Promise<Restaurant> {
    const deletedRestaurant = await this.restaurantRepository.delete(id);
    if (!deletedRestaurant) {
      throw new NotFoundException(`Restaurant with ID ${id} not found`);
    }
    return deletedRestaurant;
  }
}
