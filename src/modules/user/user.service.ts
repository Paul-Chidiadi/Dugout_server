import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';

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
}
