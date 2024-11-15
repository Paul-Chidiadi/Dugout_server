import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { envConfig } from 'src/common/config/env.config';
import { ILoginResponse, IUser } from '../user/interfaces/user.interface';
import { UserService } from '../user/user.service';
import { OAuth2Client } from 'google-auth-library';

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
    const { idToken } = body;
    const client = new OAuth2Client(envConfig.GOOGLE_CLIENT_ID);

    const credentials = {
      idToken: idToken,
      audience: envConfig.GOOGLE_CLIENT_ID,
    };

    return (async () => {
      let newUser: any;
      const ticket = await client.verifyIdToken(credentials);
      const payload = ticket.getPayload();
      if (payload) {
        const user: any = {
          name: `${payload.given_name} ${payload.family_name}`,
          email: payload.email,
          googleId: payload.sub,
        };
        const userExist = await this.usersService.findByEmail(user.email);
        if (!userExist) {
          newUser = await this.usersService.create(user);
          const userPayload = {
            sub: newUser.id,
            email: newUser.email,
            name: newUser.name,
          };
          // Generate a JWT and return it here
          const accessToken = await this.createAccessToken(userPayload);
          const refreshToken = await this.createRefreshToken(userPayload);

          return { accessToken, refreshToken, user: newUser };
        } else if (userExist) {
          newUser = await this.usersService.findByEmail(userExist.email);
          const userPayload = {
            sub: newUser.id,
            email: newUser.email,
            name: newUser.name,
          };
          // Generate a JWT and return it here
          const accessToken = await this.createAccessToken(userPayload);
          const refreshToken = await this.createRefreshToken(userPayload);

          return { accessToken, refreshToken, user: newUser };
        }
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
