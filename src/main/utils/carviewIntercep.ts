import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { PrismaService } from 'src/prisma.service';
import { AuthService } from '../services/auth.service';

@Injectable()
export class CarViewInterceptor implements NestInterceptor {
  private readonly logger = new Logger(CarViewInterceptor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user?.id; // Assume the user is authenticated and userId is available
    const carId = parseInt(request.params.carId, 10); // Assume carId is available in URL parameters
    const token = request.headers['authorization']?.split(' ')[1]; // Extract token from Authorization header

    const now = Date.now();

    return next.handle().pipe(
      tap(async () => {
        const responseTime = Date.now() - now;
        this.logger.log(
          `Logged Car View: User ${userId} viewed Car ${carId} - Response time: ${responseTime}ms`,
        );

        try {
          const profile = token
            ? await this.authService.getProfile(token)
            : null;
          console.log(profile);
          if (!profile) {
            this.logger.warn('UserId or CarId is missing. Logging skipped.');
            return next.handle();
          }

          // Log the car view in the database

          await this.prisma.userCarView.create({
            data: {
              customerId: profile.uid,
              carId: carId,
              createdAt: new Date(), // Automatically log the current timestamp
            },
          });
        } catch (error) {
          this.logger.error('Failed to log car view', error.stack);
        }
      }),
    );
  }
}
