import { Injectable, signal, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { User, LoginResponse } from '../models/user.model';
import { AuthApiService } from '../../features/auth/services/auth-api.service';
import { RegisterDto, LoginDto } from '../../features/auth/models/auth.model';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private authApiService = inject(AuthApiService);
  private router = inject(Router);

  // Estado reactivo del usuario
  private currentUserSignal = signal<User | null>(null);
  private tokenSignal = signal<string | null>(null);

  // Computed properties
  currentUser = computed(() => this.currentUserSignal());
  isAuthenticated = computed(() => !!this.tokenSignal());
  isConsumer = computed(() => this.currentUserSignal()?.role === 'consumer');
  isRestaurant = computed(() => this.currentUserSignal()?.role === 'restaurant');

  constructor() {
    // Cargar datos del localStorage al iniciar
    this.loadFromStorage();
  }

  /**
   * Registrar un nuevo usuario
   */
  register(data: RegisterDto): Observable<User> {
    return this.authApiService.register(data);
  }

  /**
   * Iniciar sesión
   */
  login(data: LoginDto): Observable<LoginResponse> {
    return this.authApiService.login(data).pipe(
      tap(response => {
        this.setSession(response);
      })
    );
  }

  /**
   * Cerrar sesión
   */
  logout(): void {
    this.clearSession();
    this.router.navigate(['/auth/login']);
  }

  /**
   * Obtener el token actual
   */
  getToken(): string | null {
    return this.tokenSignal();
  }

  /**
   * Obtener el usuario actual
   */
  getCurrentUser(): User | null {
    return this.currentUserSignal();
  }

  /**
   * Verificar si el usuario tiene un rol específico
   */
  hasRole(role: 'consumer' | 'restaurant'): boolean {
    return this.currentUserSignal()?.role === role;
  }

  /**
   * Guardar la sesión (token y usuario)
   */
  private setSession(response: LoginResponse): void {
    localStorage.setItem('token', response.accessToken);
    localStorage.setItem('user', JSON.stringify(response.user));
    
    this.tokenSignal.set(response.accessToken);
    this.currentUserSignal.set(response.user);
  }

  /**
   * Limpiar la sesión
   */
  private clearSession(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    this.tokenSignal.set(null);
    this.currentUserSignal.set(null);
  }

  /**
   * Cargar datos desde localStorage
   */
  private loadFromStorage(): void {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        this.tokenSignal.set(token);
        this.currentUserSignal.set(user);
      } catch (error) {
        console.error('Error al cargar datos de sesión:', error);
        this.clearSession();
      }
    }
  }
}
