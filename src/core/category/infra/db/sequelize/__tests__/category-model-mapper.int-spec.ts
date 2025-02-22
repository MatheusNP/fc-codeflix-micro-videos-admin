import { CategoryModel } from '../category.model';
import { CategoryModelMapper } from '../category-model-mapper';
import { EntityValidationError } from '../../../../../shared/domain/validators/validation-error';
import { Category } from '../../../../domain/category.entity';
import { Uuid } from '../../../../../shared/domain/value-objects/uuid.vo';
import { setupSequelize } from '../../../../../shared/infra/testing/helpers';

describe('CategorySequelizeRepository Integration Tests', () => {
  setupSequelize({
    models: [CategoryModel],
  });

  it('should throws error when category is invalid', () => {
    expect.assertions(2);
    const model = CategoryModel.build({
      category_id: '123e4567-e89b-12d3-a456-426655440000',
      name: 't'.repeat(256),
    });
    try {
      CategoryModelMapper.toEntity(model);
      fail(
        'The category is invalid, but it needs to throw a EntityValidationError'
      );
    } catch (e) {
      expect(e).toBeInstanceOf(EntityValidationError);
      expect((e as EntityValidationError).errors).toMatchObject([
        {
          name: ['name must be shorter than or equal to 255 characters'],
        },
      ]);
    }
  });

  it('should convert a category model to a category entity', () => {
    const created_at = new Date();
    const model = CategoryModel.build({
      category_id: '123e4567-e89b-12d3-a456-426655440000',
      name: 'Movie',
      description: 'Category description',
      is_active: true,
      created_at,
    });

    const entity = CategoryModelMapper.toEntity(model);
    expect(entity.toJSON()).toStrictEqual(
      new Category({
        category_id: new Uuid('123e4567-e89b-12d3-a456-426655440000'),
        name: 'Movie',
        description: 'Category description',
        is_active: true,
        created_at,
      }).toJSON()
    );
  });

  it('should convert a category entity to a category model', () => {
    const created_at = new Date();
    const entity = new Category({
      category_id: new Uuid('123e4567-e89b-12d3-a456-426655440000'),
      name: 'Movie',
      description: 'Category description',
      is_active: true,
      created_at,
    });
    const model = CategoryModelMapper.toModel(entity);
    expect(model.toJSON()).toStrictEqual({
      category_id: '123e4567-e89b-12d3-a456-426655440000',
      name: 'Movie',
      description: 'Category description',
      is_active: true,
      created_at,
    });
  });
});
