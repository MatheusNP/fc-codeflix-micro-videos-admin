import { Entity } from '@core/shared/domain/entity';
import { Uuid } from '@core/shared/domain/value-objects/uuid.vo';
import { CastMemberType } from './cast-member.type';
import { CastMemberValidatorFactory } from './cast-member.validator';
import { CastMemberFakeBuilder } from './cast-member-fake.builder';

export type CastMemberConstructorProps = {
  cast_member_id?: Uuid;
  name: string;
  type: CastMemberType;
  created_at?: Date;
};

export class CastMember extends Entity {
  cast_member_id: Uuid;
  name: string;
  type: CastMemberType;
  created_at: Date;

  constructor(props: CastMemberConstructorProps) {
    super();
    this.cast_member_id = props.cast_member_id || new Uuid();
    this.name = props.name;
    this.type = props.type;
    this.created_at = props.created_at ?? new Date();
  }

  get entity_id(): Uuid {
    return this.cast_member_id;
  }

  changeName(name: string) {
    this.name = name;
    this.validate(['name']);
  }

  changeType(type: CastMemberType) {
    this.type = type;
    this.validate(['type']);
  }

  static create(props: any) {
    const castMember = new CastMember(props);
    castMember.validate(['name', 'type']);
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
      type: this.type,
      created_at: this.created_at,
    };
  }
}
