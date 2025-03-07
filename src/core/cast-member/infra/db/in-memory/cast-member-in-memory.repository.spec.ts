import { CastMember } from '@core/cast-member/domain/cast-member.aggregate';
import { CastMemberInMemoryRepository } from './cast-member-in-memory.repository';
import { CastMemberType } from '@core/cast-member/domain/cast-member.type';

describe('CastMemberInMemoryRepository Unit Tests', () => {
  let repository: CastMemberInMemoryRepository;

  beforeEach(() => (repository = new CastMemberInMemoryRepository()));

  it('should no filter items when filter object is null', async () => {
    const items = [CastMember.fake().aCastMember().build()];
    const filterSpy = jest.spyOn(items, 'filter' as any);

    const itemsFiltered = await repository['applyFilter'](items, null);
    expect(filterSpy).not.toHaveBeenCalled();
    expect(itemsFiltered).toStrictEqual(items);
  });

  it('should filter items using filter by name parameter', async () => {
    const items = [
      CastMember.fake()
        .aCastMember()
        .withName('test')
        .withType(CastMemberType.ACTOR)
        .build(),
      CastMember.fake()
        .aCastMember()
        .withName('TEST')
        .withType(CastMemberType.ACTOR)
        .build(),
      CastMember.fake()
        .aCastMember()
        .withName('fake')
        .withType(CastMemberType.ACTOR)
        .build(),
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
      CastMember.fake()
        .aCastMember()
        .withName('test')
        .withType(CastMemberType.ACTOR)
        .build(),
      CastMember.fake()
        .aCastMember()
        .withName('TEST')
        .withType(CastMemberType.DIRECTOR)
        .build(),
      CastMember.fake()
        .aCastMember()
        .withName('fake')
        .withType(CastMemberType.ACTOR)
        .build(),
    ];
    const filterSpy = jest.spyOn(items, 'filter' as any);

    const itemsFiltered = await repository['applyFilter'](items, {
      type: CastMemberType.ACTOR,
    });
    expect(filterSpy).toHaveBeenCalledTimes(1);
    expect(itemsFiltered).toStrictEqual([items[0], items[2]]);
  });

  it('should filter items using filter by name and type parameter', async () => {
    const items = [
      CastMember.fake()
        .aCastMember()
        .withName('fake')
        .withType(CastMemberType.ACTOR)
        .build(),
      CastMember.fake()
        .aCastMember()
        .withName('TEST')
        .withType(CastMemberType.ACTOR)
        .build(),
      CastMember.fake()
        .aCastMember()
        .withName('test')
        .withType(CastMemberType.DIRECTOR)
        .build(),
    ];
    const filterSpy = jest.spyOn(items, 'filter' as any);

    const itemsFiltered = await repository['applyFilter'](items, {
      name: 'TEST',
      type: CastMemberType.ACTOR,
    });
    expect(filterSpy).toHaveBeenCalledTimes(1);
    expect(itemsFiltered).toStrictEqual([items[1]]);
  });

  it('should sort by created_at when sort param is null', async () => {
    const created_at = new Date();

    const items = [
      CastMember.fake()
        .aCastMember()
        .withName('test')
        .withType(CastMemberType.ACTOR)
        .withCreatedAt(created_at)
        .build(),
      CastMember.fake()
        .aCastMember()
        .withName('TEST')
        .withType(CastMemberType.ACTOR)
        .withCreatedAt(new Date(created_at.getTime() + 100))
        .build(),
      CastMember.fake()
        .aCastMember()
        .withName('fake')
        .withType(CastMemberType.ACTOR)
        .withCreatedAt(new Date(created_at.getTime() + 200))
        .build(),
    ];

    const itemsSorted = await repository['applySort'](items, null, null);
    expect(itemsSorted).toStrictEqual([items[2], items[1], items[0]]);
  });

  it('should sort by name', async () => {
    const items = [
      CastMember.fake()
        .aCastMember()
        .withName('c')
        .withType(CastMemberType.ACTOR)
        .build(),
      CastMember.fake()
        .aCastMember()
        .withName('b')
        .withType(CastMemberType.ACTOR)
        .build(),
      CastMember.fake()
        .aCastMember()
        .withName('a')
        .withType(CastMemberType.ACTOR)
        .build(),
    ];

    let itemsSorted = repository['applySort'](items, 'name', 'asc');
    expect(itemsSorted).toStrictEqual([items[2], items[1], items[0]]);

    itemsSorted = repository['applySort'](items, 'name', 'desc');
    expect(itemsSorted).toStrictEqual([items[0], items[1], items[2]]);
  });
});
