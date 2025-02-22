import { CategoryOutputMapper } from '@core/category/application/use-cases/common/category-output';
import { Category } from '@core/category/domain/category.entity';
import { ICategoryRepository } from '@core/category/domain/category.repository';
import { instanceToPlain } from 'class-transformer';
import { CategoriesController } from 'src/nest-modules/categories-module/categories.controller';
import { CATEGORY_PROVIDERS } from 'src/nest-modules/categories-module/categories.providers';
import { UpdateCategoryFixture } from 'src/nest-modules/categories-module/testing/category-fixture';
import { startApp } from 'src/nest-modules/shared-module/testing/helpers';
import request from 'supertest';

describe('CategoriesController (e2e)', () => {
  const appHelper = startApp();

  describe('/categories/:id (PATCH)', () => {
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
          .patch(`/categories/${id}`)
          .expect(expected.statusCode)
          .expect(expected);
      });
    });

    describe('should return 422 when body is invalid', () => {
      const id = '97aa09d0-c558-4cf4-9b30-37ce631119d5';
      const invalidRequest = UpdateCategoryFixture.arrangeInvalidRequest();
      const arrange = Object.keys(invalidRequest).map((key) => ({
        label: key,
        value: invalidRequest[key],
      }));

      test.each(arrange)('when label is $label', ({ value }) => {
        return request(appHelper.app.getHttpServer())
          .patch(`/categories/${id}`)
          .send(value.send_data)
          .expect(value.expected.statusCode)
          .expect(value.expected);
      });
    });

    describe('with a valid request and params', () => {
      let categoryRepo: ICategoryRepository;

      beforeEach(async () => {
        categoryRepo = appHelper.app.get<ICategoryRepository>(
          CATEGORY_PROVIDERS.REPOSITORIES.CATEGORY_REPOSITORY.provide,
        );
      });

      describe('should return 422 when throw EntityValidationError', () => {
        const invalidRequest =
          UpdateCategoryFixture.arrangeForEntityValidationError();
        const arrange = Object.keys(invalidRequest).map((key) => ({
          label: key,
          value: invalidRequest[key],
        }));

        test.each(arrange)('when label is $label', async ({ value }) => {
          const category = Category.fake().aCategory().build();
          await categoryRepo.insert(category);

          return request(appHelper.app.getHttpServer())
            .patch(`/categories/${category.category_id.id}`)
            .send(value.send_data)
            .expect(value.expected.statusCode)
            .expect(value.expected);
        });
      });

      describe('should update a category', () => {
        const arrange = UpdateCategoryFixture.arrangeForUpdate();

        test.each(arrange)(
          'when body is $send_data',
          async ({ send_data, expected }) => {
            const category = Category.fake().aCategory().build();
            await categoryRepo.insert(category);

            const res = await request(appHelper.app.getHttpServer())
              .patch(`/categories/${category.category_id.id}`)
              .send(send_data)
              .expect(200);

            const keysInResponse = UpdateCategoryFixture.keysInResponse;
            expect(Object.keys(res.body)).toStrictEqual(['data']);
            expect(Object.keys(res.body.data)).toStrictEqual(keysInResponse);

            const categoryUpdated = await categoryRepo.findById(
              category.category_id,
            );
            const presenter = CategoriesController.serialize(
              CategoryOutputMapper.toOutput(categoryUpdated),
            );
            const serialized = instanceToPlain(presenter);

            expect(res.body.data).toStrictEqual({
              id: serialized.id,
              created_at: serialized.created_at,
              ...expected,
            });
          },
        );
      });
    });
  });
});
