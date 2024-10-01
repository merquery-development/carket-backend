import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDate,
  IsEmail,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateCustomerDto {
  @IsBoolean()
  @IsOptional() // บ่งบอกว่าเป็นผู้ใช้ OAuth หรือไม่
  @ApiProperty({
    example: false,
    required: false,
  })
  isOauth: boolean;

  @IsString()
  @IsOptional() // เก็บประเภทของ OAuth เช่น Google, Facebook
  @ApiProperty({
    example: 'Google',
    required: false,
  })
  oauthType: string;

  @IsOptional() // ข้อมูลที่ได้รับจาก OAuth provider เก็บในรูปแบบ JSON
  @ApiProperty({
    example: '{}',
    required: false,
  })
  oauthUserData: object;
  @IsString()
  @IsOptional() // username ไม่จำเป็นหากเป็น OAuth
  @ApiProperty({
    example: 'testuser',
    required: false,
  })
  username: string;
  @IsString()
  @IsOptional() // username ไม่จำเป็นหากเป็น OAuth
  @ApiProperty({
    example: 'Surapong',
    required: false,
  })
  firstname: string;
  @IsString()
  @IsOptional() // username ไม่จำเป็นหากเป็น OAuth
  @ApiProperty({
    example: 'Chamalai',
    required: false,
  })
  lastname: string;
  @IsEmail()
  @IsOptional() // email ไม่จำเป็นหากเป็น OAuth
  @ApiProperty({
    example: 'testemail@mail.com',
    required: false,
  })
  email: string;

  @IsString()
  @IsOptional() // password ไม่จำเป็นหากเป็น OAuth
  @ApiProperty({
    example: 'testpassword',
    required: false,
  })
  password: string;
  @IsDate()
  @IsOptional()
  @ApiProperty({
    example: new Date(),
    required: false,
  })
  updateAt: Date;
}
