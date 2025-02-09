import { Uuid } from '../../../../shared/domain/value-objects/uuid.vo';
import { setupSequelize } from '../../../../shared/infra/testing/helpers';
import { CategorySequelizeRepository } from '../../../infra/db/sequelize/category-sequelize.repository';
import { CategoryModel } from '../../../infra/db/sequelize/category.model';
import { CreateCategoryUseCase } from '../../create-category.use-case';

describe('CreateCategoryUseCase Integration Tests', () => {
  let repository: CategorySequelizeRepository;
  let useCase: CreateCategoryUseCase;

  setupSequelize({ models: [CategoryModel] });

  beforeEach(() => {
    repository = new CategorySequelizeRepository(CategoryModel);
    useCase = new CreateCategoryUseCase(repository);
  });

  it('should create a new category', async () => {
    let output = await useCase.execute({ name: 'test' });
    let entity = await repository.findById(new Uuid(output.category_id));
    expect(output).toStrictEqual({
      category_id: entity.category_id.id,
      name: entity.name,
      description: entity.description,
      is_active: entity.is_active,
      created_at: entity.created_at,
    });

    output = await useCase.execute({
      name: 'test',
      description: 'some description',
      is_active: true,
    });
    entity = await repository.findById(new Uuid(output.category_id));
    expect(output).toStrictEqual({
      category_id: entity.category_id.id,
      name: entity.name,
      description: entity.description,
      is_active: entity.is_active,
      created_at: entity.created_at,
    });

    output = await useCase.execute({
      name: 'test',
      description: 'some description',
      is_active: false,
    });
    entity = await repository.findById(new Uuid(output.category_id));
    expect(output).toStrictEqual({
      category_id: entity.category_id.id,
      name: entity.name,
      description: entity.description,
      is_active: entity.is_active,
      created_at: entity.created_at,
    });
  });
});
