import { SearchInput } from '@core/shared/application/seach-input';
import { SortDirection } from '@core/shared/domain/repository/search-params';
import { IsArray, IsUUID, ValidateNested, validateSync } from 'class-validator';

export class ListGenresFilter {
  name?: string;
  @IsUUID('4', { each: true })
  @IsArray()
  categories_id?: string[];
}

export class ListGenresInput implements SearchInput<ListGenresFilter> {
  page?: number;
  per_page?: number;
  sort?: string;
  sort_dir?: SortDirection;
  @ValidateNested()
  filter?: ListGenresFilter;
}

export class validateListGenresInput {
  static validate(input: ListGenresInput) {
    return validateSync(input);
  }
}
