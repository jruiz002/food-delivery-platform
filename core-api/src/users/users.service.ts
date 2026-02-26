import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersRepository } from './users.repository';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { User } from '../schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async register(
    registerUserDto: RegisterUserDto,
  ): Promise<Omit<User, 'passwordHash'>> {
    const role = registerUserDto.role || 'consumer';

    // 1. Validar si existe ESE mismo correo pero con ESE mismo rol
    const existingUser = await this.usersRepository.findByEmailAndRole(
      registerUserDto.email,
      role,
    );
    if (existingUser) {
      throw new ConflictException(
        `Ya existe un usuario de tipo ${role} con este correo electrónico.`,
      );
    }

    // 2. Hashear password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(
      registerUserDto.password,
      saltRounds,
    );

    // 3. Crear usando repositorio
    const newUser = await this.usersRepository.create({
      name: registerUserDto.name,
      email: registerUserDto.email,
      passwordHash,
      role,
    });

    // 4. Retornar el usuario creado sin el Hash por seguridad
    const userObj = newUser.toObject() as Partial<User>;
    delete userObj.passwordHash;
    return userObj as Omit<User, 'passwordHash'>;
  }

  async login(loginUserDto: LoginUserDto): Promise<Omit<User, 'passwordHash'>> {
    // 1. Buscar al usuario usando explícitamente el correo y el rol especificado en el Login
    const user = await this.usersRepository.findByEmailAndRole(
      loginUserDto.email,
      loginUserDto.role,
    );

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // 2. Validar Hash de contraseña
    const isPasswordMatching = await bcrypt.compare(
      loginUserDto.password,
      user.passwordHash,
    );

    if (!isPasswordMatching) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // 3. Retornar objeto seguro simulando JWT/Session (luego se puede agregar el token real)
    const userObj = user.toObject() as Partial<User>;
    delete userObj.passwordHash;
    return userObj as Omit<User, 'passwordHash'>;
  }
}
