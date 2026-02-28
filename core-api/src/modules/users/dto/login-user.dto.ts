import { IsEmail, IsString, IsNotEmpty, IsIn } from 'class-validator';

export class LoginUserDto {
  @IsEmail({}, { message: 'Debe ser un correo electrónico válido' })
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsIn(['consumer', 'restaurant'])
  role: 'consumer' | 'restaurant';
}
