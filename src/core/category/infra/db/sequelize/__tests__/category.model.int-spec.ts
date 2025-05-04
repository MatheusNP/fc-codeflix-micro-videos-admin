import { DataType } from 'sequelize-typescript';
import { setupSequelize } from '../../../../../shared/infra/testing/helpers';
import { CategoryModel } from '../category.model';

describe('CategoryModel Integration Tests', () => {
  setupSequelize({
    models: [CategoryModel],
  });

  test('mapping props', () => {
    const attributesMap = CategoryModel.getAttributes();
    const attributes = Object.keys(CategoryModel.getAttributes());

    expect(attributes).toStrictEqual([
      'category_id',
      'name',
      'description',
      'is_active',
      'created_at',
    ]);

    expect(attributesMap.category_id).toMatchObject({
      type: DataType.UUID(),
      primaryKey: true,
      field: 'category_id',
      fieldName: 'category_id',
    });

    expect(attributesMap.name).toMatchObject({
      type: DataType.STRING(255),
      allowNull: false,
      field: 'name',
      fieldName: 'name',
    });

    expect(attributesMap.description).toMatchObject({
      type: DataType.TEXT(),
      allowNull: true,
      field: 'description',
      fieldName: 'description',
    });

    expect(attributesMap.is_active).toMatchObject({
      type: DataType.BOOLEAN(),
      allowNull: false,
      field: 'is_active',
      fieldName: 'is_active',
    });

    expect(attributesMap.created_at).toMatchObject({
      type: DataType.DATE(6),
      allowNull: false,
      field: 'created_at',
      fieldName: 'created_at',
    });
  });

  test('should create a category', async () => {
    const arrange = {
      category_id: '123e4567-e89b-12d3-a456-426655440000',
      name: 'test',
      description: 'test',
      is_active: true,
      created_at: new Date(),
    };
    const category = await CategoryModel.create(arrange);
    expect(category.toJSON()).toStrictEqual(arrange);
  });
});
