import {
  Body,
  Controller,
  Get,
  HttpCode,
  Inject,
  Post,
  Query,
  Res,
  forwardRef,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from 'src/main/services/auth.service';
import { VendorService } from 'src/main/services/vendor.service';
import * as jwt from 'jsonwebtoken';
@ApiTags('auth-vendor')
@Controller('auth-vendor')
export class AuthVendorController {
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
