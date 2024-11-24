import { IsString, IsNotEmpty, IsArray } from 'class-validator';

export class DraftPlayersDto {
  @IsString()
  @IsNotEmpty()
  playerIds: string[];
}
