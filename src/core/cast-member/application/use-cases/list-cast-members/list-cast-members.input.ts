import { CastMemberTypes } from '@core/cast-member/domain/cast-member-type.vo';
import { SearchInput } from '@core/shared/application/seach-input';
import { SortDirection } from '@core/shared/domain/repository/search-params';
import { IsInt, ValidateNested, validateSync } from 'class-validator';

export class ListCastMembersFilter {
  name?: string | null;
  @IsInt()
  type?: CastMemberTypes | null;
}

export class ListCastMembersInput
  implements SearchInput<ListCastMembersFilter>
{
  page?: number;
  per_page?: number;
  sort?: string;
  sort_dir?: SortDirection;
  @ValidateNested()
  filter?: ListCastMembersFilter;
}

export class ValidateListCastMembersInput {
  static validate(input: ListCastMembersInput) {
    return validateSync(input);
  }
}
