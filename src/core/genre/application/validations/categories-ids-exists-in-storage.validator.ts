import { Category, CategoryId } from '@core/category/domain/category.aggregate';
import { ICategoryRepository } from '@core/category/domain/category.repository';
import { Either } from '@core/shared/domain/either';
import { NotFoundError } from '@core/shared/domain/errors/not-found.error';

export class CategoriesIdExistsInStorageValidator {
  constructor(private categoryRepo: ICategoryRepository) {}

  async validate(
    categories_id: string[],
  ): Promise<Either<CategoryId[], NotFoundError[]>> {
    const categoriesId = categories_id.map((id) => new CategoryId(id));
    const result = await this.categoryRepo.existsByIds(categoriesId);

    return result.not_exists.length > 0
      ? Either.fail(
          result.not_exists.map((c) => new NotFoundError(c.id, Category)),
        )
      : Either.ok(categoriesId);
  }
}
