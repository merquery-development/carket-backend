import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AppService } from '../app.service';
import { PrismaService } from '../prisma.service';
import { AuthController } from './controllers/auth.controller';
import { CarController } from './controllers/car.controller';
import { CarPostController } from './controllers/carpost.controller';
import { CustomerController } from './controllers/customer.controller';
import { FileUploadController } from './controllers/file.controller';
import { VendorController } from './controllers/vendor.controller';
import { AuthService } from './services/auth.service';
import { CarService } from './services/car.service';
import { CarPostService } from './services/carpost.service';
import { CustomerService } from './services/customer.service';
import { FileUploadService } from './services/file.service';
import { MailerService } from './services/mailer.service';
import { VendorService } from './services/vendor.service';
import { CarViewInterceptor } from './utils/carviewIntercep';
import { FacebookStrategy } from './utils/strategy/facebook.stategy';
import { GoogleStrategy } from './utils/strategy/google.strategy';
import { CustomerOrGuestGuard } from './guards/customer.guard';
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
  controllers: [
    VendorController,
    AuthController,
    CarController,
    CustomerController,
    FileUploadController,
    CarPostController,
  ],
  providers: [
    AppService,
    PrismaService,
    VendorService,
    AuthService,
    GoogleStrategy,
    FacebookStrategy,
    CarService,
    MailerService,
    CustomerService,
    FileUploadService,
    CarPostService,
    CarViewInterceptor,
    CustomerOrGuestGuard
  ],
})
export class MainModule {}
