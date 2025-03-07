import { CastMember } from '@core/cast-member/domain/cast-member.aggregate';
import { CastMemberOutputMapper } from './cast-member-output';
import { CastMemberType } from '@core/cast-member/domain/cast-member.type';

describe('CastMemberOutputMapper Unit Tests', () => {
  it('should convert a cast member to output', () => {
    const entity = CastMember.fake()
      .aCastMember()
      .withName('test')
      .withType(CastMemberType.ACTOR)
      .build();

    const spyToJSON = jest.spyOn(entity, 'toJSON');
    const output = CastMemberOutputMapper.toOutput(entity);

    expect(spyToJSON).toHaveBeenCalledTimes(1);
    expect(output).toStrictEqual({
      id: entity.cast_member_id.id,
      name: entity.name,
      type: entity.type,
      created_at: entity.created_at,
    });
  });
});
