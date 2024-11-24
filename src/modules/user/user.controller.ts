import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import {
  CreateSuccessResponse,
  SuccessResponse,
} from 'src/common/utils/response.utils';
import { Response } from 'express';
import { OnboardUserDto } from './dto/onboard-user.dto';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { CurrentUser } from 'src/common/decorator/current-user.decorator';
import { ICurrentUser } from './interfaces/user.interface';
import { DraftPlayersDto } from './dto/draft_players.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('')
  async getAllUsers(@Res() res: Response) {
    const users = await this.userService.findAll();

    if (users) {
      return SuccessResponse(res, users, 'Users Fetched Successfully');
    }
    throw new HttpException(
      'No User Found. Please try again later!',
      HttpStatus.NOT_FOUND,
    );
  }

  @Get(':id')
  async getUser(@Param('id') id: string, @Res() res: Response) {
    const user = await this.userService.findById(id);

    if (user) {
      return SuccessResponse(res, user, 'User Fetched Successfully');
    }
    throw new HttpException(
      'No User Found. Please try again later!',
      HttpStatus.NOT_FOUND,
    );
  }

  @UseGuards(AuthGuard)
  @Post('onboard')
  async onboardUser(
    @Body() body: OnboardUserDto,
    @CurrentUser() currentUser: ICurrentUser,
    @Res() response: Response,
  ) {
    const user = await this.userService.onboardUser(body, currentUser);
    if (user) {
      return CreateSuccessResponse(response, user, 'Onboarding Successfull');
    }
    throw new HttpException(
      'Unable to Onboard User. Please try again later!',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }

  @UseGuards(AuthGuard)
  @Post('draft')
  async draftPlayers(
    @Body() body: DraftPlayersDto,
    @CurrentUser() currentUser: ICurrentUser,
    @Res() response: Response,
  ) {
    const user = await this.userService.draftPlayers(body, currentUser);
    if (user) {
      return CreateSuccessResponse(response, user, 'Drafting Successfull');
    }
    throw new HttpException(
      'Unable to Draft Players. Please try again later!',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}
