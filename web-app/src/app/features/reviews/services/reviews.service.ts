import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  Review,
  CreateReviewDto,
  UpdateReviewDto,
  ReviewFilters
} from '../models/review.model';

@Injectable({
  providedIn: 'root'
})
export class ReviewsService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/review`;

  /**
   * GET /review
   * Obtener lista de reseñas con filtros
   */
  getAll(filters?: ReviewFilters): Observable<Review[]> {
    let params = new HttpParams();
    
    if (filters) {
      if (filters.order) params = params.set('order', filters.order);
      if (filters.page) params = params.set('page', filters.page.toString());
      if (filters.limit) params = params.set('limit', filters.limit.toString());
    }

    return this.http.get<Review[]>(this.apiUrl, { params });
  }

  /**
   * GET /review/:id
   * Obtener una reseña por ID
   */
  getById(id: string): Observable<Review> {
    return this.http.get<Review>(`${this.apiUrl}/${id}`);
  }

  /**
   * POST /review
   * Crear una nueva reseña (requiere autenticación y role 'consumer')
   */
  create(data: CreateReviewDto): Observable<Review> {
    return this.http.post<Review>(this.apiUrl, data);
  }

  /**
   * PATCH /review/:id
   * Actualizar una reseña (requiere autenticación, role 'consumer' y ser el owner)
   */
  update(id: string, data: UpdateReviewDto): Observable<Review> {
    return this.http.patch<Review>(`${this.apiUrl}/${id}`, data);
  }

  /**
   * DELETE /review/batch
   * Eliminar múltiples reseñas (requiere autenticación)
   */
  deleteMany(ids: string[]): Observable<any> {
    return this.http.delete(`${this.apiUrl}/batch`, { body: ids });
  }
}
