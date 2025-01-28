import Category from '../category.entity';

describe('Category entity unit tests', () => {
  describe('constructor', () => {
    test('should initialize constructor with default fields', () => {
      const category = new Category({
        name: 'Movie',
      });

      expect(category.category_id).toBeUndefined();
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

      expect(category.category_id).toBeUndefined();
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

      expect(category.category_id).toBeUndefined();
      expect(category.name).toBe('Movie');
      expect(category.description).toBeNull();
      expect(category.is_active).toBeTruthy();
      expect(category.created_at).toBeInstanceOf(Date);
    });

    test('should create a category with description', () => {
      const category = Category.create({
        name: 'Movie',
        description: 'Category description',
      });

      expect(category.category_id).toBeUndefined();
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

      expect(category.category_id).toBeUndefined();
      expect(category.name).toBe('Movie');
      expect(category.description).toBeNull();
      expect(category.is_active).toBeFalsy();
      expect(category.created_at).toBeInstanceOf(Date);
    });
  });

  test('should change the name of a category', () => {
    const category = Category.create({
      name: 'Movie',
    });

    category.changeName('Movie 2');

    expect(category.name).toBe('Movie 2');
  });

  test('should change the description of a category', () => {
    const category = Category.create({
      name: 'Movie',
    });

    category.changeDescription('Category description');

    expect(category.description).toBe('Category description');
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

  // test('should create a category', () => {
  //   const category = Category.create({
  //     name: 'Category 1',
  //     description: 'Description 1',
  //     is_active: true,
  //   });

  //   expect(category.toJSON()).toStrictEqual({
  //     category_id: expect.any(String),
  //     name: 'Category 1',
  //     description: 'Description 1',
  //     is_active: true,
  //     created_at: expect.any(Date),
  //   });
  // });
});
