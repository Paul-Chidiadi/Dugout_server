import { Injectable } from '@nestjs/common';
import { Player } from './entities/players.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, UpdateResult } from 'typeorm';

@Injectable()
export class PlayersService {
  constructor(
    @InjectRepository(Player)
    private readonly playerRepository: Repository<Player>,
  ) {}

  async createPlayerData(body: Partial<Player>): Promise<Player> {
    return;
  }
}
