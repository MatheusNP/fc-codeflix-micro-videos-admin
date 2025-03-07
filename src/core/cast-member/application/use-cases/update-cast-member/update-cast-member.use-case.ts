import { IUseCase } from '@core/shared/application/use-case.interface';
import {
  CastMemberOutput,
  CastMemberOutputMapper,
} from '../common/cast-member-output';
import { UpdateCastMemberInput } from './update-cast-member.input';
import { ICastMemberRepository } from '@core/cast-member/domain/cast-member.repository';
import {
  CastMember,
  CastMemberId,
} from '@core/cast-member/domain/cast-member.aggregate';
import { NotFoundError } from '@core/shared/domain/errors/not-found.error';
import { EntityValidationError } from '@core/shared/domain/validators/validation-error';

export class UpdateCastMemberUseCase
  implements IUseCase<UpdateCastMemberInput, UpdateCastMemberOutput>
{
  constructor(private castMemberRepository: ICastMemberRepository) {}

  async execute(input: UpdateCastMemberInput): Promise<CastMemberOutput> {
    const castMemberId = new CastMemberId(input.id);
    const castMember = await this.castMemberRepository.findById(castMemberId);

    if (!castMember) {
      throw new NotFoundError(castMemberId.id, CastMember);
    }

    input.name && castMember.changeName(input.name);

    input.type && castMember.changeType(input.type);

    if (castMember.notification.hasErrors()) {
      throw new EntityValidationError(castMember.notification.toJSON());
    }

    await this.castMemberRepository.update(castMember);

    return CastMemberOutputMapper.toOutput(castMember);
  }
}

export type UpdateCastMemberOutput = CastMemberOutput;
