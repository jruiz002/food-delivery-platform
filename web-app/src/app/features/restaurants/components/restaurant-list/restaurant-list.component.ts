import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-restaurant-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container">
      <div class="header">
        <h1>Restaurantes Disponibles</h1>
        <div class="user-info">
          <span>Bienvenido, {{ currentUser()?.name }}</span>
          <button (click)="logout()" class="btn-logout">Cerrar Sesión</button>
        </div>
      </div>

      <div class="content">
        <p>Lista de restaurantes aparecerá aquí...</p>
      </div>
    </div>
  `,
  styles: [`
    .container {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 2px solid #eee;
    }

    h1 {
      margin: 0;
      color: #333;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 15px;
    }

    .user-info span {
      color: #666;
      font-weight: 500;
    }

    .btn-logout {
      padding: 8px 16px;
      background-color: #dc3545;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
    }

    .btn-logout:hover {
      background-color: #c82333;
    }

    .content {
      padding: 20px;
      background-color: #f8f9fa;
      border-radius: 8px;
      min-height: 400px;
    }
  `]
})
export class RestaurantListComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  currentUser = this.authService.currentUser;

  ngOnInit() {
    console.log('RestaurantListComponent - User:', this.currentUser());
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
