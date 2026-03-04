export interface Review {
  _id: string;
  user_id: string;
  restaurant_id: string;
  menu_item_id?: string;
  order_id?: string;
  rating: number; // 1-5
  comment?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateReviewDto {
  userId: string;
  restaurantId: string;
  menuItemId?: string;
  orderId: string;
  rating: number;
  comment?: string;
}

export interface UpdateReviewDto {
  rating?: number;
  comment?: string;
}

export interface ReviewFilters {
  order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}
