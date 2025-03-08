import { Either } from '@core/shared/domain/either';
import { ValueObject } from '@core/shared/domain/value-object';

export enum CastMemberTypes {
  DIRECTOR = 1,
  ACTOR = 2,
}

export class CastMemberType extends ValueObject {
  constructor(readonly type: CastMemberTypes) {
    super();
    this.validate();
  }

  private validate() {
    const _type = Number(this.type);

    const isValid = Object.values(CastMemberTypes).includes(_type);
    if (!isValid) {
      throw new InvalidCastMemberTypeError(_type);
    }
  }

  static create(
    value: CastMemberTypes,
  ): Either<CastMemberType, InvalidCastMemberTypeError> {
    return Either.safe(() => new CastMemberType(value));
  }

  static createADirector(): CastMemberType {
    return CastMemberType.create(CastMemberTypes.DIRECTOR).ok;
  }

  static createAnActor(): CastMemberType {
    return CastMemberType.create(CastMemberTypes.ACTOR).ok;
  }
}

export class InvalidCastMemberTypeError extends Error {
  constructor(invalidType: any) {
    super(`Invalid cast member type: ${invalidType}`);
    this.name = this.constructor.name;
  }
}
