import { AggregateRoot } from '../aggregate-root';
import { IDomainEvent } from '../events/domain-event.interface';
import { ValueObject } from '../value-object';
import { Uuid } from '../value-objects/uuid.vo';

class StubEvent implements IDomainEvent {
  occurred_on: Date;
  event_version: number = 1;

  constructor(
    public aggregate_id: Uuid,
    public name: string,
  ) {
    this.occurred_on = new Date();
    this.name;
  }
}

class StubAggregateRoot extends AggregateRoot {
  name: string;
  aggregate_id: Uuid;
  field1: string;

  constructor(name: string, id: Uuid) {
    super();
    this.name = name;
    this.aggregate_id = id;
    this.registerHandler(StubEvent.name, this.onStubEvent.bind(this));
  }

  operation() {
    this.name = this.name.toUpperCase();
    this.applyEvent(new StubEvent(this.aggregate_id, this.name));
  }

  onStubEvent(event: StubEvent) {
    this.field1 = event.name;
  }

  get entity_id(): ValueObject {
    return this.aggregate_id;
  }
  toJSON() {
    return {
      aggregate_id: this.aggregate_id,
      name: this.name,
      field1: this.field1,
    };
  }
}

describe('AggregateRoot Unit Tests', () => {
  test('dispatch events', () => {
    const id = new Uuid();
    const aggregate = new StubAggregateRoot('test name', id);
    aggregate.operation();

    expect(aggregate.field1).toBe('TEST NAME');
  });
});
