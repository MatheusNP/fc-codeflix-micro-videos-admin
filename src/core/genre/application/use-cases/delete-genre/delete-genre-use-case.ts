import { GenreId } from '@core/genre/domain/genre.aggregate';
import { IGenreRepository } from '@core/genre/domain/genre.repository';
import { IUseCase } from '@core/shared/application/use-case.interface';
import { IUnitOfWork } from '@core/shared/domain/repository/unit-of-work.interface';

export class DeleteGenreUseCase
  implements IUseCase<DeleteGenreInput, DeleteGenreOutput>
{
  constructor(
    private uow: IUnitOfWork,
    private readonly genreRepo: IGenreRepository,
  ) {}

  async execute(input: DeleteGenreInput): Promise<void> {
    const genreId = new GenreId(input.id);
    return this.uow.do(async () => {
      await this.genreRepo.delete(genreId);
    });
  }
}

export type DeleteGenreInput = {
  id: string;
};

export type DeleteGenreOutput = void;
