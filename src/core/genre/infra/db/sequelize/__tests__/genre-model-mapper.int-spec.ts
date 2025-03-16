import { ICategoryRepository } from '@core/category/domain/category.repository';
import { CategorySequelizeRepository } from '@core/category/infra/db/sequelize/category-sequelize.repository';
import { CategoryModel } from '@core/category/infra/db/sequelize/category.model';
import { GenreCategoryModel, GenreModel } from '../genre-model';
import { LoadEntityError } from '@core/shared/domain/validators/validation.error';
import { GenreModelMapper } from '../genre-model-mapper';
import { setupSequelize } from '@core/shared/infra/testing/helpers';
import { Category } from '@core/category/domain/category.aggregate';
import { Genre, GenreId } from '@core/genre/domain/genre.aggregate';

describe('GenreModelMapper Integration Tests', () => {
  let categoryRepo: ICategoryRepository;
  setupSequelize({ models: [CategoryModel, GenreModel, GenreCategoryModel] });

  beforeEach(() => {
    categoryRepo = new CategorySequelizeRepository(CategoryModel);
  });

  it('should throws error when genre is invalid', () => {
    const arrange = [
      {
        makeModel: () => {
          {
            // @ts-expect-error - this is an invalid genre
            return GenreModel.build({
              genre_id: '123e4567-e89b-12d3-a456-426655440000',
              name: 't'.repeat(256),
              categories_id: [],
            });
          }
        },
        expectedErrors: [
          {
            categories_id: ['categories_id should not be empty'],
          },
          {
            name: ['name must be shorter than or equal to 255 characters'],
          },
        ],
      },
    ];

    for (const i of arrange) {
      try {
        GenreModelMapper.toEntity(i.makeModel());
        fail('The genre is valid, but it needs to throw a LoadEntityError');
      } catch (e) {
        console.log(JSON.stringify(e));
        expect(e).toBeInstanceOf(LoadEntityError);
        expect(e.errors).toMatchObject(i.expectedErrors);
      }
    }
  });

  it('should convert a genre model to a genre entity', async () => {
    const category1 = Category.fake().aCategory().build();
    const category2 = Category.fake().aCategory().build();
    await categoryRepo.bulkInsert([category1, category2]);
    const created_at = new Date();
    const model = await GenreModel.create(
      {
        genre_id: '123e4567-e89b-12d3-a456-426655440000',
        name: 'test',
        categories_id: [
          GenreCategoryModel.build({
            genre_id: '123e4567-e89b-12d3-a456-426655440000',
            category_id: category1.category_id.id,
          }),
          GenreCategoryModel.build({
            genre_id: '123e4567-e89b-12d3-a456-426655440000',
            category_id: category2.category_id.id,
          }),
        ],
        is_active: true,
        created_at,
      },
      {
        include: ['categories_id'],
      },
    );
    const entity = GenreModelMapper.toEntity(model);

    expect(entity.toJSON()).toEqual(
      new Genre({
        genre_id: new GenreId('123e4567-e89b-12d3-a456-426655440000'),
        name: 'test',
        categories_id: new Map([
          [category1.category_id.id, category1.category_id],
          [category2.category_id.id, category2.category_id],
        ]),
        is_active: true,
        created_at,
      }).toJSON(),
    );
  });
});
