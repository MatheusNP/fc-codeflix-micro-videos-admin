import { ICastMemberRepository } from '@core/cast-member/domain/cast-member.repository';
import { IUseCase } from '@core/shared/application/use-case.interface';
import { Uuid } from '@core/shared/domain/value-objects/uuid.vo';

export class DeleteCastMemberUseCase
  implements
    IUseCase<DeleteCastMemberUseCaseInput, DeleteCastMemberUseCaseOutput>
{
  constructor(private castMemberRepository: ICastMemberRepository) {}

  async execute(
    input: DeleteCastMemberUseCaseInput,
  ): Promise<DeleteCastMemberUseCaseOutput> {
    await this.castMemberRepository.delete(new Uuid(input.id));
  }
}

export type DeleteCastMemberUseCaseInput = {
  id: string;
};

export type DeleteCastMemberUseCaseOutput = void;
