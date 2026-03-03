import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async create(user: Partial<User>): Promise<UserDocument> {
    const createdUser = new this.userModel(user);
    return createdUser.save();
  }

  // Ahora buscamos por correo Y rol
  async findByEmailAndRole(
    email: string,
    role: string,
  ): Promise<UserDocument | null> {
    return this.userModel.findOne({ email, role }).exec();
  }
}
