import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AppService } from '../app.service';
import { PrismaService } from '../prisma.service';
import { AuthController } from './controllers/auth.controller';
import { VendorController } from './controllers/vendor.controller';
import { AuthService } from './services/auth.service';
import { VendorService } from './services/vendor.service';
@Module({
  imports: [
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
  controllers: [VendorController, AuthController],
  providers: [AppService, PrismaService, VendorService, AuthService],
})
export class MainModule {}
