export interface RegisterDto {
  name: string;
  email: string;
  password: string;
  role?: 'consumer' | 'restaurant';
}

export interface LoginDto {
  email: string;
  password: string;
  role: 'consumer' | 'restaurant';
}
