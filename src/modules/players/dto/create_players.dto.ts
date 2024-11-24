import { IsString, IsNotEmpty, IsNumber } from 'class-validator';

export class CreatePlayersDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @IsNotEmpty()
  jerseyNumber: string;

  @IsString()
  @IsNotEmpty()
  club: string;

  @IsString()
  @IsNotEmpty()
  position: string;
}
