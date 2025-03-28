import {
  InvalidMediaFileSizeError,
  InvalidMediaMimeTypeError,
  MediaFileValidator,
} from '../media-file.validator';

describe('MediaFileValidator Unit Tests', () => {
  const validator = new MediaFileValidator(1024 * 1024, [
    'image/jpeg',
    'image/png',
  ]);

  it('should throw an error if the file size is invalid', () => {
    expect(() =>
      validator.validate({
        raw_name: 'test.png',
        mime_type: 'image/png',
        size: validator['max_size'] + 1,
      }),
    ).toThrow(
      new InvalidMediaFileSizeError(
        validator['max_size'] + 1,
        validator['max_size'],
      ),
    );
  });

  it('should throw an error if the mime type is invalid', () => {
    expect(() =>
      validator.validate({
        raw_name: 'test.txt',
        mime_type: 'text/plain',
        size: validator['max_size'],
      }),
    ).toThrow(
      new InvalidMediaMimeTypeError(
        'text/plain',
        validator['valid_mime_types'],
      ),
    );
  });

  it('should return a valid file name', () => {
    const { name } = validator.validate({
      raw_name: 'test.png',
      mime_type: 'image/png',
      size: validator['max_size'],
    });
    expect(name).toMatch(/.png$/);
    expect(name).toHaveLength(68);
  });
});
