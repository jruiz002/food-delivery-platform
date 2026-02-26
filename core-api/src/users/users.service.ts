import { Injectable, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersRepository } from './users.repository';
import { RegisterUserDto } from './dto/register-user.dto';
import { User } from '../schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async register(
    registerUserDto: RegisterUserDto,
  ): Promise<Omit<User, 'passwordHash'>> {
    // 1. Validar si existe
    const existingUser = await this.usersRepository.findByEmail(
      registerUserDto.email,
    );
    if (existingUser) {
      throw new ConflictException(
        'El usuario con este correo electrónico ya está registrado.',
      );
    }

    // 2. Hashear password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(
      registerUserDto.password,
      saltRounds,
    );

    // 3. Crear usando repositorio (Mongoose abstract method)
    const newUser = await this.usersRepository.create({
      name: registerUserDto.name,
      email: registerUserDto.email,
      passwordHash,
      role: registerUserDto.role || 'consumer', // Consumer por defecto
    });

    // 4. Retornar el usuario creado sin el Hash por seguridad
    const userObj = newUser.toObject() as Partial<User>;
    delete userObj.passwordHash;
    return userObj as Omit<User, 'passwordHash'>;
  }
}
