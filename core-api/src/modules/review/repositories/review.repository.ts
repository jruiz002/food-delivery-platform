import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Review, ReviewDocument } from '../schemas/review.schema';
import { CreateReviewDto } from '../dto/create-review.dto';
import { UpdateReviewDto } from '../dto/update-review.dto';

@Injectable()
export class ReviewRepository {
  constructor(
    @InjectModel(Review.name) private reviewModel: Model<ReviewDocument>,
  ) {}

  async create(createReviewDto: CreateReviewDto): Promise<Review> {
    const newReview = new this.reviewModel({
      user_id: new Types.ObjectId(createReviewDto.userId),
      restaurant_id: new Types.ObjectId(createReviewDto.restaurantId),
      menu_item_id: createReviewDto.menuItemId
        ? new Types.ObjectId(createReviewDto.menuItemId)
        : null,
      order_id: new Types.ObjectId(createReviewDto.orderId), // Obligatorio ahora
      rating: createReviewDto.rating,
      comment: createReviewDto.comment,
    });
    return newReview.save();
  }

  async findOne(id: string): Promise<Review | null> {
    return this.reviewModel.findById(id).exec();
  }

  async findAll(
    sortOrder: 'asc' | 'desc' = 'desc',
    page: number = 1,
    limit: number = 10,
  ): Promise<Review[]> {
    const sortValue = sortOrder === 'asc' ? 1 : -1;
    const skip = (page - 1) * limit;
    return this.reviewModel
      .find()
      .sort({ rating: sortValue })
      .skip(skip)
      .limit(limit)
      .exec();
  }

  async update(
    id: string,
    updateReviewDto: UpdateReviewDto,
  ): Promise<Review | null> {
    return this.reviewModel
      .findByIdAndUpdate(id, updateReviewDto, { new: true })
      .exec();
  }

  async deleteMany(ids: string[]): Promise<any> {
    const objectIds = ids.map((id) => new Types.ObjectId(id));
    return this.reviewModel.deleteMany({ _id: { $in: objectIds } }).exec();
  }
}
