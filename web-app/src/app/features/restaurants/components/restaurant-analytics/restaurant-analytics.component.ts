import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { OrdersService } from '../../../orders/services/orders.service';
import { ReviewsService } from '../../../reviews/services/reviews.service';
import { RestaurantService } from '../../services/restaurant.service';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-restaurant-analytics',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule],
  templateUrl: './restaurant-analytics.component.html',
  styleUrl: './restaurant-analytics.component.css'
})
export class RestaurantAnalyticsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private ordersService = inject(OrdersService);
  private reviewsService = inject(ReviewsService);
  private restaurantService = inject(RestaurantService);
  private authService = inject(AuthService);

  restaurantId = signal<string | null>(null);
  restaurantName = signal<string>('');
  analytics = signal<any | null>(null);
  reviews = signal<any[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  reviewsError = signal<string | null>(null);

  currentUser = this.authService.currentUser;

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error.set('No se encontró el ID del restaurante.');
      return;
    }
    this.restaurantId.set(id);
    this.loadData(id);
  }

  loadData(id: string) {
    this.loading.set(true);

    // Load restaurant name
    this.restaurantService.getById(id).subscribe({
      next: (r) => this.restaurantName.set(r.name),
      error: () => {}
    });

    // Load analytics
    this.ordersService.getRestaurantAnalytics(id).subscribe({
      next: (data) => {
        this.analytics.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Error al cargar analíticas.');
        this.loading.set(false);
      }
    });

    // Load reviews and filter client-side by restaurant_id
    this.reviewsService.getAll({ limit: 10000 }).subscribe({
      next: (reviews) => {
        this.reviewsError.set(null);
        // Usamos String() para manejar cualquier tipo de serialización (ObjectId o string)
        this.reviews.set(reviews.filter(r => String(r.restaurant_id) === id));
      },
      error: (err) => {
        this.reviewsError.set(err.error?.message ?? 'No se pudieron cargar las reseñas.');
      }
    });
  }

  getAverageRating(): number {
    const r = this.reviews();
    if (!r.length) return 0;
    return r.reduce((acc, rev) => acc + rev.rating, 0) / r.length;
  }

  getStars(rating: number): number[] {
    return [1, 2, 3, 4, 5];
  }

  formatPrice(amount: any): string {
    if (amount == null) return '$0.00';
    const num = typeof amount === 'object' && amount.$numberDecimal
      ? parseFloat(amount.$numberDecimal)
      : parseFloat(amount);
    return `$${num.toFixed(2)}`;
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('es', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  }

  goBack() {
    this.router.navigate(['/restaurants', this.restaurantId()]);
  }
}
