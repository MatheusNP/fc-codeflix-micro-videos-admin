import { IUseCase } from '@core/shared/application/use-case.interface';
import { ListGenresInput } from './list-genres.input';
import {
  GenreSearchParams,
  GenreSearchResult,
  IGenreRepository,
} from '@core/genre/domain/genre.repository';
import { ICategoryRepository } from '@core/category/domain/category.repository';
import { CategoryId } from '@core/category/domain/category.aggregate';
import { GenreOutput, GenreOutputMapper } from '../common/genre-output';
import {
  PaginationOutput,
  PaginationOutputMapper,
} from '@core/shared/application/pagination-output';

export class ListGenresUseCase
  implements IUseCase<ListGenresInput, ListGenresOutput>
{
  constructor(
    private genreRepository: IGenreRepository,
    private categoryRepository: ICategoryRepository,
  ) {}

  async execute(input: ListGenresInput): Promise<ListGenresOutput> {
    const params = GenreSearchParams.create(input);
    const searchResult = await this.genreRepository.search(params);
    return this.toOutput(searchResult);
  }

  private async toOutput(
    searchResult: GenreSearchResult,
  ): Promise<ListGenresOutput> {
    const { items: _items } = searchResult;

    const categoriesIdRelated = _items.reduce<CategoryId[]>((acc, item) => {
      return acc.concat([...item.categories_id.values()]);
    }, []);

    const categoriesRelated =
      await this.categoryRepository.findByIds(categoriesIdRelated);

    const items = _items.map((item) => {
      const categoriesOfGenre = categoriesRelated.filter((category) =>
        item.categories_id.has(category.category_id.id),
      );
      return GenreOutputMapper.toOutput(item, categoriesOfGenre);
    });

    return PaginationOutputMapper.toOutput(items, searchResult);
  }
}

export type ListGenresOutput = PaginationOutput<GenreOutput>;
