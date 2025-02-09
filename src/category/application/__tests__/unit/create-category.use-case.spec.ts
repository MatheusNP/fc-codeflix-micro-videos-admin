import { CategoryInMemoryRepository } from '../../../infra/db/in-memory/category-in-memory.repository';
import { CreateCategoryUseCase } from '../../create-category.use-case';

describe('CreateCategoryUseCase unit tests', () => {
  let repository: CategoryInMemoryRepository;
  let useCase: CreateCategoryUseCase;

  beforeEach(() => {
    repository = new CategoryInMemoryRepository();
    useCase = new CreateCategoryUseCase(repository);
  });

  it('should create a new category', async () => {
    const spyInsert = jest.spyOn(repository, 'insert');
    let output = await useCase.execute({ name: 'test' });
    expect(spyInsert).toHaveBeenCalledTimes(1);
    expect(output).toStrictEqual({
      category_id: repository.items[0].category_id.id,
      name: repository.items[0].name,
      description: repository.items[0].description,
      is_active: repository.items[0].is_active,
      created_at: repository.items[0].created_at,
    });

    output = await useCase.execute({
      name: 'test',
      description: 'some description',
      is_active: false,
    });

    expect(spyInsert).toHaveBeenCalledTimes(2);
    expect(output).toStrictEqual({
      category_id: repository.items[1].category_id.id,
      name: 'test',
      description: 'some description',
      is_active: false,
      created_at: repository.items[1].created_at,
    });
  });
});
