import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  Order,
  CreateOrderDto,
  UpdateOrderStatusDto,
  OrderHistoryFilters,
  RestaurantAnalytics,
  RestaurantOrderFilters,
  RestaurantOrderItem
} from '../models/order.model';

@Injectable({
  providedIn: 'root'
})
export class OrdersService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/orders`;

  /**
   * POST /orders
   * Crear una nueva orden (requiere autenticación)
   */
  create(data: CreateOrderDto): Observable<Order> {
    return this.http.post<Order>(this.apiUrl, data);
  }

  /**
   * GET /orders/history
   * Obtener historial de órdenes del usuario autenticado
   */
  getHistory(filters?: OrderHistoryFilters): Observable<Order[]> {
    let params = new HttpParams();
    
    if (filters) {
      if (filters.page) params = params.set('page', filters.page.toString());
      if (filters.limit) params = params.set('limit', filters.limit.toString());
      if (filters.sortBy) params = params.set('sortBy', filters.sortBy);
      if (filters.sortOrder) params = params.set('sortOrder', filters.sortOrder);
      if (filters.restaurant_id) params = params.set('restaurant_id', filters.restaurant_id);
    }

    return this.http.get<Order[]>(`${this.apiUrl}/history`, { params });
  }

  /**
   * GET /orders/restaurant/:restaurantId/analytics
   * Obtener analíticas de un restaurante (requiere autenticación y role 'restaurant')
   */
  getRestaurantAnalytics(restaurantId: string): Observable<RestaurantAnalytics> {
    return this.http.get<RestaurantAnalytics>(`${this.apiUrl}/restaurant/${restaurantId}/analytics`);
  }

  /**
   * GET /orders/restaurant/:restaurantId/orders
   * Obtener pedidos entrantes de un restaurante (requiere role 'restaurant')
   */
  getRestaurantOrders(restaurantId: string, filters?: RestaurantOrderFilters): Observable<RestaurantOrderItem[]> {
    let params = new HttpParams();

    if (filters) {
      if (filters.page) params = params.set('page', filters.page.toString());
      if (filters.limit) params = params.set('limit', filters.limit.toString());
      if (filters.sortBy) params = params.set('sortBy', filters.sortBy);
      if (filters.sortOrder) params = params.set('sortOrder', filters.sortOrder);
      if (filters.status) params = params.set('status', filters.status);
    }

    return this.http.get<RestaurantOrderItem[]>(`${this.apiUrl}/restaurant/${restaurantId}/orders`, { params });
  }

  /**
   * PATCH /orders/:id/status
   * Actualizar el estado de una orden (requiere autenticación y role 'restaurant')
   */
  updateStatus(orderId: string, data: UpdateOrderStatusDto): Observable<Order> {
    return this.http.patch<Order>(`${this.apiUrl}/${orderId}/status`, data);
  }
}
