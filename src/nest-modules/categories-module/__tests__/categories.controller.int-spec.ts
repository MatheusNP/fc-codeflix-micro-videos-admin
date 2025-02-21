import { ICategoryRepository } from '@core/category/domain/category.repository';
import { CategoriesController } from '../categories.controller';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '../../config-module/config.module';
import { CategoriesModule } from '../categories.module';
import { CATEGORY_PROVIDERS } from '../categories.providers';
import { DatabaseModule } from '../../database-module/database.module';
import {
  CreateCategoryFixture,
  ListCategoriesFixture,
  UpdateCategoryFixture,
} from '../testing/category-fixture';
import { Uuid } from '@core/shared/domain/value-objects/uuid.vo';
import { CategoryOutputMapper } from '@core/category/application/use-cases/common/category-output';
import {
  CategoryCollectionPresenter,
  CategoryPresenter,
} from '../categories.presenter';
import { Category } from '@core/category/domain/category.entity';
import { before } from 'node:test';

describe('CategoriesController Integration Tests', () => {
  let controller: CategoriesController;
  let repository: ICategoryRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot(), DatabaseModule, CategoriesModule],
    }).compile();

    controller = module.get<CategoriesController>(CategoriesController);
    repository = module.get<ICategoryRepository>(
      CATEGORY_PROVIDERS.REPOSITORIES.CATEGORY_REPOSITORY.provide,
    );
  });

  it('should be defined', async () => {
    expect(controller).toBeDefined();
    expect(controller['createUseCase']).toBeInstanceOf(
      CATEGORY_PROVIDERS.USE_CASES.CREATE_CATEGORY_USE_CASE.provide,
    );
    expect(controller['updateUseCase']).toBeInstanceOf(
      CATEGORY_PROVIDERS.USE_CASES.UPDATE_CATEGORY_USE_CASE.provide,
    );
    expect(controller['listUseCase']).toBeInstanceOf(
      CATEGORY_PROVIDERS.USE_CASES.LIST_CATEGORIES_USE_CASE.provide,
    );
    expect(controller['getUseCase']).toBeInstanceOf(
      CATEGORY_PROVIDERS.USE_CASES.GET_CATEGORY_USE_CASE.provide,
    );
    expect(controller['deleteUseCase']).toBeInstanceOf(
      CATEGORY_PROVIDERS.USE_CASES.DELETE_CATEGORY_USE_CASE.provide,
    );
  });

  describe('should create a category', () => {
    const arrange = CreateCategoryFixture.arrangeForCreate();

    test.each(arrange)(
      'when body is $send_data',
      async ({ send_data, expected }) => {
        const presenter = await controller.create(send_data);
        const entity = await repository.findById(new Uuid(presenter.id));
        expect(entity.toJSON()).toStrictEqual({
          category_id: presenter.id,
          created_at: presenter.created_at,
          ...expected,
        });
        const output = CategoryOutputMapper.toOutput(entity);
        expect(presenter).toEqual(new CategoryPresenter(output));
      },
    );
  });

  describe('should update a category', () => {
    const arrange = UpdateCategoryFixture.arrangeForUpdate();

    const category = Category.fake().aCategory().build();

    beforeEach(async () => {
      await repository.insert(category);
    });

    test.each(arrange)(
      'when body is $send_data',
      async ({ send_data, expected }) => {
        const presenter = await controller.update(
          category.category_id.id,
          send_data,
        );
        const entity = await repository.findById(new Uuid(presenter.id));
        expect(entity.toJSON()).toStrictEqual({
          category_id: presenter.id,
          created_at: presenter.created_at,
          name: expected.name ?? category.name,
          description:
            'description' in expected
              ? expected.description
              : category.description,
          is_active:
            expected.is_active === true || expected.is_active === false
              ? expected.is_active
              : category.is_active,
        });
        const output = CategoryOutputMapper.toOutput(entity);
        expect(presenter).toEqual(new CategoryPresenter(output));
      },
    );
  });

  it('should delete a category', async () => {
    const category = Category.fake().aCategory().build();
    await repository.insert(category);
    const response = await controller.remove(category.category_id.id);
    expect(response).toBeUndefined();
    await expect(repository.findById(category.category_id)).resolves.toBeNull();
  });

  it('should get a category', async () => {
    const category = Category.fake().aCategory().build();
    await repository.insert(category);
    const presenter = await controller.findOne(category.category_id.id);
    const output = CategoryOutputMapper.toOutput(category);
    expect(presenter).toEqual(new CategoryPresenter(output));
    expect(presenter.id).toBe(category.category_id.id);
    expect(presenter.name).toBe(category.name);
    expect(presenter.description).toBe(category.description);
    expect(presenter.is_active).toBe(category.is_active);
    expect(presenter.created_at).toStrictEqual(category.created_at);
  });

  describe('should list categories', () => {
    describe('should return sorted categories by created_at', () => {
      const { entitiesMap, arrange } =
        ListCategoriesFixture.arrangeIncrementedWithCreatedAt();

      beforeEach(async () => {
        await repository.bulkInsert(Object.values(entitiesMap));
      });

      test.each(arrange)(
        'when query is $send_data',
        async ({ send_data, expected }) => {
          const presenter = await controller.search(send_data);
          const { entities, ...paginationProps } = expected;
          expect(presenter).toEqual(
            new CategoryCollectionPresenter({
              items: entities.map(CategoryOutputMapper.toOutput),
              ...paginationProps.meta,
            }),
          );
        },
      );
    });

    describe('should return categories using pagination, sort and filter', () => {
      const { entitiesMap, arrange } = ListCategoriesFixture.arrangeUnsorted();

      beforeEach(async () => {
        await repository.bulkInsert(Object.values(entitiesMap));
      });

      test.each(arrange)(
        'when query is $send_data',
        async ({ send_data, expected }) => {
          const presenter = await controller.search(send_data);
          const { entities, ...paginationProps } = expected;
          expect(presenter).toEqual(
            new CategoryCollectionPresenter({
              items: entities.map(CategoryOutputMapper.toOutput),
              ...paginationProps.meta,
            }),
          );
        },
      );
    });
  });
});
