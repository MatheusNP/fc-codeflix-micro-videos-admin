import {
  IDomainEvent,
  IIntegrationEvent,
} from '@core/shared/domain/events/domain-event.interface';
import { Trailer } from '../trailer.vo';
import { VideoMedia } from '../video-media.vo';
import { VideoId } from '../video.aggregate';

export type VideoAudioMediaReplacedEventProps = {
  aggregate_id: VideoId;
  media: Trailer | VideoMedia;
  media_type: 'trailer' | 'video';
};

export class VideoAudioMediaReplacedEvent implements IDomainEvent {
  aggregate_id: VideoId;
  occurred_on: Date;
  event_version: number;

  readonly media: Trailer | VideoMedia;
  readonly media_type: 'trailer' | 'video';

  constructor(props: VideoAudioMediaReplacedEventProps) {
    this.aggregate_id = props.aggregate_id;
    this.occurred_on = new Date();
    this.event_version = 1;
    this.media = props.media;
    this.media_type = props.media_type;
  }

  getIntegrationEvent(): VideoAudioMediaUploadedIntegrationEvent {
    return new VideoAudioMediaUploadedIntegrationEvent(this);
  }
}

export class VideoAudioMediaUploadedIntegrationEvent
  implements IIntegrationEvent
{
  event_version: number;
  occurred_on: Date;
  payload: any;
  event_name: string;

  constructor(event: VideoAudioMediaReplacedEvent) {
    this.event_version = event.event_version;
    this.occurred_on = event.occurred_on;
    this.payload = {
      video_id: event.aggregate_id.id,
      media: event.media.toJSON(),
    };
    this.event_name = this.constructor.name;
  }
}
