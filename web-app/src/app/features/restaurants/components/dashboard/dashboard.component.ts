import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container">
      <div class="header">
        <h1>Dashboard del Restaurante</h1>
        <div class="user-info">
          <span>{{ currentUser()?.name }}</span>
          <button (click)="logout()" class="btn-logout">Cerrar Sesión</button>
        </div>
      </div>

      <div class="dashboard-grid">
        <div class="card">
          <h3>📊 Estadísticas</h3>
          <p>Órdenes de hoy: 0</p>
        </div>

        <div class="card">
          <h3>🍽️ Menú</h3>
          <p>Items activos: 0</p>
        </div>

        <div class="card">
          <h3>⭐ Reseñas</h3>
          <p>Calificación promedio: -</p>
        </div>

        <div class="card">
          <h3>📦 Órdenes Pendientes</h3>
          <p>En cola: 0</p>
        </div>
      </div>

      <div class="content">
        <h2>Panel de administración del restaurante</h2>
        <p>Aquí podrás gestionar tu menú, ver órdenes y estadísticas.</p>
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

    .dashboard-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }

    .card {
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .card h3 {
      margin: 0 0 10px 0;
      color: #333;
      font-size: 18px;
    }

    .card p {
      margin: 0;
      color: #666;
      font-size: 24px;
      font-weight: bold;
    }

    .content {
      padding: 20px;
      background-color: #f8f9fa;
      border-radius: 8px;
      min-height: 200px;
    }

    .content h2 {
      color: #333;
      margin-top: 0;
    }
  `]
})
export class DashboardComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  currentUser = this.authService.currentUser;

  ngOnInit() {
    console.log('DashboardComponent - User:', this.currentUser());
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
