import { Category } from '@core/category/domain/category.aggregate';
import { ICategoryRepository } from '@core/category/domain/category.repository';
import { CATEGORY_PROVIDERS } from 'src/nest-modules/categories-module/categories.providers';
import { startApp } from 'src/nest-modules/shared-module/testing/helpers';
import request from 'supertest';

describe('CategoriesController (e2e)', () => {
  const appHelper = startApp();

  // let categoryRepo: ICategoryRepository;

  // beforeEach(async () => {
  //   categoryRepo = appHelper.app.get<ICategoryRepository>(
  //     CATEGORY_PROVIDERS.REPOSITORIES.CATEGORY_REPOSITORY.provide,
  //   );
  // });

  describe('should return 4XX when id is invalid or not found', () => {
    const arrange = [
      {
        id: '97aa09d0-c558-4cf4-9b30-37ce631119d5',
        expected: {
          statusCode: 404,
          message:
            'Category Not Found using ID 97aa09d0-c558-4cf4-9b30-37ce631119d5',
          error: 'Not Found',
        },
      },
      {
        id: 'fake id',
        expected: {
          statusCode: 422,
          message: 'Validation failed (uuid is expected)',
          error: 'Unprocessable Entity',
        },
      },
    ];

    test.each(arrange)('when id is $id', ({ id, expected }) => {
      return request(appHelper.app.getHttpServer())
        .delete(`/categories/${id}`)
        .expect(expected.statusCode)
        .expect(expected);
    });
  });

  describe('/categories/:id (DELETE)', () => {
    it('should delete a category', async () => {
      const categoryRepo = appHelper.app.get<ICategoryRepository>(
        CATEGORY_PROVIDERS.REPOSITORIES.CATEGORY_REPOSITORY.provide,
      );

      const category = Category.fake().aCategory().build();
      await categoryRepo.insert(category);

      await request(appHelper.app.getHttpServer())
        .delete(`/categories/${category.category_id.id}`)
        .expect(204);

      await expect(
        categoryRepo.findById(category.category_id),
      ).resolves.toBeNull();
    });
  });
});
