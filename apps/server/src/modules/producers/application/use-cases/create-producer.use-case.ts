import { Injectable } from '@nestjs/common';

import { Document } from '@modules/producers/domain/value-objects/document';
import { Producer } from '@modules/producers/domain/entities/producer';
import { ProducersRepository } from '@modules/producers/domain/repositories/producers.repository';
import { DocumentAlreadyUsedError } from '../errors/document-already-used-error';

export interface Params {
  name: string;
  document: string;
}

@Injectable()
export class CreateProducerUseCase {
  constructor(private readonly repository: ProducersRepository) {}

  async execute(params: Params): Promise<Producer> {
    const document = Document.create(params.document);

    const existingProducer = await this.repository.findByDocument(document.value);
    if (existingProducer) throw new DocumentAlreadyUsedError();

    const producer = Producer.create({ name: params.name, document });
    await this.repository.save(producer);

    return producer;
  }
}
