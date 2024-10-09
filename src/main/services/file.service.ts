import { PutObjectCommand, S3, S3ClientConfig } from '@aws-sdk/client-s3';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { AuthService } from './auth.service';

import { CarService } from './car.service';

@Injectable()
export class FileUploadService {
  private s3: S3;

  constructor(
    private readonly authService: AuthService,
    private readonly carService: CarService,
  ) {
    const s3ClientConfig: S3ClientConfig = {
      region: 'auto', // Set the appropriate region
      endpoint: process.env.ENDPOINT,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
      },
      forcePathStyle: true, // Needed for R2
    };
    this.s3 = new S3(s3ClientConfig);
  }
  async uploadCarPictures(
    files: Express.Multer.File[] | Buffer[],
    carId: number,
  ): Promise<string[]> {
    const carPictures = [];

    for (const file of files) {
      const uid = uuidv4();
      let fileExtension: string;
      let fileBuffer: Buffer;

      if (file instanceof Buffer) {
        fileBuffer = file;
        fileExtension = 'png'; // Default to PNG for Buffer input
      } else {
        fileBuffer = file.buffer;
        fileExtension = file.mimetype.split('/')[1].toLowerCase();
      }

      const allowedExtensions = ['jpg', 'jpeg', 'png'];
      const maxSizeInBytes = 500 * 1024; // 500KB

      if (fileBuffer.length > maxSizeInBytes) {
        throw new HttpException(
          'File size exceeds 500KB limit.',
          HttpStatus.BAD_REQUEST,
        );
      }

      if (!allowedExtensions.includes(fileExtension)) {
        throw new HttpException(
          'Invalid file type. Only jpg, jpeg, and png are allowed.',
          HttpStatus.BAD_REQUEST,
        );
      }

      const folderPath = 'pictures/car';
      const imageName = `${uid}.${fileExtension}`;
      const key = `${folderPath}/${imageName}`;

      try {
        const command = new PutObjectCommand({
          Bucket: process.env.BUCKET,
          Key: key,
          Body: fileBuffer,
          ContentType: `image/${fileExtension}`,
        });

        await this.s3.send(command);

        const envUrl =
          process.env.S3_PUBLIC_URL || 'https://your-r2-public-url';
        const imageUrl = `${envUrl}/${key}`;

        carPictures.push(imageUrl);

        // Store in database
        await this.carService.updateCarPicture(carId, imageName, folderPath);
      } catch (error) {
        throw new HttpException(
          `File upload failed: ${error.message}`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }

    return carPictures;
  }
  async uploadBrandOrCategoryLogo(
    file: Express.Multer.File | Buffer,
    type: 'brand' | 'category',
    id: number,
  ): Promise<string> {
    const uid = uuidv4();
    let fileExtension: string;
    let fileBuffer: Buffer;

    if (file instanceof Buffer) {
      fileBuffer = file;
      fileExtension = 'png'; // Default to PNG for Buffer input
    } else {
      fileBuffer = file.buffer;
      fileExtension = file.mimetype.split('/')[1].toLowerCase();
    }

    const allowedExtensions = ['jpg', 'jpeg', 'png'];
    const maxSizeInBytes = 500 * 1024; // 500KB

    if (fileBuffer.length > maxSizeInBytes) {
      throw new HttpException(
        'File size exceeds 500KB limit.',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (!allowedExtensions.includes(fileExtension)) {
      throw new HttpException(
        'Invalid file type. Only jpg, jpeg, and png are allowed.',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Set folder path for brand or category
    let folderPath: string;
    if (type === 'brand') {
      folderPath = 'logos/brand';
    } else if (type === 'category') {
      folderPath = 'logos/category';
    }

    const imageName = `${uid}.${fileExtension}`;
    const key = `${folderPath}/${imageName}`;

    try {
      const command = new PutObjectCommand({
        Bucket: process.env.BUCKET,
        Key: key,
        Body: fileBuffer,
        ContentType: `image/${fileExtension}`,
      });

      await this.s3.send(command);

      const envUrl = process.env.S3_PUBLIC_URL || 'https://your-r2-public-url';
      const imageUrl = `${envUrl}/${key}`;

      // Update brand or category in the database
      if (type === 'brand') {
        await this.carService.updateBrandLogo(id, imageName, folderPath);
      } else if (type === 'category') {
        await this.carService.updateCategoryLogo(id, imageName, folderPath);
      }

      return imageUrl;
    } catch (error) {
      throw new HttpException(
        `File upload failed: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
