import { ClassValidatorFields } from '@core/shared/domain/validators/class-validator-fields';
import { Notification } from '@core/shared/domain/validators/notification';
import { CastMemberType } from './cast-member.type';
import { CastMember } from './cast-member.entity';
import { IsEnum, MaxLength } from 'class-validator';

class CastMemberRules {
  @MaxLength(255, { groups: ['name'] })
  name: string;
  @IsEnum(CastMemberType, { groups: ['type'] })
  type: CastMemberType;

  constructor(entity: CastMember) {
    Object.assign(this, entity);
  }
}

class CastMemberValidator extends ClassValidatorFields {
  validate(notification: Notification, data: any, fields?: string[]): boolean {
    const newFields = fields?.length ? fields : ['name', 'type'];
    return super.validate(notification, new CastMemberRules(data), newFields);
  }
}

export class CastMemberValidatorFactory {
  static create() {
    return new CastMemberValidator();
  }
}
