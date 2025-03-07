import { IUseCase } from '@core/shared/application/use-case.interface';
import {
  CastMemberOutput,
  CastMemberOutputMapper,
} from '../common/cast-member-output';
import { ICastMemberRepository } from '@core/cast-member/domain/cast-member.repository';
import {
  CastMember,
  CastMemberId,
} from '@core/cast-member/domain/cast-member.aggregate';
import { NotFoundError } from '@core/shared/domain/errors/not-found.error';

export class GetCastMemberUseCase
  implements IUseCase<GetCastMemberInput, GetCastMemberOutput>
{
  constructor(private castMemberRepository: ICastMemberRepository) {}

  async execute(input: GetCastMemberInput): Promise<GetCastMemberOutput> {
    const castMember = await this.castMemberRepository.findById(
      new CastMemberId(input.id),
    );
    if (!castMember) {
      throw new NotFoundError(input.id, CastMember);
    }

    return CastMemberOutputMapper.toOutput(castMember);
  }
}

export type GetCastMemberInput = {
  id: string;
};

export type GetCastMemberOutput = CastMemberOutput;
