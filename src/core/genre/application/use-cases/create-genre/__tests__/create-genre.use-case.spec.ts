import { GenreInMemoryRepository } from '@core/genre/infra/db/in-memory/genre-in-memory.repository';
import { CreateGenreUseCase } from '../create-genre.use-case';
import { CategoryInMemoryRepository } from '@core/category/infra/db/in-memory/category-in-memory.repository';
import { CategoriesIdExistsInStorageValidator } from '@core/genre/application/validations/categories-ids-exists-in-storage.validator';
import { UnitOfWorkFakeInMemory } from '@core/shared/infra/db/in-memory/fake-unit-of-work-in-memory';
import { EntityValidationError } from '@core/shared/domain/validators/validation.error';
import { Category, CategoryId } from '@core/category/domain/category.aggregate';

describe('CreateGenreUseCase Unit Tests', () => {
  let useCase: CreateGenreUseCase;
  let genreRepo: GenreInMemoryRepository;
  let categoryRepo: CategoryInMemoryRepository;
  let categoriesIdValidator: CategoriesIdExistsInStorageValidator;
  let uow: UnitOfWorkFakeInMemory;

  beforeEach(() => {
    uow = new UnitOfWorkFakeInMemory();
    genreRepo = new GenreInMemoryRepository();
    categoryRepo = new CategoryInMemoryRepository();
    categoriesIdValidator = new CategoriesIdExistsInStorageValidator(
      categoryRepo,
    );
    useCase = new CreateGenreUseCase(
      uow,
      genreRepo,
      categoryRepo,
      categoriesIdValidator,
    );
  });

  describe('execute method', () => {
    it('should throw an entity validation error when categories id not exists', async () => {
      expect.assertions(3);
      const spyValidateCategoriesId = jest.spyOn(
        categoriesIdValidator,
        'validate',
      );
      const categoryId1 = new CategoryId();
      const categoryId2 = new CategoryId();

      try {
        await useCase.execute({
          name: 'test',
          categories_id: [categoryId1.id, categoryId2.id],
        });
      } catch (error) {
        expect(spyValidateCategoriesId).toHaveBeenCalledWith([
          categoryId1.id,
          categoryId2.id,
        ]);
        expect(error).toBeInstanceOf(EntityValidationError);
        expect(error.errors).toStrictEqual([
          {
            categories_id: [
              'Category Not Found using ID ' + categoryId1.id,
              'Category Not Found using ID ' + categoryId2.id,
            ],
          },
        ]);
      }
    });

    it('should create an genre', async () => {
      const category1 = Category.fake().aCategory().build();
      const category2 = Category.fake().aCategory().build();
      await categoryRepo.bulkInsert([category1, category2]);
      const spyInsert = jest.spyOn(genreRepo, 'insert');
      const spyUowDo = jest.spyOn(uow, 'do');

      let output = await useCase.execute({
        name: 'test',
        categories_id: [category1.category_id.id, category2.category_id.id],
      });

      expect(spyUowDo).toHaveBeenCalledTimes(1);
      expect(spyInsert).toHaveBeenCalledTimes(1);
      expect(output).toStrictEqual({
        id: genreRepo.items[0].genre_id.id,
        name: 'test',
        categories: [category1, category2].map((category) => ({
          id: category.category_id.id,
          name: category.name,
          created_at: category.created_at,
        })),
        categories_id: [category1.category_id.id, category2.category_id.id],
        is_active: true,
        created_at: genreRepo.items[0].created_at,
      });
    });
  });
});
