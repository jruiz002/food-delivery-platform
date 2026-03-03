import { IsEnum, IsNotEmpty } from 'class-validator';

export class UpdateOrderStatusDto {
  @IsNotEmpty()
  @IsEnum(['Pending', 'Preparing', 'Delivered', 'Cancelled'])
  status: string;
}
