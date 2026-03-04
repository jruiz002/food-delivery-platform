import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LoginDto } from '../../models/auth.model';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="login-container">
      <h2>Iniciar Sesión</h2>
      
      <form (ngSubmit)="onSubmit()">
        <div class="form-group">
          <label for="email">Email:</label>
          <input 
            id="email" 
            type="email" 
            [(ngModel)]="loginData.email" 
            name="email"
            required>
        </div>

        <div class="form-group">
          <label for="password">Password:</label>
          <input 
            id="password" 
            type="password" 
            [(ngModel)]="loginData.password" 
            name="password"
            required>
        </div>

        <div class="form-group">
          <label for="role">Tipo de usuario:</label>
          <select id="role" [(ngModel)]="loginData.role" name="role">
            <option value="consumer">Consumer</option>
            <option value="restaurant">Restaurant</option>
          </select>
        </div>

        <button type="submit" [disabled]="loading()">
          {{ loading() ? 'Cargando...' : 'Iniciar Sesión' }}
        </button>
      </form>

      @if (error()) {
        <div class="error">{{ error() }}</div>
      }

      @if (successMessage()) {
        <div class="success">{{ successMessage() }}</div>
      }
    </div>
  `,
  styles: [`
    .login-container {
      max-width: 400px;
      margin: 50px auto;
      padding: 20px;
      border: 1px solid #ddd;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    h2 {
      text-align: center;
      margin-bottom: 30px;
      color: #333;
    }

    .form-group {
      margin-bottom: 15px;
    }

    label {
      display: block;
      margin-bottom: 5px;
      font-weight: 500;
      color: #555;
    }

    input, select {
      width: 100%;
      padding: 10px;
      box-sizing: border-box;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 14px;
    }

    input:focus, select:focus {
      outline: none;
      border-color: #007bff;
    }

    button {
      width: 100%;
      padding: 12px;
      background-color: #007bff;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 16px;
      font-weight: 500;
      margin-top: 10px;
      transition: background-color 0.3s;
    }

    button:hover:not(:disabled) {
      background-color: #0056b3;
    }

    button:disabled {
      background-color: #ccc;
      cursor: not-allowed;
    }

    .error {
      color: white;
      background-color: #dc3545;
      padding: 10px;
      border-radius: 4px;
      margin-top: 15px;
      text-align: center;
    }

    .success {
      color: white;
      background-color: #28a745;
      padding: 10px;
      border-radius: 4px;
      margin-top: 15px;
      text-align: center;
    }
  `]
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  // Signals para manejo de estado
  loading = signal(false);
  error = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  // Datos del formulario
  loginData: LoginDto = {
    email: '',
    password: '',
    role: 'consumer'
  };

  onSubmit() {
    this.loading.set(true);
    this.error.set(null);
    this.successMessage.set(null);

    this.authService.login(this.loginData).subscribe({
      next: (response) => {
        console.log('Login exitoso', response);
        this.successMessage.set('¡Login exitoso! Bienvenido ' + response.user.name);
        this.loading.set(false);
        
        // Navegar según el rol
        setTimeout(() => {
          if (response.user.role === 'consumer') {
            this.router.navigate(['/restaurants']);
          } else {
            this.router.navigate(['/dashboard']);
          }
        }, 1000);
      },
      error: (err) => {
        console.error('Error en login', err);
        this.error.set(err.error?.message || 'Error al iniciar sesión');
        this.loading.set(false);
      }
    });
  }
}
