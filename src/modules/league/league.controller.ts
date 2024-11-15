import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { LeagueService } from './league.service';
import { AuthGuard } from 'src/common/guards/auth.guard';
import {
  CreateSuccessResponse,
  SuccessResponse,
} from 'src/common/utils/response.utils';
import { Response } from 'express';
import { CreateLeagueDto } from './dto/create_league.dto';
import { CurrentUser } from 'src/common/decorator/current-user.decorator';
import { ICurrentUser } from '../user/interfaces/user.interface';

@Controller('league')
export class LeagueController {
  constructor(private readonly leagueService: LeagueService) {}

  @Get('')
  async getAllLeagues(@Res() res: Response) {
    const leagues = await this.leagueService.getAllLeagues();

    if (leagues) {
      return SuccessResponse(res, leagues, 'Leagues Fetched Successfully');
    }
    throw new HttpException(
      'No Leagues Found. Please try again later!',
      HttpStatus.NOT_FOUND,
    );
  }

  @Get(':id')
  async getLeague(@Param('id') id: string, @Res() res: Response) {
    const league = await this.leagueService.getLeague(id);

    if (league) {
      return SuccessResponse(res, league, 'League Fetched Successfully');
    }
    throw new HttpException(
      'No League Found. Please try again later!',
      HttpStatus.NOT_FOUND,
    );
  }

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

  @UseGuards(AuthGuard)
  @Patch('/:leagueId')
  async joinLeague(
    @Param('leagueId') leagueId: string,
    @CurrentUser() currentUser: ICurrentUser,
    @Res() response: Response,
  ) {
    const leagueGroup = await this.leagueService.joinLeague(
      leagueId,
      currentUser,
    );
    if (leagueGroup) {
      return CreateSuccessResponse(response, leagueGroup, 'Successfull');
    }
    throw new HttpException(
      'Unable to Join leagueGroup. Please try again later!',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}
