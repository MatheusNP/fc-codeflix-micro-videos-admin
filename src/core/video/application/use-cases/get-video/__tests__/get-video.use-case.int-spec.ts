import { CastMember } from '@core/cast-member/domain/cast-member.aggregate';
import { CastMemberSequelizeRepository } from '@core/cast-member/infra/db/sequelize/cast-member-sequelize.repository';
import { CastMemberModel } from '@core/cast-member/infra/db/sequelize/cast-member.model';
import { Category } from '@core/category/domain/category.aggregate';
import { CategorySequelizeRepository } from '@core/category/infra/db/sequelize/category-sequelize.repository';
import { CategoryModel } from '@core/category/infra/db/sequelize/category.model';
import { Genre } from '@core/genre/domain/genre.aggregate';
import { GenreModel } from '@core/genre/infra/db/sequelize/genre-model';
import { GenreSequelizeRepository } from '@core/genre/infra/db/sequelize/genre-sequelize.repository';
import { UnitOfWorkSequelize } from '@core/shared/infra/db/sequelize/unit-of-work-sequelize';
import { Video } from '@core/video/domain/video.aggregate';
import { setupSequelizeForVideo } from '@core/video/infra/db/sequelize/testing/helpers';
import { VideoSequelizeRepository } from '@core/video/infra/db/sequelize/video-sequelize.repository';
import { VideoModel } from '@core/video/infra/db/sequelize/video.model';
import { GetVideoUseCase } from '../get-video.use-case';

describe('GetVideoUseCase Integration Tests', () => {
  let useCase: GetVideoUseCase;
  let uow: UnitOfWorkSequelize;
  let videoRepo: VideoSequelizeRepository;
  let categoryRepo: CategorySequelizeRepository;
  let genreRepo: GenreSequelizeRepository;
  let castMemberRepo: CastMemberSequelizeRepository;

  const sequelizeHelper = setupSequelizeForVideo();

  beforeEach(async () => {
    uow = new UnitOfWorkSequelize(sequelizeHelper.sequelize);
    videoRepo = new VideoSequelizeRepository(VideoModel, uow);
    categoryRepo = new CategorySequelizeRepository(CategoryModel);
    genreRepo = new GenreSequelizeRepository(GenreModel, uow);
    castMemberRepo = new CastMemberSequelizeRepository(CastMemberModel);
    useCase = new GetVideoUseCase(
      videoRepo,
      categoryRepo,
      genreRepo,
      castMemberRepo,
    );
  });

  it('should return a video', async () => {
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

    const output = await useCase.execute({ id: video.video_id.id });

    expect(output).toStrictEqual({
      id: video.video_id.id,
      title: video.title,
      description: video.description,
      year_launched: video.year_launched,
      duration: video.duration,
      rating: video.rating.value,
      is_opened: video.is_opened,
      is_published: video.is_published,
      categories: expect.arrayContaining(
        [category].map((c) => ({
          id: c.category_id.id,
          name: c.name,
          created_at: c.created_at,
        })),
      ),
      categories_id: expect.arrayContaining([category.category_id.id]),
      genres: expect.arrayContaining(
        [genre].map((c) => ({
          id: c.genre_id.id,
          name: c.name,
          is_active: c.is_active,
          categories: expect.arrayContaining(
            [category].map((cc) => ({
              id: cc.category_id.id,
              name: cc.name,
              created_at: cc.created_at,
            })),
          ),
          categories_id: Array.from(c.categories_id.values()).map(
            (cc) => cc.id,
          ),
          created_at: c.created_at,
        })),
      ),
      genres_id: expect.arrayContaining([genre.genre_id.id]),
      cast_members: expect.arrayContaining(
        [castMember].map((c) => ({
          id: c.cast_member_id.id,
          name: c.name,
          type: c.type.type,
          created_at: c.created_at,
        })),
      ),
      cast_members_id: expect.arrayContaining([castMember.cast_member_id.id]),
      created_at: video.created_at,
    });
  });
});
