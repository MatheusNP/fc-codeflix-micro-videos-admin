import { Genre } from '@core/genre/domain/genre.aggregate';
import { GenreInMemoryRepository } from './genre-in-memory.repository';
import { GenreFakeBuilder } from '@core/genre/domain/genre-fake.builder';
import { CategoryId } from '@core/category/domain/category.aggregate';

describe('GenreInMemoryRepository Unit Tests', () => {
  let repository: GenreInMemoryRepository;

  beforeEach(() => {
    repository = new GenreInMemoryRepository();
  });

  it('should no filter items when filter object is null', async () => {
    const items = [
      Genre.fake().aGenre().build(),
      Genre.fake().aGenre().build(),
    ];
    const filterSpy = jest.spyOn(items, 'filter' as any);

    const itemsFiltered = await repository['applyFilter'](items, null!);

    expect(filterSpy).not.toHaveBeenCalled();
    expect(itemsFiltered).toStrictEqual(items);
  });

  it('should filter items by name', async () => {
    const faker = Genre.fake().aGenre();
    const items = [
      faker.withName('test').build(),
      faker.withName('TEST').build(),
      faker.withName('fake').build(),
    ];
    const filterSpy = jest.spyOn(items, 'filter' as any);

    let itemsFiltered = await repository['applyFilter'](items, {
      name: 'TEST',
    });

    expect(filterSpy).toHaveBeenCalledTimes(1);
    expect(itemsFiltered).toStrictEqual([items[0], items[1]]);

    itemsFiltered = await repository['applyFilter'](items, {
      name: 'fake',
    });

    expect(filterSpy).toHaveBeenCalledTimes(2);
    expect(itemsFiltered).toStrictEqual([items[2]]);
  });

  it('should filter items by categories_id', async () => {
    const categoryId1 = new CategoryId();
    const categoryId2 = new CategoryId();
    const categoryId3 = new CategoryId();
    const categoryId4 = new CategoryId();
    const items = [
      Genre.fake()
        .aGenre()
        .addCategoryId(categoryId1)
        .addCategoryId(categoryId2)
        .build(),
      Genre.fake()
        .aGenre()
        .addCategoryId(categoryId3)
        .addCategoryId(categoryId4)
        .build(),
    ];
    const filterSpy = jest.spyOn(items, 'filter' as any);

    let itemsFiltered = await repository['applyFilter'](items, {
      categories_id: [categoryId1],
    });

    expect(filterSpy).toHaveBeenCalledTimes(1);
    expect(itemsFiltered).toStrictEqual([items[0]]);

    itemsFiltered = await repository['applyFilter'](items, {
      categories_id: [categoryId2],
    });

    expect(filterSpy).toHaveBeenCalledTimes(2);
    expect(itemsFiltered).toStrictEqual([items[0]]);

    itemsFiltered = await repository['applyFilter'](items, {
      categories_id: [categoryId1, categoryId2],
    });

    expect(filterSpy).toHaveBeenCalledTimes(3);
    expect(itemsFiltered).toStrictEqual([items[0]]);

    itemsFiltered = await repository['applyFilter'](items, {
      categories_id: [categoryId1, categoryId3],
    });

    expect(filterSpy).toHaveBeenCalledTimes(4);
    expect(itemsFiltered).toStrictEqual([...items]);

    itemsFiltered = await repository['applyFilter'](items, {
      categories_id: [categoryId3],
    });

    expect(filterSpy).toHaveBeenCalledTimes(5);
    expect(itemsFiltered).toStrictEqual([items[1]]);

    itemsFiltered = await repository['applyFilter'](items, {
      categories_id: [categoryId4],
    });

    expect(filterSpy).toHaveBeenCalledTimes(6);
    expect(itemsFiltered).toStrictEqual([items[1]]);

    itemsFiltered = await repository['applyFilter'](items, {
      categories_id: [categoryId3, categoryId4],
    });

    expect(filterSpy).toHaveBeenCalledTimes(7);
    expect(itemsFiltered).toStrictEqual([items[1]]);

    itemsFiltered = await repository['applyFilter'](items, {
      categories_id: [categoryId2, categoryId4],
    });

    expect(filterSpy).toHaveBeenCalledTimes(8);
    expect(itemsFiltered).toStrictEqual([...items]);
  });

  it('should filter items by name and categories_id', async () => {
    const categoryId1 = new CategoryId();
    const categoryId2 = new CategoryId();
    const categoryId3 = new CategoryId();
    const categoryId4 = new CategoryId();
    const items = [
      Genre.fake()
        .aGenre()
        .withName('test')
        .addCategoryId(categoryId1)
        .addCategoryId(categoryId2)
        .build(),
      Genre.fake()
        .aGenre()
        .withName('fake')
        .addCategoryId(categoryId3)
        .addCategoryId(categoryId4)
        .build(),
      Genre.fake()
        .aGenre()
        .withName('test fake')
        .addCategoryId(categoryId1)
        .build(),
    ];

    let itemsFiltered = await repository['applyFilter'](items, {
      name: 'test',
      categories_id: [categoryId1],
    });

    expect(itemsFiltered).toStrictEqual([items[0], items[2]]);

    itemsFiltered = await repository['applyFilter'](items, {
      name: 'test',
      categories_id: [categoryId3],
    });

    expect(itemsFiltered).toStrictEqual([]);

    itemsFiltered = await repository['applyFilter'](items, {
      name: 'fake',
      categories_id: [categoryId4],
    });

    expect(itemsFiltered).toStrictEqual([items[1]]);
  });

  it('should sort by created_at when sort is null', async () => {
    const date = new Date();
    const items = [
      Genre.fake().aGenre().withCreatedAt(new Date(date)).build(),
      Genre.fake()
        .aGenre()
        .withCreatedAt(new Date(date.getTime() + 100))
        .build(),
      Genre.fake()
        .aGenre()
        .withCreatedAt(new Date(date.getTime() + 200))
        .build(),
    ];

    const itemsSorted = await repository['applySort'](items, null, null);
    expect(itemsSorted).toStrictEqual([items[2], items[1], items[0]]);
  });

  it('should sort by name', () => {
    const items = [
      Genre.fake().aGenre().withName('c').build(),
      Genre.fake().aGenre().withName('b').build(),
      Genre.fake().aGenre().withName('a').build(),
    ];

    let itemsSorted = repository['applySort'](items, 'name', 'asc');
    expect(itemsSorted).toStrictEqual([items[2], items[1], items[0]]);

    itemsSorted = repository['applySort'](items, 'name', 'desc');
    expect(itemsSorted).toStrictEqual([items[0], items[1], items[2]]);
  });
});
