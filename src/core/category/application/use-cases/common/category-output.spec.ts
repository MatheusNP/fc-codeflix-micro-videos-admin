import { Category } from '../../../domain/category.aggregate';
import { CategoryOutputMapper } from './category-output';

describe('CategoryOutputMapper Unit Tests', () => {
  it('should convert a category to output', () => {
    const entity = Category.fake()
      .aCategory()
      .withName('test')
      .withDescription('test description')
      .build();

    const spyToJSON = jest.spyOn(entity, 'toJSON');
    const output = CategoryOutputMapper.toOutput(entity);

    expect(spyToJSON).toHaveBeenCalledTimes(1);
    expect(output).toStrictEqual({
      id: entity.category_id.id,
      name: entity.name,
      description: entity.description,
      is_active: entity.is_active,
      created_at: entity.created_at,
    });
  });
});
