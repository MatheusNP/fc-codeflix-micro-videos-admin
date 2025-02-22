import { Uuid } from '../../../shared/domain/value-objects/uuid.vo';
import { Category } from '../category.entity';

describe('Category entity unit tests', () => {
  beforeAll(() => {
    Category.prototype.validate = jest
      .fn()
      .mockImplementation(Category.prototype.validate);
  });

  describe('constructor', () => {
    test('should initialize constructor with default fields', () => {
      const category = new Category({
        name: 'Movie',
      });

      expect(category.category_id).toBeInstanceOf(Uuid);
      expect(category.name).toBe('Movie');
      expect(category.description).toBeNull();
      expect(category.is_active).toBeTruthy();
      expect(category.created_at).toBeInstanceOf(Date);
    });

    test('should initialize constructor with all fields', () => {
      const created_at = new Date();
      const category = new Category({
        name: 'Movie',
        description: 'Category description',
        is_active: false,
        created_at,
      });

      expect(category.category_id).toBeInstanceOf(Uuid);
      expect(category.name).toBe('Movie');
      expect(category.description).toBe('Category description');
      expect(category.is_active).toBeFalsy();
      expect(category.created_at).toBe(created_at);
    });
  });

  describe('create command', () => {
    test('should create a category', () => {
      const category = Category.create({
        name: 'Movie',
      });

      expect(category.category_id).toBeInstanceOf(Uuid);
      expect(category.name).toBe('Movie');
      expect(category.description).toBeNull();
      expect(category.is_active).toBeTruthy();
      expect(category.created_at).toBeInstanceOf(Date);
      expect(Category.prototype.validate).toHaveBeenCalledTimes(1);
    });

    test('should create a category with description', () => {
      const category = Category.create({
        name: 'Movie',
        description: 'Category description',
      });

      expect(category.category_id).toBeInstanceOf(Uuid);
      expect(category.name).toBe('Movie');
      expect(category.description).toBe('Category description');
      expect(category.is_active).toBeTruthy();
      expect(category.created_at).toBeInstanceOf(Date);
    });

    test('should create a category with is_active', () => {
      const category = Category.create({
        name: 'Movie',
        is_active: false,
      });

      expect(category.category_id).toBeInstanceOf(Uuid);
      expect(category.name).toBe('Movie');
      expect(category.description).toBeNull();
      expect(category.is_active).toBeFalsy();
      expect(category.created_at).toBeInstanceOf(Date);
    });
  });

  describe('category_id field', () => {
    const arrange = [
      { category_id: null },
      { category_id: undefined },
      { category_id: new Uuid() },
    ];
    test.each(arrange)('id = %j', ({ category_id }) => {
      const category = new Category({
        name: 'Movie',
        category_id: category_id as any,
      });
      expect(category.category_id).toBeInstanceOf(Uuid);
      if (category_id instanceof Uuid) {
        expect(category.category_id).toBe(category_id);
      }
    });
  });

  test('should change the name of a category', () => {
    const category = Category.create({
      name: 'Movie',
    });

    category.changeName('Movie 2');

    expect(category.name).toBe('Movie 2');
    expect(Category.prototype.validate).toHaveBeenCalledTimes(2);
  });

  test('should change the description of a category', () => {
    const category = Category.create({
      name: 'Movie',
    });

    category.changeDescription('Category description');

    expect(category.description).toBe('Category description');
    expect(Category.prototype.validate).toHaveBeenCalledTimes(1);
  });

  test('should activate a category', () => {
    const category = Category.create({
      name: 'Movie',
      is_active: false,
    });

    category.activate();

    expect(category.is_active).toBeTruthy();
  });

  test('should deactivate a category', () => {
    const category = Category.create({
      name: 'Movie',
    });

    category.deactivate();

    expect(category.is_active).toBeFalsy();
  });
});

describe('Category validator unit tests', () => {
  describe('create command', () => {
    test('should throw error when name is invalid', () => {
      const category = Category.create({ name: 't'.repeat(256) });

      expect(category.notification.hasErrors()).toBeTruthy();
      expect(category.notification).notificationContainsErrorMessages([
        {
          name: ['name must be shorter than or equal to 255 characters'],
        },
      ]);
    });
  });

  describe('changeName method unit tests', () => {
    it('should throw error when name is invalid', () => {
      const category = Category.create({ name: 'Movie' });

      category.changeName('t'.repeat(256));

      expect(category.notification.hasErrors()).toBeTruthy();
      expect(category.notification).notificationContainsErrorMessages([
        {
          name: ['name must be shorter than or equal to 255 characters'],
        },
      ]);
    });
  });
});
