import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from 'src/main/services/auth.service';

@ApiTags('auth-customer')
@Controller('auth-customer')
export class AuthCustomerController {
  constructor(private readonly authService: AuthService) {}

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
          example: 'testuser',
          description: 'this is username',
        },
        password: {
          type: 'String',
          example: 'testpassword',
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

  // // Optional endpoint for showing the Facebook user info
  // @Get('facebook/login')
  // facebookLogin(@Req() req) {
  //   if (!req.user) {
  //     return 'No user from Facebook';
  //   }
  //   return {
  //     message: 'User information from Facebook',
  //     user: req.user,
  //   };
  // }
}
