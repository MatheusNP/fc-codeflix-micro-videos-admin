import { IDomainEvent } from '@core/shared/domain/events/domain-event.interface';
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
}
