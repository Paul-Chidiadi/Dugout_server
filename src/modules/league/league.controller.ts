import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { LeagueService } from './league.service';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { CreateSuccessResponse } from 'src/common/utils/response.utils';
import { Response } from 'express';
import { CreateLeagueDto } from './dto/create_league.dto';
import { CurrentUser } from 'src/common/decorator/current-user.decorator';
import { ICurrentUser } from '../user/interfaces/user.interface';

@Controller('league')
export class LeagueController {
  constructor(private readonly leagueService: LeagueService) {}

  @UseGuards(AuthGuard)
  @Post('')
  async createLeague(
    @Body() body: CreateLeagueDto,
    @CurrentUser() currentUser: ICurrentUser,
    @Res() response: Response,
  ) {
    const leagueGroup = await this.leagueService.createLeague(
      body,
      currentUser,
    );
    if (leagueGroup) {
      return CreateSuccessResponse(response, leagueGroup, 'Successfull');
    }
    throw new HttpException(
      'Unable to Create leagueGroup. Please try again later!',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}
