import { IUseCase } from '@core/shared/application/use-case.interface';
import { CreateGenreInput } from './create-genre.input';
import { GenreOutputMapper } from '../common/genre-output';
import { IUnitOfWork } from '@core/shared/domain/repository/unit-of-work.interface';
import { Genre } from '@core/genre/domain/genre.aggregate';
import { CategoryId } from '@core/category/domain/category.aggregate';
import { EntityValidationError } from '@core/shared/domain/validators/validation.error';
import { IGenreRepository } from '@core/genre/domain/genre.repository';
import { ICategoryRepository } from '@core/category/domain/category.repository';

export class CreateGenreUseCase
  implements IUseCase<CreateGenreInput, CreateGenreOutput>
{
  constructor(
    private uow: IUnitOfWork,
    private readonly genreRepository: IGenreRepository,
    private readonly categoryRepository: ICategoryRepository,
  ) {}

  async execute(input: CreateGenreInput): Promise<CreateGenreOutput> {
    const { name, categories_id, is_active } = input;

    const categoryIds = categories_id.map((id) => new CategoryId(id));

    const entity = Genre.create({
      name,
      categories_id: categoryIds,
      is_active,
    });

    const notification = entity.notification;

    if (notification.hasErrors()) {
      throw new EntityValidationError(notification.toJSON());
    }

    await this.uow.do(async () => {
      return await this.genreRepository.insert(entity);
    });

    const categories = await this.categoryRepository.findByIds(categoryIds);

    return GenreOutputMapper.toOutput(entity, categories);
  }
}

export type CreateGenreOutput = GenreOutputMapper;
