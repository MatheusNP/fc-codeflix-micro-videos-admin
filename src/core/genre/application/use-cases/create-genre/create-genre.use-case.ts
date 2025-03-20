import { IUseCase } from '@core/shared/application/use-case.interface';
import { CreateGenreInput } from './create-genre.input';
import { GenreOutput, GenreOutputMapper } from '../common/genre-output';
import { IUnitOfWork } from '@core/shared/domain/repository/unit-of-work.interface';
import { Genre } from '@core/genre/domain/genre.aggregate';
import { EntityValidationError } from '@core/shared/domain/validators/validation.error';
import { IGenreRepository } from '@core/genre/domain/genre.repository';
import { ICategoryRepository } from '@core/category/domain/category.repository';
import { CategoriesIdExistsInStorageValidator } from '../../validations/categories-ids-exists-in-storage.validator';

export class CreateGenreUseCase
  implements IUseCase<CreateGenreInput, CreateGenreOutput>
{
  constructor(
    private uow: IUnitOfWork,
    private genreRepository: IGenreRepository,
    private categoryRepository: ICategoryRepository,
    private categoriesIdExistsInStorage: CategoriesIdExistsInStorageValidator,
  ) {}

  async execute(input: CreateGenreInput): Promise<CreateGenreOutput> {
    const { name, categories_id, is_active } = input;

    const [categoriesId, errorsCategoriesId] = (
      await this.categoriesIdExistsInStorage.validate(categories_id)
    ).asArray();

    const entity = Genre.create({
      name,
      categories_id: errorsCategoriesId ? [] : categoriesId,
      is_active,
    });

    const notification = entity.notification;

    if (errorsCategoriesId) {
      notification.setError(
        errorsCategoriesId.map((e) => e.message),
        'categories_id',
      );
    }

    if (notification.hasErrors()) {
      throw new EntityValidationError(notification.toJSON());
    }

    await this.uow.do(async () => {
      return await this.genreRepository.insert(entity);
    });

    const categories = await this.categoryRepository.findByIds(categoriesId);

    return GenreOutputMapper.toOutput(entity, categories);
  }
}

export type CreateGenreOutput = GenreOutput;
