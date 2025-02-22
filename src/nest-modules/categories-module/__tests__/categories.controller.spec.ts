import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesController } from '../categories.controller';
import { DatabaseModule } from '../../database-module/database.module';
import { CategoriesModule } from '../categories.module';
import { ConfigModule } from '../../config-module/config.module';
import { getModelToken } from '@nestjs/sequelize';
import { CategoryModel } from '@core/category/infra/db/sequelize/category.model';
import { CategoryInMemoryRepository } from '@core/category/infra/db/in-memory/category-in-memory.repository';
import { CreateCategoryOutput } from '@core/category/application/use-cases/create-category/create-category.use-case';
import { CreateCategoryDto } from '../dto/create-category.dto';
import {
  CategoryCollectionPresenter,
  CategoryPresenter,
} from '../categories.presenter';
import { UpdateCategoryOutput } from '@core/category/application/use-cases/update-category/update-category.use-case';
import { UpdateCategoryDto } from '../dto/update-category.dto';
import { GetCategoryOutput } from '@core/category/application/use-cases/get-gategory/get-category.use-case';
import { ListCategoriesOutput } from '@core/category/application/use-cases/list-categories/list-categories.use-case';
import { sourceMapsEnabled } from 'process';
import { SortDirection } from '@core/shared/domain/repository/search-params';

describe('CategoriesController Unit Tests', () => {
  let controller: CategoriesController;

  beforeEach(async () => {
    controller = new CategoriesController();
  });
  // beforeEach(async () => {
  //   const module: TestingModule = await Test.createTestingModule({
  //     imports: [ConfigModule.forRoot(), CategoriesModule],
  //   })
  //     .overrideProvider(getModelToken(CategoryModel))
  //     .useValue({})
  //     .overrideProvider('CategoryRepository')
  //     .useValue(CategoryInMemoryRepository)
  //     .compile();

  //   controller = module.get<CategoriesController>(CategoriesController);
  // });

  // it('should be defined', () => {
  //   expect(controller).toBeDefined();
  // });

  it('should create a category', async () => {
    const output: CreateCategoryOutput = {
      id: '123e4567-e89b-12d3-a456-426655440000',
      name: 'test',
      description: 'some description',
      is_active: true,
      created_at: new Date(),
    };

    const mockCreateUseCase = {
      execute: jest.fn().mockReturnValue(Promise.resolve(output)),
    };

    //@ts-expect-error defined part of methods
    controller['createUseCase'] = mockCreateUseCase;
    const input: CreateCategoryDto = {
      name: 'test',
      description: 'some description',
      is_active: true,
    };

    const presenter = await controller.create(input);

    expect(mockCreateUseCase.execute).toHaveBeenCalledWith(input);
    expect(presenter).toBeInstanceOf(CategoryPresenter);
    expect(presenter).toStrictEqual(new CategoryPresenter(output));
  });

  it('should update a category', async () => {
    const id = '123e4567-e89b-12d3-a456-426655440000';
    const output: UpdateCategoryOutput = {
      id,
      name: 'test',
      description: 'some description',
      is_active: true,
      created_at: new Date(),
    };

    const mockUpdateUseCase = {
      execute: jest.fn().mockReturnValue(Promise.resolve(output)),
    };

    //@ts-expect-error defined part of methods
    controller['updateUseCase'] = mockUpdateUseCase;
    const input: UpdateCategoryDto = {
      name: 'new test',
      description: 'new description',
      is_active: false,
    };

    const presenter = await controller.update(id, input);

    expect(mockUpdateUseCase.execute).toHaveBeenCalledWith({ id, ...input });
    expect(presenter).toBeInstanceOf(CategoryPresenter);
    expect(presenter).toStrictEqual(new CategoryPresenter(output));
  });

  it('should delete a category', async () => {
    const expectedOutput = undefined;
    const mockDeleteUseCase = {
      execute: jest.fn().mockReturnValue(Promise.resolve(expectedOutput)),
    };
    //@ts-expect-error defined part of methods
    controller['deleteUseCase'] = mockDeleteUseCase;

    const id = '123e4567-e89b-12d3-a456-426655440000';

    expect(controller.remove(id)).toBeInstanceOf(Promise);

    const output = await controller.remove(id);

    expect(mockDeleteUseCase.execute).toHaveBeenCalledWith({ id });
    expect(expectedOutput).toStrictEqual(output);
  });

  it('should get a category', async () => {
    const id = '123e4567-e89b-12d3-a456-426655440000';
    const output: GetCategoryOutput = {
      id,
      name: 'test',
      description: 'some description',
      is_active: true,
      created_at: new Date(),
    };
    const mockGetUseCase = {
      execute: jest.fn().mockReturnValue(Promise.resolve(output)),
    };
    //@ts-expect-error defined part of methods
    controller['getUseCase'] = mockGetUseCase;

    const presenter = await controller.findOne(id);

    expect(mockGetUseCase.execute).toHaveBeenCalledWith({ id });
    expect(presenter).toBeInstanceOf(CategoryPresenter);
    expect(presenter).toStrictEqual(new CategoryPresenter(output));
  });

  it('should list categories', async () => {
    const output: ListCategoriesOutput = {
      items: [
        {
          id: '123e4567-e89b-12d3-a456-426655440000',
          name: 'test',
          description: 'some description',
          is_active: true,
          created_at: new Date(),
        },
      ],
      current_page: 1,
      last_page: 1,
      per_page: 1,
      total: 1,
    };
    const mockListUseCase = {
      execute: jest.fn().mockReturnValue(Promise.resolve(output)),
    };
    //@ts-expect-error defined part of methods
    controller['listUseCase'] = mockListUseCase;

    const searchParams = {
      page: 1,
      per_page: 2,
      sort: 'name',
      sort_dir: 'desc' as SortDirection,
      filter: 'test',
    };
    const presenter = await controller.search(searchParams);

    expect(presenter).toBeInstanceOf(CategoryCollectionPresenter);
    expect(mockListUseCase.execute).toHaveBeenCalledWith(searchParams);
    expect(presenter).toStrictEqual(new CategoryCollectionPresenter(output));
  });
});
