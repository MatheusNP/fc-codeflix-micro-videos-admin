import { Genre, GenreId } from '@core/genre/domain/genre.aggregate';
import { GenreInMemoryRepository } from '@core/genre/infra/db/in-memory/genre-in-memory.repository';
import { NotFoundError } from '@core/shared/domain/errors/not-found.error';
import { GenresIdExistsInDatabaseValidator } from './genres-ids-exists-in-database.validator';

describe('GenresIdExistsInDatabaseValidator Unit Tests', () => {
  let genreRepo: GenreInMemoryRepository;
  let validator: GenresIdExistsInDatabaseValidator;
  beforeEach(() => {
    genreRepo = new GenreInMemoryRepository();
    validator = new GenresIdExistsInDatabaseValidator(genreRepo);
  });

  it('should return many not found error when genres id is not exists in storage', async () => {
    const genreId1 = new GenreId();
    const genreId2 = new GenreId();
    const spyExistsById = jest.spyOn(genreRepo, 'existsByIds');
    let [genresId, errorsGenresId] = await validator.validate([
      genreId1.id,
      genreId2.id,
    ]);
    expect(genresId).toStrictEqual(null);
    expect(errorsGenresId).toStrictEqual([
      new NotFoundError(genreId1.id, Genre),
      new NotFoundError(genreId2.id, Genre),
    ]);

    expect(spyExistsById).toHaveBeenCalledTimes(1);

    const genre1 = Genre.fake().aGenre().build();
    await genreRepo.insert(genre1);

    [genresId, errorsGenresId] = await validator.validate([
      genre1.genre_id.id,
      genreId2.id,
    ]);
    expect(genresId).toStrictEqual(null);
    expect(errorsGenresId).toStrictEqual([
      new NotFoundError(genreId2.id, Genre),
    ]);
    expect(spyExistsById).toHaveBeenCalledTimes(2);
  });

  it('should return a list of genres id', async () => {
    const genre1 = Genre.fake().aGenre().build();
    const genre2 = Genre.fake().aGenre().build();
    await genreRepo.bulkInsert([genre1, genre2]);
    const [genresId, errorsGenresId] = await validator.validate([
      genre1.genre_id.id,
      genre2.genre_id.id,
    ]);
    expect(genresId).toHaveLength(2);
    expect(errorsGenresId).toStrictEqual(null);
    expect(genresId[0]).toBeValueObject(genre1.genre_id);
    expect(genresId[1]).toBeValueObject(genre2.genre_id);
  });
});
