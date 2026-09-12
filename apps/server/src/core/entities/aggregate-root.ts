import { z } from 'zod';
import { DomainEvent } from '../events/domain-event';
import { DomainEvents } from '../events/domain-events';
import { Entity } from './entity';

export abstract class AggregateRoot<Props extends z.ZodType> extends Entity<Props> {
  #domainEvents: DomainEvent[] = [];

  get domainEvents(): DomainEvent[] {
    return this.#domainEvents;
  }

  protected addDomainEvent(domainEvent: DomainEvent): void {
    this.#domainEvents.push(domainEvent);
    DomainEvents.markAggregateForDispatch(this);
  }

  public clearEvents() {
    this.#domainEvents = [];
  }
}
