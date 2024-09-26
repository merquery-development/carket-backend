import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AppService } from '../app.service';
import { PrismaService } from '../prisma.service';
import { AuthController } from './controllers/auth.controller';
import { VendorController } from './controllers/vendor.controller';
import { AuthService } from './services/auth.service';
import { VendorService } from './services/vendor.service';
import { GoogleStrategy } from './utils/strategy/google.strategy';
import { ConfigModule } from '@nestjs/config';
import { FacebookStrategy } from './utils/strategy/facebook.stategy';
import { CarService } from './services/car.service';
import { CarController } from './controllers/car.controller';
@Module({
  imports: [
    PassportModule,
    ConfigModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      global: true,
      secret: process.env.ACCESS_TOKEN_SECRET,
      signOptions: { expiresIn: '15m' },
    }),
    JwtModule.register({
      global: true,
      secret: process.env.REFRESH_TOKEN_SECRET,
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [VendorController, AuthController,CarController],
  providers: [
    AppService,
    PrismaService,
    VendorService,
    AuthService,
    GoogleStrategy,
    FacebookStrategy,
    CarService
  ],
})
export class MainModule {}
