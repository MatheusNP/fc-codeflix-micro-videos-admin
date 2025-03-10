import { CastMemberSequelizeRepository } from '@core/cast-member/infra/db/sequelize/cast-member-sequelize.repository';
import { CreateCastMemberUseCase } from '../create-cast-member.use-case';
import { CastMemberModel } from '@core/cast-member/infra/db/sequelize/cast-member.model';
import { setupSequelize } from '@core/shared/infra/testing/helpers';
import { CastMemberId } from '@core/cast-member/domain/cast-member.aggregate';
import { CastMemberTypes } from '@core/cast-member/domain/cast-member-type.vo';

describe('CreateCastMemberUseCase Integration Tests', () => {
  let repository: CastMemberSequelizeRepository;
  let useCase: CreateCastMemberUseCase;

  setupSequelize({ models: [CastMemberModel] });

  beforeEach(() => {
    repository = new CastMemberSequelizeRepository(CastMemberModel);
    useCase = new CreateCastMemberUseCase(repository);
  });

  it('should create a new cast member', async () => {
    let output = await useCase.execute({
      name: 'test',
      type: CastMemberTypes.ACTOR,
    });
    let entity = await repository.findById(new CastMemberId(output.id));
    expect(output).toStrictEqual({
      id: entity!.cast_member_id.id,
      name: 'test',
      type: CastMemberTypes.ACTOR,
      created_at: entity!.created_at,
    });

    output = await useCase.execute({
      name: 'another',
      type: CastMemberTypes.DIRECTOR,
    });
    entity = await repository.findById(new CastMemberId(output.id));
    expect(output).toStrictEqual({
      id: entity!.cast_member_id.id,
      name: 'another',
      type: CastMemberTypes.DIRECTOR,
      created_at: entity!.created_at,
    });
  });
});
