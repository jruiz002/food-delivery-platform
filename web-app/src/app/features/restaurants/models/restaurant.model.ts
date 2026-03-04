export interface MenuItem {
  _id: string;
  name: string;
  price: number;
  description?: string;
  tags: string[];
  available: boolean;
}

export interface Restaurant {
  _id: string;
  owner_id: string;
  name: string;
  description: string;
  menu: MenuItem[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateRestaurantDto {
  name: string;
  description: string;
  isActive?: boolean;
}

export interface UpdateRestaurantDto {
  name?: string;
  description?: string;
  isActive?: boolean;
}

export interface CreateMenuItemDto {
  name: string;
  price: number;
  description?: string;
  tags?: string[];
  available?: boolean;
}

export interface RestaurantFilters {
  search?: string;
  status?: 'active' | 'inactive' | 'all';
  page?: number;
  limit?: number;
  sortBy?: string;
  order?: 'asc' | 'desc';
  ownerId?: string;
}

export interface MenuFilters {
  search?: string;
  status?: 'available' | 'unavailable' | 'all';
  page?: number;
  limit?: number;
  sortBy?: string;
  order?: 'asc' | 'desc';
}
