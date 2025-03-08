import { CastMemberInMemoryRepository } from '@core/cast-member/infra/db/in-memory/cast-member-in-memory.repository';
import { UpdateCastMemberUseCase } from '../update-cast-member.use-case';
import { NotFoundError } from '@core/shared/domain/errors/not-found.error';
import {
  CastMember,
  CastMemberId,
} from '@core/cast-member/domain/cast-member.aggregate';
import { CastMemberTypes } from '@core/cast-member/domain/cast-member-type.vo';

describe('UpdateCastMemberUseCase Unit Tests', () => {
  let repository: CastMemberInMemoryRepository;
  let useCase: UpdateCastMemberUseCase;

  beforeEach(() => {
    repository = new CastMemberInMemoryRepository();
    useCase = new UpdateCastMemberUseCase(repository);
  });

  it('should throw error when entity not found', async () => {
    const castMemberId = new CastMemberId();
    await expect(() =>
      useCase.execute({
        id: castMemberId.id,
        name: 'fake name',
        type: CastMemberTypes.ACTOR,
      }),
    ).rejects.toThrow(new NotFoundError(castMemberId.id, CastMember));
  });

  it('should update a cast member', async () => {
    const items = [CastMember.fake().aDirector().build()];
    repository.items = items;
    const spyUpdate = jest.spyOn(repository, 'update');

    const output = await useCase.execute({
      id: items[0].cast_member_id.id,
      name: 'fake name',
      type: CastMemberTypes.ACTOR,
    });
    expect(spyUpdate).toHaveBeenCalledTimes(1);
    expect(output).toStrictEqual({
      id: items[0].cast_member_id.id,
      name: 'fake name',
      type: CastMemberTypes.ACTOR,
      created_at: items[0].created_at,
    });

    const arrange = [
      {
        input: {
          id: items[0].cast_member_id.id,
          name: 'Actor',
        },
        expected: {
          id: items[0].cast_member_id.id,
          name: 'Actor',
          type: CastMemberTypes.ACTOR,
          created_at: items[0].created_at,
        },
      },
      {
        input: {
          id: items[0].cast_member_id.id,
          type: CastMemberTypes.DIRECTOR,
        },
        expected: {
          id: items[0].cast_member_id.id,
          name: 'Actor',
          type: CastMemberTypes.DIRECTOR,
          created_at: items[0].created_at,
        },
      },
      {
        input: {
          id: items[0].cast_member_id.id,
          name: 'new name',
          type: CastMemberTypes.ACTOR,
        },
        expected: {
          id: items[0].cast_member_id.id,
          name: 'new name',
          type: CastMemberTypes.ACTOR,
          created_at: items[0].created_at,
        },
      },
    ];

    for (const i of arrange) {
      const output = await useCase.execute(i.input);
      expect(output).toStrictEqual({
        id: i.expected.id,
        name: i.expected.name,
        type: i.expected.type,
        created_at: i.expected.created_at,
      });
    }
  });
});
