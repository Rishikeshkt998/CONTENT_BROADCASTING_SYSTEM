import { createClient, RedisClientType } from 'redis';
import logger from '../../logging/winston/AppLogger';

export class RedisService {
  private client: RedisClientType;
  private isConnected: boolean = false;

  constructor() {
    this.client = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379'
    });

    this.client.on('error', (err) => logger.error('Redis Client Error', err));
    this.client.on('connect', () => {
      this.isConnected = true;
      logger.info('Redis Client Connected');
    });
  }

  async connect(): Promise<void> {
    if (!this.isConnected) {
      await this.client.connect();
    }
  }

  async setValue(key: string, value: string, expirySeconds?: number): Promise<void> {
    await this.connect();
    if (expirySeconds) {
      await this.client.set(key, value, { EX: expirySeconds });
    } else {
      await this.client.set(key, value);
    }
  }

  async getValue(key: string): Promise<string | null> {
    await this.connect();
    return await this.client.get(key);
  }

  async deleteKey(key: string): Promise<void> {
    await this.connect();
    await this.client.del(key);
  }
}
