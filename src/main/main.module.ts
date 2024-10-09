import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AppService } from '../app.service';
import { PrismaService } from '../prisma.service';
import { AuthController } from './controllers/auth.controller';
import { CustomerController } from './controllers/customer.controller';
import { VendorController } from './controllers/vendor.controller';
import { AuthService } from './services/auth.service';
import { CarService } from './services/car.service';
import { CustomerService } from './services/customer.service';
import { MailerService } from './services/mailer.service';
import { VendorService } from './services/vendor.service';
import { FacebookStrategy } from './utils/strategy/facebook.stategy';
import { GoogleStrategy } from './utils/strategy/google.strategy';
import { CarController } from './controllers/car.controller';
import { FileUploadController } from './controllers/file.controller';
import { FileUploadService } from './services/file.service';
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
    FileUploadController
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
    FileUploadService
  ],
})
export class MainModule {}
