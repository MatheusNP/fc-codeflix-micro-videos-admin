import {
  AudioVideoMedia,
  AudioVideoMediaStatus,
} from '@core/shared/domain/value-objects/audio-video-media.vo';
import { VideoId } from './video.aggregate';
import {
  InvalidMediaFileSizeError,
  InvalidMediaMimeTypeError,
  MediaFileValidator,
} from '@core/shared/domain/validators/media-file.validator';
import { Either } from '@core/shared/domain/either';

export class Trailer extends AudioVideoMedia {
  static max_size = 1024 * 1024 * 500;
  static mime_types = ['video/mp4'];

  static createFromFile({
    raw_name,
    mime_type,
    size,
    video_id,
  }: {
    raw_name: string;
    mime_type: string;
    size: number;
    video_id: VideoId;
  }) {
    const mediaFileValidator = new MediaFileValidator(
      Trailer.max_size,
      Trailer.mime_types,
    );

    return Either.safe<
      Trailer,
      InvalidMediaFileSizeError | InvalidMediaMimeTypeError
    >(() => {
      const { name } = mediaFileValidator.validate({
        raw_name,
        mime_type,
        size,
      });

      return Trailer.create({
        name: `${video_id.id}-${name}`,
        raw_location: `videos/${video_id.id}/videos`,
      });
    });
  }

  static create({
    name,
    raw_location,
  }: {
    name: string;
    raw_location: string;
  }) {
    return new Trailer({
      name,
      raw_location,
      status: AudioVideoMediaStatus.PENDING,
    });
  }

  process() {
    return new Trailer({
      name: this.name,
      raw_location: this.raw_location,
      status: AudioVideoMediaStatus.PROCESSING,
      encoded_location: this.encoded_location!,
    });
  }

  complete(encoded_location: string) {
    return new Trailer({
      name: this.name,
      raw_location: this.raw_location,
      status: AudioVideoMediaStatus.COMPLETED,
      encoded_location,
    });
  }

  fail() {
    return new Trailer({
      name: this.name,
      raw_location: this.raw_location,
      status: AudioVideoMediaStatus.FAILED,
      encoded_location: this.encoded_location!,
    });
  }
}
