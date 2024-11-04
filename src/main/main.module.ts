import { CacheInterceptor, CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AppService } from '../app.service';
import { PrismaService } from '../prisma.service';
import { AuthController } from './controllers/auth.controller';
import { CarController } from './controllers/car.controller';
import { CarPostController } from './controllers/carpost.controller';
import { CustomerController } from './controllers/customer.controller';
import { FileUploadController } from './controllers/file.controller';
import { RoleController } from './controllers/role.controller';
import { VendorController } from './controllers/vendor.controller';
import { CarPostGuard } from './guards/carpost.guard';
import { CustomerOrGuestGuard } from './guards/customer.guard';
import { AuthService } from './services/auth.service';
import { CarService } from './services/car.service';
import { CarPostService } from './services/carpost.service';
import { CustomerService } from './services/customer.service';
import { FileUploadService } from './services/file.service';
import { MailerService } from './services/mailer.service';
import { RoleService } from './services/role.service';
import { VendorService } from './services/vendor.service';
import { CarViewInterceptor } from './utils/carviewIntercep';
import { FacebookStrategy } from './utils/strategy/facebook.stategy';
import { GoogleStrategy } from './utils/strategy/google.strategy';
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
    CacheModule.register({
    
      isGlobal: true,
    }),
  ],
  controllers: [
    VendorController,
    AuthController,
    CarController,
    CustomerController,
    FileUploadController,
    CarPostController,
    RoleController,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: CacheInterceptor,
    },
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
    CustomerOrGuestGuard,
    RoleService,
    CarPostGuard,
  ],
})
export class MainModule {}
