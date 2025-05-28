import { CastMember } from '@core/cast-member/domain/cast-member.aggregate';
import { ICastMemberRepository } from '@core/cast-member/domain/cast-member.repository';
import { CastMemberSequelizeRepository } from '@core/cast-member/infra/db/sequelize/cast-member-sequelize.repository';
import { CastMemberModel } from '@core/cast-member/infra/db/sequelize/cast-member.model';
import { Category } from '@core/category/domain/category.aggregate';
import { ICategoryRepository } from '@core/category/domain/category.repository';
import { CategorySequelizeRepository } from '@core/category/infra/db/sequelize/category-sequelize.repository';
import { CategoryModel } from '@core/category/infra/db/sequelize/category.model';
import { Genre } from '@core/genre/domain/genre.aggregate';
import { IGenreRepository } from '@core/genre/domain/genre.repository';
import { GenreModel } from '@core/genre/infra/db/sequelize/genre-model';
import { GenreSequelizeRepository } from '@core/genre/infra/db/sequelize/genre-sequelize.repository';
import { IStorage } from '@core/shared/application/storage.interface';
import { NotFoundError } from '@core/shared/domain/errors/not-found.error';
import { EntityValidationError } from '@core/shared/domain/validators/validation.error';
import { Config } from '@core/shared/infra/config';
import { UnitOfWorkSequelize } from '@core/shared/infra/db/sequelize/unit-of-work-sequelize';
import { GoogleCloudStorage } from '@core/shared/infra/storage/google-cloud.storage';
import { Video } from '@core/video/domain/video.aggregate';
import { IVideoRepository } from '@core/video/domain/video.repository';
import { setupSequelizeForVideo } from '@core/video/infra/db/sequelize/testing/helpers';
import { VideoSequelizeRepository } from '@core/video/infra/db/sequelize/video-sequelize.repository';
import { VideoModel } from '@core/video/infra/db/sequelize/video.model';
import { Storage as GoogleCloudStorageSdk } from '@google-cloud/storage';
import { UploadAudioVideoMediasUseCase } from '../upload-audio-video-medias.use-case';

describe('UploadAudioVideoMediasUseCase Integration Tests', () => {
  let uploadAudioVideoMediasUseCase: UploadAudioVideoMediasUseCase;
  let videoRepo: IVideoRepository;
  let categoryRepo: ICategoryRepository;
  let genreRepo: IGenreRepository;
  let castMemberRepo: ICastMemberRepository;
  let uow: UnitOfWorkSequelize;
  let storageService: IStorage;
  const sequelizeHelper = setupSequelizeForVideo();
  const storageSdk = new GoogleCloudStorageSdk({
    credentials: Config.googleCredentials(),
  });

  beforeEach(() => {
    uow = new UnitOfWorkSequelize(sequelizeHelper.sequelize);
    categoryRepo = new CategorySequelizeRepository(CategoryModel);
    genreRepo = new GenreSequelizeRepository(GenreModel, uow);
    castMemberRepo = new CastMemberSequelizeRepository(CastMemberModel);
    videoRepo = new VideoSequelizeRepository(VideoModel, uow);
    storageService = new GoogleCloudStorage(storageSdk, Config.bucketName());

    uploadAudioVideoMediasUseCase = new UploadAudioVideoMediasUseCase(
      uow,
      videoRepo,
      storageService,
    );
  });

  it('should throw error when video not found', async () => {
    await expect(
      uploadAudioVideoMediasUseCase.execute({
        video_id: '4e9e2e4e-4b4a-4b4a-8b8b-8b8b8b8b8b8b',
        field: 'trailer',
        file: {
          raw_name: 'trailer.mp4',
          data: Buffer.from(''),
          mime_type: 'video/mp4',
          size: 100,
        },
      }),
    ).rejects.toThrowError(
      new NotFoundError('4e9e2e4e-4b4a-4b4a-8b8b-8b8b8b8b8b8b', Video),
    );
  });

  it('should throw error when video is invalid', async () => {
    expect.assertions(2);
    const category = Category.fake().aCategory().build();
    await categoryRepo.insert(category);
    const genre = Genre.fake()
      .aGenre()
      .addCategoryId(category.category_id)
      .build();
    await genreRepo.insert(genre);
    const castMember = CastMember.fake().anActor().build();
    await castMemberRepo.insert(castMember);
    const video = Video.fake()
      .aVideoWithoutMedias()
      .addCategoryId(category.category_id)
      .addGenreId(genre.genre_id)
      .addCastMemberId(castMember.cast_member_id)
      .build();

    await videoRepo.insert(video);

    try {
      await uploadAudioVideoMediasUseCase.execute({
        video_id: video.video_id.id,
        field: 'trailer',
        file: {
          raw_name: 'trailer.mp4',
          data: Buffer.from(''),
          mime_type: 'video/mov',
          size: 100,
        },
      });
    } catch (error) {
      expect(error).toBeInstanceOf(EntityValidationError);
      expect(error.errors).toEqual([
        {
          trailer: [
            'Invalid media file mime type. Expected one of [video/mp4], received video/mov',
          ],
        },
      ]);
    }
  }, 10000);

  it('should upload trailer video', async () => {
    const storeSpy = jest.spyOn(storageService, 'store');
    const category = Category.fake().aCategory().build();
    await categoryRepo.insert(category);
    const genre = Genre.fake()
      .aGenre()
      .addCategoryId(category.category_id)
      .build();
    await genreRepo.insert(genre);
    const castMember = CastMember.fake().anActor().build();
    await castMemberRepo.insert(castMember);
    const video = Video.fake()
      .aVideoWithoutMedias()
      .addCategoryId(category.category_id)
      .addGenreId(genre.genre_id)
      .addCastMemberId(castMember.cast_member_id)
      .build();

    await videoRepo.insert(video);

    await uploadAudioVideoMediasUseCase.execute({
      video_id: video.video_id.id,
      field: 'trailer',
      file: {
        raw_name: 'trailer.mp4',
        data: Buffer.from('test data'),
        mime_type: 'video/mp4',
        size: 100,
      },
    });

    const videoUpdated = await videoRepo.findById(video.video_id);
    expect(videoUpdated!.trailer).toBeDefined();
    expect(videoUpdated!.trailer!.name.includes('.mp4')).toBeTruthy();
    expect(videoUpdated!.trailer!.raw_location).toBe(
      `videos/${videoUpdated!.video_id.id}/videos`,
    );
    expect(storeSpy).toHaveBeenCalledWith({
      data: Buffer.from('test data'),
      id: videoUpdated!.trailer!.raw_url,
      mime_type: 'video/mp4',
    });
  }, 10000);
});
