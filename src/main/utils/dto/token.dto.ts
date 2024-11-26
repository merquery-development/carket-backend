import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, Matches } from 'class-validator';

export class RefreshTokenDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^[A-Za-z0-9-_]+?\.[A-Za-z0-9-_]+?\.([A-Za-z0-9-_]+)?$/, {
    message: 'Invalid refresh token format',
  })
  @ApiProperty({
    description: 'The refresh token to be used for generating new access token',
  })
  refreshToken: string;
}
