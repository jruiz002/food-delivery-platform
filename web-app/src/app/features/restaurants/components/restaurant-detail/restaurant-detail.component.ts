import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RestaurantService } from '../../services/restaurant.service';
import { Restaurant, MenuFilters } from '../../models/restaurant.model';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-restaurant-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule, MatIconModule],
  templateUrl: './restaurant-detail.component.html',
  styleUrl: './restaurant-detail.component.css'
})
export class RestaurantDetailComponent implements OnInit {
  private restaurantService = inject(RestaurantService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);

  // Restaurant data
  restaurant = signal<Restaurant | null>(null);
  
  // Edit modal signals
  showEditModal = signal(false);
  updatingRestaurant = signal(false);
  updateError = signal<string | null>(null);
  
  // Edit restaurant form
  editRestaurantForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
    description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]],
    isActive: [true]
  });
  
  // Menu management modal signals
  showMenuModal = signal(false);
  updatingMenu = signal(false);
  menuError = signal<string | null>(null);
  editingMenuItems = signal<any[]>([]);
  showAddItemForm = signal(false);
  editingItemIndex = signal<number | null>(null);
  
  // Menu item form
  menuItemForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    price: [0, [Validators.required, Validators.min(0)]],
    description: ['', Validators.maxLength(500)],
    tags: [''],
    available: [true]
  });
  
  // Current user
  currentUser = this.authService.currentUser;
  
  // Computed: check if current user is the owner
  isOwner = computed(() => {
    const user = this.currentUser();
    const rest = this.restaurant();
    return user && rest && user._id === rest.owner_id;
  });
  
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

  // Edit restaurant methods
  openEditModal() {
    const rest = this.restaurant();
    if (rest) {
      this.editRestaurantForm.patchValue({
        name: rest.name,
        description: rest.description,
        isActive: rest.isActive
      });
      this.showEditModal.set(true);
      this.updateError.set(null);
    }
  }

  closeEditModal() {
    this.showEditModal.set(false);
    this.editRestaurantForm.reset();
    this.updateError.set(null);
  }

  submitUpdateRestaurant() {
    if (this.editRestaurantForm.invalid) {
      this.editRestaurantForm.markAllAsTouched();
      return;
    }

    const restaurantId = this.restaurantId();
    if (!restaurantId) return;

    this.updatingRestaurant.set(true);
    this.updateError.set(null);

    this.restaurantService.update(restaurantId, this.editRestaurantForm.value as any).subscribe({
      next: (updatedRestaurant) => {
        this.restaurant.set(updatedRestaurant);
        this.updatingRestaurant.set(false);
        this.closeEditModal();
      },
      error: (err) => {
        this.updatingRestaurant.set(false);
        this.updateError.set(err.error?.message || 'Failed to update restaurant. Please try again.');
        console.error('Error updating restaurant:', err);
      }
    });
  }

  // Form field helpers
  isFieldInvalid(fieldName: string, formType: 'restaurant' | 'menuItem' = 'restaurant'): boolean {
    const form = formType === 'restaurant' ? this.editRestaurantForm : this.menuItemForm;
    const field = (form as any).get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string, formType: 'restaurant' | 'menuItem' = 'restaurant'): string {
    const form = formType === 'restaurant' ? this.editRestaurantForm : this.menuItemForm;
    const field = (form as any).get(fieldName);
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
    if (field.errors['min']) {
      return `${fieldName} must be greater than or equal to ${field.errors['min'].min}`;
    }
    return '';
  }

  // Menu management methods
  openMenuModal() {
    const rest = this.restaurant();
    if (rest) {
      // Clone the menu to work with
      this.editingMenuItems.set(JSON.parse(JSON.stringify(rest.menu)));
      this.showMenuModal.set(true);
      this.menuError.set(null);
      this.showAddItemForm.set(false);
      this.editingItemIndex.set(null);
    }
  }

  closeMenuModal() {
    this.showMenuModal.set(false);
    this.editingMenuItems.set([]);
    this.menuError.set(null);
    this.showAddItemForm.set(false);
    this.editingItemIndex.set(null);
    this.menuItemForm.reset({ available: true });
  }

  openAddItemForm() {
    this.showAddItemForm.set(true);
    this.editingItemIndex.set(null);
    this.menuItemForm.reset({ price: 0, available: true });
  }

  cancelItemForm() {
    this.showAddItemForm.set(false);
    this.editingItemIndex.set(null);
    this.menuItemForm.reset({ available: true });
  }

  openEditItemForm(index: number) {
    const item = this.editingMenuItems()[index];
    this.editingItemIndex.set(index);
    this.showAddItemForm.set(true);
    this.menuItemForm.patchValue({
      name: item.name,
      price: item.price,
      description: item.description || '',
      tags: item.tags?.join(', ') || '',
      available: item.available
    });
  }

  saveMenuItem() {
    if (this.menuItemForm.invalid) {
      this.menuItemForm.markAllAsTouched();
      return;
    }

    const formValue = this.menuItemForm.value;
    const menuItem = {
      _id: this.editingItemIndex() !== null ? this.editingMenuItems()[this.editingItemIndex()!]._id : new Date().getTime().toString(),
      name: formValue.name!,
      price: formValue.price!,
      description: formValue.description || '',
      tags: formValue.tags ? formValue.tags.split(',').map((t: string) => t.trim()).filter((t: string) => t) : [],
      available: formValue.available!
    };

    const currentItems = [...this.editingMenuItems()];
    
    if (this.editingItemIndex() !== null) {
      // Edit existing item
      currentItems[this.editingItemIndex()!] = menuItem;
    } else {
      // Add new item
      currentItems.push(menuItem);
    }

    this.editingMenuItems.set(currentItems);
    this.cancelItemForm();
  }

  deleteMenuItem(index: number) {
    const currentItems = [...this.editingMenuItems()];
    currentItems.splice(index, 1);
    this.editingMenuItems.set(currentItems);
  }

  saveMenu() {
    const restaurantId = this.restaurantId();
    if (!restaurantId) return;

    this.updatingMenu.set(true);
    this.menuError.set(null);

    // Remove _id from items as it might cause issues with new items
    const menuToSend = this.editingMenuItems().map(item => ({
      name: item.name,
      price: item.price,
      description: item.description,
      tags: item.tags,
      available: item.available
    }));

    this.restaurantService.updateMenu(restaurantId, menuToSend).subscribe({
      next: (updatedRestaurant) => {
        this.restaurant.set(updatedRestaurant);
        this.updatingMenu.set(false);
        this.closeMenuModal();
        this.loadMenuItems(); // Reload the menu display
      },
      error: (err) => {
        this.updatingMenu.set(false);
        this.menuError.set(err.error?.message || 'Failed to update menu. Please try again.');
        console.error('Error updating menu:', err);
      }
    });
  }

  // Format helpers
  formatPrice(price: number): string {
    return `$${price.toFixed(2)}`;
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString();
  }
}
