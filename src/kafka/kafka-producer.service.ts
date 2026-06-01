import { Inject, Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class KafkaProducerService implements OnModuleInit {
  private readonly logger = new Logger(KafkaProducerService.name);

  // Khoi tao lop va nhan cac dependency can thiet qua dependency injection de xu ly nghiep vu.
  constructor(@Inject('KAFKA_CLIENT') private readonly kafkaClient: ClientKafka) {}

  // Chay khi module duoc khoi tao de chuan bi ket noi, dang ky Kafka pattern hoac seed du lieu can thiet.
  async onModuleInit() {
    await this.kafkaClient.connect();
    this.logger.log('Kafka producer connected');
  }

  // Gui su kien len Kafka/Redpanda de cac service khac xu ly bat dong bo.
  async emit(topic: string, data: object): Promise<void> {
    try {
      await lastValueFrom(this.kafkaClient.emit(topic, data));
    } catch (error) {
      // Non-fatal: user-service still works if Kafka is temporarily unavailable
      this.logger.error(`Failed to emit event to topic "${topic}": ${error.message}`);
    }
  }
}
