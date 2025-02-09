import { NotFoundError } from '../../../../shared/domain/errors/not-found.error';
import {
  InvalidUuidError,
  Uuid,
} from '../../../../shared/domain/value-objects/uuid.vo';
import { Category } from '../../../domain/category.entity';
import { CategoryInMemoryRepository } from '../../../infra/db/in-memory/category-in-memory.repository';
import { DeleteCategoryUseCase } from '../../delete-category.use-case';

describe('DeleteCategoryUseCase Unit Tests', () => {
  let repository: CategoryInMemoryRepository;
  let useCase: DeleteCategoryUseCase;

  beforeEach(() => {
    repository = new CategoryInMemoryRepository();
    useCase = new DeleteCategoryUseCase(repository);
  });

  it('should throw error when entity not found', async () => {
    await expect(() => useCase.execute({ id: 'fake id' })).rejects.toThrow(
      new InvalidUuidError()
    );

    const uuid = new Uuid();
    await expect(() => useCase.execute({ id: uuid.id })).rejects.toThrow(
      new NotFoundError(uuid.id, Category)
    );
  });

  it('should delete a category', async () => {
    const items = Category.fake().theCategories(3).build();
    repository.items = items;
    const spyDelete = jest.spyOn(repository, 'delete');

    await useCase.execute({ id: items[2].category_id.id });
    expect(spyDelete).toHaveBeenCalledTimes(1);
    expect(repository.items).toHaveLength(2);

    await useCase.execute({ id: items[1].category_id.id });
    expect(spyDelete).toHaveBeenCalledTimes(2);
    expect(repository.items).toHaveLength(1);

    await useCase.execute({ id: items[0].category_id.id });
    expect(spyDelete).toHaveBeenCalledTimes(3);
    expect(repository.items).toHaveLength(0);
  });
});
