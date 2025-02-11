import { NotFoundError } from '../../../../../shared/domain/errors/not-found.error';
import {
  InvalidUuidError,
  Uuid,
} from '../../../../../shared/domain/value-objects/uuid.vo';
import { Category } from '../../../../domain/category.entity';
import { CategoryInMemoryRepository } from '../../../../infra/db/in-memory/category-in-memory.repository';
import { UpdateCategoryUseCase } from '../../update-category.use-case';

describe('CreateCategoryUseCase Unit Tests', () => {
  let repository: CategoryInMemoryRepository;
  let useCase: UpdateCategoryUseCase;

  beforeEach(() => {
    repository = new CategoryInMemoryRepository();
    useCase = new UpdateCategoryUseCase(repository);
  });

  it('should throw error when entity not found', async () => {
    await expect(() =>
      useCase.execute({ id: 'fake id', name: 'fake name' })
    ).rejects.toThrow(new InvalidUuidError());

    const uuid = new Uuid();
    await expect(() =>
      useCase.execute({ id: uuid.id, name: 'fake name' })
    ).rejects.toThrow(new NotFoundError(uuid.id, Category));
  });

  it('should throw error when entity is not valid', async () => {
    const entity = Category.fake().aCategory().build();
    repository.items = [entity];

    await expect(() =>
      useCase.execute({ id: entity.category_id.id, name: 't'.repeat(256) })
    ).rejects.toThrow('Entity Validation Error');
  });

  it('should update a category', async () => {
    const spyUpdate = jest.spyOn(repository, 'update');
    const entity = new Category({
      name: 'test',
      description: 'some description',
      is_active: true,
    });
    await repository.insert(entity);

    let output = await useCase.execute({
      id: entity.category_id.id,
      name: 'test',
    });

    expect(spyUpdate).toHaveBeenCalledTimes(1);
    expect(output).toStrictEqual({
      id: entity.category_id.id,
      name: 'test',
      description: 'some description',
      is_active: true,
      created_at: entity.created_at,
    });

    type Arrange = {
      input: {
        id: string;
        name: string;
        description?: string;
        is_active?: boolean;
      };
      expected: {
        id: string;
        name: string;
        description: string;
        is_active: boolean;
        created_at: Date;
      };
    };

    const arrange: Arrange[] = [
      {
        input: {
          id: entity.category_id.id,
          name: 'test',
          description: 'some description',
        },
        expected: {
          id: entity.category_id.id,
          name: 'test',
          description: 'some description',
          is_active: true,
          created_at: entity.created_at,
        },
      },
      {
        input: {
          id: entity.category_id.id,
          name: 'test',
          description: 'new description',
        },
        expected: {
          id: entity.category_id.id,
          name: 'test',
          description: 'new description',
          is_active: true,
          created_at: entity.created_at,
        },
      },
      {
        input: {
          id: entity.category_id.id,
          name: 'test',
          is_active: false,
        },
        expected: {
          id: entity.category_id.id,
          name: 'test',
          description: 'new description',
          is_active: false,
          created_at: entity.created_at,
        },
      },
    ];

    for (const i of arrange) {
      output = await useCase.execute({
        id: i.input.id,
        ...('name' in i.input && { name: i.input.name }),
        ...('description' in i.input && { description: i.input.description }),
        ...('is_active' in i.input && { is_active: i.input.is_active }),
      });

      expect(output).toStrictEqual({
        id: i.expected.id,
        name: i.expected.name,
        description: i.expected.description,
        is_active: i.expected.is_active,
        created_at: i.expected.created_at,
      });
    }
  });
});
