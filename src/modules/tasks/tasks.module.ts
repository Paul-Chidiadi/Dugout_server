import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { LeagueModule } from '../league/league.module';
import { UserModule } from '../user/user.module';
import { NotificationsService } from '../notifications/notifications.service';

@Module({
  imports: [LeagueModule, UserModule],
  controllers: [TasksController],
  providers: [TasksService, NotificationsService],
})
export class TasksModule {}
