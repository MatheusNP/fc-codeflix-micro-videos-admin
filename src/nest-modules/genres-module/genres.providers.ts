import { ICategoryRepository } from '@core/category/domain/category.repository';
import { CreateGenreUseCase } from '@core/genre/application/use-cases/create-genre/create-genre.use-case';
import { CategoriesIdExistsInStorageValidator } from '@core/genre/application/validations/categories-ids-exists-in-storage.validator';
import { IGenreRepository } from '@core/genre/domain/genre.repository';
import { GenreInMemoryRepository } from '@core/genre/infra/db/in-memory/genre-in-memory.repository';
import { GenreModel } from '@core/genre/infra/db/sequelize/genre-model';
import { GenreSequelizeRepository } from '@core/genre/infra/db/sequelize/genre-sequelize.repository';
import { IUnitOfWork } from '@core/shared/domain/repository/unit-of-work.interface';
import { UnitOfWorkSequelize } from '@core/shared/infra/db/sequelize/unit-of-work-sequelize';
import { getModelToken } from '@nestjs/sequelize';
import { CATEGORY_PROVIDERS } from '../categories-module/categories.providers';
import { UpdateGenreUseCase } from '@core/genre/application/use-cases/update-genre/update-genre.use-case';
import { ListGenresUseCase } from '@core/genre/application/use-cases/list-genres/list-genres.use-case';
import { GetGenreUseCase } from '@core/genre/application/use-cases/get-genre/get-genre.use-case';
import { DeleteGenreUseCase } from '@core/genre/application/use-cases/delete-genre/delete-genre-use-case';

export const REPOSITORIES = {
  GENRE_REPOSITORY: {
    provide: 'GenreRepository',
    useExisting: GenreSequelizeRepository,
  },
  GENRE_IN_MEMORY_REPOSITORY: {
    provide: GenreInMemoryRepository,
    useClass: GenreInMemoryRepository,
  },
  GENRE_SEQUELIZE_REPOSITORY: {
    provide: GenreSequelizeRepository,
    useFactory: (genreModel: typeof GenreModel, uow: UnitOfWorkSequelize) =>
      new GenreSequelizeRepository(genreModel, uow),
    inject: [getModelToken(GenreModel), 'UnitOfWork'],
  },
};

export const USE_CASES = {
  CREATE_GENRE_USE_CASE: {
    provide: CreateGenreUseCase,
    useFactory: (
      uow: IUnitOfWork,
      genreRepo: IGenreRepository,
      categoryRepo: ICategoryRepository,
      categoriesIdValidator: CategoriesIdExistsInStorageValidator,
    ) =>
      new CreateGenreUseCase(
        uow,
        genreRepo,
        categoryRepo,
        categoriesIdValidator,
      ),
    inject: [
      'UnitOfWork',
      REPOSITORIES.GENRE_REPOSITORY.provide,
      CATEGORY_PROVIDERS.REPOSITORIES.CATEGORY_REPOSITORY.provide,
      CATEGORY_PROVIDERS.VALIDATIONS.CATEGORIES_ID_EXISTS_IN_STORAGE_VALIDATOR
        .provide,
    ],
  },
  UPDATE_GENRE_USE_CASE: {
    provide: UpdateGenreUseCase,
    useFactory: (
      uow: IUnitOfWork,
      genreRepo: IGenreRepository,
      categoryRepo: ICategoryRepository,
      categoriesIdValidator: CategoriesIdExistsInStorageValidator,
    ) =>
      new UpdateGenreUseCase(
        uow,
        genreRepo,
        categoryRepo,
        categoriesIdValidator,
      ),
    inject: [
      'UnitOfWork',
      REPOSITORIES.GENRE_REPOSITORY.provide,
      CATEGORY_PROVIDERS.REPOSITORIES.CATEGORY_REPOSITORY.provide,
      CATEGORY_PROVIDERS.VALIDATIONS.CATEGORIES_ID_EXISTS_IN_STORAGE_VALIDATOR
        .provide,
    ],
  },
  LIST_GENRES_USE_CASE: {
    provide: ListGenresUseCase,
    useFactory: (
      genreRepo: IGenreRepository,
      categoryRepo: ICategoryRepository,
    ) => new ListGenresUseCase(genreRepo, categoryRepo),
    inject: [
      REPOSITORIES.GENRE_REPOSITORY.provide,
      CATEGORY_PROVIDERS.REPOSITORIES.CATEGORY_REPOSITORY.provide,
    ],
  },
  GET_GENRE_USE_CASE: {
    provide: GetGenreUseCase,
    useFactory: (
      genreRepo: IGenreRepository,
      categoryRepo: ICategoryRepository,
    ) => new GetGenreUseCase(genreRepo, categoryRepo),
    inject: [
      REPOSITORIES.GENRE_REPOSITORY.provide,
      CATEGORY_PROVIDERS.REPOSITORIES.CATEGORY_REPOSITORY.provide,
    ],
  },
  DELETE_GENRE_USE_CASE: {
    provide: DeleteGenreUseCase,
    useFactory: (uow: IUnitOfWork, genreRepo: IGenreRepository) =>
      new DeleteGenreUseCase(uow, genreRepo),
    inject: ['UnitOfWork', REPOSITORIES.GENRE_REPOSITORY.provide],
  },
};

export const GENRES_PROVIDERS = {
  REPOSITORIES,
  USE_CASES,
};
