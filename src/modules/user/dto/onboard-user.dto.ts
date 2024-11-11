import { IsString, IsNotEmpty, IsArray } from 'class-validator';

export class OnboardUserDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  clubName: string;

  @IsString()
  @IsNotEmpty()
  clubSlugName: string;

  @IsString()
  @IsNotEmpty()
  clubColor: string;

  @IsString()
  @IsNotEmpty()
  clubAbbrev: string;

  @IsArray()
  @IsNotEmpty()
  preferences: JSON;
}
