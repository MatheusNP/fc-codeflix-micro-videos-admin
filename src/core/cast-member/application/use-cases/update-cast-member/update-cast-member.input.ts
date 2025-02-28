import { CastMemberType } from '@core/cast-member/domain/cast-member.type';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  validateSync,
} from 'class-validator';

type UpdateCastMemberInputConstructorProps = {
  id: string;
  name?: string;
  type?: CastMemberType;
};

export class UpdateCastMemberInput {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsEnum(CastMemberType)
  @IsOptional()
  type?: CastMemberType;

  constructor(props: UpdateCastMemberInputConstructorProps) {
    if (!props) return;
    this.id = props.id;
    props.name && (this.name = props.name);
    props.type && (this.type = props.type);
  }
}

export class ValidateUpdateCastMemberInput {
  static validate(input: UpdateCastMemberInput) {
    return validateSync(input);
  }
}
