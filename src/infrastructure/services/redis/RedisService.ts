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

  async scanKeys(pattern: string): Promise<string[]> {
    await this.connect();
    const keys: string[] = [];
    // Using any as a fallback to bypass potential type mismatch in older/newer redis client versions
    const iterator = (this.client as any).scanIterator({
      MATCH: pattern,
      COUNT: 100,
    });
    
    for await (const key of iterator) {
      keys.push(key);
    }
    return keys;
  }

  async deleteKeys(keys: string[]): Promise<void> {
    if (!keys || keys.length === 0) return;
    await this.connect();
    
    // Filter to ensure we only have valid, non-empty strings
    const validKeys = keys.filter(k => typeof k === 'string' && k.length > 0);
    if (validKeys.length === 0) return;

    for (const key of validKeys) {
      try {
        await this.client.del(key);
      } catch (err) {
        logger.error(`[RedisService] Failed to delete key "${key}":`, err);
      }
    }
  }
}
