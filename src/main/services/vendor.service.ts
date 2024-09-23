import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  forwardRef,
} from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CreateVendorUserDto } from '../utils/vendor.dto';
import { AuthService } from './auth.service';

@Injectable()
export class VendorService {
  constructor(
    private readonly prisma: PrismaService,
    // @Inject(forwardRef(() => AuthService))
    // private readonly authService: AuthService,
  ) {}

  async createVendorUser(createVendorUser: CreateVendorUserDto) {
    const result = await this.prisma.vendorUser.create({
      data: {
        ...createVendorUser,
      },
    });

    if (!result) {
      throw new HttpException(
        'Error while create vendor',
        HttpStatus.BAD_REQUEST,
      );
    }
    return { message: 'create successfull' };
  }
  catch(error) {
    throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
  }
}
