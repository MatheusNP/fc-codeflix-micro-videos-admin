import { GenreSequelizeRepository } from '@core/genre/infra/db/sequelize/genre-sequelize.repository';
import { GetGenreUseCase } from '../get-genre.use-case';
import { CategorySequelizeRepository } from '@core/category/infra/db/sequelize/category-sequelize.repository';
import { setupSequelize } from '@core/shared/infra/testing/helpers';
import {
  GenreCategoryModel,
  GenreModel,
} from '@core/genre/infra/db/sequelize/genre-model';
import { CategoryModel } from '@core/category/infra/db/sequelize/category.model';
import { UnitOfWorkSequelize } from '@core/shared/infra/db/sequelize/unit-of-work-sequelize';
import { Category } from '@core/category/domain/category.aggregate';
import { Genre } from '@core/genre/domain/genre.aggregate';

describe('GetGenreUseCase Integration Tests', () => {
  let useCase: GetGenreUseCase;
  let uow: UnitOfWorkSequelize;
  let genreRepo: GenreSequelizeRepository;
  let categoryRepo: CategorySequelizeRepository;

  const sequelizeHelper = setupSequelize({
    models: [GenreModel, GenreCategoryModel, CategoryModel],
  });

  beforeEach(async () => {
    uow = new UnitOfWorkSequelize(sequelizeHelper.sequelize);
    genreRepo = new GenreSequelizeRepository(GenreModel, uow);
    categoryRepo = new CategorySequelizeRepository(CategoryModel);
    useCase = new GetGenreUseCase(genreRepo, categoryRepo);
  });

  it('should return a genre', async () => {
    const categories = Category.fake().theCategories(2).build();
    await categoryRepo.bulkInsert(categories);
    const genre = Genre.fake()
      .aGenre()
      .addCategoryId(categories[0].category_id)
      .addCategoryId(categories[1].category_id)
      .build();
    await genreRepo.insert(genre);

    const output = await useCase.execute({ id: genre.genre_id.id });

    expect(output).toStrictEqual({
      id: genre.genre_id.id,
      name: genre.name,
      categories: expect.arrayContaining(
        [categories[0], categories[1]].map((c) => ({
          id: c.category_id.id,
          name: c.name,
          created_at: c.created_at,
        })),
      ),
      categories_id: expect.arrayContaining([
        categories[0].category_id.id,
        categories[1].category_id.id,
      ]),
      is_active: genre.is_active,
      created_at: genre.created_at,
    });
  });
});
