import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../../src/app.module';
import { CreateCategoryFixture } from 'src/nest-modules/categories-module/testing/category-fixture';
import { ICategoryRepository } from '@core/category/domain/category.repository';
import { CATEGORY_PROVIDERS } from 'src/nest-modules/categories-module/categories.providers';
import { Uuid } from '@core/shared/domain/value-objects/uuid.vo';
import { applyGlobalConfig } from 'src/nest-modules/global-config';

describe('CagegoriesController (e2e)', () => {
  let app: INestApplication;
  let categoryRepo: ICategoryRepository;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    applyGlobalConfig(app);
    await app.init();

    categoryRepo = app.get<ICategoryRepository>(
      CATEGORY_PROVIDERS.REPOSITORIES.CATEGORY_REPOSITORY.provide,
    );
  });

  describe('/categories (POST)', () => {
    const arrange = CreateCategoryFixture.arrangeForCreate();

    test.each(arrange)(
      'when body is $send_data',
      async ({ send_data, expected }) => {
        const res = await request(app.getHttpServer())
          .post('/categories')
          .send(send_data)
          .expect(201);

        expect(Object.keys(res.body)).toStrictEqual(['data']);

        // const presenter = await controller.create(send_data);
        // const entity = await categoryRepo.findById(new Uuid(presenter.id));
        // expect(entity.toJSON()).toStrictEqual({
        //   category_id: presenter.id,
        //   created_at: presenter.created_at,
        //   ...expected,
        // });
        // const output = CategoryOutputMapper.toOutput(entity);
        // expect(presenter).toEqual(new CategoryPresenter(output));
      },
    );
  });

  // it('/ (GET)', () => {
  //   return request(app.getHttpServer())
  //     .get('/')
  //     .expect(200)
  //     .expect('Hello World!');
  // });
});
