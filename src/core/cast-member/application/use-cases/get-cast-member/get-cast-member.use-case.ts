import { IUseCase } from '@core/shared/application/use-case.interface';
import {
  CastMemberOutput,
  CastMemberOutputMapper,
} from '../common/cast-member-output';
import { ICastMemberRepository } from '@core/cast-member/domain/cast-member.repository';
import { Uuid } from '@core/shared/domain/value-objects/uuid.vo';
import { CastMember } from '@core/cast-member/domain/cast-member.entity';
import { NotFoundError } from '@core/shared/domain/errors/not-found.error';

export class GetCastMemberUseCase
  implements IUseCase<GetCastMemberUseCaseInput, GetCastMemberUseCaseOutput>
{
  constructor(private castMemberRepository: ICastMemberRepository) {}

  async execute(input: GetCastMemberUseCaseInput): Promise<CastMemberOutput> {
    const castMember = await this.castMemberRepository.findById(
      new Uuid(input.id),
    );
    if (!castMember) {
      throw new NotFoundError(input.id, CastMember);
    }

    return CastMemberOutputMapper.toOutput(castMember);
  }
}

export type GetCastMemberUseCaseInput = {
  id: string;
};

export type GetCastMemberUseCaseOutput = CastMemberOutput;
