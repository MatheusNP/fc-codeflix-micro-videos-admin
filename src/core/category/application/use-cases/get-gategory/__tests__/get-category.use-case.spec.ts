import { NotFoundError } from '../../../../../shared/domain/errors/not-found.error';
import { InvalidUuidError } from '../../../../../shared/domain/value-objects/uuid.vo';
import { Category, CategoryId } from '../../../../domain/category.aggregate';
import { CategoryInMemoryRepository } from '../../../../infra/db/in-memory/category-in-memory.repository';
import { GetCategoryUseCase } from '../get-category.use-case';

describe('GetCategoryUseCase Unit Tests', () => {
  let repository: CategoryInMemoryRepository;
  let useCase: GetCategoryUseCase;

  beforeEach(() => {
    repository = new CategoryInMemoryRepository();
    useCase = new GetCategoryUseCase(repository);
  });

  it('should throw error when entity not found', async () => {
    await expect(() => useCase.execute({ id: 'fake id' })).rejects.toThrow(
      new InvalidUuidError(),
    );

    const categoryId = new CategoryId();
    await expect(() => useCase.execute({ id: categoryId.id })).rejects.toThrow(
      new NotFoundError(categoryId.id, Category),
    );
  });

  it('should get a category', async () => {
    const items = [Category.fake().aCategory().build()];
    repository.items = items;

    const spyFindById = jest.spyOn(repository, 'findById');
    const output = await useCase.execute({ id: items[0].category_id.id });

    expect(spyFindById).toHaveBeenCalledTimes(1);
    expect(output).toStrictEqual({
      id: items[0].category_id.id,
      name: items[0].name,
      description: items[0].description,
      is_active: items[0].is_active,
      created_at: items[0].created_at,
    });
  });
});
