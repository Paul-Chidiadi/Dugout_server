import { Module } from '@nestjs/common';
import { LeagueService } from './league.service';
import { LeagueController } from './league.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { League_Group } from './entities/league.entity';
import { UserService } from '../user/user.service';

@Module({
  imports: [TypeOrmModule.forFeature([League_Group])],
  controllers: [LeagueController],
  providers: [LeagueService, UserService],
})
export class LeagueModule {}
