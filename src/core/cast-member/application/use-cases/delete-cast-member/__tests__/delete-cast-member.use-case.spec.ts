import { CastMemberInMemoryRepository } from '@core/cast-member/infra/db/in-memory/cast-member-in-memory.repository';
import { DeleteCastMemberUseCase } from '../delete-cast-member.use-case';
import { InvalidUuidError } from '@core/shared/domain/value-objects/uuid.vo';
import { NotFoundError } from '@core/shared/domain/errors/not-found.error';
import {
  CastMember,
  CastMemberId,
} from '@core/cast-member/domain/cast-member.aggregate';

describe('DeleteCastMemberUseCase Unit Tests', () => {
  let repository: CastMemberInMemoryRepository;
  let useCase: DeleteCastMemberUseCase;

  beforeEach(() => {
    repository = new CastMemberInMemoryRepository();
    useCase = new DeleteCastMemberUseCase(repository);
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

  it('should delete a cast member', async () => {
    const items = CastMember.fake().theCastMembers(3).build();
    repository.items = items;
    const spyDelete = jest.spyOn(repository, 'delete');

    await useCase.execute({ id: items[2].cast_member_id.id });
    expect(spyDelete).toHaveBeenCalledTimes(1);
    expect(repository.items).toHaveLength(2);

    await useCase.execute({ id: items[1].cast_member_id.id });
    expect(spyDelete).toHaveBeenCalledTimes(2);
    expect(repository.items).toHaveLength(1);

    await useCase.execute({ id: items[0].cast_member_id.id });
    expect(spyDelete).toHaveBeenCalledTimes(3);
    expect(repository.items).toHaveLength(0);
  });
});
