import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '@core/services/auth.service';
import { RestaurantService } from '../../services/restaurant.service';
import { Restaurant, RestaurantFilters } from '../../models/restaurant.model';

@Component({
  selector: 'app-restaurant-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatIconModule, RouterModule],
  templateUrl: './restaurant-list.component.html',
  styleUrls: ['./restaurant-list.component.css']
})
export class RestaurantListComponent implements OnInit {
  private authService = inject(AuthService);
  private restaurantService = inject(RestaurantService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  // Signals
  currentUser = this.authService.currentUser;
  restaurants = signal<Restaurant[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  
  // Modal signals
  showCreateModal = signal(false);
  creatingRestaurant = signal(false);
  createError = signal<string | null>(null);
  
  // Create restaurant form
  createRestaurantForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
    description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]],
    isActive: [true]
  });
  
  // Filtros
  searchTerm = signal('');
  statusFilter = signal<'all' | 'active' | 'inactive'>('all');
  currentPage = signal(1);
  itemsPerPage = signal(9);
  sortBy = signal('name');
  sortOrder = signal<'asc' | 'desc'>('asc');
  
  // Total de resultados para paginación
  totalItems = signal(0);
  
  // Computed para determinar si es restaurante
  isRestaurant = computed(() => this.currentUser()?.role === 'restaurant');
  
  // Computed para el título de la página
  pageTitle = computed(() => 
    this.isRestaurant() ? 'My Restaurants' : 'Browse Restaurants'
  );
  
  // Computed para páginas totales
  totalPages = computed(() => 
    Math.ceil(this.totalItems() / this.itemsPerPage())
  );

  ngOnInit() {
    this.loadRestaurants();
  }

  loadRestaurants() {
    this.loading.set(true);
    this.error.set(null);

    const filters: RestaurantFilters = {
      search: this.searchTerm() || undefined,
      status: this.statusFilter() === 'all' ? undefined : this.statusFilter(),
      page: this.currentPage(),
      limit: this.itemsPerPage(),
      sortBy: this.sortBy(),
      order: this.sortOrder()
    };

    // Si es restaurante, filtrar por ownerId
    if (this.isRestaurant() && this.currentUser()?._id) {
      filters.ownerId = this.currentUser()!._id;
    }

    this.restaurantService.getAll(filters).subscribe({
      next: (response) => {
        this.restaurants.set(response.data);
        this.totalItems.set(response.total);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load restaurants. Please try again.');
        this.loading.set(false);
        console.error('Error loading restaurants:', err);
      }
    });
  }

  onSearchChange(value: string) {
    this.searchTerm.set(value);
    this.currentPage.set(1); // Reset a la primera página
    this.loadRestaurants();
  }

  onStatusChange(value: 'all' | 'active' | 'inactive') {
    this.statusFilter.set(value);
    this.currentPage.set(1);
    this.loadRestaurants();
  }

  onSortChange(field: string) {
    if (this.sortBy() === field) {
      // Toggle order
      this.sortOrder.set(this.sortOrder() === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortBy.set(field);
      this.sortOrder.set('asc');
    }
    this.loadRestaurants();
  }

  onPageChange(page: number) {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
      this.loadRestaurants();
    }
  }

  viewRestaurantDetails(restaurant: Restaurant) {
    // Navegar a detalles del restaurante
    this.router.navigate(['/restaurants', restaurant._id]);
  }

  createNewRestaurant() {
    // Solo para restaurantes
    if (this.isRestaurant()) {
      this.showCreateModal.set(true);
      this.createError.set(null);
      this.createRestaurantForm.reset({ isActive: true });
    }
  }

  closeCreateModal() {
    this.showCreateModal.set(false);
    this.createRestaurantForm.reset({ isActive: true });
    this.createError.set(null);
  }

  submitCreateRestaurant() {
    if (this.createRestaurantForm.invalid) {
      this.createRestaurantForm.markAllAsTouched();
      return;
    }

    this.creatingRestaurant.set(true);
    this.createError.set(null);

    this.restaurantService.create(this.createRestaurantForm.value as any).subscribe({
      next: (newRestaurant) => {
        this.creatingRestaurant.set(false);
        this.closeCreateModal();
        // Reload the list to show the new restaurant
        this.loadRestaurants();
      },
      error: (err) => {
        this.creatingRestaurant.set(false);
        this.createError.set(err.error?.message || 'Failed to create restaurant. Please try again.');
        console.error('Error creating restaurant:', err);
      }
    });
  }

  // Form field helpers
  isFieldInvalid(fieldName: string): boolean {
    const field = this.createRestaurantForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.createRestaurantForm.get(fieldName);
    if (!field || !field.errors) return '';

    if (field.errors['required']) return `${fieldName} is required`;
    if (field.errors['minlength']) {
      const minLength = field.errors['minlength'].requiredLength;
      return `${fieldName} must be at least ${minLength} characters`;
    }
    if (field.errors['maxlength']) {
      const maxLength = field.errors['maxlength'].requiredLength;
      return `${fieldName} must not exceed ${maxLength} characters`;
    }
    return '';
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  // Helper para generar array de páginas para el paginador
  getPageNumbers(): number[] {
    const total = this.totalPages();
    const current = this.currentPage();
    const pages: number[] = [];
    
    // Mostrar máximo 5 páginas
    let start = Math.max(1, current - 2);
    let end = Math.min(total, start + 4);
    
    // Ajustar si estamos cerca del final
    if (end - start < 4) {
      start = Math.max(1, end - 4);
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    return pages;
  }
}
