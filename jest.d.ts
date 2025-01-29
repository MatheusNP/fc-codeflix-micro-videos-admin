declare global {
  namespace jest {
    interface Matchers<R> {
      containsErrorsMessages: (
        expected: Expected,
        received: FieldsErrors = null
      ) => R;
    }
  }
}
export {};
