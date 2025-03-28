import { MaxLength } from 'class-validator';
import { Video } from './video.aggregate';
import { ClassValidatorFields } from '@core/shared/domain/validators/class-validator-fields';
import { Notification } from '@core/shared/domain/validators/notification';

export class VideoRules {
  @MaxLength(255, { groups: ['title'] })
  title: string;

  constructor(aggregate: Video) {
    Object.assign(this, aggregate);
  }
}

export class VideoValidator extends ClassValidatorFields {
  validate(
    notification: Notification,
    entity: Video,
    fields?: string[],
  ): boolean {
    const newFields = fields?.length ? fields : ['title'];
    return super.validate(notification, new VideoRules(entity), newFields);
  }
}

export class VideoValidatorFactory {
  static create() {
    return new VideoValidator();
  }
}

export default VideoValidatorFactory;
