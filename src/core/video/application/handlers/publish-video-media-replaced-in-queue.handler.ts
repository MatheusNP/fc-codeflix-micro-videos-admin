import { IDomainEventHandler } from '@core/shared/application/domain-event-handler.interface';
import { VideoAudioMediaReplacedEvent } from '@core/video/domain/domain-events/video-audio-media-replaced.event';
import { OnEvent } from '@nestjs/event-emitter';

export class PublishVideoMediaReplacedInQueueHandler
  implements IDomainEventHandler
{
  @OnEvent(VideoAudioMediaReplacedEvent.name)
  async handle(event: VideoAudioMediaReplacedEvent): Promise<void> {
    console.log(event);
  }
}
