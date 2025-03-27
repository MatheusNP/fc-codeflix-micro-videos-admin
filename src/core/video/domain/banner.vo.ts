import { Either } from '@core/shared/domain/either';
import { MediaFilerValidator } from '@core/shared/domain/validators/media-file.validator';
import { ImageMedia } from '@core/shared/domain/value-objects/image-media.vo';

export class Banner extends ImageMedia {
  static max_size = 1024 * 1024 * 2;
  static mime_types = ['image/jpeg', 'image/png', 'image/gif'];

  static createFromFile({
    raw_name,
    mime_type,
    size,
    video_id,
  }: {
    raw_name: string;
    mime_type: string;
    size: number;
    video_id: string;
  }) {
    const mediaFileValidator = new MediaFilerValidator(
      Banner.max_size,
      Banner.mime_types,
    );

    return Either.safe(() => {
      const { name } = mediaFileValidator.validate({
        raw_name,
        mime_type,
        size,
      });

      return new Banner({
        name,
        location: `videos/${video_id}/images`,
      });
    });
  }
}
