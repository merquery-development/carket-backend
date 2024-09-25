import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
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
import { AuthService } from '../services/auth.service';
import { RefreshTokenDto } from '../utils/token.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Sign in with username and password' })
  @ApiResponse({ status: 200, description: 'Successfully signed in' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        username: {
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
  signIn(@Body() signInDto: Record<string, any>) {
    return this.authService.signIn(signInDto.username, signInDto.password);
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
  @ApiOperation({ summary: 'Get profile user from jwt token' })
  @ApiResponse({ status: 200, description: 'request sucess' })
  async getProfile(@Req() request: Request) {
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
  async googleAuth(@Req() req) {
    return req.user;
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Google Auth Callback' })
  googleAuthRedirect(@Req() req) {
    return {
      message: 'Google Authentication successful',
      user: req.user,
    };
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
    return {
      message: 'Facebook Authentication successful',
      user: req.user,
    };
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
}
