import {
  CastMember,
  CastMemberId,
} from '@core/cast-member/domain/cast-member.aggregate';
import { CastMemberModel } from './cast-member.model';
import { LoadEntityError } from '@core/shared/domain/validators/validation.error';
import { CastMemberType } from '@core/cast-member/domain/cast-member-type.vo';

export class CastMemberModelMapper {
  static toModel(entity: CastMember): CastMemberModel {
    return CastMemberModel.build({
      cast_member_id: entity.cast_member_id.id,
      name: entity.name,
      type: entity.type.type,
      created_at: entity.created_at,
    });
  }

  static toEntity(model: CastMemberModel): CastMember {
    const { cast_member_id: id, ...otherData } = model.toJSON();
    const [type, errorCastMemberType] = CastMemberType.create(
      otherData.type,
    ).asArray();

    const castMember = new CastMember({
      cast_member_id: new CastMemberId(model.cast_member_id),
      name: model.name,
      type,
      created_at: model.created_at,
    });
    castMember.validate();

    if (errorCastMemberType) {
      castMember.notification.setError(errorCastMemberType.message, 'type');
    }

    if (castMember.notification.hasErrors()) {
      throw new LoadEntityError(castMember.notification.toJSON());
    }

    return castMember;
  }
}
