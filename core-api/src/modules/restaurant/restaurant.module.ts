import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RestaurantService } from './restaurant.service';
import { RestaurantController } from './restaurant.controller';
import { Restaurant, RestaurantSchema } from './schemas/restaurant.schema';
import { RestaurantRepository } from './repositories/restaurant.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Restaurant.name, schema: RestaurantSchema },
    ]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '8h' },
      }),
    }),
    ConfigModule,
  ],
  controllers: [RestaurantController],
  providers: [RestaurantService, RestaurantRepository],
  exports: [RestaurantService],
})
export class RestaurantModule {}
