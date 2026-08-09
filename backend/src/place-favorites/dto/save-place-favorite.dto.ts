import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class SavePlaceFavoriteDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  messageId!: string;
}
