import { Producer } from "@modules/producers/domain/entities/producer"

export interface ProducerRepository {
  findById(id: string): Promise<Producer | null>
  findByDocument(document: string): Promise<Producer | null>
  save(producer: Producer): Promise<void>
  deleteById(id: string): Promise<void>
}
