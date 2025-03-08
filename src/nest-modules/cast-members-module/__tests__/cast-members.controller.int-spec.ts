import { ICastMemberRepository } from '@core/cast-member/domain/cast-member.repository';
import { CastMembersController } from '../cast-members.controller';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from 'src/nest-modules/config-module/config.module';
import { DatabaseModule } from 'src/nest-modules/database-module/database.module';
import { CastMembersModule } from '../cast-members.module';
import { CAST_MEMBERS_PROVIDERS } from '../cast-members.providers';
import {
  CreateCastMemberFixture,
  ListCastMembersFixture,
  UpdateCastMemberFixture,
} from '../testing/cast-member-fixture';
import { CastMemberOutputMapper } from '@core/cast-member/application/use-cases/common/cast-member-output';
import {
  CastMemberCollectionPresenter,
  CastMemberPresenter,
} from '../cast-members.presenter';
import {
  CastMember,
  CastMemberId,
} from '@core/cast-member/domain/cast-member.aggregate';

describe('CastMembersController Integration Tests', () => {
  let controller: CastMembersController;
  let repository: ICastMemberRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot(), DatabaseModule, CastMembersModule],
    }).compile();

    controller = module.get<CastMembersController>(CastMembersController);
    repository = module.get<ICastMemberRepository>(
      CAST_MEMBERS_PROVIDERS.REPOSITORIES.CAST_MEMBERS_REPOSITORY.provide,
    );
  });

  it('should be defined', async () => {
    expect(controller).toBeDefined();
    expect(controller['createCastMemberUseCase']).toBeInstanceOf(
      CAST_MEMBERS_PROVIDERS.USE_CASES.CREATE_CAST_MEMBER_USE_CASE.provide,
    );
    expect(controller['updateCastMemberUseCase']).toBeInstanceOf(
      CAST_MEMBERS_PROVIDERS.USE_CASES.UPDATE_CAST_MEMBER_USE_CASE.provide,
    );
    expect(controller['listCastMembersUseCase']).toBeInstanceOf(
      CAST_MEMBERS_PROVIDERS.USE_CASES.LIST_CAST_MEMBERS_USE_CASE.provide,
    );
    expect(controller['getCastMemberUseCase']).toBeInstanceOf(
      CAST_MEMBERS_PROVIDERS.USE_CASES.GET_CAST_MEMBER_USE_CASE.provide,
    );
    expect(controller['deleteCastMemberUseCase']).toBeInstanceOf(
      CAST_MEMBERS_PROVIDERS.USE_CASES.DELETE_CAST_MEMBER_USE_CASE.provide,
    );
  });

  describe('should create a cast member', () => {
    const arrange = CreateCastMemberFixture.arrangeForCreate();

    test.each(arrange)(
      'when body is $send_data',
      async ({ send_data, expected }) => {
        const presenter = await controller.create(send_data);
        const entity = await repository.findById(
          new CastMemberId(presenter.id),
        );
        expect(entity.toJSON()).toStrictEqual({
          cast_member_id: presenter.id,
          created_at: presenter.created_at,
          ...expected,
        });
        const output = CastMemberOutputMapper.toOutput(entity);
        expect(presenter).toEqual(new CastMemberPresenter(output));
      },
    );
  });

  describe('should update a cast member', () => {
    const arrange = UpdateCastMemberFixture.arrangeForUpdate();

    const castMember = CastMember.fake().anActor().build();

    beforeEach(async () => {
      await repository.insert(castMember);
    });

    test.each(arrange)(
      'when body is $send_data',
      async ({ send_data, expected }) => {
        const presenter = await controller.update(
          castMember.cast_member_id.id,
          send_data,
        );
        const entity = await repository.findById(
          new CastMemberId(presenter.id),
        );
        expect(entity.toJSON()).toStrictEqual({
          cast_member_id: presenter.id,
          created_at: presenter.created_at,
          name: expected.name ?? castMember.name,
          type: expected.type ?? castMember.type,
        });
        const output = CastMemberOutputMapper.toOutput(entity);
        expect(presenter).toEqual(new CastMemberPresenter(output));
      },
    );
  });

  it('should delete a cast member', async () => {
    const castMember = CastMember.fake().anActor().build();
    await repository.insert(castMember);
    const response = await controller.remove(castMember.cast_member_id.id);
    expect(response).toBeUndefined();
    await expect(
      repository.findById(castMember.cast_member_id),
    ).resolves.toBeNull();
  });

  it('should get a cast member', async () => {
    const castMember = CastMember.fake().anActor().build();
    await repository.insert(castMember);
    const presenter = await controller.findOne(castMember.cast_member_id.id);
    const output = CastMemberOutputMapper.toOutput(castMember);
    expect(presenter).toEqual(new CastMemberPresenter(output));
    expect(presenter.id).toBe(castMember.cast_member_id.id);
    expect(presenter.name).toBe(castMember.name);
    expect(presenter.type).toBe(castMember.type.type);
    expect(presenter.created_at).toStrictEqual(castMember.created_at);
  });

  describe('should list cast members', () => {
    describe('should return sorted cast members by created_at', () => {
      const { entitiesMap, arrange } =
        ListCastMembersFixture.arrangeIncrementedWithCreatedAt();

      beforeEach(async () => {
        await repository.bulkInsert(Object.values(entitiesMap));
      });

      test.each(arrange)(
        'when query is $send_data',
        async ({ send_data, expected }) => {
          const presenter = await controller.search(send_data);
          const { entities, ...paginationProps } = expected;
          expect(presenter).toEqual(
            new CastMemberCollectionPresenter({
              items: entities.map(CastMemberOutputMapper.toOutput),
              ...paginationProps.meta,
            }),
          );
        },
      );
    });

    describe('should return cast members using pagination, sort and filter', () => {
      const { entitiesMap, arrange } = ListCastMembersFixture.arrangeUnsorted();

      beforeEach(async () => {
        await repository.bulkInsert(Object.values(entitiesMap));
      });

      test.each(arrange)(
        'when query is $send_data',
        async ({ send_data, expected }) => {
          const presenter = await controller.search(send_data);
          const { entities, ...paginationProps } = expected;
          expect(presenter).toEqual(
            new CastMemberCollectionPresenter({
              items: entities.map(CastMemberOutputMapper.toOutput),
              ...paginationProps.meta,
            }),
          );
        },
      );
    });
  });
});
