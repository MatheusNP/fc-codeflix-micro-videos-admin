import { Entity } from '../../../../domain/entity';
import { NotFoundError } from '../../../../domain/errors/not-found.error';
import { Uuid } from '../../../../domain/value-objects/uuid.vo';
import { InMemoryRepository } from '../in-memory.repository';

class StubEntityConstructorProps {
  entity_id?: Uuid;
  name: string;
  price: number;
}

class StubEntity extends Entity {
  entity_id: Uuid;
  name: string;
  price: number;

  constructor(props: StubEntityConstructorProps) {
    super();
    this.entity_id = props.entity_id || new Uuid();
    this.name = props.name;
    this.price = props.price;
  }

  toJSON() {
    return {
      entity_id: this.entity_id.id,
      name: this.name,
      price: this.price,
    };
  }
}

class StubInMemoryRepository extends InMemoryRepository<StubEntity, Uuid> {
  getEntity(): new (...args: any[]) => StubEntity {
    return StubEntity;
  }
}

describe('InMemory Repository Unit Tests', () => {
  let repo: StubInMemoryRepository;

  beforeEach(() => {
    repo = new StubInMemoryRepository();
  });

  it('should insert an entity', async () => {
    const entity = new StubEntity({
      entity_id: new Uuid(),
      name: 'Product 1',
      price: 10,
    });
    await repo.insert(entity);
    expect(repo.items).toHaveLength(1);
    expect(repo.items[0]).toBe(entity);
  });

  it('should bulk insert entities', async () => {
    const entity1 = new StubEntity({
      entity_id: new Uuid(),
      name: 'Product 1',
      price: 10,
    });
    const entity2 = new StubEntity({
      entity_id: new Uuid(),
      name: 'Product 2',
      price: 20,
    });
    await repo.bulkInsert([entity1, entity2]);
    expect(repo.items).toHaveLength(2);
    expect(repo.items[0]).toBe(entity1);
    expect(repo.items[1]).toBe(entity2);
  });

  it('should return all entities', async () => {
    const entity = new StubEntity({
      name: 'Product 1',
      price: 10,
    });
    await repo.insert(entity);
    const entities = await repo.findAll();
    expect(entities).toHaveLength(1);
    expect(entities[0]).toBe(entity);
  });

  it('should throwserror on update when entity not found', async () => {
    const entity = new StubEntity({
      name: 'Product 1',
      price: 10,
    });

    await expect(repo.update(entity)).rejects.toThrow(
      new NotFoundError(entity.entity_id, StubEntity)
    );
  });

  it('should update an entity', async () => {
    const entity = new StubEntity({
      name: 'Product 1',
      price: 10,
    });
    await repo.insert(entity);

    const entityUpdated = new StubEntity({
      entity_id: entity.entity_id,
      name: 'Product 1 Updated',
      price: 20,
    });
    await repo.update(entityUpdated);

    await expect(entityUpdated.toJSON()).toStrictEqual(repo.items[0].toJSON());
  });

  it('should throws error on delete when entity not found', async () => {
    const uuid = new Uuid();
    await expect(repo.delete(uuid)).rejects.toThrow(
      new NotFoundError(uuid, StubEntity)
    );
  });

  it('should delete an entity', async () => {
    const entity = new StubEntity({
      name: 'Product 1',
      price: 10,
    });
    await repo.insert(entity);
    await repo.delete(entity.entity_id);
    expect(repo.items).toHaveLength(0);
  });
});
