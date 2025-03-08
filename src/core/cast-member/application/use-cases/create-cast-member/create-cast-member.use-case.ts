import { CastMember } from '@core/cast-member/domain/cast-member.aggregate';
import { ICastMemberRepository } from '@core/cast-member/domain/cast-member.repository';
import { IUseCase } from '@core/shared/application/use-case.interface';
import { EntityValidationError } from '@core/shared/domain/validators/validation.error';
import {
  CastMemberOutput,
  CastMemberOutputMapper,
} from '../common/cast-member-output';
import { CreateCastMemberInput } from './create-cast-member.input';
import { CastMemberType } from '@core/cast-member/domain/cast-member-type.vo';

export class CreateCastMemberUseCase
  implements IUseCase<CreateCastMemberInput, CreateCastMemberOutput>
{
  constructor(private castMemberRepository: ICastMemberRepository) {}

  async execute(input: CreateCastMemberInput): Promise<CreateCastMemberOutput> {
    const [type, errorCastMemberType] = CastMemberType.create(
      input.type,
    ).asArray();

    const entity = CastMember.create({ ...input, type });

    if (errorCastMemberType) {
      entity.notification.setError(errorCastMemberType.message, 'type');
    }

    if (entity.notification.hasErrors()) {
      throw new EntityValidationError(entity.notification.toJSON());
    }

    await this.castMemberRepository.insert(entity);
    return CastMemberOutputMapper.toOutput(entity);
  }
}

export type CreateCastMemberOutput = CastMemberOutput;
