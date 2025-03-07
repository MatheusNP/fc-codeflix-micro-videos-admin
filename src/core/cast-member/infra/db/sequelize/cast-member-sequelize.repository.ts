import {
  CastMember,
  CastMemberId,
} from '@core/cast-member/domain/cast-member.aggregate';
import {
  CastMemberSearchParams,
  CastMemberSearchResult,
  ICastMemberRepository,
} from '@core/cast-member/domain/cast-member.repository';
import { NotFoundError } from '@core/shared/domain/errors/not-found.error';
import { SortDirection } from '@core/shared/domain/repository/search-params';
import { literal, Op } from 'sequelize';
import { CastMemberModel } from './cast-member.model';
import { CastMemberModelMapper } from './cast-member-model-mapper';

export class CastMemberSequelizeRepository implements ICastMemberRepository {
  sortableFields: string[] = ['name', 'created_at'];
  orderBy = {
    mysql: {
      name: (sort_dir: SortDirection) => literal(`binary name ${sort_dir}`),
    },
  };

  constructor(private castMemberModel: typeof CastMemberModel) {}

  async insert(entity: CastMember): Promise<void> {
    const modelProps = CastMemberModelMapper.toModel(entity);
    await this.castMemberModel.create(modelProps.toJSON());
  }

  async bulkInsert(entities: CastMember[]): Promise<void> {
    const modelProps = entities.map((entity) =>
      CastMemberModelMapper.toModel(entity).toJSON(),
    );
    await this.castMemberModel.bulkCreate(modelProps);
  }

  async update(entity: CastMember): Promise<void> {
    const id = entity.cast_member_id.id;
    const model = await this._get(id);
    if (!model) {
      throw new NotFoundError(id, this.getEntity());
    }

    const modelProps = CastMemberModelMapper.toModel(entity);
    await this.castMemberModel.update(modelProps.toJSON(), {
      where: { cast_member_id: id },
    });
  }

  async delete(cast_member_id: CastMemberId): Promise<void> {
    const id = cast_member_id.id;
    const model = await this._get(id);
    if (!model) {
      throw new NotFoundError(id, this.getEntity());
    }

    await this.castMemberModel.destroy({ where: { cast_member_id: id } });
  }

  async findById(cast_member_id: CastMemberId): Promise<CastMember | null> {
    const model = await this._get(cast_member_id.id);
    return model ? CastMemberModelMapper.toEntity(model) : null;
  }

  private async _get(id: string): Promise<CastMemberModel | null> {
    return await this.castMemberModel.findByPk(id);
  }

  async findAll(): Promise<CastMember[]> {
    const models = await this.castMemberModel.findAll();
    return models.map((model) => CastMemberModelMapper.toEntity(model));
  }

  async search(props: CastMemberSearchParams): Promise<CastMemberSearchResult> {
    const offset = (props.page - 1) * props.per_page;
    const limit = props.per_page;

    const where = {};

    if (props.filter) {
      if (props.filter.name) {
        where['name'] = { [Op.like]: `%${props.filter.name}%` };
      }

      if (typeof props.filter.type !== 'undefined') {
        where['type'] = props.filter.type;
      }
    }

    const { rows: models, count } = await this.castMemberModel.findAndCountAll({
      ...(props.filter && {
        where,
      }),
      ...(props.sort && this.sortableFields.includes(props.sort)
        ? { order: this.formatSort(props.sort, props.sort_dir) }
        : { order: [['created_at', 'desc']] }),
      offset,
      limit,
    });

    return new CastMemberSearchResult({
      items: models.map((model) => CastMemberModelMapper.toEntity(model)),
      total: count,
      current_page: props.page,
      per_page: props.per_page,
    });
  }

  getEntity(): new (...args: any[]) => CastMember {
    return CastMember;
  }

  private formatSort(sort: string, sort_dir: SortDirection) {
    const dialect = this.castMemberModel.sequelize.getDialect() as 'mysql';

    if (this.orderBy[dialect] && this.orderBy[dialect][sort]) {
      return this.orderBy[dialect][sort](sort_dir);
    }

    return [[sort, sort_dir]];
  }
}
