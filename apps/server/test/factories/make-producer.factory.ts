import { faker } from '@faker-js/faker';
import { cpf, cnpj } from 'cpf-cnpj-validator';
import { UniqueEntityID } from '@core/entities/unique-entity-id';
import { Document } from '@modules/producers/domain/value-objects/document';
import { Producer } from '@modules/producers/domain/entities/producer';
import { Injectable } from '@nestjs/common';
import { ProducersRepository } from '@modules/producers/domain/repositories/producers.repository';

type Overrides = {
  name?: string;
  document?: string;
  createdAt?: Date;
  id?: UniqueEntityID;
};

export function makeProducer(data: Overrides = {}) {
  const document = faker.helpers.arrayElement([cpf.generate(), cnpj.generate()]);

  return Producer.create(
    {
      name: data.name ?? faker.person.fullName(),
      document: Document.create(data.document ?? document),
      createdAt: data.createdAt,
    },
    data.id,
  );
}

@Injectable()
export class ProducerFactory {
  constructor(private producersRepository: ProducersRepository) {}

  async make(data?: Overrides) {
    return await this.producersRepository.save(makeProducer(data));
  }
}
