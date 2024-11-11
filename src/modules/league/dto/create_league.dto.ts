import { IsString, IsNotEmpty, IsNumber } from 'class-validator';
import { LEAGUE_STATUS, LEAGUE_VISIBILITY } from 'src/common/enums/league.enum';

export class CreateLeagueDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @IsNotEmpty()
  entryFee: number;

  @IsString()
  @IsNotEmpty()
  visibility: LEAGUE_VISIBILITY;
}
