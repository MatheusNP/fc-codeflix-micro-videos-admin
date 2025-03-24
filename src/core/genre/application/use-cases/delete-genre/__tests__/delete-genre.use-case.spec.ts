import { GenreInMemoryRepository } from '@core/genre/infra/db/in-memory/genre-in-memory.repository';
import { DeleteGenreUseCase } from '../delete-genre-use-case';
import { UnitOfWorkFakeInMemory } from '@core/shared/infra/db/in-memory/fake-unit-of-work-in-memory';
import { Genre, GenreId } from '@core/genre/domain/genre.aggregate';
import { NotFoundError } from '@core/shared/domain/errors/not-found.error';

describe('DeleteGenreUseCase Unit Tests', () => {
  let useCase: DeleteGenreUseCase;
  let uow: UnitOfWorkFakeInMemory;
  let repository: GenreInMemoryRepository;

  beforeEach(() => {
    uow = new UnitOfWorkFakeInMemory();
    repository = new GenreInMemoryRepository();
    useCase = new DeleteGenreUseCase(uow, repository);
  });

  it('should throws error when entity not found', async () => {
    const genreId = new GenreId();

    await expect(() => useCase.execute({ id: genreId.id })).rejects.toThrow(
      new NotFoundError(genreId.id, Genre),
    );
  });

  it('should delete a genre', async () => {
    const items = [Genre.fake().aGenre().build()];
    repository.items = items;
    const spyOnDo = jest.spyOn(uow, 'do');

    await useCase.execute({ id: items[0].genre_id.id });

    expect(spyOnDo).toHaveBeenCalledTimes(1);
    expect(repository.items).toHaveLength(0);
  });
});
