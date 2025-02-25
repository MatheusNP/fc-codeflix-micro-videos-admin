export enum CastMemberType {
  DIRECTOR = 1,
  ACTOR = 2,
}

export const CastMemberTypeValues = Object.values(CastMemberType).filter(
  (value) => typeof value === 'number',
);

// export class InvalidCastMemberTypeError extends Error {
//   constructor(invalidType: any) {
//     super(`Invalid cast member type: ${invalidType}`);
//     this.name = this.constructor.name;
//   }
// }
