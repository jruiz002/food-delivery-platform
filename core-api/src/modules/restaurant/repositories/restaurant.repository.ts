import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Restaurant, RestaurantDocument } from '../schemas/restaurant.schema';

@Injectable()
export class RestaurantRepository {
  constructor(
    @InjectModel(Restaurant.name)
    private restaurantModel: Model<RestaurantDocument>,
  ) {}

  async findAll(
    filter: any,
    projection: any,
    sort: any,
    limit: number,
    skip: number,
  ): Promise<Restaurant[]> {
    const result = await this.restaurantModel.collection
      .find(filter, {
        projection,
        sort,
        limit,
        skip,
      })
      .toArray();

    return result as unknown as Restaurant[];
  }

  async countDocuments(filter: any): Promise<number> {
    return this.restaurantModel.countDocuments(filter).exec();
  }

  async findAllMenuItems(pipeline: any[]): Promise<any[]> {
    return this.restaurantModel.aggregate(pipeline).exec();
  }

  async findById(id: string): Promise<Restaurant | null> {
    return this.restaurantModel.findById(id).exec();
  }

  async create(createRestaurantDto: any): Promise<Restaurant> {
    const createdRestaurant = new this.restaurantModel(createRestaurantDto);
    return createdRestaurant.save();
  }

  async update(
    id: string,
    updateRestaurantDto: any,
    options: { new: boolean },
  ): Promise<Restaurant | null> {
    return this.restaurantModel
      .findByIdAndUpdate(id, updateRestaurantDto, options)
      .exec();
  }

  async delete(id: string): Promise<Restaurant | null> {
    return this.restaurantModel.findByIdAndDelete(id).exec();
  }
}
