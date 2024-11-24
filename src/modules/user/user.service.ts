import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { In, Repository, UpdateResult } from 'typeorm';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ICurrentUser } from './interfaces/user.interface';
import { Player } from '../players/entities/players.entity';
import { LEAGUE_STATUS } from 'src/common/enums/league.enum';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Player)
    private readonly playerRepository: Repository<Player>,
  ) {}

  async create(createUser: Partial<User>): Promise<User> {
    const savedResult = await this.userRepository.save(createUser);
    return savedResult;
  }

  async findAll(): Promise<Partial<User[]> | null> {
    const user = await this.userRepository.find();
    return user;
  }

  async findById(userId: string): Promise<Partial<User> | null> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    return user;
  }

  async findByEmail(email: string): Promise<User | undefined> {
    return await this.userRepository.findOne({ where: { email } });
  }

  async updateUser(
    payload: Partial<User>,
    email: string,
  ): Promise<UpdateResult> {
    return await this.userRepository.update({ email }, payload);
  }

  async onboardUser(
    body: Partial<User>,
    currentUser: ICurrentUser,
  ): Promise<UpdateResult> {
    const user = await this.findById(currentUser.sub);
    if (!user) {
      throw new HttpException('User does not exist', HttpStatus.BAD_REQUEST);
    }
    if (user.onboarded) {
      throw new HttpException(
        'User has already onboarded',
        HttpStatus.BAD_REQUEST,
      );
    }
    const userWithClubName = await this.userRepository.findOne({
      where: { clubName: body.clubName },
    });
    const userWithUserName = await this.userRepository.findOne({
      where: { username: body.username },
    });
    if (userWithClubName) {
      throw new HttpException(
        'This ClubName already exist',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (userWithUserName) {
      throw new HttpException(
        'This UserName already exist',
        HttpStatus.BAD_REQUEST,
      );
    }
    const payload: Partial<User> = {
      ...body,
    };
    const updatedUser = await this.updateUser(payload, user.email);
    return updatedUser;
  }

  async draftPlayers(
    body: { playerIds: string[] },
    currentUser: ICurrentUser,
  ): Promise<User> {
    const { playerIds } = body;
    // Fetch the User by ID
    const user = await this.userRepository.findOne({
      where: { id: currentUser.sub },
      relations: [
        'leagueGroup',
        'leagueGroup.users',
        'leagueGroup.users.draftedPlayers',
      ],
    });
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    const leagueGroup = user.leagueGroup;
    if (!leagueGroup) {
      throw new BadRequestException('User is not part of any league group');
    }
    if (leagueGroup.status !== LEAGUE_STATUS.DRAFTING) {
      throw new HttpException(
        'This is not drafting period',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Flatten the drafted players of all other users in the league group
    const draftedPlayersInGroup = new Set(
      leagueGroup.users
        .filter((groupUser) => groupUser.id !== currentUser.sub)
        .flatMap((groupUser) =>
          groupUser.draftedPlayers.map((player) => player.id),
        ),
    );
    // Check if any of the players the user wants to draft are already taken
    const conflictingPlayers = playerIds.filter((playerId) =>
      draftedPlayersInGroup.has(playerId),
    );
    if (conflictingPlayers.length > 0) {
      throw new BadRequestException(
        `The following players are already drafted: ${conflictingPlayers.join(', ')}`,
      );
    }

    // Fetch the Player entities using findBy and In operator
    const players = await this.playerRepository.findBy({ id: In(playerIds) });
    if (players.length !== playerIds.length) {
      throw new HttpException(
        'One or more Players not found',
        HttpStatus.NOT_FOUND,
      );
    }
    // user.draftedPlayers = [...user.draftedPlayers, ...players];
    user.draftedPlayers = [...players];

    // Save the updated user
    const updatedUser = await this.userRepository.save(user);
    return updatedUser;
  }
}
