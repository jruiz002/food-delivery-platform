import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UsersRepository } from './users.repository';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly jwtService: JwtService,
  ) {}

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

  async login(
    loginUserDto: LoginUserDto,
  ): Promise<{ accessToken: string; user: Omit<User, 'passwordHash'> }> {
    // 1. Buscar al usuario
    const user = (await this.usersRepository.findByEmailAndRole(
      loginUserDto.email,
      loginUserDto.role,
    )) as UserDocument;

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

    // 3. Generar token JWT con la información no sensible de sesión
    const payload = { sub: user._id, email: user.email, role: user.role };
    const accessToken = await this.jwtService.signAsync(payload);

    // 4. Retornar objeto seguro simulando JWT/Session (sin passwordHash)
    const userObj = user.toObject() as Partial<User>;
    delete userObj.passwordHash;

    return {
      accessToken,
      user: userObj as Omit<User, 'passwordHash'>,
    };
  }
}
