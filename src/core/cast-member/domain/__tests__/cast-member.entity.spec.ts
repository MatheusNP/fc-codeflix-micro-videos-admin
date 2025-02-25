import { Uuid } from '@core/shared/domain/value-objects/uuid.vo';
import { CastMember } from '../cast-member.entity';
import { CastMemberType } from '../cast-member.type';

describe('CastMember entity unit tests', () => {
  const castMemberTypeValues = Object.values(CastMemberType)
    .filter((value) => typeof value === 'number')
    .join(', ');

  beforeAll(() => {
    CastMember.prototype.validate = jest
      .fn()
      .mockImplementation(CastMember.prototype.validate);
  });

  describe('constructor', () => {
    test('should initialize constructor with default fields', () => {
      const castMember = new CastMember({
        name: 'Actor',
        type: CastMemberType.ACTOR,
      });

      expect(castMember.cast_member_id).toBeInstanceOf(Uuid);
      expect(castMember.name).toBe('Actor');
      expect(castMember.type).toBe(CastMemberType.ACTOR);
      expect(castMember.created_at).toBeInstanceOf(Date);
    });

    test('should initialize constructor with all fields', () => {
      const created_at = new Date();
      const castMember = new CastMember({
        name: 'Actor',
        type: CastMemberType.ACTOR,
        created_at,
      });

      expect(castMember.cast_member_id).toBeInstanceOf(Uuid);
      expect(castMember.name).toBe('Actor');
      expect(castMember.type).toBe(CastMemberType.ACTOR);
      expect(castMember.created_at).toBe(created_at);
    });
  });

  describe('create command', () => {
    test('should create a cast member', () => {
      const castMember = CastMember.create({
        name: 'Actor',
        type: CastMemberType.ACTOR,
      });

      expect(castMember.cast_member_id).toBeInstanceOf(Uuid);
      expect(castMember.name).toBe('Actor');
      expect(castMember.type).toBe(CastMemberType.ACTOR);
      expect(castMember.created_at).toBeInstanceOf(Date);
    });
  });

  describe('cast_member_id field', () => {
    const arrange = [
      { cast_member_id: null },
      { cast_member_id: undefined },
      { cast_member_id: new Uuid() },
    ];

    test.each(arrange)('id = %j', ({ cast_member_id }) => {
      const castMember = new CastMember({
        name: 'Actor',
        type: CastMemberType.ACTOR,
        cast_member_id: cast_member_id as any,
      });
      expect(castMember.cast_member_id).toBeInstanceOf(Uuid);
      if (cast_member_id instanceof Uuid) {
        expect(castMember.cast_member_id).toBe(cast_member_id);
      }
    });
  });

  test('should change the name of a cast member', () => {
    const castMember = CastMember.create({
      name: 'Actor',
      type: CastMemberType.ACTOR,
    });

    castMember.changeName('Actor 2');

    expect(castMember.name).toBe('Actor 2');
    expect(CastMember.prototype.validate).toHaveBeenCalledTimes(2);
  });

  test('should change the type of a cast member', () => {
    const castMember = CastMember.create({
      name: 'Actor',
      type: CastMemberType.ACTOR,
    });

    castMember.changeType(CastMemberType.DIRECTOR);

    expect(castMember.type).toBe(CastMemberType.DIRECTOR);
    expect(CastMember.prototype.validate).toHaveBeenCalledTimes(2);
  });

  describe('CastMember validator unit tests', () => {
    describe('create command', () => {
      test('should throw error when name is invalid', () => {
        const castMember = CastMember.create({
          name: 't'.repeat(256),
          type: CastMemberType.ACTOR,
        });

        expect(castMember.notification.hasErrors()).toBeTruthy();
        expect(castMember.notification).notificationContainsErrorMessages([
          {
            name: ['name must be shorter than or equal to 255 characters'],
          },
        ]);
      });

      test('should throw error when type is invalid', () => {
        const castMember = CastMember.create({
          name: 'Actor',
          type: 0,
        });

        expect(castMember.notification.hasErrors()).toBeTruthy();
        expect(castMember.notification).notificationContainsErrorMessages([
          {
            type: [
              `type must be one of the following values: ${castMemberTypeValues}`,
            ],
          },
        ]);
      });
    });

    describe('changeName method unit tests', () => {
      it('should throw error when name is invalid', () => {
        const castMember = CastMember.create({
          name: 'Actor',
          type: CastMemberType.ACTOR,
        });

        castMember.changeName('t'.repeat(256));

        expect(castMember.notification.hasErrors()).toBeTruthy();
        expect(castMember.notification).notificationContainsErrorMessages([
          {
            name: ['name must be shorter than or equal to 255 characters'],
          },
        ]);
      });
    });

    describe('changeType method unit tests', () => {
      it('should throw error when type is invalid', () => {
        const castMember = CastMember.create({
          name: 'Actor',
          type: CastMemberType.ACTOR,
        });

        castMember.changeType(0 as any);

        expect(castMember.notification.hasErrors()).toBeTruthy();
        expect(castMember.notification).notificationContainsErrorMessages([
          {
            type: [
              `type must be one of the following values: ${castMemberTypeValues}`,
            ],
          },
        ]);
      });
    });
  });
});
