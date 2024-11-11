import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { envConfig } from 'src/common/config/env.config';
import { ILoginResponse, IUser } from '../user/interfaces/user.interface';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UserService,
    private jwtService: JwtService,
  ) {}

  async createAccessToken(payload: any): Promise<string> {
    return this.jwtService.signAsync(payload, {
      expiresIn: Number(envConfig.ACCESSTOKEN_EXPIRES_IN),
    });
  }

  async createRefreshToken(payload: any): Promise<string> {
    return this.jwtService.signAsync(payload, {
      expiresIn: envConfig.REFRESHTOKEN_EXPIRES_IN,
    });
  }

  async googleAuth(body: IUser): Promise<Partial<ILoginResponse>> {
    const { email, name } = body;

    return (async () => {
      let newUser: any;
      const userExist = await this.usersService.findByEmail(email);
      const user: IUser = {
        name,
        email,
      };

      if (!userExist) {
        newUser = await this.usersService.create(user);
        const payload = {
          sub: newUser.id,
          email: newUser.email,
          name: newUser.name,
        };
        // Generate a JWT and return it here
        const accessToken = await this.createAccessToken(payload);
        const refreshToken = await this.createRefreshToken(payload);

        return { accessToken, refreshToken, user: newUser };
      } else if (userExist) {
        newUser = await this.usersService.findByEmail(userExist.email);
        const payload = {
          sub: newUser.id,
          email: newUser.email,
          name: newUser.name,
        };
        // Generate a JWT and return it here
        const accessToken = await this.createAccessToken(payload);
        const refreshToken = await this.createRefreshToken(payload);

        return { accessToken, refreshToken, user: newUser };
      }
    })();
  }

  async decodeRefreshToken(token: string): Promise<ILoginResponse> {
    try {
      const decoded = await this.jwtService.verifyAsync(token, {
        secret: envConfig.JWT_SECRET,
      });

      if (!decoded) {
        throw new HttpException(
          'Invalid refresh token',
          HttpStatus.BAD_REQUEST,
        );
      }
      const expirationTime = decoded.exp as number;
      const currentTime = Math.floor(Date.now() / 1000);
      if (currentTime > expirationTime) {
        // token has expired
        throw new HttpException(
          'Invalid refresh token',
          HttpStatus.BAD_REQUEST,
        );
      }
      const userExist = await this.usersService.findByEmail(decoded.email);
      const payload = {
        sub: decoded.sub,
        email: decoded.email,
      };
      const newAccessToken = await this.createAccessToken(payload);
      const newRefreshToken = await this.createRefreshToken(payload);
      const result: ILoginResponse = {
        newAccessToken,
        newRefreshToken,
        user: userExist,
      };
      return result as ILoginResponse;
    } catch (error: any) {
      throw new HttpException('Invalid refresh token', HttpStatus.BAD_REQUEST);
    }
  }
}
