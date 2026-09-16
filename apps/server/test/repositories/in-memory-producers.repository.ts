import {
  FindManyProducersParams,
  FindManyProducersResult,
  ProducersRepository,
} from '@modules/producers/domain/repositories/producers.repository';
import { Producer } from '@modules/producers/domain/entities/producer';
import { InMemoryFarmsRepository } from './in-memory-farms.repository';
import { Document } from '@modules/producers/domain/value-objects/document';

export class InMemoryProducersRepository implements ProducersRepository {
  public items: Producer[] = [];

  constructor(private readonly farmsRepository: InMemoryFarmsRepository) {
    farmsRepository.setProducersRepository(this);
  }

  async findById(id: string): Promise<Producer | null> {
    return this.items.find((item) => item.id.toString() === id) ?? null;
  }

  async findByDocument(document: string): Promise<Producer | null> {
    return this.items.find((item) => item.document.value === document) ?? null;
  }

  async findMany(params: FindManyProducersParams): Promise<FindManyProducersResult> {
    const search = params.search?.toLocaleLowerCase();
    const normalizedSearch = params.search ? Document.strip(params.search) : undefined;
    const filtered = this.items
      .filter(
        (item) =>
          !search ||
          item.name.toLocaleLowerCase().includes(search) ||
          (!!normalizedSearch && item.document.value.includes(normalizedSearch)),
      )
      .sort(
        (a, b) =>
          b.createdAt.getTime() - a.createdAt.getTime() ||
          a.id.toString().localeCompare(b.id.toString()),
      );
    const start = (params.page - 1) * params.perPage;

    return {
      items: filtered.slice(start, start + params.perPage).map((item) => ({
        producer: item,
        farmsCount: this.farmsRepository.items.filter(
          (farm) => farm.producerId === item.id.toString(),
        ).length,
      })),
      total: filtered.length,
    };
  }

  async save(producer: Producer): Promise<Producer> {
    const index = this.items.findIndex((item) => item.id.equals(producer.id));
    if (index === -1) this.items.push(producer);
    else this.items[index] = producer;
    return producer;
  }

  async deleteById(id: string): Promise<void> {
    this.items = this.items.filter((item) => item.id.toString() !== id);
  }
}
