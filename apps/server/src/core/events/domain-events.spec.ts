import { z } from 'zod';
import { DomainEvent } from '../events/domain-event';
import { UniqueEntityID } from '../entities/unique-entity-id';
import { AggregateRoot } from '../entities/aggregate-root';
import { DomainEvents } from './domain-events';

class CustomAggregateCreated implements DomainEvent {
  public occurredAt: Date;
  private aggregate: CustomAggregate;

  constructor(aggregate: CustomAggregate) {
    this.aggregate = aggregate;
    this.occurredAt = new Date();
  }

  public getAggregateId(): UniqueEntityID {
    return this.aggregate.id;
  }
}

class CustomAggregate extends AggregateRoot<z.ZodNull> {
  static create() {
    const aggregate = new CustomAggregate(null);

    aggregate.addDomainEvent(new CustomAggregateCreated(aggregate));

    return aggregate;
  }
}

describe('domain events', () => {
  it('should be able to dispatch and listen to events', async () => {
    const callbackSpy = jest.fn();

    // Register a subscriber listening for the "created response" event.
    DomainEvents.register(callbackSpy, CustomAggregateCreated.name);

    // Create a response without saving it to the database.
    const aggregate = CustomAggregate.create();

    // Ensure the event was created but not dispatched.
    expect(aggregate.domainEvents).toHaveLength(1);

    // Save the response to the database, dispatching the event.
    DomainEvents.dispatchEventsForAggregate(aggregate.id);

    // The subscriber receives the event and handles the data.
    expect(callbackSpy).toHaveBeenCalled();

    expect(aggregate.domainEvents).toHaveLength(0);
  });
});
