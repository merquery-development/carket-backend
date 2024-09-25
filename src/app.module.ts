import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MainModule } from './main/main.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // ทำให้ ConfigService ใช้ได้ทั่วทั้งแอป
    }),
    MainModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
