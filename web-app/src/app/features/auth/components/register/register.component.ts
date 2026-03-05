import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { RegisterDto } from '../../models/auth.model';
import { AuthService } from '@core/services/auth.service';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, MatIconModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  // Signals para manejo de estado
  loading = signal(false);
  error = signal<string | null>(null);
  successMessage = signal<string | null>(null);
  showPassword = signal(false);

  // Datos del formulario
  registerData: RegisterDto = {
    name: '',
    email: '',
    password: '',
    role: 'consumer'
  };

  togglePasswordVisibility() {
    this.showPassword.set(!this.showPassword());
  }

  selectRole(role: 'consumer' | 'restaurant') {
    this.registerData.role = role;
  }

  onSubmit() {
    // Validaciones básicas
    if (!this.registerData.name || !this.registerData.email || !this.registerData.password) {
      this.error.set('Please fill in all fields');
      return;
    }

    if (this.registerData.password.length < 6) {
      this.error.set('Password must be at least 6 characters long');
      return;
    }

    this.loading.set(true);
    this.error.set(null);
    this.successMessage.set(null);

    this.authService.register(this.registerData).subscribe({
      next: (response) => {
        console.log('Registro exitoso', response);
        this.successMessage.set('¡Account created successfully! Redirecting to login...');
        this.loading.set(false);
        
        // Redirigir al login después de 2 segundos
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (err) => {
        console.error('Error en registro', err);
        this.error.set(err.error?.message || 'Error creating account. Please try again.');
        this.loading.set(false);
      }
    });
  }
}
