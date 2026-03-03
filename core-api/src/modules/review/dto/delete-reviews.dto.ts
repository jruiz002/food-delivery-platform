import { IsArray, IsMongoId, IsNotEmpty } from 'class-validator';

export class DeleteReviewsDto {
  @IsArray()
  @IsNotEmpty()
  @IsMongoId({ each: true })
  ids: string[];
}
