import { ApiProperty } from '@nestjs/swagger';
import {
  IsDate,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
export class CreateVendorUserDto {
  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({
    example: '1',
  })
  vendorId: number;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'testuser',
  })
  username: string;

  @IsEmail()
  @ApiProperty({
    example: 'testemail@mail.com',
  })
  email: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'testpassword',
  })
  password: string;

  @IsNotEmpty()
  @ApiProperty({
    example: '1',
  })
  roleId: number;

  @IsDate()
  @IsOptional()
  updateAt: Date;
}
