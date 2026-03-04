export interface OrderItem {
  menu_item_id: string;
  name: string;
  quantity: number;
  price: number;
}

export interface Order {
  _id: string;
  user_id: string;
  restaurant_id: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'Pending' | 'Preparing' | 'Delivered' | 'Cancelled';
  deliveredAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateOrderDto {
  restaurant_id: string;
  items: {
    menu_item_id: string;
    quantity: number;
  }[];
}

export interface UpdateOrderStatusDto {
  status: 'Pending' | 'Preparing' | 'Delivered' | 'Cancelled';
}

export interface OrderHistoryFilters {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  restaurant_id?: string;
}

export interface RestaurantAnalytics {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  ordersByStatus: {
    status: string;
    count: number;
  }[];
  // Añadir más campos según lo que retorne el backend
}
