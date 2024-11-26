import { Injectable } from '@nestjs/common';
import { LeagueService } from '../league/league.service';
import { Cron } from '@nestjs/schedule';
import { LEAGUE_STATUS } from 'src/common/enums/league.enum';
import { UserService } from '../user/user.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class TasksService {
  constructor(
    private readonly leagueService: LeagueService,
    private readonly usersService: UserService,
    private readonly notificationsService: NotificationsService,
  ) {}

  @Cron('* 00 16 * * 5')
  async handleUpdateLeagueStatusToDraftingCron() {
    const leagues = await this.leagueService.updateAllLeagueStatus(
      LEAGUE_STATUS.CREATED,
      LEAGUE_STATUS.DRAFTING,
    );
    // SEND EMAILS
    ////////////////////////////////////////////////////////////////
    if (leagues) {
      await this.notificationsService.sendDraftingEmailAtIntervals();
    }
  }

  @Cron('* 30 17 * * 5')
  async handleEndLeagueDraftingCron() {
    const leagues = await this.leagueService.updateAllLeagueStatus(
      LEAGUE_STATUS.DRAFTING,
      LEAGUE_STATUS.UPCOMING,
    );
  }

  @Cron('* 00 01 * * 2')
  async handleStartCreateLeagueGroupCron() {
    const users = await this.usersService.updateAllUsersPermission(false, true);
    // SEND EMAILS
    ////////////////////////////////////////////////////////////////
    if (users) {
      await this.notificationsService.sendCreateGroupEmailAtIntervals();
    }
  }

  @Cron('* 00 01 * * 5')
  async handleEndCreateLeagueGroupCron() {
    const users = await this.usersService.updateAllUsersPermission(true, false);
  }
}
