import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { League_Group } from './entities/league.entity';
import { Repository, UpdateResult } from 'typeorm';
import { ICurrentUser } from '../user/interfaces/user.interface';
import { UserService } from '../user/user.service';
import { LEAGUE_STATUS, LEAGUE_VISIBILITY } from 'src/common/enums/league.enum';
import { User } from '../user/entities/user.entity';
import { generateRandomCode } from 'src/common/utils/utils.service';

@Injectable()
export class LeagueService {
  constructor(
    @InjectRepository(League_Group)
    private readonly leagueRepository: Repository<League_Group>,
    private readonly usersService: UserService,
  ) {}

  async updateAllLeagueStatus(
    currentLeagueStatus: LEAGUE_STATUS,
    leagueUpdateStatus: LEAGUE_STATUS,
  ): Promise<UpdateResult> {
    const leagues = await this.leagueRepository.update(
      { status: currentLeagueStatus },
      { status: leagueUpdateStatus },
    );
    return leagues;
  }

  async getAllLeagues(): Promise<League_Group[]> {
    const leagues = await this.leagueRepository.find();
    return leagues;
  }

  async getLeague(id: string): Promise<League_Group> {
    const league = await this.leagueRepository.findOne({
      where: { id: id },
    });
    return league;
  }

  async createLeague(
    body: Partial<League_Group>,
    currentUser: ICurrentUser,
  ): Promise<League_Group> {
    const { name, entryFee, visibility } = body;
    const user: User = (await this.usersService.findById(
      currentUser.sub,
    )) as unknown as User;
    if (!user) {
      throw new HttpException('User does not exist', HttpStatus.BAD_REQUEST);
    }
    if (!user.isPermittedToCreateGroup) {
      throw new HttpException(
        "You can't create Group at this time",
        HttpStatus.BAD_REQUEST,
      );
    }
    const leagueNameExists = await this.leagueRepository.findOne({
      where: { name },
    });
    if (leagueNameExists) {
      throw new HttpException(
        'League with this name already exist',
        HttpStatus.BAD_REQUEST,
      );
    }
    const accessKey =
      visibility === LEAGUE_VISIBILITY.PRIVATE
        ? `DUG:${generateRandomCode(6, false)}`
        : null;
    const payload: Partial<League_Group> = {
      name,
      entryFee,
      visibility,
      accessKey,
      createdBy: user,
      users: [user],
    };
    const savedLeague = await this.leagueRepository.save(payload);
    return savedLeague;
  }

  async joinLeague(
    leagueId: string,
    body: { accessKey: string },
    currentUser: ICurrentUser,
  ): Promise<League_Group> {
    const { accessKey } = body;
    const user: User = (await this.usersService.findById(
      currentUser.sub,
    )) as unknown as User;
    if (!user) {
      throw new HttpException('User does not exist', HttpStatus.BAD_REQUEST);
    }
    if (!user.isPermittedToCreateGroup) {
      throw new HttpException(
        "You can't create Group at this time",
        HttpStatus.BAD_REQUEST,
      );
    }
    const existingLeague = await this.leagueRepository.findOne({
      where: { id: leagueId },
      relations: ['users'],
    });
    if (!existingLeague) {
      throw new HttpException(
        'League Group does not exist',
        HttpStatus.BAD_REQUEST,
      );
    }
    // Check if league is already filled up
    const maxUsers = 8;
    if (existingLeague.users.length >= maxUsers) {
      throw new HttpException(
        'League is full, join another group',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Check if the user is already part of the league
    const isUserAlreadyInLeague = existingLeague.users.some(
      (existingUser) => existingUser.id === user.id,
    );
    if (isUserAlreadyInLeague) {
      throw new HttpException(
        'User is already a member of the league',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (
      existingLeague.visibility === LEAGUE_VISIBILITY.PRIVATE &&
      accessKey !== existingLeague.accessKey
    ) {
      throw new HttpException(
        'Invalid access key for private league',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Add the new user to the league's users array
    existingLeague.users.push(user);
    // Update the league in the database
    const updatedLeague = await this.leagueRepository.save(existingLeague);
    return updatedLeague;
  }
}
