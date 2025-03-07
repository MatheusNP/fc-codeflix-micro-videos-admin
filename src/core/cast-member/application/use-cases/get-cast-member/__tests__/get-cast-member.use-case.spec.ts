import { CastMemberInMemoryRepository } from '@core/cast-member/infra/db/in-memory/cast-member-in-memory.repository';
import { GetCastMemberUseCase } from '../get-cast-member.use-case';
import { InvalidUuidError } from '@core/shared/domain/value-objects/uuid.vo';
import {
  CastMember,
  CastMemberId,
} from '@core/cast-member/domain/cast-member.aggregate';
import { NotFoundError } from '@core/shared/domain/errors/not-found.error';

describe('DeleteCastMemberUseCase Unit Tests', () => {
  let repository: CastMemberInMemoryRepository;
  let useCase: GetCastMemberUseCase;

  beforeEach(() => {
    repository = new CastMemberInMemoryRepository();
    useCase = new GetCastMemberUseCase(repository);
  });

  it('should throw error when entity not found', async () => {
    await expect(() => useCase.execute({ id: 'fake id' })).rejects.toThrow(
      new InvalidUuidError(),
    );

    const castMemberId = new CastMemberId();
    await expect(() =>
      useCase.execute({ id: castMemberId.id }),
    ).rejects.toThrow(new NotFoundError(castMemberId.id, CastMember));
  });

  it('should get a cast member', async () => {
    const items = [CastMember.fake().aCastMember().build()];
    repository.items = items;

    const output = await useCase.execute({ id: items[0].cast_member_id.id });
    expect(output).toStrictEqual({
      id: items[0].cast_member_id.id,
      name: items[0].name,
      type: items[0].type,
      created_at: items[0].created_at,
    });
  });
});
