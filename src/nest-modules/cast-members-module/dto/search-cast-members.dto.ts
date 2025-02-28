import { ListCastMembersInput } from '@core/cast-member/application/use-cases/list-cast-members/list-cast-members.use-case';
import { CastMemberType } from '@core/cast-member/domain/cast-member.type';
import { SortDirection } from '@core/shared/domain/repository/search-params';
import { IsEnum, ValidateNested } from 'class-validator';

export class CastMemberTypeFilter {
  name?: string;
  @IsEnum(CastMemberType)
  type?: CastMemberType;
}

export class SearchCastMembersDto implements ListCastMembersInput {
  page?: number;
  per_page?: number;
  sort?: string;
  sort_dir?: SortDirection;
  @ValidateNested()
  filter?: CastMemberTypeFilter;
}
