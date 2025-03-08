import { CastMemberSequelizeRepository } from '@core/cast-member/infra/db/sequelize/cast-member-sequelize.repository';
import { GetCastMemberUseCase } from '../get-cast-member.use-case';
import { setupSequelize } from '@core/shared/infra/testing/helpers';
import { CastMemberModel } from '@core/cast-member/infra/db/sequelize/cast-member.model';
import { InvalidUuidError } from '@core/shared/domain/value-objects/uuid.vo';
import {
  CastMember,
  CastMemberId,
} from '@core/cast-member/domain/cast-member.aggregate';
import { NotFoundError } from '@core/shared/domain/errors/not-found.error';

describe('DeleteCastMemberUseCase Integration Tests', () => {
  let repository: CastMemberSequelizeRepository;
  let useCase: GetCastMemberUseCase;

  setupSequelize({ models: [CastMemberModel] });

  beforeEach(() => {
    repository = new CastMemberSequelizeRepository(CastMemberModel);
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
    const items = CastMember.fake().theCastMembers(3).build();
    await repository.bulkInsert(items);

    const output = await useCase.execute({ id: items[1].cast_member_id.id });
    expect(output).toStrictEqual({
      id: items[1].cast_member_id.id,
      name: items[1].name,
      type: items[1].type.type,
      created_at: items[1].created_at,
    });
  });
});
