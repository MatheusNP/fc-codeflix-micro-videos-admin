import { CastMemberSequelizeRepository } from '@core/cast-member/infra/db/sequelize/cast-member-sequelize.repository';
import { UpdateCastMemberUseCase } from '../update-cast-member.use-case';
import { setupSequelize } from '@core/shared/infra/testing/helpers';
import { CastMemberModel } from '@core/cast-member/infra/db/sequelize/cast-member.model';
import { InvalidUuidError } from '@core/shared/domain/value-objects/uuid.vo';
import { NotFoundError } from '@core/shared/domain/errors/not-found.error';
import {
  CastMember,
  CastMemberId,
} from '@core/cast-member/domain/cast-member.aggregate';
import { CastMemberOutputMapper } from '../../common/cast-member-output';
import { CastMemberTypes } from '@core/cast-member/domain/cast-member-type.vo';

describe('DeleteCastMemberUseCase Integration Tests', () => {
  let repository: CastMemberSequelizeRepository;
  let useCase: UpdateCastMemberUseCase;

  setupSequelize({ models: [CastMemberModel] });

  beforeEach(() => {
    repository = new CastMemberSequelizeRepository(CastMemberModel);
    useCase = new UpdateCastMemberUseCase(repository);
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

  it('should update a cast member', async () => {
    const items = CastMember.fake().theCastMembers(3).build();
    await repository.bulkInsert(items);

    const arrange = [
      {
        input: {
          id: items[0].cast_member_id.id,
          name: 'Actor',
        },
        expected: {
          id: items[0].cast_member_id.id,
          name: 'Actor',
          type: items[0].type.type,
          created_at: items[0].created_at,
        },
      },
      {
        input: {
          id: items[1].cast_member_id.id,
          type: CastMemberTypes.DIRECTOR,
        },
        expected: {
          id: items[1].cast_member_id.id,
          name: items[1].name,
          type: CastMemberTypes.DIRECTOR,
          created_at: items[1].created_at,
        },
      },
      {
        input: {
          id: items[2].cast_member_id.id,
          name: 'new name',
          type: CastMemberTypes.DIRECTOR,
        },
        expected: {
          id: items[2].cast_member_id.id,
          name: 'new name',
          type: CastMemberTypes.DIRECTOR,
          created_at: items[2].created_at,
        },
      },
    ];

    for (const { input, expected } of arrange) {
      const output = await useCase.execute(input);
      expect(output).toStrictEqual(expected);

      const castMember = await repository.findById(new CastMemberId(input.id));
      expect(CastMemberOutputMapper.toOutput(castMember!)).toStrictEqual(
        expected,
      );
    }
  });
});
