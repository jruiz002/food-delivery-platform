import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LoginDto } from '../../models/auth.model';
import { AuthService } from '@core/services/auth.service';

/**
 * EJEMPLO DE COMPONENTE DE LOGIN
 * 
 * Este es un ejemplo de cómo usar el AuthService en un componente real.
 * Puedes usar esto como base para crear tus propios componentes.
 */
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
    </div>
  `,
  styles: [`
    .login-container {
      max-width: 400px;
      margin: 50px auto;
      padding: 20px;
    }

    .form-group {
      margin-bottom: 15px;
    }

    label {
      display: block;
      margin-bottom: 5px;
    }

    input, select {
      width: 100%;
      padding: 8px;
      box-sizing: border-box;
    }

    button {
      width: 100%;
      padding: 10px;
      background-color: #007bff;
      color: white;
      border: none;
      cursor: pointer;
    }

    button:disabled {
      background-color: #ccc;
    }

    .error {
      color: red;
      margin-top: 10px;
    }
  `]
})
export class LoginComponent {
  private authService = inject(AuthService);

  // Signals para manejo de estado
  loading = signal(false);
  error = signal<string | null>(null);

  // Datos del formulario
  loginData: LoginDto = {
    email: '',
    password: '',
    role: 'consumer'
  };

  onSubmit() {
    this.loading.set(true);
    this.error.set(null);

    this.authService.login(this.loginData).subscribe({
      next: (response) => {
        console.log('Login exitoso', response);
        this.loading.set(false);
        // Aquí puedes navegar a otra ruta
        // this.router.navigate(['/home']);
      },
      error: (err) => {
        console.error('Error en login', err);
        this.error.set(err.error?.message || 'Error al iniciar sesión');
        this.loading.set(false);
      }
    });
  }
}
