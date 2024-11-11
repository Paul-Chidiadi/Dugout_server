import {
  Controller,
  Post,
  Body,
  Res,
  Headers,
  HttpException,
  HttpStatus,
  Get,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateSuccessResponse } from 'src/common/utils/response.utils';
import { Response } from 'express';
import { CreateUserDto } from './dto/create-user.dto';
import { envConfig } from 'src/common/config/env.config';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('google')
  async googleAuth(
    @Body() createUserDto: CreateUserDto,
    @Res() response: Response,
  ) {
    const { user, accessToken, refreshToken } =
      await this.authService.googleAuth(createUserDto);
    if (user) {
      // Set JWT token as a cookie in the response
      response.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: true,
        maxAge: envConfig.COOKIE_EXPIRES_IN,
        sameSite: 'none',
      });
      return CreateSuccessResponse(
        response,
        {
          accessToken,
          user,
        },
        'Login Succesfull',
      );
    }
    throw new HttpException(
      'Unable to Create User. Please try again later!',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }

  @Get('refresh')
  async refresh(
    @Headers('Cookie') cookie: string,
    @Res({ passthrough: true }) response: Response,
  ) {
    const cookies = cookie.split(';').reduce((acc, curr) => {
      const [key, value] = curr.trim().split('=');
      acc[key] = value;
      return acc;
    }, {});

    const refreshToken = cookies['refreshToken'];

    if (refreshToken) {
      const { user, newAccessToken, newRefreshToken } =
        await this.authService.decodeRefreshToken(refreshToken);

      response.cookie('refreshToken', newRefreshToken, {
        httpOnly: true,
        secure: true,
        maxAge: envConfig.COOKIE_EXPIRES_IN,
        sameSite: 'none',
      });

      return { accessToken: newAccessToken, user };
    }
    throw new HttpException(
      'Unable to refresh token. Please try again later.',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}
