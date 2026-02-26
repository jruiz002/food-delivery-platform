export class LoginUserDto {
  email: string;
  password: string;
  role: 'consumer' | 'restaurant';
}
