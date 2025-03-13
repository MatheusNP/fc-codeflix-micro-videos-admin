import { CategoryId } from '@core/category/domain/category.aggregate';
import { Genre, GenreId } from '../genre.aggregate';

describe('Genre Aggregate Unit Tests', () => {
  beforeEach(() => {
    Genre.prototype.validate = jest
      .fn()
      .mockImplementation(Genre.prototype.validate);
  });

  test('constructor Genre', () => {
    const categoryId = new CategoryId();
    const categoriesId = new Map([[categoryId.id, categoryId]]);
    let genre = new Genre({
      name: 'test',
      categories_id: categoriesId,
    });

    expect(genre).toBeDefined();
    expect(genre.genre_id).toBeInstanceOf(GenreId);
    expect(genre.name).toBe('test');
    expect(genre.categories_id).toEqual(categoriesId);
    expect(genre.is_active).toBeTruthy();
    expect(genre.created_at).toBeInstanceOf(Date);

    const created_at = new Date();
    genre = new Genre({
      name: 'test',
      categories_id: categoriesId,
      is_active: false,
      created_at,
    });
    expect(genre).toBeDefined();
    expect(genre.genre_id).toBeInstanceOf(GenreId);
    expect(genre.name).toBe('test');
    expect(genre.categories_id).toEqual(categoriesId);
    expect(genre.is_active).toBeFalsy();
    expect(genre.created_at).toBe(created_at);
  });

  describe('genre_id fields', () => {
    const categoryId = new CategoryId();
    const categories_id = new Map([[categoryId.id, categoryId]]);
    const arrange = [
      { name: 'Movie', categories_id },
      { name: 'Movie', categories_id, id: null },
      { name: 'Movie', categories_id, id: undefined },
      { name: 'Movie', categories_id, id: new GenreId() },
    ];

    test.each(arrange)('when props is %j', (item) => {
      const genre = new Genre(item);
      expect(genre.genre_id).toBeInstanceOf(GenreId);
    });
  });

  describe('create command', () => {
    test('should create a genre', () => {
      const categoryId = new CategoryId();
      const categories_id = new Map([[categoryId.id, categoryId]]);
      const genre = Genre.create({
        name: 'test',
        categories_id: [categoryId],
      });

      expect(genre).toBeDefined();
      expect(genre.genre_id).toBeInstanceOf(GenreId);
      expect(genre.name).toBe('test');
      expect(genre.categories_id).toEqual(categories_id);
      expect(genre.created_at).toBeInstanceOf(Date);
      expect(Genre.prototype.validate).toHaveBeenCalledTimes(1);

      const genre2 = Genre.create({
        name: 'test',
        categories_id: [categoryId],
        is_active: false,
      });

      expect(genre2).toBeDefined();
      expect(genre2.genre_id).toBeInstanceOf(GenreId);
      expect(genre2.name).toBe('test');
      expect(genre2.categories_id).toEqual(categories_id);
      expect(genre2.is_active).toBeFalsy();
      expect(genre2.created_at).toBeInstanceOf(Date);
      expect(Genre.prototype.validate).toHaveBeenCalledTimes(2);
    });
  });

  test('should change a name', () => {
    const genre = Genre.create({
      name: 'test',
      categories_id: [new CategoryId()],
    });
    genre.changeName('test 2');
    expect(genre.name).toBe('test 2');
    expect(Genre.prototype.validate).toHaveBeenCalledTimes(2);
  });

  test('should add a category_id', () => {
    const categoryId = new CategoryId();
    const genre = Genre.create({
      name: 'test',
      categories_id: [categoryId],
    });
    genre.addCategoryId(categoryId);

    expect(genre.categories_id.size).toBe(1);
    expect(genre.categories_id).toEqual(new Map([[categoryId.id, categoryId]]));
    expect(Genre.prototype.validate).toHaveBeenCalledTimes(1);

    const categoryId2 = new CategoryId();
    genre.addCategoryId(categoryId2);
    expect(genre.categories_id.size).toBe(2);
    expect(genre.categories_id).toEqual(
      new Map([
        [categoryId.id, categoryId],
        [categoryId2.id, categoryId2],
      ]),
    );
  });
});

describe('Genre validator unit tests', () => {
  describe('create command', () => {
    test('should an invalid genre with name property', () => {
      const categoryId = new CategoryId();
      const genre = Genre.create({
        name: 't'.repeat(256),
        categories_id: [categoryId],
      });

      expect(genre.notification.hasErrors()).toBeTruthy();
      expect(genre.notification).notificationContainsErrorMessages([
        {
          name: ['name must be shorter than or equal to 255 characters'],
        },
      ]);
    });
  });

  describe('changeName method', () => {
    it('should an invalid genre with name property', () => {
      const categoryId = new CategoryId();
      const genre = Genre.create({
        name: 'test',
        categories_id: [categoryId],
      });

      genre.changeName('t'.repeat(256));

      expect(genre.notification.hasErrors()).toBeTruthy();
      expect(genre.notification).notificationContainsErrorMessages([
        {
          name: ['name must be shorter than or equal to 255 characters'],
        },
      ]);
    });
  });
});
