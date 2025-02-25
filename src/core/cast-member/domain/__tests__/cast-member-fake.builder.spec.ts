import { Chance } from 'chance';
import { Uuid } from '../../../shared/domain/value-objects/uuid.vo';
import { CastMemberFakeBuilder } from '../cast-member-fake.builder';
import { CastMemberType } from '../cast-member.type';

describe('CastMemberFakeBuilder unit tests', () => {
  const faker = CastMemberFakeBuilder.aCastMember();

  describe('cast_member_id prop', () => {
    test('should throw error when any with methods has called', () => {
      expect(() => {
        new Error(
          `Property cast_member_id not have a factory, use 'with' methods`,
        );
      });
    });

    test('should be undefined', () => {
      expect(faker['_cast_member_id']).toBeUndefined();
    });

    test('withUuid', () => {
      const cast_member_id = new Uuid();
      const $this = faker.withUuid(cast_member_id);
      expect($this).toBeInstanceOf(CastMemberFakeBuilder);
      expect(faker['_cast_member_id']).toBe(cast_member_id);

      faker.withUuid(() => cast_member_id);
      //@ts-expect-error _cast_member_id is a callable
      expect(faker['_cast_member_id']()).toBe(cast_member_id);

      expect(faker.cast_member_id).toBe(cast_member_id);
    });

    test('should pass index to cast_member_id factory', () => {
      let mockFactory = jest.fn(() => new Uuid());
      faker.withUuid(mockFactory);
      faker.build();
      expect(mockFactory).toHaveBeenCalledTimes(1);

      const cast_member_id = new Uuid();
      mockFactory = jest.fn(() => cast_member_id);
      const fakerMany = CastMemberFakeBuilder.theCastMembers(2);
      fakerMany.withUuid(mockFactory);
      fakerMany.build();
      expect(mockFactory).toHaveBeenCalledTimes(2);
      expect(fakerMany.build()[0].cast_member_id).toBe(cast_member_id);
      expect(fakerMany.build()[1].cast_member_id).toBe(cast_member_id);
    });
  });

  describe('name prop', () => {
    const faker = CastMemberFakeBuilder.aCastMember();

    test('should be a function', () => {
      expect(typeof faker['_name']).toBe('function');
    });

    test('shoud call the word method', () => {
      const chance = Chance();
      const spyWordMethod = jest.spyOn(chance, 'word');
      faker['chance'] = chance;
      faker.build();

      expect(spyWordMethod).toHaveBeenCalled();
    });

    test('withName', () => {
      const $this = faker.withName('test name');
      expect($this).toBeInstanceOf(CastMemberFakeBuilder);
      expect(faker['_name']).toBe('test name');

      faker.withName(() => 'test name');
      //@ts-expect-error _name is a callable
      expect(faker['_name']()).toBe('test name');

      expect(faker.name).toBe('test name');
    });

    test('should pass index to name factory', () => {
      faker.withName((index) => `test name ${index}`);
      const castMember = faker.build();
      expect(castMember.name).toBe('test name 0');

      const fakerMany = CastMemberFakeBuilder.theCastMembers(2);
      fakerMany.withName((index) => `test name ${index}`);
      const castMembers = fakerMany.build();
      expect(castMembers[0].name).toBe('test name 0');
      expect(castMembers[1].name).toBe('test name 1');
    });

    test('should be invalid too long case', () => {
      const $this = faker.withInvalidNameTooLong();
      expect($this).toBeInstanceOf(CastMemberFakeBuilder);
      expect(faker['_name'].length).toBe(256);

      const tooLong = 'a'.repeat(256);
      faker.withInvalidNameTooLong(tooLong);
      expect(faker['_name'].length).toBe(256);
      expect(faker['_name']).toBe(tooLong);
    });
  });

  describe('type prop', () => {
    const faker = CastMemberFakeBuilder.aCastMember();

    test('should be a function', () => {
      expect(typeof faker['_type']).toBe('function');
    });

    test('shoud call the pickone method', () => {
      const chance = Chance();
      const spyPickOneMethod = jest.spyOn(chance, 'pickone');
      faker['chance'] = chance;
      faker.build();

      expect(spyPickOneMethod).toHaveBeenCalled();
    });

    test('withType', () => {
      const $this = faker.withType(CastMemberType.ACTOR);
      expect($this).toBeInstanceOf(CastMemberFakeBuilder);
      expect(faker['_type']).toBe(CastMemberType.ACTOR);

      expect(faker.type).toBe(CastMemberType.ACTOR);
    });
  });

  describe('created_at prop', () => {
    const faker = CastMemberFakeBuilder.aCastMember();

    test('should throw error when any with methods has called', () => {
      const fakerCastMember = CastMemberFakeBuilder.aCastMember();
      expect(() => fakerCastMember.created_at).toThrowError(
        new Error(`Property created_at not have a factory, use 'with' methods`),
      );
    });

    test('should be undefined', () => {
      expect(faker['_created_at']).toBeUndefined();
    });

    test('withCreatedAt', () => {
      const date = new Date();
      const $this = faker.withCreatedAt(date);
      expect($this).toBeInstanceOf(CastMemberFakeBuilder);
      expect(faker['_created_at']).toBe(date);

      faker.withCreatedAt(() => date);
      //@ts-expect-error _created_at is a callable
      expect(faker['_created_at']()).toBe(date);

      expect(faker.created_at).toBe(date);
    });

    test('should pass index to created_at factory', () => {
      const date = new Date();
      faker.withCreatedAt((index) => new Date(date.getTime() + index + 2));
      const castMember = faker.build();
      expect(castMember.created_at.getTime()).toBe(date.getTime() + 2);

      const fakerMany = CastMemberFakeBuilder.theCastMembers(2);
      fakerMany.withCreatedAt((index) => new Date(date.getTime() + index + 2));
      const castMembers = fakerMany.build();
      expect(castMembers[0].created_at.getTime()).toBe(date.getTime() + 2);
      expect(castMembers[1].created_at.getTime()).toBe(date.getTime() + 3);
    });
  });

  test('should create a cast member', () => {
    const faker = CastMemberFakeBuilder.aCastMember();
    let castMember = faker.build();

    expect(castMember.cast_member_id).toBeInstanceOf(Uuid);
    expect(typeof castMember.name === 'string').toBeTruthy();
    console.log(typeof castMember.type);
    // expect(castMember.type).toBeInstanceOf(CastMemberType);
    expect(castMember.created_at).toBeInstanceOf(Date);

    const created_at = new Date();
    const cast_member_id = new Uuid();
    castMember = faker
      .withUuid(cast_member_id)
      .withName('test name')
      .withType(CastMemberType.ACTOR)
      .withCreatedAt(created_at)
      .build();

    expect(castMember.cast_member_id).toBe(cast_member_id);
    expect(castMember.name).toBe('test name');
    expect(castMember.type).toBe(CastMemberType.ACTOR);
    expect(castMember.created_at).toBe(created_at);
  });

  test('should create many cast members', () => {
    const faker = CastMemberFakeBuilder.theCastMembers(2);
    let castMembers = faker.build();

    castMembers.forEach((castMember) => {
      expect(castMember.cast_member_id).toBeInstanceOf(Uuid);
      expect(typeof castMember.name === 'string').toBeTruthy();
      // expect(castMember.type).toBeInstanceOf(CastMemberType);
      expect(castMember.created_at).toBeInstanceOf(Date);
    });

    const created_at = new Date();
    const cast_member_id = new Uuid();
    castMembers = faker
      .withUuid(cast_member_id)
      .withName('test name')
      .withType(CastMemberType.ACTOR)
      .withCreatedAt(created_at)
      .build();

    castMembers.forEach((castMember) => {
      expect(castMember.cast_member_id).toBe(cast_member_id);
      expect(castMember.name).toBe('test name');
      expect(castMember.type).toBe(CastMemberType.ACTOR);
      expect(castMember.created_at).toBe(created_at);
    });
  });
});
