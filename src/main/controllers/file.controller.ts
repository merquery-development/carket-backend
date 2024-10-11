import {
  Body,
  Controller,
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Post,
  Req,
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
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthService } from '../services/auth.service';
import { FileUploadService } from '../services/file.service';
import { UploadCarPicturesDto, UploadLogoDto } from '../utils/dto/car.dto';
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
      const fileUrls = await this.fileUploadService.uploadCarPictures(
        files,
        Number(body.carId),
      );
      console.log(fileUrls);

      return { urls: fileUrls };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
  @Post('logo')
  @UseInterceptors(FileInterceptor('file')) // Interceptor สำหรับไฟล์เดียว
  @ApiOperation({ summary: 'Upload a logo for a brand or category' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Upload a logo for brand or category',
    schema: {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          enum: ['brand', 'category'], // เลือกได้เฉพาะ brand หรือ category
        },
        id: { type: 'integer' }, // รวม id ของ brand หรือ category ในฟอร์ม-data
        file: {
          type: 'string',
          format: 'binary', // ระบุว่า file เป็น binary
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Logo successfully uploaded',
  })
  async uploadLogo(
    @UploadedFile() file: Express.Multer.File, // รับไฟล์เดียว
    @Body() body: UploadLogoDto, // รับ type และ id
  ): Promise<string> {
    try {
      // ตรวจสอบว่าได้รับไฟล์และ id หรือไม่
      if (!file) {
        throw new HttpException('No file uploaded', HttpStatus.BAD_REQUEST);
      }

      if (!body.id) {
        throw new HttpException('ID is required', HttpStatus.BAD_REQUEST);
      }

      // เรียกใช้ service เพื่ออัปโหลดโลโก้
      const imageUrl = await this.fileUploadService.uploadBrandOrCategoryLogo(
        file,
        body.type,
        body.id,
      );

      return imageUrl; // ส่ง URL ของโลโก้ที่อัปโหลดกลับไป
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
}
