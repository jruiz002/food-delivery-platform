import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { ReviewService } from './review.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';

import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { GetUser } from '../../common/decorators/get-user.decorator';

@Controller('review')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(
    @Body() createReviewDto: CreateReviewDto,
    @GetUser('role') role: string,
    @GetUser('sub') userId: string,
  ) {
    if (role === 'restaurant') {
      throw new ForbiddenException('Restaurants cannot review');
    }
    // Set userId from token
    createReviewDto.userId = userId;
    return this.reviewService.create(createReviewDto);
  }

  @Get()
  findAll(
    @Query('order') order: 'asc' | 'desc' = 'desc',
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.reviewService.findAll(order, page, limit);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.reviewService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id') id: string,
    @Body() updateReviewDto: UpdateReviewDto,
    @GetUser('role') role: string,
    @GetUser('sub') userId: string,
  ) {
    if (role === 'restaurant') {
      throw new ForbiddenException('Restaurants cannot update reviews');
    }
    return this.reviewService.update(id, updateReviewDto, userId); 
  }

  @Delete('batch')
  @UseGuards(JwtAuthGuard)
  deleteMany(
    @Body() ids: string[],
    @GetUser('role') role: string,
    @GetUser('sub') userId: string,
  ) {
    return this.reviewService.deleteMany(ids, role, userId);
  }
}