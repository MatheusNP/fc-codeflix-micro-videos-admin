import { UnitOfWorkSequelize } from '@core/shared/infra/db/sequelize/unit-of-work-sequelize';
import { CreateGenreUseCase } from '../create-genre.use-case';
import { GenreSequelizeRepository } from '@core/genre/infra/db/sequelize/genre-sequelize.repository';
import { CategorySequelizeRepository } from '@core/category/infra/db/sequelize/category-sequelize.repository';
import { CategoriesIdExistsInStorageValidator } from '@core/genre/application/validations/categories-ids-exists-in-storage.validator';
import { setupSequelize } from '@core/shared/infra/testing/helpers';
import {
  GenreCategoryModel,
  GenreModel,
} from '@core/genre/infra/db/sequelize/genre-model';
import { CategoryModel } from '@core/category/infra/db/sequelize/category.model';
import { Category } from '@core/category/domain/category.aggregate';
import { Genre, GenreId } from '@core/genre/domain/genre.aggregate';
import { DatabaseError } from 'sequelize';

describe('CreateGenreUseCase Integration Tests', () => {
  let uow: UnitOfWorkSequelize;
  let useCase: CreateGenreUseCase;
  let genreRepo: GenreSequelizeRepository;
  let categoryRepo: CategorySequelizeRepository;
  let categoriesIdValidator: CategoriesIdExistsInStorageValidator;

  const sequelizeHelper = setupSequelize({
    models: [GenreModel, GenreCategoryModel, CategoryModel],
  });

  beforeEach(async () => {
    uow = new UnitOfWorkSequelize(sequelizeHelper.sequelize);
    genreRepo = new GenreSequelizeRepository(GenreModel, uow);
    categoryRepo = new CategorySequelizeRepository(CategoryModel);
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

  it('should create a genre', async () => {
    const categories = Category.fake().theCategories(2).build();
    await categoryRepo.bulkInsert(categories);
    const categoriesIds = categories.map((c) => c.category_id.id);

    let output = await useCase.execute({
      name: 'test',
      categories_id: categoriesIds,
    });

    let entity = await genreRepo.findById(new GenreId(output.id));

    expect(output).toStrictEqual({
      id: entity!.genre_id.id,
      name: 'test',
      categories: expect.arrayContaining(
        categories.map((c) => ({
          id: c.category_id.id,
          name: c.name,
          created_at: c.created_at,
        })),
      ),
      categories_id: expect.arrayContaining(categoriesIds),
      is_active: entity!.is_active,
      created_at: entity!.created_at,
    });

    output = await useCase.execute({
      name: 'test genre',
      categories_id: [categories[0].category_id.id],
      is_active: true,
    });

    entity = await genreRepo.findById(new GenreId(output.id));

    expect(output).toStrictEqual({
      id: entity!.genre_id.id,
      name: 'test genre',
      categories: expect.arrayContaining([
        {
          id: categories[0].category_id.id,
          name: categories[0].name,
          created_at: categories[0].created_at,
        },
      ]),
      categories_id: expect.arrayContaining([categories[0].category_id.id]),
      is_active: entity!.is_active,
      created_at: entity!.created_at,
    });
  });

  it('rollback transaction', async () => {
    const categories = Category.fake().theCategories(2).build();
    await categoryRepo.bulkInsert(categories);
    const categoriesIds = categories.map((c) => c.category_id.id);

    const genre = Genre.fake().aGenre().build();
    genre.name = 't'.repeat(256);

    const mockCreate = jest
      .spyOn(Genre, 'create')
      .mockImplementation(() => genre);

    await expect(() =>
      useCase.execute({
        name: 'test',
        categories_id: categoriesIds,
      }),
    ).rejects.toThrow(DatabaseError);

    const genres = await genreRepo.findAll();

    expect(genres).toHaveLength(0);

    mockCreate.mockRestore();
  });
});
