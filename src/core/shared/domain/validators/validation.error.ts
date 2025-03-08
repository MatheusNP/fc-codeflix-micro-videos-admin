import { FieldsErrors } from './validator-fields-interface';

export class BaseValidationError extends Error {
  constructor(
    public errors: FieldsErrors[],
    message = 'Validation Error',
  ) {
    super(message);
  }

  count(): number {
    return Object.keys(this.errors).length;
  }
}

export class ValidationError extends Error {}

export class EntityValidationError extends BaseValidationError {
  constructor(errors: FieldsErrors[]) {
    super(errors, 'Entity Validation Error');
    this.name = this.constructor.name;
  }
}

export class SearchValidationError extends BaseValidationError {
  constructor(errors: FieldsErrors[]) {
    super(errors, 'Search Validation Error');
    this.name = this.constructor.name;
  }
}

export class LoadEntityError extends BaseValidationError {
  constructor(errors: FieldsErrors[]) {
    super(errors, 'Load Entity Error');
    this.name = this.constructor.name;
  }
}
