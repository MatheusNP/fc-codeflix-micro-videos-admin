import { CastMember } from '@core/cast-member/domain/cast-member.aggregate';
import { CastMemberInMemoryRepository } from './cast-member-in-memory.repository';
import { CastMemberType } from '@core/cast-member/domain/cast-member-type.vo';

describe('CastMemberInMemoryRepository Unit Tests', () => {
  let repository: CastMemberInMemoryRepository;

  beforeEach(() => (repository = new CastMemberInMemoryRepository()));

  it('should no filter items when filter object is null', async () => {
    const items = [CastMember.fake().anActor().build()];
    const filterSpy = jest.spyOn(items, 'filter' as any);

    const itemsFiltered = await repository['applyFilter'](items, null);
    expect(filterSpy).not.toHaveBeenCalled();
    expect(itemsFiltered).toStrictEqual(items);
  });

  it('should filter items using filter by name parameter', async () => {
    const items = [
      CastMember.fake().anActor().withName('test').build(),
      CastMember.fake().anActor().withName('TEST').build(),
      CastMember.fake().anActor().withName('fake').build(),
    ];
    const filterSpy = jest.spyOn(items, 'filter' as any);

    const itemsFiltered = await repository['applyFilter'](items, {
      name: 'TEST',
    });
    expect(filterSpy).toHaveBeenCalledTimes(1);
    expect(itemsFiltered).toStrictEqual([items[0], items[1]]);
  });

  it('should filter items using filter by type parameter', async () => {
    const items = [
      CastMember.fake().anActor().withName('test').build(),
      CastMember.fake().aDirector().withName('TEST').build(),
      CastMember.fake().anActor().withName('fake').build(),
    ];
    const filterSpy = jest.spyOn(items, 'filter' as any);

    const itemsFiltered = await repository['applyFilter'](items, {
      type: CastMemberType.createAnActor(),
    });
    expect(filterSpy).toHaveBeenCalledTimes(1);
    expect(itemsFiltered).toStrictEqual([items[0], items[2]]);
  });

  it('should filter items using filter by name and type parameter', async () => {
    const items = [
      CastMember.fake().anActor().withName('fake').build(),
      CastMember.fake().anActor().withName('TEST').build(),
      CastMember.fake().aDirector().withName('test').build(),
    ];
    const filterSpy = jest.spyOn(items, 'filter' as any);

    const itemsFiltered = await repository['applyFilter'](items, {
      name: 'TEST',
      type: CastMemberType.createAnActor(),
    });
    expect(filterSpy).toHaveBeenCalledTimes(1);
    expect(itemsFiltered).toStrictEqual([items[1]]);
  });

  it('should sort by created_at when sort param is null', async () => {
    const created_at = new Date();

    const items = [
      CastMember.fake()
        .anActor()
        .withName('test')
        .withCreatedAt(created_at)
        .build(),
      CastMember.fake()
        .anActor()
        .withName('TEST')
        .withCreatedAt(new Date(created_at.getTime() + 100))
        .build(),
      CastMember.fake()
        .anActor()
        .withName('fake')
        .withCreatedAt(new Date(created_at.getTime() + 200))
        .build(),
    ];

    const itemsSorted = await repository['applySort'](items, null, null);
    expect(itemsSorted).toStrictEqual([items[2], items[1], items[0]]);
  });

  it('should sort by name', async () => {
    const items = [
      CastMember.fake().anActor().withName('c').build(),
      CastMember.fake().anActor().withName('b').build(),
      CastMember.fake().anActor().withName('a').build(),
    ];

    let itemsSorted = repository['applySort'](items, 'name', 'asc');
    expect(itemsSorted).toStrictEqual([items[2], items[1], items[0]]);

    itemsSorted = repository['applySort'](items, 'name', 'desc');
    expect(itemsSorted).toStrictEqual([items[0], items[1], items[2]]);
  });
});
