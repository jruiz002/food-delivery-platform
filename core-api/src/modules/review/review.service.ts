import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ReviewRepository } from './repositories/review.repository';
import { Review } from './schemas/review.schema';

@Injectable()
export class ReviewService {
  constructor(private readonly reviewRepository: ReviewRepository) {}

  async create(createReviewDto: CreateReviewDto): Promise<Review> {
    // TODO: Verify if the user has an order from this restaurant (when Order module is ready)

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

  async update(id: string, updateReviewDto: UpdateReviewDto): Promise<Review> {
    const updatedReview = await this.reviewRepository.update(
      id,
      updateReviewDto,
    );
    if (!updatedReview) {
      throw new NotFoundException(`Review with ID ${id} not found`);
    }
    return updatedReview;
  }

  async deleteMany(ids: string[]): Promise<any> {
    return this.reviewRepository.deleteMany(ids);
  }
}
