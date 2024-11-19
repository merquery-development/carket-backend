import {
  Body,
  Controller,
  forwardRef,
  Get,
  HttpCode,
  Inject,
  Post,
  Query,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import * as jwt from 'jsonwebtoken';
import { CustomerOrGuestGuard } from '../../guards/customer.guard';
import { AuthService } from '../../services/auth.service';
import { VendorService } from '../../services/vendor.service';
import { RefreshTokenDto } from '../../utils/dto/token.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    @Inject(forwardRef(() => VendorService))
    private readonly vendorService: VendorService,
  ) {}

 

 
  @Post('refresh')
  @HttpCode(200)
  @ApiOperation({ summary: 'Refresh access token using refresh token' })
  @ApiResponse({ status: 200, description: 'Successfully refreshed tokens' })
  @ApiResponse({ status: 401, description: 'Invalid or expired refresh token' })
  @ApiBearerAuth('defaultBearerAuth') // Indicates that Bearer token is required
  async refresh(@Body() body: RefreshTokenDto) {
    return this.authService.refresh(body.refreshToken);
  }

  @Get('profile')
  @HttpCode(200)
  @ApiBearerAuth('defaultBearerAuth')
  @UseGuards(CustomerOrGuestGuard)
  @ApiOperation({ summary: 'Get profile user from jwt token' })
  @ApiResponse({ status: 200, description: 'request sucess' })
  async getProfile(@Req() request: Request) {
    if (request['isGuest']) {
      throw new UnauthorizedException('Guests cannot access the profile');
    }

    const authorization = request.headers['authorization'];

    if (!authorization || !authorization.startsWith('Bearer ')) {
      throw new UnauthorizedException('Invalid authorization header');
    }

    const token = authorization.substring(7); // Remove 'Bearer ' prefix
    return this.authService.getProfile(token);
  }

  

}
