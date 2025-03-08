import { CastMemberInMemoryRepository } from '@core/cast-member/infra/db/in-memory/cast-member-in-memory.repository';
import { CreateCastMemberUseCase } from '../create-cast-member.use-case';
import {
  CastMemberType,
  CastMemberTypes,
} from '@core/cast-member/domain/cast-member-type.vo';

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
        type: CastMemberTypes.ACTOR,
      },
      {
        name: 'test',
        type: 0 as CastMemberTypes,
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
      type: CastMemberTypes.ACTOR,
    });

    expect(spyInsert).toHaveBeenCalledTimes(1);
    expect(output).toStrictEqual({
      id: repository.items[0].cast_member_id.id,
      name: repository.items[0].name,
      type: repository.items[0].type.type,
      created_at: repository.items[0].created_at,
    });

    output = await useCase.execute({
      name: 'director',
      type: CastMemberTypes.DIRECTOR,
    });

    expect(spyInsert).toHaveBeenCalledTimes(2);
    expect(output).toStrictEqual({
      id: repository.items[1].cast_member_id.id,
      name: 'director',
      type: CastMemberType.createADirector().type,
      created_at: repository.items[1].created_at,
    });
  });
});
