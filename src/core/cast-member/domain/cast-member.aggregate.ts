import { Uuid } from '@core/shared/domain/value-objects/uuid.vo';
import { CastMemberValidatorFactory } from './cast-member.validator';
import { CastMemberFakeBuilder } from './cast-member-fake.builder';
import { AggregateRoot } from '@core/shared/domain/aggregate-root';
import { CastMemberType } from './cast-member-type.vo';

export type CastMemberConstructorProps = {
  cast_member_id?: CastMemberId;
  name: string;
  type: CastMemberType;
  created_at?: Date;
};

export type CastMemberCreateCommand = {
  name: string;
  type: CastMemberType;
};

export class CastMemberId extends Uuid {}

export class CastMember extends AggregateRoot {
  cast_member_id: CastMemberId;
  name: string;
  type: CastMemberType;
  created_at: Date;

  constructor(props: CastMemberConstructorProps) {
    super();
    this.cast_member_id = props.cast_member_id || new CastMemberId();
    this.name = props.name;
    this.type = props.type;
    this.created_at = props.created_at ?? new Date();
  }

  get entity_id(): CastMemberId {
    return this.cast_member_id;
  }

  changeName(name: string) {
    this.name = name;
    this.validate(['name']);
  }

  changeType(type: CastMemberType) {
    this.type = type;
  }

  static create(props: CastMemberCreateCommand) {
    const castMember = new CastMember(props);
    castMember.validate(['name']);
    return castMember;
  }

  validate(fields?: string[]) {
    const validator = CastMemberValidatorFactory.create();
    return validator.validate(this.notification, this, fields);
  }

  static fake() {
    return CastMemberFakeBuilder;
  }

  toJSON() {
    return {
      cast_member_id: this.cast_member_id.id,
      name: this.name,
      type: this.type.type,
      created_at: this.created_at,
    };
  }
}
