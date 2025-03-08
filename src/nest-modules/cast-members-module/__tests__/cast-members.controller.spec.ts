import { CreateCastMemberOutput } from '@core/cast-member/application/use-cases/create-cast-member/create-cast-member.use-case';
import { CastMembersController } from '../cast-members.controller';
import { CreateCastMemberDto } from '../dto/create-cast-member.dto';
import {
  CastMemberCollectionPresenter,
  CastMemberPresenter,
} from '../cast-members.presenter';
import { UpdateCastMemberOutput } from '@core/cast-member/application/use-cases/update-cast-member/update-cast-member.use-case';
import { UpdateCastMemberDto } from '../dto/update-cast-member.dto';
import { GetCastMemberOutput } from '@core/cast-member/application/use-cases/get-cast-member/get-cast-member.use-case';
import { ListCastMembersOutput } from '@core/cast-member/application/use-cases/list-cast-members/list-cast-members.use-case';
import { SortDirection } from '@core/shared/domain/repository/search-params';
import { CastMemberTypes } from '@core/cast-member/domain/cast-member-type.vo';

describe('CastMembersController Unit Tests', () => {
  let controller: CastMembersController;

  beforeEach(async () => {
    controller = new CastMembersController();
  });

  it('should create a cast member', async () => {
    const output: CreateCastMemberOutput = {
      id: '123e4567-e89b-12d3-a456-426655440000',
      name: 'test',
      type: CastMemberTypes.ACTOR,
      created_at: new Date(),
    };

    const mockCreateUseCase = {
      execute: jest.fn().mockReturnValue(Promise.resolve(output)),
    };

    //@ts-expect-error defined part of methods
    controller['createCastMemberUseCase'] = mockCreateUseCase;
    const input: CreateCastMemberDto = {
      name: 'test',
      type: CastMemberTypes.ACTOR,
    };

    const presenter = await controller.create(input);

    expect(mockCreateUseCase.execute).toHaveBeenCalledWith(input);
    expect(presenter).toBeInstanceOf(CastMemberPresenter);
    expect(presenter).toStrictEqual(new CastMemberPresenter(output));
  });

  it('should update a cast member', async () => {
    const id = '123e4567-e89b-12d3-a456-426655440000';
    const output: UpdateCastMemberOutput = {
      id,
      name: 'test',
      type: CastMemberTypes.ACTOR,
      created_at: new Date(),
    };

    const mockUpdateUseCase = {
      execute: jest.fn().mockReturnValue(Promise.resolve(output)),
    };

    //@ts-expect-error defined part of methods
    controller['updateCastMemberUseCase'] = mockUpdateUseCase;
    const input: UpdateCastMemberDto = {
      name: 'new test',
      type: CastMemberTypes.DIRECTOR,
    };

    const presenter = await controller.update(id, input);

    expect(mockUpdateUseCase.execute).toHaveBeenCalledWith({ id, ...input });
    expect(presenter).toBeInstanceOf(CastMemberPresenter);
    expect(presenter).toStrictEqual(new CastMemberPresenter(output));
  });

  it('should delete a cast member', async () => {
    const expectedOutput = undefined;
    const mockDeleteUseCase = {
      execute: jest.fn().mockReturnValue(Promise.resolve(expectedOutput)),
    };
    //@ts-expect-error defined part of methods
    controller['deleteCastMemberUseCase'] = mockDeleteUseCase;

    const id = '123e4567-e89b-12d3-a456-426655440000';

    expect(controller.remove(id)).toBeInstanceOf(Promise);

    const output = await controller.remove(id);

    expect(mockDeleteUseCase.execute).toHaveBeenCalledWith({ id });
    expect(expectedOutput).toStrictEqual(output);
  });

  it('should get a cast member', async () => {
    const id = '123e4567-e89b-12d3-a456-426655440000';
    const output: GetCastMemberOutput = {
      id,
      name: 'test',
      type: CastMemberTypes.ACTOR,
      created_at: new Date(),
    };
    const mockGetUseCase = {
      execute: jest.fn().mockReturnValue(Promise.resolve(output)),
    };
    //@ts-expect-error defined part of methods
    controller['getCastMemberUseCase'] = mockGetUseCase;

    const presenter = await controller.findOne(id);

    expect(mockGetUseCase.execute).toHaveBeenCalledWith({ id });
    expect(presenter).toBeInstanceOf(CastMemberPresenter);
    expect(presenter).toStrictEqual(new CastMemberPresenter(output));
  });

  it('should list cast members', async () => {
    const output: ListCastMembersOutput = {
      items: [
        {
          id: '123e4567-e89b-12d3-a456-426655440000',
          name: 'test',
          type: CastMemberTypes.ACTOR,
          created_at: new Date(),
        },
      ],
      current_page: 1,
      last_page: 1,
      per_page: 1,
      total: 1,
    };
    const mockListUseCase = {
      execute: jest.fn().mockReturnValue(Promise.resolve(output)),
    };
    //@ts-expect-error defined part of methods
    controller['listCastMembersUseCase'] = mockListUseCase;

    const searchParams = {
      page: 1,
      per_page: 2,
      sort: 'name',
      sort_dir: 'desc' as SortDirection,
      filter: { name: 'test' },
    };
    const presenter = await controller.search(searchParams);

    expect(presenter).toBeInstanceOf(CastMemberCollectionPresenter);
    expect(mockListUseCase.execute).toHaveBeenCalledWith(searchParams);
    expect(presenter).toStrictEqual(new CastMemberCollectionPresenter(output));
  });
});
