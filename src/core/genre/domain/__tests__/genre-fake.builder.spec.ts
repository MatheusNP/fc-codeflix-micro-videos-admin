import { Chance } from 'chance';
import { GenreFakeBuilder } from '../genre-fake.builder';
import { GenreId } from '../genre.aggregate';
import { CategoryId } from '@core/category/domain/category.aggregate';

describe('GenreFakeBuilder Unit Tests', () => {
  const faker = GenreFakeBuilder.aGenre();

  describe('genre_id prop', () => {
    test('should throw error when any with methods has called', () => {
      expect(() => {
        new Error(`Property genre_id not have a factory, use 'with' methods`);
      });
    });

    test('should be undefined', () => {
      expect(faker['_genre_id']).toBeUndefined();
    });

    test('withGenreId', () => {
      const genre_id = new GenreId();
      const $this = faker.withGenreId(genre_id);
      expect($this).toBeInstanceOf(GenreFakeBuilder);
      expect(faker['_genre_id']).toBe(genre_id);

      faker.withGenreId(() => genre_id);
      //@ts-expect-error _genre_id is a callable
      expect(faker['_genre_id']()).toBe(genre_id);

      expect(faker.genre_id).toBe(genre_id);
    });

    test('should pass index to genre_id factory', () => {
      let mockFactory = jest.fn(() => new GenreId());
      faker.withGenreId(mockFactory);
      faker.build();
      expect(mockFactory).toHaveBeenCalledTimes(1);

      const genre_id = new GenreId();
      mockFactory = jest.fn(() => genre_id);
      const fakerMany = GenreFakeBuilder.theGenres(2);
      fakerMany.withGenreId(mockFactory);
      fakerMany.build();
      expect(mockFactory).toHaveBeenCalledTimes(2);
      expect(fakerMany.build()[0].genre_id).toBe(genre_id);
      expect(fakerMany.build()[1].genre_id).toBe(genre_id);
    });
  });

  describe('name prop', () => {
    const faker = GenreFakeBuilder.aGenre();

    test('should be a function', () => {
      expect(typeof faker['_name']).toBe('function');
    });

    test('shoud call the word method', () => {
      const chance = Chance();
      const spyWordMethod = jest.spyOn(chance, 'word');
      faker['chance'] = chance;
      faker.build();

      expect(spyWordMethod).toHaveBeenCalled();
    });

    test('withName', () => {
      const $this = faker.withName('test name');
      expect($this).toBeInstanceOf(GenreFakeBuilder);
      expect(faker['_name']).toBe('test name');

      faker.withName(() => 'test name');
      //@ts-expect-error _name is a callable
      expect(faker['_name']()).toBe('test name');

      expect(faker.name).toBe('test name');
    });

    test('should pass index to name factory', () => {
      faker.withName((index) => `test name ${index}`);
      const category = faker.build();
      expect(category.name).toBe('test name 0');

      const fakerMany = GenreFakeBuilder.theGenres(2);
      fakerMany.withName((index) => `test name ${index}`);
      const categories = fakerMany.build();
      expect(categories[0].name).toBe('test name 0');
      expect(categories[1].name).toBe('test name 1');
    });

    test('should be invalid too long case', () => {
      const $this = faker.withInvalidNameTooLong();
      expect($this).toBeInstanceOf(GenreFakeBuilder);
      expect(faker['_name'].length).toBe(256);

      const tooLong = 'a'.repeat(256);
      faker.withInvalidNameTooLong(tooLong);
      expect(faker['_name'].length).toBe(256);
      expect(faker['_name']).toBe(tooLong);
    });
  });

  describe('categories_id prop', () => {
    const faker = GenreFakeBuilder.aGenre();

    test('addCategoryId', () => {
      const category_id = new CategoryId();
      const $this = faker.addCategoryId(category_id);
      expect($this).toBeInstanceOf(GenreFakeBuilder);
      expect(faker['_categories_id']).toEqual([category_id]);

      expect(faker.categories_id).toEqual([category_id]);
    });
  });

  describe('is_active prop', () => {
    const faker = GenreFakeBuilder.aGenre();

    test('should be a function', () => {
      expect(typeof faker['_is_active']).toBe('function');
    });

    test('activate', () => {
      const $this = faker.activate();
      expect($this).toBeInstanceOf(GenreFakeBuilder);
      expect(faker['_is_active']).toBeTruthy();
      expect(faker.is_active).toBeTruthy();
    });

    test('deactivate', () => {
      const $this = faker.deactivate();
      expect($this).toBeInstanceOf(GenreFakeBuilder);
      expect(faker['_is_active']).toBeFalsy();
      expect(faker.is_active).toBeFalsy();
    });
  });

  describe('created_at prop', () => {
    const faker = GenreFakeBuilder.aGenre();

    test('should throw error when any with methods has called', () => {
      const fakerCategory = GenreFakeBuilder.aGenre();
      expect(() => fakerCategory.created_at).toThrowError(
        new Error(`Property created_at not have a factory, use 'with' methods`),
      );
    });

    test('should be undefined', () => {
      expect(faker['_created_at']).toBeUndefined();
    });

    test('withCreatedAt', () => {
      const date = new Date();
      const $this = faker.withCreatedAt(date);
      expect($this).toBeInstanceOf(GenreFakeBuilder);
      expect(faker['_created_at']).toBe(date);

      faker.withCreatedAt(() => date);
      //@ts-expect-error _created_at is a callable
      expect(faker['_created_at']()).toBe(date);

      expect(faker.created_at).toBe(date);
    });

    test('should pass index to created_at factory', () => {
      const date = new Date();
      faker.withCreatedAt((index) => new Date(date.getTime() + index + 2));
      const category = faker.build();
      expect(category.created_at.getTime()).toBe(date.getTime() + 2);

      const fakerMany = GenreFakeBuilder.theGenres(2);
      fakerMany.withCreatedAt((index) => new Date(date.getTime() + index + 2));
      const categories = fakerMany.build();
      expect(categories[0].created_at.getTime()).toBe(date.getTime() + 2);
      expect(categories[1].created_at.getTime()).toBe(date.getTime() + 3);
    });
  });

  test('should create a genre', () => {
    const faker = GenreFakeBuilder.aGenre();
    let genre = faker.build();

    expect(genre.genre_id).toBeInstanceOf(GenreId);
    expect(typeof genre.name === 'string').toBeTruthy();
    expect(genre.categories_id).toBeInstanceOf(Map<string, CategoryId>);
    expect(typeof genre.is_active === 'boolean').toBeTruthy();
    expect(genre.created_at).toBeInstanceOf(Date);

    const created_at = new Date();
    const genre_id = new GenreId();
    const category_id = new CategoryId();
    genre = faker
      .withGenreId(genre_id)
      .withName('test name')
      .addCategoryId(category_id)
      .deactivate()
      .withCreatedAt(created_at)
      .build();

    expect(genre.genre_id).toBe(genre_id);
    expect(genre.name).toBe('test name');
    expect(genre.categories_id).toEqual(
      new Map([[category_id.id, category_id]]),
    );
    expect(genre.is_active).toBeFalsy();
    expect(genre.created_at).toBe(created_at);
  });

  test('should create many genres', () => {
    const faker = GenreFakeBuilder.theGenres(2);
    let genres = faker.build();

    genres.forEach((genre) => {
      expect(genre.genre_id).toBeInstanceOf(GenreId);
      expect(typeof genre.name === 'string').toBeTruthy();
      expect(genre.categories_id).toBeInstanceOf(Map<string, CategoryId>);
      expect(typeof genre.is_active === 'boolean').toBeTruthy();
      expect(genre.created_at).toBeInstanceOf(Date);
    });

    const created_at = new Date();
    const genre_id = new GenreId();
    const category_id = new CategoryId();
    genres = faker
      .withGenreId(genre_id)
      .withName('test name')
      .addCategoryId(category_id)
      .deactivate()
      .withCreatedAt(created_at)
      .build();

    genres.forEach((genre) => {
      expect(genre.genre_id).toBe(genre_id);
      expect(genre.name).toBe('test name');
      expect(genre.categories_id).toEqual(
        new Map([[category_id.id, category_id]]),
      );
      expect(genre.is_active).toBeFalsy();
      expect(genre.created_at).toBe(created_at);
    });
  });
});
