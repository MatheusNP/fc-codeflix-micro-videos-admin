import { CastMemberType, CastMemberTypes } from '../cast-member-type.vo';
import { CastMember, CastMemberId } from '../cast-member.aggregate';

describe('CastMember entity unit tests', () => {
  beforeAll(() => {
    CastMember.prototype.validate = jest
      .fn()
      .mockImplementation(CastMember.prototype.validate);
  });

  describe('constructor', () => {
    test('should initialize constructor with default fields', () => {
      const castMember = new CastMember({
        name: 'Actor',
        type: CastMemberType.createAnActor(),
      });

      expect(castMember.cast_member_id).toBeInstanceOf(CastMemberId);
      expect(castMember.name).toBe('Actor');
      expect(castMember.type.type).toBe(CastMemberTypes.ACTOR);
      expect(castMember.created_at).toBeInstanceOf(Date);
    });

    test('should initialize constructor with all fields', () => {
      const created_at = new Date();
      const castMember = new CastMember({
        name: 'Actor',
        type: CastMemberType.createAnActor(),
        created_at,
      });

      expect(castMember.cast_member_id).toBeInstanceOf(CastMemberId);
      expect(castMember.name).toBe('Actor');
      expect(castMember.type.type).toBe(CastMemberTypes.ACTOR);
      expect(castMember.created_at).toBe(created_at);
    });
  });

  describe('create command', () => {
    test('should create a cast member', () => {
      const castMember = CastMember.create({
        name: 'Actor',
        type: CastMemberType.createAnActor(),
      });

      expect(castMember.cast_member_id).toBeInstanceOf(CastMemberId);
      expect(castMember.name).toBe('Actor');
      expect(castMember.type.type).toBe(CastMemberTypes.ACTOR);
      expect(castMember.created_at).toBeInstanceOf(Date);
    });
  });

  describe('cast_member_id field', () => {
    const arrange = [
      { cast_member_id: null },
      { cast_member_id: undefined },
      { cast_member_id: new CastMemberId() },
    ];

    test.each(arrange)('id = %j', ({ cast_member_id }) => {
      const castMember = new CastMember({
        name: 'Actor',
        type: CastMemberType.createAnActor(),
        cast_member_id: cast_member_id as any,
      });
      expect(castMember.cast_member_id).toBeInstanceOf(CastMemberId);
      if (cast_member_id instanceof CastMemberId) {
        expect(castMember.cast_member_id).toBe(cast_member_id);
      }
    });
  });

  test('should change the name of a cast member', () => {
    const castMember = CastMember.create({
      name: 'Actor',
      type: CastMemberType.createAnActor(),
    });

    castMember.changeName('Actor 2');

    expect(castMember.name).toBe('Actor 2');
    expect(CastMember.prototype.validate).toHaveBeenCalledTimes(2);
  });

  test('should change the type of a cast member', () => {
    const castMember = CastMember.create({
      name: 'Actor',
      type: CastMemberType.createAnActor(),
    });

    castMember.changeType(CastMemberType.createADirector());

    expect(castMember.type.type).toBe(CastMemberTypes.DIRECTOR);
    expect(CastMember.prototype.validate).toHaveBeenCalledTimes(1);
  });

  describe('CastMember validator unit tests', () => {
    describe('create command', () => {
      test('should throw error when name is invalid', () => {
        const castMember = CastMember.create({
          name: 't'.repeat(256),
          type: CastMemberType.createAnActor(),
        });

        expect(castMember.notification.hasErrors()).toBeTruthy();
        expect(castMember.notification).notificationContainsErrorMessages([
          {
            name: ['name must be shorter than or equal to 255 characters'],
          },
        ]);
      });
    });

    describe('changeName method unit tests', () => {
      it('should throw error when name is invalid', () => {
        const castMember = CastMember.create({
          name: 'Actor',
          type: CastMemberType.createAnActor(),
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
  });
});
