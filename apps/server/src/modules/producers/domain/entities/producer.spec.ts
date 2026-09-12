import { EntityValidationError } from '@core/errors/common/entity-validation-error';
import { UniqueEntityID } from '@core/entities/unique-entity-id';
import { Document } from '@modules/producers/domain/value-objects/document';
import { Producer } from '@modules/producers/domain/entities/producer';

describe('Producer', () => {
  it('should be able to create a producer with a valid name and document', () => {
    const producer = Producer.create({
      name: 'Maria Silva',
      document: Document.create('529.982.247-25'),
    });
    expect(producer.name).toBe('Maria Silva');
    expect(producer.document.value).toBe('52998224725');
  });

  it('should not be able to create a producer with an empty name', () => {
    expect(() =>
      Producer.create({ name: ' ', document: Document.create('52998224725') }),
    ).toThrow(EntityValidationError);
  });

  it('should be able to accept a Document value object', () => {
    const document = Document.create('52998224725');
    expect(Producer.create({ name: 'Maria Silva', document }).document).toBe(document);
  });

  it('should be able to preserve a supplied ID', () => {
    const id = new UniqueEntityID('producer-1');
    expect(
      Producer.create(
        { name: 'Maria Silva', document: Document.create('52998224725') },
        id,
      ).id,
    ).toBe(id);
  });
});
