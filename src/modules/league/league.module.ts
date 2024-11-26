import { Module } from '@nestjs/common';
import { LeagueService } from './league.service';
import { LeagueController } from './league.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { League_Group } from './entities/league.entity';
import { UserService } from '../user/user.service';
import { UserModule } from '../user/user.module';
import { User } from '../user/entities/user.entity';
import { Player } from '../players/entities/players.entity';

@Module({
  imports: [TypeOrmModule.forFeature([League_Group, User, Player]), UserModule],
  controllers: [LeagueController],
  providers: [LeagueService, UserService],
  exports: [LeagueService],
})
export class LeagueModule {}
