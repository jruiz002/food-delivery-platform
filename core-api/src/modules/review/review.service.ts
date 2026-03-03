import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ReviewRepository } from './repositories/review.repository';
import { Review } from './schemas/review.schema';
import { OrdersService } from '../orders/orders.service';

@Injectable()
export class ReviewService {
  constructor(
    private readonly reviewRepository: ReviewRepository,
    private readonly ordersService: OrdersService,
  ) {}

  async create(createReviewDto: CreateReviewDto): Promise<Review> {
    const hasOrdered =
      await this.ordersService.verifyUserPurchasedFromRestaurant(
        createReviewDto.userId,
        createReviewDto.restaurantId,
      );

    if (!hasOrdered) {
      throw new BadRequestException(
        'El usuario no puede realizar una reseña a este restaurante sin antes haber consumido allí.',
      );
    }

    return this.reviewRepository.create(createReviewDto);
  }

  async findOne(id: string): Promise<Review> {
    const review = await this.reviewRepository.findOne(id);
    if (!review) {
      throw new NotFoundException(`Review with ID ${id} not found`);
    }
    return review;
  }

  async findAll(
    order: 'asc' | 'desc' = 'desc',
    page: number = 1,
    limit: number = 10,
  ): Promise<Review[]> {
    return this.reviewRepository.findAll(order, page, limit);
  }

  async update(
    id: string,
    updateReviewDto: UpdateReviewDto,
    userId: string,
  ): Promise<Review> {
    const review = await this.findOne(id);

    if (review.user_id.toString() !== userId) {
      throw new ForbiddenException(
        'No tienes permiso para modificar esta reseña.',
      );
    }

    const updatedReview = await this.reviewRepository.update(
      id,
      updateReviewDto,
    );
    if (!updatedReview) {
      throw new NotFoundException(`Review with ID ${id} not found`);
    }
    return updatedReview;
  }

  async deleteMany(
    ids: string[],
    role: string,
    userId: string,
  ): Promise<any> {
    if (role === 'consumer') {
      const notOwnedCount = await this.reviewRepository.countNotOwned(
        ids,
        userId,
      );
      if (notOwnedCount > 0) {
        throw new ForbiddenException(
          'You do not have permission to delete one or more of these reviews.',
        );
      }
      return this.reviewRepository.deleteManyByUser(ids, userId);
    }
    return this.reviewRepository.deleteMany(ids);
  }
}
