import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Repository, UpdateResult } from 'typeorm';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ICurrentUser } from './interfaces/user.interface';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async create(createUser: Partial<User>): Promise<User> {
    const savedResult = await this.userRepository.save(createUser);
    return savedResult;
  }

  async findById(userId: string): Promise<Partial<User> | null> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    return user;
  }

  async findByEmail(email: string): Promise<User | undefined> {
    return await this.userRepository.findOne({ where: { email } });
  }

  async updateUser(
    payload: Partial<User>,
    email: string,
  ): Promise<UpdateResult> {
    return await this.userRepository.update({ email }, payload);
  }

  async onboardUser(
    body: Partial<User>,
    currentUser: ICurrentUser,
  ): Promise<UpdateResult> {
    const user = await this.findById(currentUser.sub);
    if (!user) {
      throw new HttpException('User does not exist', HttpStatus.BAD_REQUEST);
    }
    if (user.onboarded) {
      throw new HttpException(
        'User has already onboarded',
        HttpStatus.BAD_REQUEST,
      );
    }
    const userWithClubName = await this.userRepository.findOne({
      where: { clubName: body.clubName },
    });
    const userWithUserName = await this.userRepository.findOne({
      where: { username: body.username },
    });
    if (userWithClubName) {
      throw new HttpException(
        'This ClubName already exist',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (userWithUserName) {
      throw new HttpException(
        'This UserName already exist',
        HttpStatus.BAD_REQUEST,
      );
    }
    const payload: Partial<User> = {
      ...body,
    };
    const updatedUser = await this.updateUser(payload, user.email);
    return updatedUser;
  }
}
