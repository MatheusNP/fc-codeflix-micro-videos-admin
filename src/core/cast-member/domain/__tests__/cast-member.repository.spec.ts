import { SearchValidationError } from '@core/shared/domain/validators/validation.error';
import { CastMemberTypes } from '../cast-member-type.vo';
import { CastMemberSearchParams } from '../cast-member.repository';

describe('CastMemberRepository unit tests', () => {
  describe('create', () => {
    it('should create a new instance with default values', () => {
      const searchParams = CastMemberSearchParams.create();

      expect(searchParams).toBeInstanceOf(CastMemberSearchParams);
      expect(searchParams.filter).toBeNull();
    });

    it('should create a new instance with provided values', () => {
      const searchParams = CastMemberSearchParams.create({
        filter: {
          name: 'test',
          type: CastMemberTypes.ACTOR,
        },
      });

      expect(searchParams).toBeInstanceOf(CastMemberSearchParams);
      expect(searchParams.filter!.name).toBe('test');
      expect(searchParams.filter!.type!.type).toBe(CastMemberTypes.ACTOR);
    });

    it('should throw an error if provided type is invalid', () => {
      expect(() => {
        CastMemberSearchParams.create({
          filter: {
            type: 'invalid' as any,
          },
        });
      }).toThrowError(SearchValidationError);
    });
  });
});
