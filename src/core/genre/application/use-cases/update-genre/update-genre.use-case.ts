import { CategoriesIdExistsInDatabaseValidator } from '@core/category/application/validations/categories-ids-exists-in-database.validator';
import { ICategoryRepository } from '@core/category/domain/category.repository';
import { Genre, GenreId } from '@core/genre/domain/genre.aggregate';
import { IGenreRepository } from '@core/genre/domain/genre.repository';
import { IUseCase } from '@core/shared/application/use-case.interface';
import { NotFoundError } from '@core/shared/domain/errors/not-found.error';
import { IUnitOfWork } from '@core/shared/domain/repository/unit-of-work.interface';
import { EntityValidationError } from '@core/shared/domain/validators/validation.error';
import { GenreOutput, GenreOutputMapper } from '../common/genre-output';
import { UpdateGenreInput } from './update-genre.input';

export class UpdateGenreUseCase
  implements IUseCase<UpdateGenreInput, UpdateGenreOutput>
{
  constructor(
    private uow: IUnitOfWork,
    private genreRepository: IGenreRepository,
    private categoryRepository: ICategoryRepository,
    private categoriesIdValidator: CategoriesIdExistsInDatabaseValidator,
  ) {}

  async execute(input: UpdateGenreInput): Promise<GenreOutput> {
    const genreId = new GenreId(input.id);
    const genre = await this.genreRepository.findById(genreId);

    if (!genre) {
      throw new NotFoundError(input.id, Genre);
    }

    input.name && genre.changeName(input.name);

    if (input.is_active === true) {
      genre.activate();
    }

    if (input.is_active === false) {
      genre.deactivate();
    }

    const notification = genre.notification;

    if (input.categories_id) {
      const [categoriesId, errorsCategoriesId] = (
        await this.categoriesIdValidator.validate(input.categories_id)
      ).asArray();

      categoriesId && genre.syncCategoriesId(categoriesId);

      errorsCategoriesId &&
        notification.setError(
          errorsCategoriesId.map((e) => e.message),
          'categories_id',
        );
    }

    if (notification.hasErrors()) {
      throw new EntityValidationError(notification.toJSON());
    }

    await this.uow.do(async () => {
      return await this.genreRepository.update(genre);
    });

    const categories = await this.categoryRepository.findByIds(
      Array.from(genre.categories_id.values()),
    );

    return GenreOutputMapper.toOutput(genre, categories);
  }
}

export type UpdateGenreOutput = GenreOutput;
