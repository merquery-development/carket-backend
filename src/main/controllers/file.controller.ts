import {
  Body,
  Controller,
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Post,
  Req,
  UnauthorizedException,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthService } from '../services/auth.service';
import { FileUploadService } from '../services/file.service';
import { UploadCarPicturesDto } from '../utils/dto/car.dto';
import { FileInterceptor } from '@nestjs/platform-express';
@ApiBearerAuth('defaultBearerAuth')
@ApiTags('upload')
@Controller('upload')
export class FileUploadController {
  constructor(
    private readonly fileUploadService: FileUploadService,
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
  ) {}

  @Post('car-pictures')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Upload multiple car pictures',
    type: 'multipart/form-data',
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
        },
        carId: { type: 'integer' }, // Include carId field in form-data
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Car pictures upload successful',
  })
  async uploadCarPictures(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() body: UploadCarPicturesDto,
    @Req() request: Request,
  ) {
    try {
      const authorization = request.headers['authorization'];

      if (!authorization || !authorization.startsWith('Bearer ')) {
        throw new UnauthorizedException('Invalid authorization header');
      }

      const token = authorization.substring(7);

      const fileUrls = await this.fileUploadService.uploadCarPictures(
        files,
        body.carId,
      );

      return { urls: fileUrls };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
}
