import { NotFoundError } from '../../../../../shared/domain/errors/not-found.error';
import { Uuid } from '../../../../../shared/domain/value-objects/uuid.vo';
import { setupSequelize } from '../../../../../shared/infra/testing/helpers';
import { Category } from '../../../../domain/category.entity';
import { CategorySequelizeRepository } from '../../../../infra/db/sequelize/category-sequelize.repository';
import { CategoryModel } from '../../../../infra/db/sequelize/category.model';
import { DeleteCategoryUseCase } from '../delete-category.use-case';

describe('DeleteCategoryUseCase Integration Tests', () => {
  let repository: CategorySequelizeRepository;
  let useCase: DeleteCategoryUseCase;

  setupSequelize({ models: [CategoryModel] });

  beforeEach(() => {
    repository = new CategorySequelizeRepository(CategoryModel);
    useCase = new DeleteCategoryUseCase(repository);
  });

  it('should throw error when entity not found', async () => {
    const uuid = new Uuid();
    await expect(() => useCase.execute({ id: uuid.id })).rejects.toThrow(
      new NotFoundError(uuid.id, Category)
    );
  });

  it('should delete some categories', async () => {
    const categories = Category.fake().theCategories(3).build();
    await repository.bulkInsert(categories);

    await useCase.execute({ id: categories[2].category_id.id });
    await expect(repository.findAll()).resolves.toHaveLength(2);
    await expect(
      repository.findById(categories[2].category_id)
    ).resolves.toBeNull();

    await useCase.execute({ id: categories[1].category_id.id });
    await expect(repository.findAll()).resolves.toHaveLength(1);
    await expect(
      repository.findById(categories[1].category_id)
    ).resolves.toBeNull();

    await useCase.execute({ id: categories[0].category_id.id });
    await expect(repository.findAll()).resolves.toHaveLength(0);
    await expect(
      repository.findById(categories[0].category_id)
    ).resolves.toBeNull();
  });
});
