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
import { CustomerOrGuestGuard } from '../guards/customer.guard';
import { AuthService } from '../services/auth.service';
import { VendorService } from '../services/vendor.service';
import { RefreshTokenDto } from '../utils/dto/token.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    @Inject(forwardRef(() => VendorService))
    private readonly vendorService: VendorService,
  ) {}

  @Post('login-vendor')
  @ApiOperation({ summary: 'Sign in with username or email and password' })
  @ApiResponse({ status: 200, description: 'Successfully signed in' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        identifier: {
          type: 'String',
          example: 'admin',
          description: 'this is username',
        },
        password: {
          type: 'String',
          example: 'adminx',
          description: 'this is password',
        },
      },
    },
  })
  @HttpCode(200)
  signInVendor(@Body() signInDto: Record<string, any>) {
    return this.authService.signInVendor(
      signInDto.identifier,
      signInDto.password,
    );
  }

  @Post('login-customer')
  @ApiOperation({ summary: 'Sign in with username or email and password' })
  @ApiResponse({ status: 200, description: 'Successfully signed in' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        identifier: {
          type: 'String',
          example: 'admin',
          description: 'this is username',
        },
        password: {
          type: 'String',
          example: 'adminx',
          description: 'this is password',
        },
      },
    },
  })
  @HttpCode(200)
  signInCustomer(@Body() signInDto: Record<string, any>) {
    return this.authService.signInCustomer(
      signInDto.identifier,
      signInDto.password,
    );
  }
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
  // @UseGuards(CustomerOrGuestGuard)
  @ApiOperation({ summary: 'Get profile user from jwt token' })
  @ApiResponse({ status: 200, description: 'request sucess' })
  async getProfile(@Req() request: Request) {
    if(request['isGuest']){
      throw new UnauthorizedException('Guests cannot access the profile');
    };

    const authorization = request.headers['authorization'];

    if (!authorization || !authorization.startsWith('Bearer ')) {
      throw new UnauthorizedException('Invalid authorization header');
    }

    const token = authorization.substring(7); // Remove 'Bearer ' prefix
    return this.authService.getProfile(token);
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Login with Google' })
  async googleAuth(@Req() req) {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Google Auth Callback' })
  googleAuthRedirect(@Req() req) {
    return this.authService.googleLogin(req);
  }
  // Facebook login route
  @Get('facebook')
  @UseGuards(AuthGuard('facebook')) // Corrected to 'facebook'
  @ApiOperation({ summary: 'Login with Facebook' })
  async facebookAuth(@Req() req) {
    // User will be redirected to Facebook login page
  }

  // Facebook callback route
  @Get('facebook/callback')
  @UseGuards(AuthGuard('facebook')) // Corrected to 'facebook'
  @ApiOperation({ summary: 'Facebook Auth Callback' })
  facebookAuthRedirect(@Req() req) {
    // After Facebook redirects back to your site
    return this.authService.facebookLogin(req);
  }

  // Optional endpoint for showing the Facebook user info
  @Get('facebook/login')
  facebookLogin(@Req() req) {
    if (!req.user) {
      return 'No user from Facebook';
    }
    return {
      message: 'User information from Facebook',
      user: req.user,
    };
  }
  @Get('verify-email')
  async verifyEmail(@Query('token') token: string, @Res() res) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded['userId'];

      // Activate user account
      await this.vendorService.verifyEmail(userId);

      return res.send('Email successfully verified!');
    } catch (error) {
      return res.status(400).send('Invalid or expired token.');
    }
  }
}
