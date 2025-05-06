import { CastMembersIdExistsInDatabaseValidator } from '@core/cast-member/application/validations/cast-members-ids-exists-in-database.validator';
import { CastMember } from '@core/cast-member/domain/cast-member.aggregate';
import { CastMemberInMemoryRepository } from '@core/cast-member/infra/db/in-memory/cast-member-in-memory.repository';
import { CategoriesIdExistsInDatabaseValidator } from '@core/category/application/validations/categories-ids-exists-in-database.validator';
import { Category } from '@core/category/domain/category.aggregate';
import { CategoryInMemoryRepository } from '@core/category/infra/db/in-memory/category-in-memory.repository';
import { GenresIdExistsInDatabaseValidator } from '@core/genre/application/validations/genres-ids-exists-in-database.validator';
import { Genre } from '@core/genre/domain/genre.aggregate';
import { GenreInMemoryRepository } from '@core/genre/infra/db/in-memory/genre-in-memory.repository';
import { EntityValidationError } from '@core/shared/domain/validators/validation.error';
import { UnitOfWorkFakeInMemory } from '@core/shared/infra/db/in-memory/fake-unit-of-work-in-memory';
import { RatingValues } from '@core/video/domain/rating.vo';
import { Video } from '@core/video/domain/video.aggregate';
import { VideoInMemoryRepository } from '@core/video/infra/db/in-memory/video-in-memory.repository';
import { UpdateVideoInput } from '../update-video.input';
import { UpdateVideoUseCase } from '../update-video.use-case';

describe('UpdateVideoUseCase Unit Tests', () => {
  let useCase: UpdateVideoUseCase;
  let uow: UnitOfWorkFakeInMemory;
  let videoRepository: VideoInMemoryRepository;
  let categoryRepository: CategoryInMemoryRepository;
  let genreRepository: GenreInMemoryRepository;
  let castMemberRepository: CastMemberInMemoryRepository;
  let categoriesIdValidator: CategoriesIdExistsInDatabaseValidator;
  let genresIdValidator: GenresIdExistsInDatabaseValidator;
  let castMembersIdValidator: CastMembersIdExistsInDatabaseValidator;

  beforeEach(() => {
    uow = new UnitOfWorkFakeInMemory();
    videoRepository = new VideoInMemoryRepository();
    categoryRepository = new CategoryInMemoryRepository();
    categoriesIdValidator = new CategoriesIdExistsInDatabaseValidator(
      categoryRepository,
    );
    genreRepository = new GenreInMemoryRepository();
    genresIdValidator = new GenresIdExistsInDatabaseValidator(genreRepository);
    castMemberRepository = new CastMemberInMemoryRepository();
    castMembersIdValidator = new CastMembersIdExistsInDatabaseValidator(
      castMemberRepository,
    );
    useCase = new UpdateVideoUseCase(
      uow,
      videoRepository,
      categoriesIdValidator,
      genresIdValidator,
      castMembersIdValidator,
    );
  });

  describe('execute method', () => {
    it('should throw an entity validation error when categories, genres, cast members id not found', async () => {
      expect.assertions(5);
      const video = Video.fake().aVideoWithoutMedias().build();
      await videoRepository.insert(video);
      const spyValidateCategoriesId = jest.spyOn(
        categoriesIdValidator,
        'validate',
      );
      const spyValidateGenresId = jest.spyOn(genresIdValidator, 'validate');
      const spyValidateCastMembersId = jest.spyOn(
        castMembersIdValidator,
        'validate',
      );

      try {
        await useCase.execute(
          new UpdateVideoInput({
            id: video.video_id.id,
            title: 'test video',
            description: 'test description',
            year_launched: 2022,
            duration: 120,
            rating: RatingValues.R10,
            is_opened: true,
            categories_id: ['e70e130f-49e3-4bae-9ea1-09525d83801d'],
            genres_id: ['e70e130f-49e3-4bae-9ea1-09525d83801d'],
            cast_members_id: ['e70e130f-49e3-4bae-9ea1-09525d83801d'],
          }),
        );
      } catch (error) {
        expect(spyValidateCategoriesId).toHaveBeenCalledWith([
          'e70e130f-49e3-4bae-9ea1-09525d83801d',
        ]);
        expect(spyValidateGenresId).toHaveBeenCalledWith([
          'e70e130f-49e3-4bae-9ea1-09525d83801d',
        ]);
        expect(spyValidateCastMembersId).toHaveBeenCalledWith([
          'e70e130f-49e3-4bae-9ea1-09525d83801d',
        ]);
        expect(error).toBeInstanceOf(EntityValidationError);
        expect(error.errors).toStrictEqual([
          {
            categories_id: [
              'Category Not Found using ID e70e130f-49e3-4bae-9ea1-09525d83801d',
            ],
          },
          {
            genres_id: [
              'Genre Not Found using ID e70e130f-49e3-4bae-9ea1-09525d83801d',
            ],
          },
          {
            cast_members_id: [
              'CastMember Not Found using ID e70e130f-49e3-4bae-9ea1-09525d83801d',
            ],
          },
        ]);
      }
    });

    it('should update a video', async () => {
      const category = Category.fake().aCategory().build();
      await categoryRepository.insert(category);
      const genre = Genre.fake()
        .aGenre()
        .addCategoryId(category.category_id)
        .build();
      await genreRepository.insert(genre);
      const castMember = CastMember.fake().anActor().build();
      await castMemberRepository.insert(castMember);
      const video = Video.fake().aVideoWithoutMedias().build();
      await videoRepository.insert(video);
      const spyUpdate = jest.spyOn(videoRepository, 'update');
      const spyUowDo = jest.spyOn(uow, 'do');

      let output = await useCase.execute({
        id: video.video_id.id,
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

      expect(spyUowDo).toHaveBeenCalledTimes(1);
      expect(spyUpdate).toHaveBeenCalledTimes(1);
      expect(output).toStrictEqual({
        id: videoRepository.items[0].video_id.id,
      });
    });
  });
});
