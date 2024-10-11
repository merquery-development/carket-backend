import {
  Body,
  Controller,
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UnauthorizedException,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { AnyFilesInterceptor, FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthService } from '../services/auth.service';
import { FileUploadService } from '../services/file.service';
import { UploadCarPicturesDto } from '../utils/dto/car.dto';
import { log } from 'console';
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
  @UseInterceptors(AnyFilesInterceptor())
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Upload multiple car pictures',
    type: 'multipart/form-data',
    schema: {
      type: 'object',
      properties: {
        filename: {
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
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Body() body: UploadCarPicturesDto,
    @Req() request: Request,
  ) {
    try {
      // ตรวจสอบว่าได้รับไฟล์และ carId หรือไม่
      if (!files || files.length === 0) {
        throw new HttpException('No files uploaded', HttpStatus.BAD_REQUEST);
      }

      if (!body.carId) {
        throw new HttpException('Car ID is required', HttpStatus.BAD_REQUEST);
      }

      
      // เรียกใช้ service เพื่ออัปโหลดรูปภาพหลายไฟล์
      const fileUrls = await this.fileUploadService.uploadCarPictures(files, Number(body.carId));
        console.log(fileUrls);
        
      return { urls: fileUrls };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
  @Post(':type/:id')
  @ApiOperation({ summary: 'Upload a logo for a brand or category' })
  @ApiConsumes('multipart/form-data')
  @ApiParam({
    name: 'type',
    enum: ['brand', 'category'],
    description: 'Specify whether to upload a brand or category logo',
  })
  @ApiParam({ name: 'id', description: 'The ID of the brand or category' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Logo successfully uploaded',
    type: String,
  })
  @ApiResponse({ status: 400, description: 'Invalid file or file too large' })
  @ApiResponse({ status: 500, description: 'File upload failed' })
  @UseInterceptors(FileInterceptor('file'))
  async uploadLogo(
    @UploadedFile() file: Express.Multer.File,
    @Param('type') type: 'brand' | 'category',
    @Param('id', ParseIntPipe) id: number,
  ): Promise<string> {
    if (!file) {
      throw new HttpException('No file provided', HttpStatus.BAD_REQUEST);
    }

    // Use the service to handle the file upload
    return await this.fileUploadService.uploadBrandOrCategoryLogo(
      file,
      type,
      id,
    );
  }
}
