import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  Restaurant,
  CreateRestaurantDto,
  UpdateRestaurantDto,
  CreateMenuItemDto,
  RestaurantFilters,
  MenuFilters,
  MenuItem
} from '../models/restaurant.model';

@Injectable({
  providedIn: 'root'
})
export class RestaurantService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/restaurant`;

  /**
   * GET /restaurant
   * Obtener lista de restaurantes con filtros
   */
  getAll(filters?: RestaurantFilters): Observable<{ data: Restaurant[]; total: number }> {
    let params = new HttpParams();
    
    if (filters) {
      if (filters.search) params = params.set('search', filters.search);
      if (filters.status) params = params.set('status', filters.status);
      if (filters.page) params = params.set('page', filters.page.toString());
      if (filters.limit) params = params.set('limit', filters.limit.toString());
      if (filters.sortBy) params = params.set('sortBy', filters.sortBy);
      if (filters.order) params = params.set('order', filters.order);
      if (filters.ownerId) params = params.set('ownerId', filters.ownerId);
    }

    return this.http.get<{ data: Restaurant[]; total: number }>(this.apiUrl, { params });
  }

  /**
   * GET /restaurant/menu
   * Buscar items del menú de todos los restaurantes
   */
  getAllMenuItems(filters?: MenuFilters): Observable<any> {
    let params = new HttpParams();
    
    if (filters) {
      if (filters.search) params = params.set('search', filters.search);
      if (filters.status) params = params.set('status', filters.status);
      if (filters.page) params = params.set('page', filters.page.toString());
      if (filters.limit) params = params.set('limit', filters.limit.toString());
      if (filters.sortBy) params = params.set('sortBy', filters.sortBy);
      if (filters.order) params = params.set('order', filters.order);
    }

    return this.http.get<any>(`${this.apiUrl}/menu`, { params });
  }

  /**
   * GET /restaurant/:id
   * Obtener un restaurante por ID
   */
  getById(id: string): Observable<Restaurant> {
    return this.http.get<Restaurant>(`${this.apiUrl}/${id}`);
  }

  /**
   * POST /restaurant
   * Crear un nuevo restaurante (requiere autenticación y role 'restaurant')
   */
  create(data: CreateRestaurantDto): Observable<Restaurant> {
    return this.http.post<Restaurant>(this.apiUrl, data);
  }

  /**
   * PATCH /restaurant/:id
   * Actualizar un restaurante (requiere autenticación y role 'restaurant')
   */
  update(id: string, data: UpdateRestaurantDto): Observable<Restaurant> {
    return this.http.patch<Restaurant>(`${this.apiUrl}/${id}`, data);
  }

  /**
   * PUT /restaurant/:id/menu
   * Actualizar el menú completo de un restaurante (requiere autenticación y role 'restaurant')
   */
  updateMenu(id: string, menuItems: CreateMenuItemDto[]): Observable<Restaurant> {
    return this.http.put<Restaurant>(`${this.apiUrl}/${id}/menu`, menuItems);
  }

  /**
   * DELETE /restaurant/:id
   * Eliminar un restaurante (requiere autenticación y role 'restaurant')
   */
  delete(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
