import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
  Res,
} from '@nestjs/common';
import { PlayersService } from './players.service';
import { CreateSuccessResponse } from 'src/common/utils/response.utils';
import { CreatePlayersDto } from './dto/create_players.dto';
import { Response } from 'express';

@Controller('players')
export class PlayersController {
  constructor(private readonly playersService: PlayersService) {}

  @Post('')
  async createPlayerData(
    @Body() body: CreatePlayersDto,
    @Res() response: Response,
  ) {
    const playersData = await this.playersService.createPlayerData(body);
    if (playersData) {
      return CreateSuccessResponse(response, playersData, 'Successfull');
    }
    throw new HttpException(
      'Unable to Create Players Data. Please try again later!',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}
