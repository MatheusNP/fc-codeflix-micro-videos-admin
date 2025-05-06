import { CastMember } from '@core/cast-member/domain/cast-member.aggregate';
import { CastMemberInMemoryRepository } from '@core/cast-member/infra/db/in-memory/cast-member-in-memory.repository';
import { Category } from '@core/category/domain/category.aggregate';
import { CategoryInMemoryRepository } from '@core/category/infra/db/in-memory/category-in-memory.repository';
import { Genre } from '@core/genre/domain/genre.aggregate';
import { GenreInMemoryRepository } from '@core/genre/infra/db/in-memory/genre-in-memory.repository';
import { NotFoundError } from '@core/shared/domain/errors/not-found.error';
import { Video, VideoId } from '@core/video/domain/video.aggregate';
import { VideoInMemoryRepository } from '@core/video/infra/db/in-memory/video-in-memory.repository';
import { GetVideoUseCase } from '../get-video.use-case';

describe('GetVideoUseCase Unit Tests', () => {
  let useCase: GetVideoUseCase;
  let videoRepo: VideoInMemoryRepository;
  let categoryRepo: CategoryInMemoryRepository;
  let genreRepo: GenreInMemoryRepository;
  let castMemberRepo: CastMemberInMemoryRepository;

  beforeEach(() => {
    videoRepo = new VideoInMemoryRepository();
    categoryRepo = new CategoryInMemoryRepository();
    genreRepo = new GenreInMemoryRepository();
    castMemberRepo = new CastMemberInMemoryRepository();
    useCase = new GetVideoUseCase(
      videoRepo,
      categoryRepo,
      genreRepo,
      castMemberRepo,
    );
  });

  it('should throws error when entity not found', async () => {
    const videoId = new VideoId();
    await expect(() => useCase.execute({ id: videoId.id })).rejects.toThrow(
      new NotFoundError(videoId.id, Video),
    );
  });

  it('should returns a video', async () => {
    const category = Category.fake().aCategory().build();
    const genre = Genre.fake().aGenre().build();
    const castMember = CastMember.fake().anActor().build();
    await categoryRepo.insert(category);
    await genreRepo.insert(genre);
    await castMemberRepo.insert(castMember);
    const video = Video.fake()
      .aVideoWithoutMedias()
      .addCategoryId(category.category_id)
      .addGenreId(genre.genre_id)
      .addCastMemberId(castMember.cast_member_id)
      .build();
    await videoRepo.insert(video);
    const spyVideoFindById = jest.spyOn(videoRepo, 'findById');
    const spyCategoryFindByIds = jest.spyOn(categoryRepo, 'findByIds');
    const spyGenreFindByIds = jest.spyOn(genreRepo, 'findByIds');
    const spyCastMemberFindByIds = jest.spyOn(castMemberRepo, 'findByIds');

    const output = await useCase.execute({ id: video.video_id.id });

    expect(spyVideoFindById).toHaveBeenCalledTimes(1);
    expect(spyCategoryFindByIds).toHaveBeenCalledTimes(1);
    expect(spyGenreFindByIds).toHaveBeenCalledTimes(1);
    expect(spyCastMemberFindByIds).toHaveBeenCalledTimes(1);
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
      genres: expect.arrayContaining(
        [genre].map((c) => ({
          id: c.genre_id.id,
          name: c.name,
          is_active: c.is_active,
          categories_id: Array.from(c.categories_id.values()).map(
            (cc) => cc.id,
          ),
          categories: [],
          created_at: c.created_at,
        })),
      ),
      cast_members: expect.arrayContaining(
        [castMember].map((c) => ({
          id: c.cast_member_id.id,
          name: c.name,
          created_at: c.created_at,
          type: c.type.type,
        })),
      ),
      categories_id: expect.arrayContaining([category.category_id.id]),
      genres_id: expect.arrayContaining([genre.genre_id.id]),
      cast_members_id: expect.arrayContaining([castMember.cast_member_id.id]),
      created_at: video.created_at,
    });
  });
});
