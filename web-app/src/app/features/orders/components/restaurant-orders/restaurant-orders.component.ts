import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { OrdersService } from '../../services/orders.service';
import { AuthService } from '@core/services/auth.service';
import { RestaurantOrderItem } from '../../models/order.model';

type OrderStatus = 'Pending' | 'Preparing' | 'Delivered' | 'Cancelled';

@Component({
  selector: 'app-restaurant-orders',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './restaurant-orders.component.html',
  styleUrl: './restaurant-orders.component.css'
})
export class RestaurantOrdersComponent implements OnInit {
  private ordersService = inject(OrdersService);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  restaurantId = signal<string>('');
  orders = signal<RestaurantOrderItem[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  // Filters
  statusFilter = signal<string>('');
  sortBy = signal('createdAt');
  sortOrder = signal<'asc' | 'desc'>('desc');
  page = signal(1);
  limit = signal(10);

  // Status update
  updatingOrderId = signal<string | null>(null);
  updateError = signal<string | null>(null);

  readonly statuses: OrderStatus[] = ['Pending', 'Preparing', 'Delivered', 'Cancelled'];
  readonly statusLabels: Record<OrderStatus, string> = {
    Pending: 'Pendiente',
    Preparing: 'Preparando',
    Delivered: 'Entregado',
    Cancelled: 'Cancelado',
  };
  readonly sortOptions = [
    { value: 'createdAt', label: 'Fecha' },
    { value: 'totalAmount', label: 'Total' },
    { value: 'status', label: 'Estado' },
  ];

  ngOnInit() {
    if (!this.authService.isRestaurant()) {
      this.router.navigate(['/restaurants']);
      return;
    }

    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.restaurantId.set(id);
        this.loadOrders();
      }
    });
  }

  loadOrders() {
    this.loading.set(true);
    this.error.set(null);
    this.updateError.set(null);

    this.ordersService.getRestaurantOrders(this.restaurantId(), {
      page: this.page(),
      limit: this.limit(),
      sortBy: this.sortBy(),
      sortOrder: this.sortOrder(),
      status: this.statusFilter() || undefined,
    }).subscribe({
      next: (data) => {
        this.orders.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message ?? 'Error al cargar los pedidos.');
        this.loading.set(false);
      }
    });
  }

  applyFilters() {
    this.page.set(1);
    this.loadOrders();
  }

  nextPage() {
    this.page.update(p => p + 1);
    this.loadOrders();
  }

  prevPage() {
    if (this.page() > 1) {
      this.page.update(p => p - 1);
      this.loadOrders();
    }
  }

  changeStatus(order: RestaurantOrderItem, newStatus: OrderStatus) {
    if (order.status === newStatus) return;

    this.updatingOrderId.set(order._id);
    this.updateError.set(null);

    this.ordersService.updateStatus(order._id, { status: newStatus }).subscribe({
      next: () => {
        this.orders.update(list =>
          list.map(o => o._id === order._id ? { ...o, status: newStatus } : o)
        );
        this.updatingOrderId.set(null);
      },
      error: (err) => {
        this.updateError.set(err.error?.message ?? 'No se pudo actualizar el estado.');
        this.updatingOrderId.set(null);
      }
    });
  }

  nextStatuses(current: OrderStatus): OrderStatus[] {
    const flow: Record<OrderStatus, OrderStatus[]> = {
      Pending: ['Preparing', 'Cancelled'],
      Preparing: ['Delivered', 'Cancelled'],
      Delivered: [],
      Cancelled: [],
    };
    return flow[current];
  }

  formatAmount(amount: any): number {
    if (amount && typeof amount === 'object' && '$numberDecimal' in amount) {
      return parseFloat(amount.$numberDecimal);
    }
    return parseFloat(amount) || 0;
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      Pending: 'status-pending',
      Preparing: 'status-preparing',
      Delivered: 'status-delivered',
      Cancelled: 'status-cancelled',
    };
    return map[status] ?? '';
  }

  goBack() {
    this.router.navigate(['/restaurants', this.restaurantId()]);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
