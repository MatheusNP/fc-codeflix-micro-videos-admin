import { ValueObject } from '../value-object';

class StringValueObject extends ValueObject {
  constructor(readonly value: string) {
    super();
  }
}

class ComplexValueObject extends ValueObject {
  constructor(readonly prop1: string, readonly prop2: number) {
    super();
  }
}

describe('ValueObject unit tests', () => {
  test('should be equal', () => {
    const stringValueObject1 = new StringValueObject('test');
    const stringValueObject2 = new StringValueObject('test');

    expect(stringValueObject1.equals(stringValueObject2)).toBeTruthy();

    const complexValueObject1 = new ComplexValueObject('test', 1);
    const complexValueObject2 = new ComplexValueObject('test', 1);

    expect(complexValueObject1.equals(complexValueObject2)).toBeTruthy();
  });

  test('should be not equal', () => {
    const stringValueObject1 = new StringValueObject('test1');
    const stringValueObject2 = new StringValueObject('test2');

    expect(stringValueObject1.equals(stringValueObject2)).toBeFalsy();
    expect(stringValueObject1.equals(null as any)).toBeFalsy();
    expect(stringValueObject1.equals(undefined as any)).toBeFalsy();

    const complexValueObject1 = new ComplexValueObject('test', 1);
    const complexValueObject2 = new ComplexValueObject('test', 2);

    expect(complexValueObject1.equals(complexValueObject2)).toBeFalsy();
    expect(complexValueObject1.equals(null as any)).toBeFalsy();
    expect(complexValueObject1.equals(undefined as any)).toBeFalsy();
  });
});
