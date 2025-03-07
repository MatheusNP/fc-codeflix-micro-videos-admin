import { CastMember } from '@core/cast-member/domain/cast-member.aggregate';
import { CastMemberType } from '@core/cast-member/domain/cast-member.type';

export type CastMemberOutput = {
  id: string;
  name: string;
  type: CastMemberType;
  created_at: Date;
};
export class CastMemberOutputMapper {
  static toOutput(entity: CastMember): CastMemberOutput {
    const { cast_member_id, ...otherProps } = entity.toJSON();
    return {
      id: cast_member_id,
      ...otherProps,
    };
  }
}
