import { CastMemberSequelizeRepository } from '@core/cast-member/infra/db/sequelize/cast-member-sequelize.repository';
import { DeleteCastMemberUseCase } from '../delete-cast-member.use-case';
import { CastMemberModel } from '@core/cast-member/infra/db/sequelize/cast-member.model';
import { InvalidUuidError } from '@core/shared/domain/value-objects/uuid.vo';
import { CastMember } from '@core/cast-member/domain/cast-member.aggregate';
import { setupSequelize } from '@core/shared/infra/testing/helpers';

describe('DeleteCastMemberUseCase Integration Tests', () => {
  let repository: CastMemberSequelizeRepository;
  let useCase: DeleteCastMemberUseCase;

  setupSequelize({ models: [CastMemberModel] });

  beforeEach(() => {
    repository = new CastMemberSequelizeRepository(CastMemberModel);
    useCase = new DeleteCastMemberUseCase(repository);
  });

  it('should throw error when entity not found', async () => {
    await expect(() => useCase.execute({ id: 'fake id' })).rejects.toThrow(
      new InvalidUuidError(),
    );
  });

  it('should delete a cast member', async () => {
    const items = CastMember.fake().theCastMembers(3).build();
    await repository.bulkInsert(items);

    await useCase.execute({ id: items[2].cast_member_id.id });
    await expect(repository.findAll()).resolves.toHaveLength(2);
    await expect(
      repository.findById(items[2].cast_member_id),
    ).resolves.toBeNull();

    await useCase.execute({ id: items[1].cast_member_id.id });
    await expect(repository.findAll()).resolves.toHaveLength(1);
    await expect(
      repository.findById(items[1].cast_member_id),
    ).resolves.toBeNull();

    await useCase.execute({ id: items[0].cast_member_id.id });
    await expect(repository.findAll()).resolves.toHaveLength(0);
    await expect(
      repository.findById(items[0].cast_member_id),
    ).resolves.toBeNull();
  });
});
