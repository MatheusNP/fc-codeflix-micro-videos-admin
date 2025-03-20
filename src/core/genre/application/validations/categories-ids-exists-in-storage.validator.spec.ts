import { CategoryInMemoryRepository } from '@core/category/infra/db/in-memory/category-in-memory.repository';
import { CategoriesIdExistsInStorageValidator } from './categories-ids-exists-in-storage.validator';
import { Category, CategoryId } from '@core/category/domain/category.aggregate';
import { NotFoundError } from '@core/shared/domain/errors/not-found.error';

describe('CategoriesIdsExistsInDatabaseValidator Unit Tests', () => {
  let categoryRepo: CategoryInMemoryRepository;
  let validator: CategoriesIdExistsInStorageValidator;

  beforeEach(() => {
    categoryRepo = new CategoryInMemoryRepository();
    validator = new CategoriesIdExistsInStorageValidator(categoryRepo);
  });

  it('should return not found errors when categories not exists in storage', async () => {
    const categoryId1 = new CategoryId();
    const categoryId2 = new CategoryId();
    const spyExistsById = jest.spyOn(categoryRepo, 'existsByIds');

    let [categoriesId, errorsCategoriesId] = await validator.validate([
      categoryId1.id,
      categoryId2.id,
    ]);

    expect(spyExistsById).toHaveBeenCalledTimes(1);

    const category1 = Category.fake().aCategory().build();
    await categoryRepo.insert(category1);

    [categoriesId, errorsCategoriesId] = await validator.validate([
      category1.category_id.id,
      categoryId2.id,
    ]);

    expect(categoriesId).toStrictEqual(null);
    expect(errorsCategoriesId).toStrictEqual([
      new NotFoundError(categoryId2.id, Category),
    ]);
    expect(spyExistsById).toHaveBeenCalledTimes(2);
  });

  it('should return a list of categories id', async () => {
    const category1 = Category.fake().aCategory().build();
    const category2 = Category.fake().aCategory().build();
    await categoryRepo.bulkInsert([category1, category2]);

    const [categoriesId, errorsCategoriesId] = await validator.validate([
      category1.category_id.id,
      category2.category_id.id,
    ]);

    expect(categoriesId).toStrictEqual([
      category1.category_id,
      category2.category_id,
    ]);
    expect(errorsCategoriesId).toStrictEqual(null);
    expect(categoriesId[0]).toBeValueObject(category1.category_id);
    expect(categoriesId[1]).toBeValueObject(category2.category_id);
  });
});
