import { setupSequelize } from '@core/shared/infra/testing/helpers';
import { CastMemberModel } from '../cast-member.model';
import { CastMemberSequelizeRepository } from '../cast-member-sequelize.repository';
import { CastMember } from '@core/cast-member/domain/cast-member.entity';
import { Uuid } from '@core/shared/domain/value-objects/uuid.vo';
import { NotFoundError } from '@core/shared/domain/errors/not-found.error';
import { CastMemberType } from '@core/cast-member/domain/cast-member.type';
import { CastMemberModelMapper } from '../cast-member-model-mapper';
import {
  CastMemberSearchParams,
  CastMemberSearchResult,
} from '@core/cast-member/domain/cast-member.repository';

describe('CastMemberSequelizeRepository Integration Tests', () => {
  setupSequelize({
    models: [CastMemberModel],
  });

  let repository: CastMemberSequelizeRepository;

  beforeEach(async () => {
    repository = new CastMemberSequelizeRepository(CastMemberModel);
  });

  it('should create a cast member', async () => {
    const castMember = CastMember.fake().aCastMember().build();
    await repository.insert(castMember);

    const entity = await repository.findById(castMember.cast_member_id);
    expect(entity.toJSON()).toStrictEqual(castMember.toJSON());
  });

  it('should find an entity by id', async () => {
    let entityFound = await repository.findById(new Uuid());
    expect(entityFound).toBeNull();

    const castMember = CastMember.fake().aCastMember().build();
    await repository.insert(castMember);
    entityFound = await repository.findById(castMember.cast_member_id);
    expect(entityFound.toJSON()).toStrictEqual(castMember.toJSON());
  });

  it('should find all entities', async () => {
    const castMembers = CastMember.fake().theCastMembers(2).build();
    await repository.bulkInsert(castMembers);

    const entitiesFound = await repository.findAll();
    expect(entitiesFound).toStrictEqual(castMembers);
  });

  it('should throw error on update when entity not found', async () => {
    const castMember = CastMember.fake().aCastMember().build();
    await expect(repository.update(castMember)).rejects.toThrow(
      new NotFoundError(castMember.cast_member_id.id, CastMember),
    );
  });

  it('should update an entity', async () => {
    const castMember = CastMember.fake().aCastMember().build();
    await repository.insert(castMember);

    castMember.changeName('new test name');
    castMember.changeType(CastMemberType.DIRECTOR);
    await repository.update(castMember);

    const entityFound = await repository.findById(castMember.cast_member_id);
    expect(entityFound.toJSON()).toStrictEqual(castMember.toJSON());
  });

  it('should throw error on delete when entity not found', async () => {
    const cast_member_id = new Uuid();
    await expect(repository.delete(cast_member_id)).rejects.toThrow(
      new NotFoundError(cast_member_id.id, CastMember),
    );
  });

  it('should delete an entity', async () => {
    const castMember = CastMember.fake().aCastMember().build();
    await repository.insert(castMember);
    let entityFound = await repository.findById(castMember.cast_member_id);
    expect(entityFound.toJSON()).toStrictEqual(castMember.toJSON());

    await repository.delete(castMember.cast_member_id);
    entityFound = await repository.findById(castMember.cast_member_id);
    expect(entityFound).toBeNull();
  });

  describe('search method tests', () => {
    it('should only apply paginate when other params are null', async () => {
      const created_at = new Date();
      const castMembers = CastMember.fake()
        .theCastMembers(16)
        .withName('Actor')
        .withType(CastMemberType.ACTOR)
        .withCreatedAt(created_at)
        .build();
      await repository.bulkInsert(castMembers);
      const spyToEntity = jest.spyOn(CastMemberModelMapper, 'toEntity');

      const searchOutput = await repository.search(
        CastMemberSearchParams.create(),
      );
      expect(searchOutput).toBeInstanceOf(CastMemberSearchResult);
      expect(spyToEntity).toHaveBeenCalledTimes(15);
      expect(searchOutput.toJSON()).toMatchObject({
        total: 16,
        current_page: 1,
        last_page: 2,
        per_page: 15,
      });
      searchOutput.items.forEach((item) => {
        expect(item).toBeInstanceOf(CastMember);
        expect(item.cast_member_id).toBeDefined();
      });
      const items = searchOutput.items.map((item) => item.toJSON());
      expect(items).toMatchObject(
        new Array(15).fill({
          name: 'Actor',
          type: CastMemberType.ACTOR,
          created_at: created_at,
        }),
      );
    });

    it('should order by created_at DESC when search params are null', async () => {
      const created_at = new Date();
      const castMembers = CastMember.fake()
        .theCastMembers(16)
        .withName((index) => `Movie ${index}`)
        .withCreatedAt((index) => new Date(created_at.getTime() + index))
        .build();
      const searchOutput = await repository.search(
        CastMemberSearchParams.create(),
      );
      const items = searchOutput.items;
      [...items].reverse().forEach((item, index) => {
        expect(`Movie ${index}`).toBe(`${castMembers[index + 1].name}`);
      });
    });

    it('should apply paginate and filter', async () => {
      const castMembers = [
        CastMember.fake()
          .aCastMember()
          .withName('test')
          .withType(CastMemberType.DIRECTOR)
          .withCreatedAt(new Date(new Date().getTime() + 5000))
          .build(),
        CastMember.fake()
          .aCastMember()
          .withName('a')
          .withType(CastMemberType.DIRECTOR)
          .withCreatedAt(new Date(new Date().getTime() + 4000))
          .build(),
        CastMember.fake()
          .aCastMember()
          .withName('TEST')
          .withType(CastMemberType.DIRECTOR)
          .withCreatedAt(new Date(new Date().getTime() + 3000))
          .build(),
        CastMember.fake()
          .aCastMember()
          .withName('TeSt')
          .withType(CastMemberType.ACTOR)
          .withCreatedAt(new Date(new Date().getTime() + 2000))
          .build(),
        CastMember.fake()
          .aCastMember()
          .withName('b')
          .withType(CastMemberType.DIRECTOR)
          .withCreatedAt(new Date(new Date().getTime() + 1000))
          .build(),
      ];

      await repository.bulkInsert(castMembers);

      let searchOutput = await repository.search(
        CastMemberSearchParams.create({
          page: 1,
          per_page: 2,
          filter: {
            name: 'TEST',
          },
        }),
      );
      expect(searchOutput.toJSON(true)).toMatchObject(
        new CastMemberSearchResult({
          items: [castMembers[0], castMembers[2]],
          total: 3,
          current_page: 1,
          per_page: 2,
        }).toJSON(true),
      );

      searchOutput = await repository.search(
        CastMemberSearchParams.create({
          page: 2,
          per_page: 2,
          filter: {
            name: 'TEST',
          },
        }),
      );
      expect(searchOutput.toJSON(true)).toMatchObject(
        new CastMemberSearchResult({
          items: [castMembers[3]],
          total: 3,
          current_page: 2,
          per_page: 2,
        }).toJSON(true),
      );

      searchOutput = await repository.search(
        CastMemberSearchParams.create({
          page: 1,
          per_page: 2,
          filter: {
            type: CastMemberType.DIRECTOR,
          },
        }),
      );
      expect(searchOutput.toJSON(true)).toMatchObject(
        new CastMemberSearchResult({
          items: [castMembers[0], castMembers[1]],
          total: 4,
          current_page: 1,
          per_page: 2,
        }).toJSON(true),
      );

      searchOutput = await repository.search(
        CastMemberSearchParams.create({
          page: 2,
          per_page: 2,
          filter: {
            type: CastMemberType.DIRECTOR,
          },
        }),
      );
      expect(searchOutput.toJSON(true)).toMatchObject(
        new CastMemberSearchResult({
          items: [castMembers[2], castMembers[4]],
          total: 4,
          current_page: 2,
          per_page: 2,
        }).toJSON(true),
      );
    });

    it('should apply paginate and sort', async () => {
      expect(repository.sortableFields).toStrictEqual(['name', 'created_at']);

      const castMembers = [
        CastMember.fake().aCastMember().withName('b').build(),
        CastMember.fake().aCastMember().withName('a').build(),
        CastMember.fake().aCastMember().withName('d').build(),
        CastMember.fake().aCastMember().withName('e').build(),
        CastMember.fake().aCastMember().withName('c').build(),
      ];
      await repository.bulkInsert(castMembers);

      const arrange = [
        {
          params: CastMemberSearchParams.create({
            page: 1,
            per_page: 2,
            sort: 'name',
          }),
          result: new CastMemberSearchResult({
            items: [castMembers[1], castMembers[0]],
            total: 5,
            current_page: 1,
            per_page: 2,
          }),
        },
        {
          params: CastMemberSearchParams.create({
            page: 2,
            per_page: 2,
            sort: 'name',
          }),
          result: new CastMemberSearchResult({
            items: [castMembers[4], castMembers[2]],
            total: 5,
            current_page: 2,
            per_page: 2,
          }),
        },
        {
          params: CastMemberSearchParams.create({
            page: 1,
            per_page: 2,
            sort: 'name',
            sort_dir: 'desc',
          }),
          result: new CastMemberSearchResult({
            items: [castMembers[3], castMembers[2]],
            total: 5,
            current_page: 1,
            per_page: 2,
          }),
        },
        {
          params: CastMemberSearchParams.create({
            page: 2,
            per_page: 2,
            sort: 'name',
            sort_dir: 'desc',
          }),
          result: new CastMemberSearchResult({
            items: [castMembers[4], castMembers[0]],
            total: 5,
            current_page: 2,
            per_page: 2,
          }),
        },
      ];

      for (const i of arrange) {
        const result = await repository.search(i.params);
        expect(result.toJSON(true)).toMatchObject(i.result.toJSON(true));
      }
    });

    describe('should search using filter, sort and paginate', () => {
      const castMembers = [
        CastMember.fake().aCastMember().withName('test').build(),
        CastMember.fake().aCastMember().withName('a').build(),
        CastMember.fake().aCastMember().withName('TEST').build(),
        CastMember.fake().aCastMember().withName('e').build(),
        CastMember.fake().aCastMember().withName('TeSt').build(),
      ];

      const arrange = [
        {
          search_params: CastMemberSearchParams.create({
            page: 1,
            per_page: 2,
            sort: 'name',
            filter: { name: 'TEST' },
          }),
          search_result: new CastMemberSearchResult({
            items: [castMembers[2], castMembers[4]],
            total: 3,
            current_page: 1,
            per_page: 2,
          }),
        },
        {
          search_params: CastMemberSearchParams.create({
            page: 2,
            per_page: 2,
            sort: 'name',
            filter: { name: 'TEST' },
          }),
          search_result: new CastMemberSearchResult({
            items: [castMembers[0]],
            total: 3,
            current_page: 2,
            per_page: 2,
          }),
        },
      ];

      beforeEach(async () => {
        await repository.bulkInsert(castMembers);
      });

      test.each(arrange)(
        'when value is $search_params',
        async ({ search_params, search_result }) => {
          const result = await repository.search(search_params);
          expect(result.toJSON(true)).toMatchObject(search_result.toJSON(true));
        },
      );
    });
  });
});
