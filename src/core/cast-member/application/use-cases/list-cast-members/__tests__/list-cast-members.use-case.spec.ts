import { CastMemberInMemoryRepository } from '@core/cast-member/infra/db/in-memory/cast-member-in-memory.repository';
import { ListCastMembersUseCase } from '../list-cast-members.use-case';
import { CastMemberSearchResult } from '@core/cast-member/domain/cast-member.repository';
import { CastMember } from '@core/cast-member/domain/cast-member.aggregate';
import { CastMemberOutputMapper } from '../../common/cast-member-output';
import { CastMemberTypes } from '@core/cast-member/domain/cast-member-type.vo';

describe('ListCastMembersUseCase Unit Tests', () => {
  let repository: CastMemberInMemoryRepository;
  let useCase: ListCastMembersUseCase;

  beforeEach(() => {
    repository = new CastMemberInMemoryRepository();
    useCase = new ListCastMembersUseCase(repository);
  });

  test('toOutput method', () => {
    let result = new CastMemberSearchResult({
      items: [],
      total: 1,
      current_page: 1,
      per_page: 2,
    });
    let output = useCase['toOutput'](result);

    expect(output).toStrictEqual({
      items: [],
      total: 1,
      current_page: 1,
      per_page: 2,
      last_page: 1,
    });

    const entity = CastMember.fake().anActor().build();
    result = new CastMemberSearchResult({
      items: [entity],
      total: 1,
      current_page: 1,
      per_page: 2,
    });
    output = useCase['toOutput'](result);
    expect(output).toStrictEqual({
      items: [entity].map(CastMemberOutputMapper.toOutput),
      total: 1,
      current_page: 1,
      per_page: 2,
      last_page: 1,
    });
  });

  it('should return output sorted by created_at when input param is empty', async () => {
    const items = [
      CastMember.fake().anActor().withName('test 1').build(),
      CastMember.fake()
        .anActor()
        .withName('test 2')
        .withCreatedAt(new Date(new Date().getTime() + 1000))
        .build(),
    ];
    repository.items = items;

    const output = await useCase.execute({});
    expect(output).toStrictEqual({
      items: [...items].reverse().map(CastMemberOutputMapper.toOutput),
      total: 2,
      current_page: 1,
      per_page: 15,
      last_page: 1,
    });
  });

  it('should return output using pagination, sort and filter', async () => {
    const items = [
      CastMember.fake().anActor().withName('a').build(),
      CastMember.fake().aDirector().withName('AAA').build(),
      CastMember.fake().aDirector().withName('AaA').build(),
      CastMember.fake().aDirector().withName('b').build(),
      CastMember.fake().anActor().withName('c').build(),
    ];
    repository.items = items;

    let output = await useCase.execute({
      page: 1,
      per_page: 2,
      sort: 'name',
      filter: { name: 'a' },
    });
    expect(output).toStrictEqual({
      items: [items[1], items[2]].map(CastMemberOutputMapper.toOutput),
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
      items: [items[0]].map(CastMemberOutputMapper.toOutput),
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
      items: [items[0], items[2]].map(CastMemberOutputMapper.toOutput),
      total: 3,
      current_page: 1,
      per_page: 2,
      last_page: 2,
    });

    output = await useCase.execute({
      page: 1,
      per_page: 2,
      sort: 'name',
      filter: { type: CastMemberTypes.DIRECTOR },
    });
    expect(output).toStrictEqual({
      items: [items[1], items[2]].map(CastMemberOutputMapper.toOutput),
      total: 3,
      current_page: 1,
      per_page: 2,
      last_page: 2,
    });

    output = await useCase.execute({
      page: 2,
      per_page: 2,
      sort: 'name',
      filter: { type: CastMemberTypes.DIRECTOR },
    });
    expect(output).toStrictEqual({
      items: [items[3]].map(CastMemberOutputMapper.toOutput),
      total: 3,
      current_page: 2,
      per_page: 2,
      last_page: 2,
    });

    output = await useCase.execute({
      page: 1,
      per_page: 2,
      sort: 'name',
      filter: { name: 'a', type: CastMemberTypes.DIRECTOR },
    });
    expect(output).toStrictEqual({
      items: [items[1], items[2]].map(CastMemberOutputMapper.toOutput),
      total: 2,
      current_page: 1,
      per_page: 2,
      last_page: 1,
    });
  });
});
