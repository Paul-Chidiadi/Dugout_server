import { User } from '../entities/user.entity';

export interface ILoginResponse {
  readonly accessToken?: string;
  readonly refreshToken?: string;
  readonly user: User;
  readonly newAccessToken?: string;
  readonly newRefreshToken?: string;
}

export interface ICurrentUser {
  sub: string;
  email: string;
  name: string;
  iat: number;
  exp: number;
}

export interface IUser {
  id?: string;
  name?: string;
  email?: string;
  idToken?: string;
  createdAt?: any;
  updatedAt?: any;
}
