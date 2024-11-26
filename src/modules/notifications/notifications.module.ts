import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { UserService } from '../user/user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { Player } from '../players/entities/players.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Player])],
  controllers: [NotificationsController],
  providers: [NotificationsService, UserService],
})
export class NotificationsModule {}
