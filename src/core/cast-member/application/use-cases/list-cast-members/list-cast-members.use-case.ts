import {
  CastMemberFilter,
  CastMemberSearchParams,
  CastMemberSearchResult,
} from '@core/cast-member/domain/cast-member.repository';
import {
  PaginationOutput,
  PaginationOutputMapper,
} from '@core/shared/application/pagination-output';
import { IUseCase } from '@core/shared/application/use-case.interface';
import { SortDirection } from '@core/shared/domain/repository/search-params';
import {
  CastMemberOutput,
  CastMemberOutputMapper,
} from '../common/cast-member-output';

export class ListCastMembersUseCase
  implements IUseCase<ListCastMembersInput, ListCastMembersOutput>
{
  constructor(private castMemberRepository: any) {}

  async execute(input: ListCastMembersInput): Promise<ListCastMembersOutput> {
    const params = CastMemberSearchParams.create(input);
    const searchResult = await this.castMemberRepository.search(params);

    return this.toOutput(searchResult);
  }

  private toOutput(
    searchResult: CastMemberSearchResult,
  ): ListCastMembersOutput {
    const { items: _items } = searchResult;
    const items = _items.map(CastMemberOutputMapper.toOutput);
    return PaginationOutputMapper.toOutput(items, searchResult);
  }
}

export type ListCastMembersInput = {
  page?: number;
  per_page?: number;
  sort?: string | null;
  sort_dir?: SortDirection | null;
  filter?: CastMemberFilter | null;
};

export type ListCastMembersOutput = PaginationOutput<CastMemberOutput>;
