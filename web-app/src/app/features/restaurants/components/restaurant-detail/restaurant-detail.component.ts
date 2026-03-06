import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RestaurantService } from '../../services/restaurant.service';
import { Restaurant, MenuFilters } from '../../models/restaurant.model';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-restaurant-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, MatIconModule],
  templateUrl: './restaurant-detail.component.html',
  styleUrl: './restaurant-detail.component.css'
})
export class RestaurantDetailComponent implements OnInit {
  private restaurantService = inject(RestaurantService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  // Restaurant data
  restaurant = signal<Restaurant | null>(null);
  
  // Menu items data
  menuItems = signal<any[]>([]);
  
  // Loading and error states
  loading = signal(false);
  loadingMenu = signal(false);
  error = signal<string | null>(null);
  
  // Menu filters
  searchTerm = signal('');
  statusFilter = signal<'available' | 'unavailable' | 'all'>('all');
  currentPage = signal(1);
  itemsPerPage = signal(12);
  sortBy = signal('name');
  sortOrder = signal<'asc' | 'desc'>('asc');
  totalItems = signal(0);
  
  // Computed
  totalPages = computed(() => Math.ceil(this.totalItems() / this.itemsPerPage()));
  restaurantId = signal<string | null>(null);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.restaurantId.set(id);
      this.loadRestaurant(id);
      this.loadMenuItems();
    } else {
      this.error.set('No restaurant ID provided');
    }
  }

  loadRestaurant(id: string) {
    this.loading.set(true);
    this.error.set(null);

    this.restaurantService.getById(id).subscribe({
      next: (restaurant) => {
        this.restaurant.set(restaurant);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Failed to load restaurant');
        this.loading.set(false);
      }
    });
  }

  loadMenuItems() {
    const id = this.restaurantId();
    if (!id) return;

    this.loadingMenu.set(true);

    const filters: MenuFilters = {
      search: this.searchTerm() || undefined,
      status: this.statusFilter(),
      page: this.currentPage(),
      limit: this.itemsPerPage(),
      sortBy: this.sortBy(),
      order: this.sortOrder()
    };

    this.restaurantService.getAllMenuItems(id, filters).subscribe({
      next: (items) => {
        this.menuItems.set(items);
        // Si el backend no devuelve el total, usamos la longitud del array
        this.totalItems.set(items.length);
        this.loadingMenu.set(false);
      },
      error: (err) => {
        console.error('Failed to load menu items:', err);
        this.menuItems.set([]);
        this.loadingMenu.set(false);
      }
    });
  }

  // Filter handlers
  onSearchChange() {
    this.currentPage.set(1);
    this.loadMenuItems();
  }

  onStatusChange() {
    this.currentPage.set(1);
    this.loadMenuItems();
  }

  onSortChange(sortBy: string) {
    if (this.sortBy() === sortBy) {
      // Toggle order
      this.sortOrder.set(this.sortOrder() === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortBy.set(sortBy);
      this.sortOrder.set('asc');
    }
    this.currentPage.set(1);
    this.loadMenuItems();
  }

  onPageChange(page: number) {
    this.currentPage.set(page);
    this.loadMenuItems();
  }

  // Pagination helpers
  getPageNumbers(): number[] {
    const total = this.totalPages();
    const current = this.currentPage();
    const maxVisible = 5;
    
    if (total <= maxVisible) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }
    
    let start = Math.max(1, current - Math.floor(maxVisible / 2));
    let end = Math.min(total, start + maxVisible - 1);
    
    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }
    
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }

  goBack() {
    this.router.navigate(['/restaurants']);
  }

  // Format helpers
  formatPrice(price: number): string {
    return `$${price.toFixed(2)}`;
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString();
  }
}
