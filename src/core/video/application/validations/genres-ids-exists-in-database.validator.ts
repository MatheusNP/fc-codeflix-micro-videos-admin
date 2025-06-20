import { Genre, GenreId } from '@core/genre/domain/genre.aggregate';
import { IGenreRepository } from '@core/genre/domain/genre.repository';
import { Either } from '@core/shared/domain/either';
import { NotFoundError } from '@core/shared/domain/errors/not-found.error';

export class GenresIdExistsInDatabaseValidator {
  constructor(private genreRepo: IGenreRepository) {}

  async validate(
    genres_id: string[],
  ): Promise<Either<GenreId[], NotFoundError[]>> {
    const genresIds = genres_id.map((v) => new GenreId(v));

    const existsResult = await this.genreRepo.existsByIds(genresIds);
    return existsResult.not_exists.length > 0
      ? Either.fail(
          existsResult.not_exists.map((c) => new NotFoundError(c.id, Genre)),
        )
      : Either.ok(genresIds);
  }
}
