import { CategoryId } from '@core/category/domain/category.aggregate';
import { GenreId } from '@core/genre/domain/genre.aggregate';
import { Video } from '@core/video/domain/video.aggregate';
import { VideoInMemoryRepository } from './video-in-memory.repository';

describe('VideoInMemoryRepository Unit Tests', () => {
  let repository: VideoInMemoryRepository;

  beforeEach(() => {
    repository = new VideoInMemoryRepository();
  });

  it('should not filter items when filter object is null', async () => {
    const items = [
      Video.fake().aVideoWithoutMedias().build(),
      Video.fake().aVideoWithoutMedias().build(),
    ];
    const filterSpy = jest.spyOn(items, 'filter' as any);

    const itemsFiltered = await repository['applyFilter'](items, null);

    expect(filterSpy).not.toHaveBeenCalled();
    expect(itemsFiltered).toStrictEqual(items);
  });

  it('should filter items by title', async () => {
    const faker = Video.fake().aVideoWithoutMedias();
    const items = [
      faker.withTitle('test').build(),
      faker.withTitle('TEST').build(),
      faker.withTitle('fake').build(),
    ];
    const filterSpy = jest.spyOn(items, 'filter' as any);

    const itemsFiltered = await repository['applyFilter'](items, {
      title: 'test',
    });

    expect(filterSpy).toHaveBeenCalledTimes(1);
    expect(itemsFiltered).toStrictEqual([items[0], items[1]]);
  });

  it('should filter items by categories_id', async () => {
    const categoryId1 = new CategoryId();
    const categoryId2 = new CategoryId();
    const categoryId3 = new CategoryId();
    const categoryId4 = new CategoryId();
    const items = [
      Video.fake()
        .aVideoWithoutMedias()
        .addCategoryId(categoryId1)
        .addCategoryId(categoryId2)
        .build(),
      Video.fake()
        .aVideoWithoutMedias()
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
      categories_id: [categoryId3],
    });

    expect(filterSpy).toHaveBeenCalledTimes(4);
    expect(itemsFiltered).toStrictEqual([items[1]]);

    itemsFiltered = await repository['applyFilter'](items, {
      categories_id: [categoryId4],
    });

    expect(filterSpy).toHaveBeenCalledTimes(5);
    expect(itemsFiltered).toStrictEqual([items[1]]);

    itemsFiltered = await repository['applyFilter'](items, {
      categories_id: [categoryId3, categoryId4],
    });

    expect(filterSpy).toHaveBeenCalledTimes(6);
    expect(itemsFiltered).toStrictEqual([items[1]]);

    itemsFiltered = await repository['applyFilter'](items, {
      categories_id: [categoryId1, categoryId4],
    });

    expect(filterSpy).toHaveBeenCalledTimes(7);
    expect(itemsFiltered).toStrictEqual([...items]);
  });

  it('should filter by title and categories_id', async () => {
    const categoryId1 = new CategoryId();
    const categoryId2 = new CategoryId();
    const categoryId3 = new CategoryId();
    const categoryId4 = new CategoryId();
    const items = [
      Video.fake()
        .aVideoWithoutMedias()
        .withTitle('test')
        .addCategoryId(categoryId1)
        .addCategoryId(categoryId2)
        .build(),
      Video.fake()
        .aVideoWithoutMedias()
        .withTitle('fake')
        .addCategoryId(categoryId3)
        .addCategoryId(categoryId4)
        .build(),
      Video.fake()
        .aVideoWithoutMedias()
        .withTitle('test fake')
        .addCategoryId(categoryId1)
        .build(),
    ];

    let itemsFiltered = await repository['applyFilter'](items, {
      title: 'test',
      categories_id: [categoryId1],
    });

    expect(itemsFiltered).toStrictEqual([items[0], items[2]]);

    itemsFiltered = await repository['applyFilter'](items, {
      title: 'fake',
      categories_id: [categoryId3],
    });

    expect(itemsFiltered).toStrictEqual([items[1]]);

    itemsFiltered = await repository['applyFilter'](items, {
      title: 'test',
      categories_id: [categoryId3],
    });

    expect(itemsFiltered).toStrictEqual([]);

    itemsFiltered = await repository['applyFilter'](items, {
      title: 'fake',
      categories_id: [categoryId4],
    });

    expect(itemsFiltered).toStrictEqual([items[1]]);
  });

  it('should filter by title, categories_id and genres_id', async () => {
    const categoryId1 = new CategoryId();
    const categoryId2 = new CategoryId();
    const categoryId3 = new CategoryId();
    const categoryId4 = new CategoryId();
    const genreId1 = new GenreId();
    const genreId2 = new GenreId();
    const items = [
      Video.fake()
        .aVideoWithoutMedias()
        .withTitle('test')
        .addCategoryId(categoryId1)
        .addCategoryId(categoryId2)
        .addGenreId(genreId1)
        .build(),
      Video.fake()
        .aVideoWithoutMedias()
        .withTitle('fake')
        .addCategoryId(categoryId3)
        .addCategoryId(categoryId4)
        .addGenreId(genreId1)
        .build(),
      Video.fake()
        .aVideoWithoutMedias()
        .withTitle('test fake')
        .addCategoryId(categoryId1)
        .addGenreId(genreId1)
        .addGenreId(genreId2)
        .build(),
    ];

    let itemsFiltered = await repository['applyFilter'](items, {
      title: 'test',
      categories_id: [categoryId1],
      genres_id: [genreId1],
    });

    expect(itemsFiltered).toStrictEqual([items[0], items[2]]);

    itemsFiltered = await repository['applyFilter'](items, {
      title: 'fake',
      categories_id: [categoryId3],
      genres_id: [genreId1],
    });

    expect(itemsFiltered).toStrictEqual([items[1]]);

    itemsFiltered = await repository['applyFilter'](items, {
      title: 'test',
      categories_id: [categoryId3],
      genres_id: [genreId1],
    });

    expect(itemsFiltered).toStrictEqual([]);

    itemsFiltered = await repository['applyFilter'](items, {
      title: 'fake',
      categories_id: [categoryId1],
      genres_id: [genreId1, genreId2],
    });

    expect(itemsFiltered).toStrictEqual([items[2]]);
  });

  it('should sort by created_at when sort param is null', async () => {
    const items = [
      Video.fake().aVideoWithoutMedias().withCreatedAt(new Date()).build(),
      Video.fake()
        .aVideoWithoutMedias()
        .withCreatedAt(new Date(new Date().getTime() + 1))
        .build(),
      Video.fake()
        .aVideoWithoutMedias()
        .withCreatedAt(new Date(new Date().getTime() + 2))
        .build(),
    ];

    const itemsSorted = await repository['applySort'](items, null, null);

    expect(itemsSorted).toStrictEqual([items[2], items[1], items[0]]);
  });

  it('should sort by title', async () => {
    const items = [
      Video.fake().aVideoWithoutMedias().withTitle('c').build(),
      Video.fake().aVideoWithoutMedias().withTitle('b').build(),
      Video.fake().aVideoWithoutMedias().withTitle('a').build(),
    ];

    let itemsSorted = await repository['applySort'](items, 'title', 'asc');

    expect(itemsSorted).toStrictEqual([items[2], items[1], items[0]]);

    itemsSorted = await repository['applySort'](items, 'title', 'desc');

    expect(itemsSorted).toStrictEqual([items[0], items[1], items[2]]);
  });
});
