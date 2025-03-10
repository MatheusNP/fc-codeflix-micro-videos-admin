import { setupSequelize } from '@core/shared/infra/testing/helpers';
import { CastMemberModel } from '../cast-member.model';
import { CastMemberModelMapper } from '../cast-member-model-mapper';
import { LoadEntityError } from '@core/shared/domain/validators/validation.error';
import {
  CastMember,
  CastMemberId,
} from '@core/cast-member/domain/cast-member.aggregate';
import {
  CastMemberType,
  CastMemberTypes,
} from '@core/cast-member/domain/cast-member-type.vo';

describe('CastMemberSequelizeRepository Integration Tests', () => {
  setupSequelize({
    models: [CastMemberModel],
  });

  it('should throws error when cast member is invalid', () => {
    expect.assertions(2);
    const model = CastMemberModel.build({
      cast_member_id: '123e4567-e89b-12d3-a456-426655440000',
      name: 't'.repeat(256),
      type: CastMemberTypes.ACTOR,
      created_at: new Date(),
    });
    try {
      CastMemberModelMapper.toEntity(model);
      fail(
        'The cast member is invalid, but it needs to throw a LoadEntityError',
      );
    } catch (e) {
      expect(e).toBeInstanceOf(LoadEntityError);
      expect((e as LoadEntityError).errors).toMatchObject([
        {
          name: ['name must be shorter than or equal to 255 characters'],
        },
      ]);
    }
  });

  it('should convert a cast member model to a cast member entity', () => {
    const created_at = new Date();
    const model = CastMemberModel.build({
      cast_member_id: '123e4567-e89b-12d3-a456-426655440000',
      name: 'Actor',
      type: CastMemberTypes.ACTOR,
      created_at,
    });

    const entity = CastMemberModelMapper.toEntity(model);
    expect(entity.toJSON()).toStrictEqual(
      new CastMember({
        cast_member_id: new CastMemberId(
          '123e4567-e89b-12d3-a456-426655440000',
        ),
        name: 'Actor',
        type: CastMemberType.createAnActor(),
        created_at,
      }).toJSON(),
    );
  });

  it('should convert a cast member entity to a cast member model', () => {
    const created_at = new Date();
    const entity = new CastMember({
      cast_member_id: new CastMemberId('123e4567-e89b-12d3-a456-426655440000'),
      name: 'Actor',
      type: CastMemberType.createAnActor(),
      created_at,
    });
    const model = CastMemberModelMapper.toModel(entity);
    expect(model.toJSON()).toStrictEqual({
      cast_member_id: '123e4567-e89b-12d3-a456-426655440000',
      name: 'Actor',
      type: CastMemberTypes.ACTOR,
      created_at,
    });
  });
});
