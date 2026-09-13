import { ResourceNotFoundError } from '@core/errors/common/resource-not-found-error';
import { Document } from '@modules/producers/domain/value-objects/document';
import { Producer } from '@modules/producers/domain/entities/producer';
import { ProducerRepository } from '@modules/producers/domain/repositories/producer-repository';
import { DocumentAlreadyUsedError } from '../errors/document-already-used-error';

export interface Params {
  id: string;
  name?: string;
  document?: string;
}

export class UpdateProducerUseCase {
  constructor(private readonly repository: ProducerRepository) {}

  async execute(params: Params): Promise<Producer> {
    const producer = await this.repository.findById(params.id);
    if (!producer) throw new ResourceNotFoundError('Producer not found');

    const document =
      params.document === undefined ? undefined : Document.create(params.document);

    if (document) {
      const existing = await this.repository.findByDocument(document.value);
      if (existing && !existing.equals(producer)) throw new DocumentAlreadyUsedError();
    }

    producer.update({
      ...(params.name === undefined ? {} : { name: params.name }),
      ...(document === undefined ? {} : { document }),
    });

    await this.repository.save(producer);

    return producer;
  }
}
