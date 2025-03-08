import {
  CastMemberType,
  CastMemberTypes,
  InvalidCastMemberTypeError,
} from '@core/cast-member/domain/cast-member-type.vo';
import { CastMember } from '@core/cast-member/domain/cast-member.aggregate';

const _keysInResponse = ['id', 'name', 'type', 'created_at'];

export class GetCastMemberFixture {
  static keysInResponse = _keysInResponse;
}

export class CreateCastMemberFixture {
  static keysInResponse = _keysInResponse;

  static arrangeForCreate() {
    const faker = CastMember.fake().anActor().withName('test');

    return [
      {
        send_data: {
          name: faker.name,
          type: faker.type.type,
        },
        expected: {
          name: faker.name,
          type: faker.type.type,
        },
      },
    ];
  }

  static arrangeInvalidRequest() {
    const defaultExpected = {
      statusCode: 422,
      error: 'Unprocessable Entity',
    };

    return {
      EMPTY: {
        send_data: {},
        expected: {
          message: [
            'name should not be empty',
            'name must be a string',
            'type should not be empty',
            `type must be an integer number`,
          ],
          ...defaultExpected,
        },
      },
      NAME_UNDEFINED: {
        send_data: {
          name: undefined,
          type: CastMemberTypes.ACTOR,
        },
        expected: {
          message: ['name should not be empty', 'name must be a string'],
          ...defaultExpected,
        },
      },
      NAME_NULL: {
        send_data: {
          name: null,
          type: CastMemberTypes.ACTOR,
        },
        expected: {
          message: ['name should not be empty', 'name must be a string'],
          ...defaultExpected,
        },
      },
      NAME_EMPTY: {
        send_data: {
          name: '',
          type: CastMemberTypes.ACTOR,
        },
        expected: {
          message: ['name should not be empty'],
          ...defaultExpected,
        },
      },
      NAME_NOT_A_STRING: {
        send_data: {
          name: 5,
          type: CastMemberTypes.ACTOR,
        },
        expected: {
          message: ['name must be a string'],
          ...defaultExpected,
        },
      },
      TYPE_UNDEFINED: {
        send_data: {
          name: 'test',
          type: undefined,
        },
        expected: {
          message: [
            'type should not be empty',
            `type must be an integer number`,
          ],
          ...defaultExpected,
        },
      },
      TYPE_NULL: {
        send_data: {
          name: 'test',
          type: null,
        },
        expected: {
          message: [
            'type should not be empty',
            `type must be an integer number`,
          ],
          ...defaultExpected,
        },
      },
      TYPE_INVALID: {
        send_data: {
          name: 'test',
          type: 0,
        },
        expected: {
          message: [new InvalidCastMemberTypeError(0).message],
          ...defaultExpected,
        },
      },
      TYPE_NOT_A_ENUM: {
        send_data: {
          name: 'test',
          type: '5',
        },
        expected: {
          message: [`type must be an integer number`],
          ...defaultExpected,
        },
      },
      NAME_NOT_A_STRING_AND_NONE_TYPE: {
        send_data: {
          name: 5,
        },
        expected: {
          message: [
            'name must be a string',
            'type should not be empty',
            `type must be an integer number`,
          ],
          ...defaultExpected,
        },
      },
      TYPE_NOT_A_ENUM_AND_NONE_NAME: {
        send_data: {
          type: '5',
        },
        expected: {
          message: [
            'name should not be empty',
            'name must be a string',
            `type must be an integer number`,
          ],
          ...defaultExpected,
        },
      },
    };
  }

  static arrangeForEntityValidationError() {
    const faker = CastMember.fake().anActor();
    const defaultExpected = {
      statusCode: 422,
      error: 'Unprocessable Entity',
    };

    return {
      NAME_TOO_LONG: {
        send_data: {
          name: faker.withInvalidNameTooLong().name,
          type: faker.type.type,
        },
        expected: {
          message: ['name must be shorter than or equal to 255 characters'],
          ...defaultExpected,
        },
      },
    };
  }
}

export class UpdateCastMemberFixture {
  static keysInResponse = _keysInResponse;

  static arrangeForUpdate() {
    const faker = CastMember.fake().anActor().build();

    return [
      {
        send_data: {
          name: faker.name,
          type: faker.type.type,
        },
        expected: {
          name: faker.name,
          type: faker.type.type,
        },
      },
      {
        send_data: {
          name: faker.name,
        },
        expected: {
          name: faker.name,
          type: expect.anything(),
        },
      },
      {
        send_data: {
          type: faker.type.type,
        },
        expected: {
          name: expect.anything(),
          type: faker.type.type,
        },
      },
    ];
  }

  static arrangeInvalidRequest() {
    const defaultExpected = {
      statusCode: 422,
      error: 'Unprocessable Entity',
    };

    return {
      NAME_NOT_A_STRING: {
        send_data: {
          name: 5,
        },
        expected: {
          message: ['name must be a string'],
          ...defaultExpected,
        },
      },
      TYPE_NOT_A_ENUM: {
        send_data: {
          type: '5',
        },
        expected: {
          message: [`type must be an integer number`],
          ...defaultExpected,
        },
      },
      NAME_AND_TYPE_INVALIDS: {
        send_data: {
          name: 5,
          type: '5',
        },
        expected: {
          message: ['name must be a string', `type must be an integer number`],
          ...defaultExpected,
        },
      },
    };
  }

  static arrangeForEntityValidationError() {
    const faker = CastMember.fake().anActor();
    const defaultExpected = {
      statusCode: 422,
      error: 'Unprocessable Entity',
    };

    return {
      NAME_TOO_LONG: {
        send_data: {
          name: faker.withInvalidNameTooLong().name,
        },
        expected: {
          message: ['name must be shorter than or equal to 255 characters'],
          ...defaultExpected,
        },
      },
    };
  }
}

export class ListCastMembersFixture {
  static arrangeIncrementedWithCreatedAt() {
    const _entities = CastMember.fake()
      .theCastMembers(4)
      .withName((i) => `test ${i}`)
      .withCreatedAt((i) => new Date(new Date().getTime() + i * 2000))
      .build();

    const entitiesMap = {
      first: _entities[0],
      second: _entities[1],
      third: _entities[2],
      fourth: _entities[3],
    };

    const arrange = [
      {
        send_data: {},
        expected: {
          entities: [
            entitiesMap.fourth,
            entitiesMap.third,
            entitiesMap.second,
            entitiesMap.first,
          ],
          meta: {
            current_page: 1,
            last_page: 1,
            per_page: 15,
            total: 4,
          },
        },
      },
      {
        send_data: {
          page: 1,
          per_page: 2,
        },
        expected: {
          entities: [entitiesMap.fourth, entitiesMap.third],
          meta: {
            current_page: 1,
            last_page: 2,
            per_page: 2,
            total: 4,
          },
        },
      },
      {
        send_data: {
          page: 2,
          per_page: 2,
        },
        expected: {
          entities: [entitiesMap.second, entitiesMap.first],
          meta: {
            current_page: 2,
            last_page: 2,
            per_page: 2,
            total: 4,
          },
        },
      },
    ];

    return { arrange, entitiesMap };
  }

  static arrangeUnsorted() {
    const faker = CastMember.fake().anActor();

    const entitiesMap = {
      a: faker.withName('a').withType(CastMemberType.createAnActor()).build(),
      AAA: faker
        .withName('AAA')
        .withType(CastMemberType.createADirector())
        .build(),
      AaA: faker
        .withName('AaA')
        .withType(CastMemberType.createADirector())
        .build(),
      b: faker.withName('b').withType(CastMemberType.createADirector()).build(),
      c: faker.withName('c').withType(CastMemberType.createAnActor()).build(),
    };

    const arrange = [
      {
        send_data: {
          page: 1,
          per_page: 2,
          sort: 'name',
          filter: { name: 'a' },
        },
        expected: {
          entities: [entitiesMap.AAA, entitiesMap.AaA],
          meta: {
            current_page: 1,
            last_page: 2,
            per_page: 2,
            total: 3,
          },
        },
      },
      {
        send_data: {
          page: 2,
          per_page: 2,
          sort: 'name',
          filter: { name: 'a' },
        },
        expected: {
          entities: [entitiesMap.a],
          meta: {
            current_page: 2,
            last_page: 2,
            per_page: 2,
            total: 3,
          },
        },
      },
      {
        send_data: {
          page: 1,
          per_page: 2,
          sort: 'name',
          filter: { type: CastMemberTypes.DIRECTOR },
        },
        expected: {
          entities: [entitiesMap.AAA, entitiesMap.AaA],
          meta: {
            current_page: 1,
            last_page: 2,
            per_page: 2,
            total: 3,
          },
        },
      },
      {
        send_data: {
          page: 2,
          per_page: 2,
          sort: 'name',
          filter: { type: CastMemberTypes.DIRECTOR },
        },
        expected: {
          entities: [entitiesMap.b],
          meta: {
            current_page: 2,
            last_page: 2,
            per_page: 2,
            total: 3,
          },
        },
      },
      {
        send_data: {
          page: 1,
          per_page: 2,
          sort: 'name',
          filter: { name: 'a', type: CastMemberTypes.DIRECTOR },
        },
        expected: {
          entities: [entitiesMap.AAA, entitiesMap.AaA],
          meta: {
            current_page: 1,
            last_page: 1,
            per_page: 2,
            total: 2,
          },
        },
      },
    ];

    return { arrange, entitiesMap };
  }
}
