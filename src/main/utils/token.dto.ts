import { ApiProperty } from '@nestjs/swagger';

export class RefreshTokenDto {
  @ApiProperty({
    description: 'The refresh token to be used for generating new access token',
  })
  refreshToken: string;
}
