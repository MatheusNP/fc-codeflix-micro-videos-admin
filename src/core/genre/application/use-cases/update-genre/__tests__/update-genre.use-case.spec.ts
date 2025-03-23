import { UnitOfWorkFakeInMemory } from '@core/shared/infra/db/in-memory/fake-unit-of-work-in-memory';
import { UpdateGenreUseCase } from '../update-genre.use-case';
import { GenreInMemoryRepository } from '@core/genre/infra/db/in-memory/genre-in-memory.repository';
import { CategoryInMemoryRepository } from '@core/category/infra/db/in-memory/category-in-memory.repository';
import { CategoriesIdExistsInStorageValidator } from '@core/genre/application/validations/categories-ids-exists-in-storage.validator';
import { Genre } from '@core/genre/domain/genre.aggregate';
import { UpdateGenreInput } from '../update-genre.input';
import { EntityValidationError } from '@core/shared/domain/validators/validation.error';
import { Category } from '@core/category/domain/category.aggregate';

describe('UpdateGenreUseCase Unit Tests', () => {
  let useCase: UpdateGenreUseCase;
  let uow: UnitOfWorkFakeInMemory;
  let genreRepository: GenreInMemoryRepository;
  let categoryRepository: CategoryInMemoryRepository;
  let categoriesIdValidator: CategoriesIdExistsInStorageValidator;

  beforeEach(() => {
    uow = new UnitOfWorkFakeInMemory();
    genreRepository = new GenreInMemoryRepository();
    categoryRepository = new CategoryInMemoryRepository();
    categoriesIdValidator = new CategoriesIdExistsInStorageValidator(
      categoryRepository,
    );
    useCase = new UpdateGenreUseCase(
      uow,
      genreRepository,
      categoryRepository,
      categoriesIdValidator,
    );
  });

  describe('execute method', () => {
    it('should throw an entity validation error when categories id not found', async () => {
      expect.assertions(3);
      const genre = Genre.fake().aGenre().build();
      await genreRepository.insert(genre);
      const spyValidateCategoriesId = jest.spyOn(
        categoriesIdValidator,
        'validate',
      );

      try {
        await useCase.execute(
          new UpdateGenreInput({
            id: genre.genre_id.id,
            name: 'fake name',
            categories_id: [
              'e70e130f-49e3-4bae-9ea1-09525d83801d',
              '8fe6fb5e-43f0-40b5-b1d7-9beffbddf07a',
            ],
          }),
        );
      } catch (error) {
        expect(spyValidateCategoriesId).toHaveBeenCalledWith([
          'e70e130f-49e3-4bae-9ea1-09525d83801d',
          '8fe6fb5e-43f0-40b5-b1d7-9beffbddf07a',
        ]);
        expect(error).toBeInstanceOf(EntityValidationError);
        expect(error.errors).toStrictEqual([
          {
            categories_id: [
              'Category Not Found using ID e70e130f-49e3-4bae-9ea1-09525d83801d',
              'Category Not Found using ID 8fe6fb5e-43f0-40b5-b1d7-9beffbddf07a',
            ],
          },
        ]);
      }
    });

    it('should update a genre', async () => {
      const category1 = Category.fake().aCategory().build();
      const category2 = Category.fake().aCategory().build();
      await categoryRepository.bulkInsert([category1, category2]);
      const genre = Genre.fake()
        .aGenre()
        .addCategoryId(category1.category_id)
        .addCategoryId(category2.category_id)
        .build();
      await genreRepository.insert(genre);
      const spyUpdate = jest.spyOn(genreRepository, 'update');
      const spyUowDo = jest.spyOn(uow, 'do');

      let output = await useCase.execute({
        id: genre.genre_id.id,
        name: 'test',
        categories_id: [category1.category_id.id],
      });

      expect(spyUowDo).toHaveBeenCalledTimes(1);
      expect(spyUpdate).toHaveBeenCalledTimes(1);
      expect(output).toStrictEqual({
        id: genreRepository.items[0].genre_id.id,
        name: 'test',
        categories: [category1].map((category) => ({
          id: category.category_id.id,
          name: category.name,
          created_at: category.created_at,
        })),
        categories_id: [category1.category_id.id],
        is_active: true,
        created_at: genreRepository.items[0].created_at,
      });

      output = await useCase.execute({
        id: genre.genre_id.id,
        name: 'test',
        categories_id: [category1.category_id.id, category2.category_id.id],
        is_active: false,
      });

      expect(spyUowDo).toHaveBeenCalledTimes(2);
      expect(spyUpdate).toHaveBeenCalledTimes(2);
      expect(output).toStrictEqual({
        id: genreRepository.items[0].genre_id.id,
        name: 'test',
        categories: [category1, category2].map((category) => ({
          id: category.category_id.id,
          name: category.name,
          created_at: category.created_at,
        })),
        categories_id: [category1.category_id.id, category2.category_id.id],
        is_active: false,
        created_at: genreRepository.items[0].created_at,
      });
    });
  });
});
