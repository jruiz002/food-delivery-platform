import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RestaurantService } from '@features/restaurants';
import { Restaurant } from '../models/restaurant.model';

/**
 * EJEMPLO DE COMPONENTE DE LISTA DE RESTAURANTES
 * 
 * Este es un ejemplo de cómo usar el RestaurantService para mostrar
 * una lista de restaurantes con búsqueda y paginación.
 */
@Component({
  selector: 'app-restaurant-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="restaurant-list">
      <h2>Restaurantes</h2>

      <div class="search-bar">
        <input 
          type="text" 
          placeholder="Buscar restaurantes..."
          #searchInput
          (keyup.enter)="search(searchInput.value)">
        <button (click)="search(searchInput.value)">Buscar</button>
      </div>

      @if (loading()) {
        <div class="loading">Cargando restaurantes...</div>
      }

      @if (error()) {
        <div class="error">{{ error() }}</div>
      }

      <div class="restaurants-grid">
        @for (restaurant of restaurants(); track restaurant._id) {
          <div class="restaurant-card">
            <h3>{{ restaurant.name }}</h3>
            <p>{{ restaurant.description }}</p>
            <div class="menu-count">
              {{ restaurant.menu.length }} items en el menú
            </div>
            <div class="status" [class.active]="restaurant.isActive">
              {{ restaurant.isActive ? 'Abierto' : 'Cerrado' }}
            </div>
            <button (click)="viewRestaurant(restaurant._id)">
              Ver Detalles
            </button>
          </div>
        }
      </div>

      @if (restaurants().length === 0 && !loading()) {
        <div class="no-results">No se encontraron restaurantes</div>
      }
    </div>
  `,
  styles: [`
    .restaurant-list {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }

    .search-bar {
      display: flex;
      gap: 10px;
      margin-bottom: 20px;
    }

    .search-bar input {
      flex: 1;
      padding: 10px;
    }

    .restaurants-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 20px;
    }

    .restaurant-card {
      border: 1px solid #ddd;
      padding: 15px;
      border-radius: 8px;
    }

    .restaurant-card h3 {
      margin-top: 0;
    }

    .status {
      display: inline-block;
      padding: 5px 10px;
      background-color: #dc3545;
      color: white;
      border-radius: 4px;
      margin: 10px 0;
    }

    .status.active {
      background-color: #28a745;
    }

    button {
      width: 100%;
      padding: 10px;
      background-color: #007bff;
      color: white;
      border: none;
      cursor: pointer;
      border-radius: 4px;
    }

    .loading, .error, .no-results {
      text-align: center;
      padding: 20px;
    }

    .error {
      color: red;
    }
  `]
})
export class RestaurantListComponent implements OnInit {
  private restaurantService = inject(RestaurantService);

  // Signals para manejo de estado
  restaurants = signal<Restaurant[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  ngOnInit() {
    this.loadRestaurants();
  }

  loadRestaurants(searchTerm?: string) {
    this.loading.set(true);
    this.error.set(null);

    this.restaurantService.getAll({
      search: searchTerm,
      status: 'active',
      page: 1,
      limit: 10,
      sortBy: 'name',
      order: 'asc'
    }).subscribe({
      next: (data) => {
        this.restaurants.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error cargando restaurantes', err);
        this.error.set('Error al cargar los restaurantes');
        this.loading.set(false);
      }
    });
  }

  search(term: string) {
    this.loadRestaurants(term);
  }

  viewRestaurant(id: string) {
    console.log('Ver restaurante:', id);
    // Aquí puedes navegar a la página de detalles
    // this.router.navigate(['/restaurant', id]);
  }
}
