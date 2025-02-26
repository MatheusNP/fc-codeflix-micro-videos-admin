import { CastMemberInMemoryRepository } from '@core/cast-member/infra/db/in-memory/cast-member-in-memory.repository';
import { CreateCastMemberUseCase } from '../create-cast-member.use-case';
import { CastMemberType } from '@core/cast-member/domain/cast-member.type';

describe('CreateCastMemberUseCase unit tests', () => {
  let repository: CastMemberInMemoryRepository;
  let useCase: CreateCastMemberUseCase;

  beforeEach(() => {
    repository = new CastMemberInMemoryRepository();
    useCase = new CreateCastMemberUseCase(repository);
  });

  describe('should throw error when entity is not valid', () => {
    const arrange = [
      {
        name: 't'.repeat(256),
        type: CastMemberType.ACTOR,
      },
      {
        name: 'test',
        type: 0 as CastMemberType,
      },
    ];

    test.each(arrange)('when input is $i', async (i) => {
      const input = { name: i.name, type: i.type };

      await expect(() => useCase.execute(input)).rejects.toThrow(
        'Entity Validation Error',
      );
    });
  });

  it('should create a new cast member', async () => {
    const spyInsert = jest.spyOn(repository, 'insert');
    let output = await useCase.execute({
      name: 'actor',
      type: CastMemberType.ACTOR,
    });

    expect(spyInsert).toHaveBeenCalledTimes(1);
    expect(output).toStrictEqual({
      id: repository.items[0].cast_member_id.id,
      name: repository.items[0].name,
      type: repository.items[0].type,
      created_at: repository.items[0].created_at,
    });

    output = await useCase.execute({
      name: 'director',
      type: CastMemberType.DIRECTOR,
    });

    expect(spyInsert).toHaveBeenCalledTimes(2);
    expect(output).toStrictEqual({
      id: repository.items[1].cast_member_id.id,
      name: 'director',
      type: CastMemberType.DIRECTOR,
      created_at: repository.items[1].created_at,
    });
  });
});
