import { CastMembersIdExistsInDatabaseValidator } from '@core/cast-member/application/validations/cast-members-ids-exists-in-database.validator';
import { CastMember } from '@core/cast-member/domain/cast-member.aggregate';
import { CastMemberSequelizeRepository } from '@core/cast-member/infra/db/sequelize/cast-member-sequelize.repository';
import { CastMemberModel } from '@core/cast-member/infra/db/sequelize/cast-member.model';
import { CategoriesIdExistsInDatabaseValidator } from '@core/category/application/validations/categories-ids-exists-in-database.validator';
import { Category } from '@core/category/domain/category.aggregate';
import { CategorySequelizeRepository } from '@core/category/infra/db/sequelize/category-sequelize.repository';
import { CategoryModel } from '@core/category/infra/db/sequelize/category.model';
import { GenresIdExistsInDatabaseValidator } from '@core/genre/application/validations/genres-ids-exists-in-database.validator';
import { Genre } from '@core/genre/domain/genre.aggregate';
import { GenreModel } from '@core/genre/infra/db/sequelize/genre-model';
import { GenreSequelizeRepository } from '@core/genre/infra/db/sequelize/genre-sequelize.repository';
import { UnitOfWorkSequelize } from '@core/shared/infra/db/sequelize/unit-of-work-sequelize';
import { RatingValues } from '@core/video/domain/rating.vo';
import { Video } from '@core/video/domain/video.aggregate';
import { setupSequelizeForVideo } from '@core/video/infra/db/sequelize/testing/helpers';
import { VideoSequelizeRepository } from '@core/video/infra/db/sequelize/video-sequelize.repository';
import { VideoModel } from '@core/video/infra/db/sequelize/video.model';
import { UpdateVideoInput } from '../update-video.input';
import { UpdateVideoUseCase } from '../update-video.use-case';

describe('UpdateVideoUseCase Integration Tests', () => {
  let useCase: UpdateVideoUseCase;
  let uow: UnitOfWorkSequelize;
  let videoRepo: VideoSequelizeRepository;
  let categoryRepo: CategorySequelizeRepository;
  let genreRepo: GenreSequelizeRepository;
  let castMemberRepo: CastMemberSequelizeRepository;
  let categoriesIdValidator: CategoriesIdExistsInDatabaseValidator;
  let genresIdValidator: GenresIdExistsInDatabaseValidator;
  let castMembersIdValidator: CastMembersIdExistsInDatabaseValidator;

  const sequelizeHelper = setupSequelizeForVideo();

  beforeEach(async () => {
    uow = new UnitOfWorkSequelize(sequelizeHelper.sequelize);
    videoRepo = new VideoSequelizeRepository(VideoModel, uow);
    categoryRepo = new CategorySequelizeRepository(CategoryModel);
    categoriesIdValidator = new CategoriesIdExistsInDatabaseValidator(
      categoryRepo,
    );
    genreRepo = new GenreSequelizeRepository(GenreModel, uow);
    genresIdValidator = new GenresIdExistsInDatabaseValidator(genreRepo);
    castMemberRepo = new CastMemberSequelizeRepository(CastMemberModel);
    castMembersIdValidator = new CastMembersIdExistsInDatabaseValidator(
      castMemberRepo,
    );

    useCase = new UpdateVideoUseCase(
      uow,
      videoRepo,
      categoriesIdValidator,
      genresIdValidator,
      castMembersIdValidator,
    );
  });

  it('should update a video', async () => {
    const category = Category.fake().aCategory().build();
    await categoryRepo.insert(category);
    const genre = Genre.fake()
      .aGenre()
      .addCategoryId(category.category_id)
      .build();
    await genreRepo.insert(genre);
    const castMember = CastMember.fake().anActor().build();
    await castMemberRepo.insert(castMember);

    const entity = Video.fake()
      .aVideoWithoutMedias()
      .addCategoryId(category.category_id)
      .addGenreId(genre.genre_id)
      .addCastMemberId(castMember.cast_member_id)
      .build();
    await videoRepo.insert(entity);

    let output = await useCase.execute({
      id: entity.video_id.id,
      title: 'test',
      description: 'test',
      year_launched: 2021,
      duration: 120,
      rating: RatingValues.R10,
      is_opened: true,
      categories_id: [category.category_id.id],
      genres_id: [genre.genre_id.id],
      cast_members_id: [castMember.cast_member_id.id],
    });

    expect(output).toStrictEqual({
      id: entity.video_id.id,
    });
  });

  it('rollback transaction', async () => {
    const category = Category.fake().aCategory().build();
    await categoryRepo.insert(category);
    const genre = Genre.fake()
      .aGenre()
      .addCategoryId(category.category_id)
      .build();
    await genreRepo.insert(genre);
    const castMember = CastMember.fake().anActor().build();
    await castMemberRepo.insert(castMember);

    const entity = Video.fake()
      .aVideoWithoutMedias()
      .addCategoryId(category.category_id)
      .addGenreId(genre.genre_id)
      .addCastMemberId(castMember.cast_member_id)
      .build();
    await videoRepo.insert(entity);

    VideoModel.afterBulkUpdate('hook-test', () => {
      return Promise.reject(new Error('Generic Error'));
    });

    await expect(
      useCase.execute(
        new UpdateVideoInput({
          id: entity.video_id.id,
          title: 'test',
          description: 'test',
          year_launched: 2021,
          duration: 120,
          rating: RatingValues.R10,
          is_opened: true,
          categories_id: [category.category_id.id],
          genres_id: [genre.genre_id.id],
          cast_members_id: [castMember.cast_member_id.id],
        }),
      ),
    ).rejects.toThrow(new Error('Generic Error'));

    VideoModel.removeHook('afterBulkUpdate', 'hook-test');

    const notUpdateVideo = await videoRepo.findById(entity.video_id);
    expect(notUpdateVideo!.title).toStrictEqual(entity.title);
  });
});
