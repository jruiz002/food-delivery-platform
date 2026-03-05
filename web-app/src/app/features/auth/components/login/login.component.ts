import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { LoginDto } from '../../models/auth.model';
import { AuthService } from '@core/services/auth.service';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, MatIconModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  // Signals para manejo de estado
  loading = signal(false);
  error = signal<string | null>(null);
  successMessage = signal<string | null>(null);
  showPassword = signal(false);

  // Datos del formulario
  loginData: LoginDto = {
    email: '',
    password: '',
    role: 'consumer'
  };

  togglePasswordVisibility() {
    this.showPassword.set(!this.showPassword());
  }

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
            this.router.navigate(['/restaurants']);
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
