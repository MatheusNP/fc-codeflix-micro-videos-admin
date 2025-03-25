import { CreateGenreInput } from '@core/genre/application/use-cases/create-genre/create-genre.input';
import { OmitType } from '@nestjs/mapped-types';

export class UpdateGenreInputWithoutId extends OmitType(CreateGenreInput, [
  'id',
] as any) {}

export class UpdateGenreDto extends UpdateGenreInputWithoutId {}
