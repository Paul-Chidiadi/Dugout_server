import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateSuccessResponse } from 'src/common/utils/response.utils';
import { Response } from 'express';
import { OnboardUserDto } from './dto/onboard-user.dto';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { CurrentUser } from 'src/common/decorator/current-user.decorator';
import { ICurrentUser } from './interfaces/user.interface';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

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
}
