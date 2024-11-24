import { Injectable } from '@nestjs/common';
import { Player } from './entities/players.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, UpdateResult } from 'typeorm';
import { ICurrentUser } from '../user/interfaces/user.interface';

@Injectable()
export class PlayersService {
  constructor(
    @InjectRepository(Player)
    private readonly playerRepository: Repository<Player>,
  ) {}

  async createPlayerData(body: Partial<Player>): Promise<Player> {
    return;
  }

  async draftPlayers(
    body: Partial<Player[]>,
    currentUser: ICurrentUser,
  ): Promise<UpdateResult> {
    return;
  }
}
