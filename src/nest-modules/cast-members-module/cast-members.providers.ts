import { CreateCastMemberUseCase } from '@core/cast-member/application/use-cases/create-cast-member/create-cast-member.use-case';
import { DeleteCastMemberUseCase } from '@core/cast-member/application/use-cases/delete-cast-member/delete-cast-member.use-case';
import { GetCastMemberUseCase } from '@core/cast-member/application/use-cases/get-cast-member/get-cast-member.use-case';
import { ListCastMembersUseCase } from '@core/cast-member/application/use-cases/list-cast-members/list-cast-members.use-case';
import { UpdateCastMemberUseCase } from '@core/cast-member/application/use-cases/update-cast-member/update-cast-member.use-case';
import { CastMembersIdExistsInDatabaseValidator } from '@core/cast-member/application/validations/cast-members-ids-exists-in-database.validator';
import { ICastMemberRepository } from '@core/cast-member/domain/cast-member.repository';
import { CastMemberInMemoryRepository } from '@core/cast-member/infra/db/in-memory/cast-member-in-memory.repository';
import { CastMemberSequelizeRepository } from '@core/cast-member/infra/db/sequelize/cast-member-sequelize.repository';
import { CastMemberModel } from '@core/cast-member/infra/db/sequelize/cast-member.model';
import { getModelToken } from '@nestjs/sequelize';

export const REPOSITORIES = {
  CAST_MEMBER_REPOSITORY: {
    provide: 'CastMemberRepository',
    useExisting: CastMemberSequelizeRepository,
  },
  CAST_MEMBERS_IN_MEMORY_REPOSITORY: {
    provide: CastMemberInMemoryRepository,
    useClass: CastMemberInMemoryRepository,
  },
  CAST_MEMBERS_SEQUELIZE_REPOSITORY: {
    provide: CastMemberSequelizeRepository,
    useFactory: (castMemberModel: typeof CastMemberModel) =>
      new CastMemberSequelizeRepository(castMemberModel),
    inject: [getModelToken(CastMemberModel)],
  },
};

export const USE_CASES = {
  CREATE_CAST_MEMBER_USE_CASE: {
    provide: CreateCastMemberUseCase,
    useFactory: (castMemberRepo: ICastMemberRepository) =>
      new CreateCastMemberUseCase(castMemberRepo),
    inject: [REPOSITORIES.CAST_MEMBER_REPOSITORY.provide],
  },
  UPDATE_CAST_MEMBER_USE_CASE: {
    provide: UpdateCastMemberUseCase,
    useFactory: (castMemberRepo: ICastMemberRepository) =>
      new UpdateCastMemberUseCase(castMemberRepo),
    inject: [REPOSITORIES.CAST_MEMBER_REPOSITORY.provide],
  },
  LIST_CAST_MEMBERS_USE_CASE: {
    provide: ListCastMembersUseCase,
    useFactory: (castMemberRepo: ICastMemberRepository) =>
      new ListCastMembersUseCase(castMemberRepo),
    inject: [REPOSITORIES.CAST_MEMBER_REPOSITORY.provide],
  },
  GET_CAST_MEMBER_USE_CASE: {
    provide: GetCastMemberUseCase,
    useFactory: (castMemberRepo: ICastMemberRepository) =>
      new GetCastMemberUseCase(castMemberRepo),
    inject: [REPOSITORIES.CAST_MEMBER_REPOSITORY.provide],
  },
  DELETE_CAST_MEMBER_USE_CASE: {
    provide: DeleteCastMemberUseCase,
    useFactory: (castMemberRepo: ICastMemberRepository) =>
      new DeleteCastMemberUseCase(castMemberRepo),
    inject: [REPOSITORIES.CAST_MEMBER_REPOSITORY.provide],
  },
};

export const VALIDATIONS = {
  CAST_MEMBERS_IDS_EXISTS_IN_DATABASE_VALIDATOR: {
    provide: CastMembersIdExistsInDatabaseValidator,
    useFactory: (castMemberRepo: ICastMemberRepository) =>
      new CastMembersIdExistsInDatabaseValidator(castMemberRepo),
    inject: [REPOSITORIES.CAST_MEMBER_REPOSITORY.provide],
  },
};

export const CAST_MEMBERS_PROVIDERS = {
  REPOSITORIES,
  USE_CASES,
  VALIDATIONS,
};
