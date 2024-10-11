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
  async uploadCategoryLogo(
    id: number,
    logo: Express.Multer.File,
    logoActive: Express.Multer.File,
  ) {
    const allowedExtensions = ['jpg', 'jpeg', 'png'];
    const maxSizeInBytes = 500 * 1024; // 500KB

    // ตรวจสอบไฟล์โลโก้ธรรมดา
    const logoExtension = logo.mimetype.split('/')[1].toLowerCase();
    if (
      logo.size > maxSizeInBytes ||
      !allowedExtensions.includes(logoExtension)
    ) {
      throw new HttpException('Invalid logo file', HttpStatus.BAD_REQUEST);
    }

    // ตรวจสอบไฟล์โลโก้ active
    const logoActiveExtension = logoActive.mimetype.split('/')[1].toLowerCase();
    if (
      logoActive.size > maxSizeInBytes ||
      !allowedExtensions.includes(logoActiveExtension)
    ) {
      throw new HttpException(
        'Invalid logoActive file',
        HttpStatus.BAD_REQUEST,
      );
    }
    const logoOriginalname = logo.originalname.split('.')[0].toLowerCase()
    const logoActiveOriginalname = logoActive.originalname.split('.')[0].toLowerCase()
    // กำหนด path สำหรับ brand หรือ category
    const folderPath = 'logos/category';



    // สร้างชื่อไฟล์สำหรับโลโก้ธรรมดาและโลโก้ active
    const logoName = `${logoOriginalname}.${logoExtension}`;
    
    const logoActiveName = `${logoActiveOriginalname}.${logoActiveExtension}`;
    const logoKey = `${folderPath}/${logoName}`;
    const logoActiveKey = `${folderPath}/${logoActiveName}`;
    try {
      // อัปโหลดโลโก้ธรรมดา
      await this.s3.send(
        new PutObjectCommand({
          Bucket: process.env.BUCKET,
          Key: logoKey,
          Body: logo.buffer,
          ContentType: `image/${logoExtension}`,
        }),
      );

    //   // อัปโหลดโลโก้ active
      await this.s3.send(
        new PutObjectCommand({
          Bucket: process.env.BUCKET,
          Key: logoActiveKey,
          Body: logoActive.buffer,
          ContentType: `image/${logoActiveExtension}`,
        }),
      );
      await this.carService.updateCategoryLogo(
        id,
        logoName,
        logoActiveName,
        folderPath,
      );
      const envUrl = process.env.S3_PUBLIC_URL || 'https://your-r2-public-url';
      const logoUrl = `${envUrl}/${logoKey}`;
      const logoActiveUrl = `${envUrl}/${logoActiveKey}`;
      return `Logos uploaded: ${logoUrl}, ${logoActiveUrl}`;
    } catch (error) {
      throw new HttpException(
        `File upload failed: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }


  async uploadBrandLogo(
    id: number,
    logo: Express.Multer.File,
  ) {
    const allowedExtensions = ['jpg', 'jpeg', 'png'];
    const maxSizeInBytes = 500 * 1024; // 500KB

      // ตรวจสอบไฟล์โลโก้ธรรมดา
  const logoExtension = logo.mimetype.split('/')[1].toLowerCase();
  if (logo.size > maxSizeInBytes || !allowedExtensions.includes(logoExtension)) {
    throw new HttpException('Invalid logo file', HttpStatus.BAD_REQUEST);
  }

 console.log(logo);
 console.log(id);
 
  
  const logoOriginalname = logo.originalname.split('.')[0].toLowerCase()
  // กำหนด path สำหรับ brand 
  const folderPath =  'logos/brand';

    // สร้างชื่อไฟล์สำหรับโลโก้ธรรมดาและโลโก้ active
  const logoName = `${logoOriginalname}.${logoExtension}`;
  const logoKey = `${folderPath}/${logoName}`;

  try {
    // อัปโหลดโลโก้ธรรมดา
    await this.s3.send(new PutObjectCommand({
      Bucket: process.env.BUCKET,
      Key: logoKey,
      Body: logo.buffer,
      ContentType: `image/${logoExtension}`,
    }));

    // อัปโหลดโลโก้ active
    
    await this.carService.updateBrandLogo(id, logoName,folderPath);
    const envUrl = process.env.S3_PUBLIC_URL || 'https://your-r2-public-url';
    const logoUrl = `${envUrl}/${logoKey}`;
   
    return `Logos uploaded: ${logoUrl}`;
  }catch (error) {
    throw new HttpException(`File upload failed: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
  }
  
}
}
