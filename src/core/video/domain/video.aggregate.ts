import { CastMemberId } from '@core/cast-member/domain/cast-member.aggregate';
import { CategoryId } from '@core/category/domain/category.aggregate';
import { GenreId } from '@core/genre/domain/genre.aggregate';
import { AggregateRoot } from '@core/shared/domain/aggregate-root';
import { Uuid } from '@core/shared/domain/value-objects/uuid.vo';
import { Rating } from './rating.vo';
import { Banner } from './banner.vo';
import { ThumbnailHalf } from './thumbnail-half.vo';
import { Thumbnail } from './thumbnail.vo';
import { Trailer } from './trailer.vo';
import { VideoMedia } from './video-media.vo';

export type VideoConstructorProps = {
  video_id?: VideoId;
  title: string;
  description: string;
  year_launched: number;
  duration: number;
  rating: Rating;
  is_opened: boolean;
  is_published: boolean;
  banner?: Banner;
  thumbnail?: Thumbnail;
  thumbnail_half?: ThumbnailHalf;
  trailer?: Trailer;
  video?: VideoMedia;
  categories_id: Map<string, CategoryId>;
  genres_id: Map<string, GenreId>;
  cast_members_id: Map<string, CastMemberId>;
  created_at?: Date;
};

export type VideoCreateCommand = {
  title: string;
  description: string;
  year_launched: number;
  duration: number;
  rating: Rating;
  is_opened: boolean;
  banner?: Banner;
  thumbnail?: Thumbnail;
  thumbnail_half?: ThumbnailHalf;
  trailer?: Trailer;
  video?: VideoMedia;
  categories_id: CategoryId[];
  genres_id: GenreId[];
  cast_members_id: CastMemberId[];
};

export class VideoId extends Uuid {}

export class Video extends AggregateRoot {
  video_id: VideoId;
  title: string;
  description: string;
  year_launched: number;
  duration: number;
  rating: Rating;
  is_opened: boolean;
  is_published: boolean;
  banner: Banner | null;
  thumbnail: Thumbnail | null;
  thumbnail_half: ThumbnailHalf | null;
  trailer: Trailer | null;
  video: VideoMedia | null;
  categories_id: Map<string, CategoryId>;
  genres_id: Map<string, GenreId>;
  cast_members_id: Map<string, CastMemberId>;
  created_at: Date;

  constructor(props: VideoConstructorProps) {
    super();
    this.video_id = props.video_id ?? new VideoId();
    this.title = props.title;
    this.description = props.description;
    this.year_launched = props.year_launched;
    this.duration = props.duration;
    this.rating = props.rating;
    this.is_opened = props.is_opened;
    this.is_published = props.is_published;
    this.banner = props.banner ?? null;
    this.thumbnail = props.thumbnail ?? null;
    this.thumbnail_half = props.thumbnail_half ?? null;
    this.trailer = props.trailer ?? null;
    this.video = props.video ?? null;
    this.categories_id = props.categories_id;
    this.genres_id = props.genres_id;
    this.cast_members_id = props.cast_members_id;
    this.created_at = props.created_at ?? new Date();
  }

  static create(props: VideoCreateCommand): Video {
    const video = new Video({
      ...props,
      categories_id: new Map(props.categories_id.map((id) => [id.id, id])),
      genres_id: new Map(props.genres_id.map((id) => [id.id, id])),
      cast_members_id: new Map(props.cast_members_id.map((id) => [id.id, id])),
      is_published: false,
    });

    // video.validate()

    return video;
  }

  changeTitle(title: string) {
    this.title = title;
    // this.validate()
  }

  changeDescription(description: string) {
    this.description = description;
  }

  changeYearLaunched(yearLaunched: number) {
    this.year_launched = yearLaunched;
  }

  changeDuration(duration: number) {
    this.duration = duration;
  }

  changeRating(rating: Rating) {
    this.rating = rating;
  }

  markAsOpened() {
    this.is_opened = true;
  }

  markAsNotOpened() {
    this.is_opened = false;
  }

  addCategory(categoryId: CategoryId) {
    this.categories_id.set(categoryId.id, categoryId);
  }

  removeCategory(categoryId: CategoryId) {
    this.categories_id.delete(categoryId.id);
  }

  syncCategoriesId(categoriesId: CategoryId[]) {
    if (!categoriesId) {
      throw new Error('Categories is required');
    }

    this.categories_id = new Map(
      categoriesId.map((category_id) => [category_id.id, category_id]),
    );
  }

  addGenre(genreId: GenreId) {
    this.genres_id.set(genreId.id, genreId);
  }

  removeGenre(genreId: GenreId) {
    this.genres_id.delete(genreId.id);
  }

  syncGenresId(genresId: GenreId[]) {
    if (!genresId) {
      throw new Error('Genres is required');
    }

    this.genres_id = new Map(
      genresId.map((genre_id) => [genre_id.id, genre_id]),
    );
  }

  addCastMember(castMemberId: CastMemberId) {
    this.cast_members_id.set(castMemberId.id, castMemberId);
  }

  removeCastMember(castMemberId: CastMemberId) {
    this.cast_members_id.delete(castMemberId.id);
  }

  syncCastMembersId(castMembersId: CastMemberId[]) {
    if (!castMembersId) {
      throw new Error('Cast Members is required');
    }

    this.cast_members_id = new Map(
      castMembersId.map((cast_member_id) => [
        cast_member_id.id,
        cast_member_id,
      ]),
    );
  }

  get entity_id() {
    return this.video_id;
  }

  toJSON() {
    return {
      video_id: this.video_id.id,
      title: this.title,
      description: this.description,
      year_launched: this.year_launched,
      duration: this.duration,
      rating: this.rating,
      is_opened: this.is_opened,
      is_published: this.is_published,
      banner: this.banner ? this.banner.toJSON() : null,
      thumbnail: this.thumbnail ? this.thumbnail.toJSON() : null,
      thumbnail_half: this.thumbnail_half ? this.thumbnail_half.toJSON() : null,
      trailer: this.trailer ? this.trailer.toJSON() : null,
      video: this.video ? this.video.toJSON() : null,
      categories_id: Array.from(this.categories_id.values()).map((id) => id.id),
      genres_id: Array.from(this.genres_id.values()).map((id) => id.id),
      cast_members_id: Array.from(this.cast_members_id.values()).map(
        (id) => id.id,
      ),
      created_at: this.created_at,
    };
  }
}
