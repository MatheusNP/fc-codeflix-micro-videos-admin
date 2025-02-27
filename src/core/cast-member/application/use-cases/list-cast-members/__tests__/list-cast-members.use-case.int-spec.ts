import { CastMemberSequelizeRepository } from '@core/cast-member/infra/db/sequelize/cast-member-sequelize.repository';
import { ListCastMembersUseCase } from '../list-cast-members.use-case';
import { setupSequelize } from '@core/shared/infra/testing/helpers';
import { CastMemberModel } from '@core/cast-member/infra/db/sequelize/cast-member.model';
import { CastMember } from '@core/cast-member/domain/cast-member.entity';
import { CastMemberOutputMapper } from '../../common/cast-member-output';
import { CastMemberType } from '@core/cast-member/domain/cast-member.type';

describe('ListCastMembersUseCase Integration Tests', () => {
  let repository: CastMemberSequelizeRepository;
  let useCase: ListCastMembersUseCase;

  setupSequelize({ models: [CastMemberModel] });

  beforeEach(() => {
    repository = new CastMemberSequelizeRepository(CastMemberModel);
    useCase = new ListCastMembersUseCase(repository);
  });

  it('should return output sorted by created_at when input param is empty', async () => {
    const castMembers = CastMember.fake()
      .theCastMembers(2)
      .withCreatedAt((i) => new Date(new Date().getTime() + i * 1000))
      .build();
    await repository.bulkInsert(castMembers);

    const output = await useCase.execute({});
    expect(output).toStrictEqual({
      items: [...castMembers].reverse().map(CastMemberOutputMapper.toOutput),
      total: 2,
      current_page: 1,
      per_page: 15,
      last_page: 1,
    });
  });

  it('should return output using pagination, sort and filter', async () => {
    const castMembers = [
      CastMember.fake()
        .aCastMember()
        .withName('a')
        .withType(CastMemberType.ACTOR)
        .build(),
      CastMember.fake()
        .aCastMember()
        .withName('AAA')
        .withType(CastMemberType.DIRECTOR)
        .build(),
      CastMember.fake()
        .aCastMember()
        .withName('AaA')
        .withType(CastMemberType.DIRECTOR)
        .build(),
      CastMember.fake()
        .aCastMember()
        .withName('b')
        .withType(CastMemberType.DIRECTOR)
        .build(),
      CastMember.fake()
        .aCastMember()
        .withName('c')
        .withType(CastMemberType.ACTOR)
        .build(),
    ];
    await repository.bulkInsert(castMembers);

    let output = await useCase.execute({
      page: 1,
      per_page: 2,
      sort: 'name',
      filter: { name: 'a' },
    });
    expect(output).toStrictEqual({
      items: [castMembers[1], castMembers[2]].map(
        CastMemberOutputMapper.toOutput,
      ),
      total: 3,
      current_page: 1,
      per_page: 2,
      last_page: 2,
    });

    output = await useCase.execute({
      page: 2,
      per_page: 2,
      sort: 'name',
      filter: { name: 'a' },
    });
    expect(output).toStrictEqual({
      items: [castMembers[0]].map(CastMemberOutputMapper.toOutput),
      total: 3,
      current_page: 2,
      per_page: 2,
      last_page: 2,
    });

    output = await useCase.execute({
      page: 1,
      per_page: 2,
      sort: 'name',
      sort_dir: 'desc',
      filter: { name: 'a' },
    });
    expect(output).toStrictEqual({
      items: [castMembers[0], castMembers[2]].map(
        CastMemberOutputMapper.toOutput,
      ),
      total: 3,
      current_page: 1,
      per_page: 2,
      last_page: 2,
    });

    output = await useCase.execute({
      page: 1,
      per_page: 2,
      sort: 'name',
      filter: { type: CastMemberType.DIRECTOR },
    });
    expect(output).toStrictEqual({
      items: [castMembers[1], castMembers[2]].map(
        CastMemberOutputMapper.toOutput,
      ),
      total: 3,
      current_page: 1,
      per_page: 2,
      last_page: 2,
    });

    output = await useCase.execute({
      page: 2,
      per_page: 2,
      sort: 'name',
      filter: { type: CastMemberType.DIRECTOR },
    });
    expect(output).toStrictEqual({
      items: [castMembers[3]].map(CastMemberOutputMapper.toOutput),
      total: 3,
      current_page: 2,
      per_page: 2,
      last_page: 2,
    });

    output = await useCase.execute({
      page: 1,
      per_page: 2,
      sort: 'name',
      filter: { name: 'a', type: CastMemberType.DIRECTOR },
    });
    expect(output).toStrictEqual({
      items: [castMembers[1], castMembers[2]].map(
        CastMemberOutputMapper.toOutput,
      ),
      total: 2,
      current_page: 1,
      per_page: 2,
      last_page: 1,
    });
  });
});
