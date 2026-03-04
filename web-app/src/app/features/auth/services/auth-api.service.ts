import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { RegisterDto, LoginDto } from '../models/auth.model';
import { User, LoginResponse } from '../../../core/models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthApiService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/users`;

  /**
   * POST /users/register
   * Registrar un nuevo usuario
   */
  register(data: RegisterDto): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/register`, data);
  }

  /**
   * POST /users/login
   * Iniciar sesión y obtener token JWT
   */
  login(data: LoginDto): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, data);
  }
}
