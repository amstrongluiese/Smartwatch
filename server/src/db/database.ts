import fs from 'fs';
import path from 'path';
import { DatabaseSync } from 'node:sqlite';
import { Pool as PgPool } from 'pg';
import mysql, { Pool as MySqlPool } from 'mysql2/promise';
import { config } from '../config/env';

// Data Models
export interface User {
  id: number;
  xiaomi_user_id: string;
  created_at: string;
  updated_at: string;
}

export interface XiaomiToken {
  id: number;
  user_id: number;
  access_token_encrypted: string;
  refresh_token_encrypted: string | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Device {
  id: number;
  user_id: number;
  device_id: string;
  device_name: string;
  device_type: string;
  connection_info: string;
  last_sync_time: string | null;
  created_at: string;
  updated_at: string;
}

export interface HealthData {
  id: number;
  user_id: number;
  device_id: string | null;
  data_type: string;
  value: number;
  unit: string;
  timestamp: string;
  source: string;
  raw_data_reference: string | null;
  created_at: string;
}

export interface ApiLog {
  id: number;
  user_id: number | null;
  endpoint: string;
  http_status: number;
  response_time_ms: number;
  data_type: string | null;
  sanitized_response: string;
  created_at: string;
}

export interface InsertHealthData {
  user_id: number;
  device_id?: string;
  data_type: string;
  value: number;
  unit: string;
  timestamp: string;
  source?: string;
  raw_data_reference?: string;
}

export interface InsertApiLog {
  user_id?: number | null;
  endpoint: string;
  http_status: number;
  response_time_ms: number;
  data_type?: string | null;
  sanitized_response: string;
}

class DatabaseManager {
  private sqliteDb: DatabaseSync | null = null;
  private pgPool: PgPool | null = null;
  private mysqlPool: MySqlPool | null = null;
  private initialized = false;

  public async init(): Promise<void> {
    if (this.initialized) return;

    const dbType = config.dbType;
    console.log(`[Database] Initializing with dialect: ${dbType}`);

    try {
      if (dbType === 'sqlite') {
        const dbPath = path.resolve(process.cwd(), config.dbFile);
        const dir = path.dirname(dbPath);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        this.sqliteDb = new DatabaseSync(dbPath);
        const schemaPath = path.resolve(__dirname, 'schema.sqlite.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');
        this.sqliteDb.exec(schemaSql);
        console.log(`[Database] SQLite connected & schema synchronized at ${dbPath}`);
      } else if (dbType === 'postgres') {
        this.pgPool = new PgPool({
          host: config.dbHost || 'localhost',
          port: config.dbPort || 5432,
          user: config.dbUser || 'postgres',
          password: config.dbPassword || '',
          database: config.dbName || 'xiaomi_healthkit',
        });
        const client = await this.pgPool.connect();
        try {
          const schemaPath = path.resolve(__dirname, 'schema.postgres.sql');
          const schemaSql = fs.readFileSync(schemaPath, 'utf8');
          await client.query(schemaSql);
          console.log(`[Database] PostgreSQL connected & schema synchronized`);
        } finally {
          client.release();
        }
      } else if (dbType === 'mysql') {
        this.mysqlPool = mysql.createPool({
          host: config.dbHost || 'localhost',
          port: config.dbPort || 3306,
          user: config.dbUser || 'root',
          password: config.dbPassword || '',
          database: config.dbName || 'xiaomi_healthkit',
          multipleStatements: true,
        });
        const schemaPath = path.resolve(__dirname, 'schema.mysql.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');
        await this.mysqlPool.query(schemaSql);
        console.log(`[Database] MySQL connected & schema synchronized`);
      }

      this.initialized = true;
    } catch (err: any) {
      console.error(`[Database] Initialization error (${dbType}):`, err.message);
      if (dbType !== 'sqlite') {
        console.warn(`[Database] Falling back to SQLite local database for instant zero-configuration local development.`);
        config.dbType = 'sqlite';
        return this.init();
      }
      throw err;
    }
  }

  // Convert ? placeholder to $1, $2 for Postgres
  private formatQuery(sql: string): string {
    if (config.dbType === 'postgres') {
      let index = 1;
      return sql.replace(/\?/g, () => `$${index++}`);
    }
    return sql;
  }

  public async query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
    if (!this.initialized) await this.init();

    if (config.dbType === 'sqlite' && this.sqliteDb) {
      const stmt = this.sqliteDb.prepare(sql);
      return stmt.all(...params) as T[];
    } else if (config.dbType === 'postgres' && this.pgPool) {
      const formatted = this.formatQuery(sql);
      const res = await this.pgPool.query(formatted, params);
      return res.rows as T[];
    } else if (config.dbType === 'mysql' && this.mysqlPool) {
      const [rows] = await this.mysqlPool.execute(sql, params);
      return rows as T[];
    }

    throw new Error('Database not initialized');
  }

  public async getOne<T = any>(sql: string, params: any[] = []): Promise<T | null> {
    const rows = await this.query<T>(sql, params);
    return rows.length > 0 ? rows[0] : null;
  }

  public async execute(sql: string, params: any[] = []): Promise<{ insertId?: number; affectedRows: number }> {
    if (!this.initialized) await this.init();

    if (config.dbType === 'sqlite' && this.sqliteDb) {
      const stmt = this.sqliteDb.prepare(sql);
      const info = stmt.run(...params);
      return {
        insertId: Number(info.lastInsertRowid),
        affectedRows: Number(info.changes),
      };
    } else if (config.dbType === 'postgres' && this.pgPool) {
      const formatted = this.formatQuery(sql);
      // For Postgres insert return id if needed
      const res = await this.pgPool.query(formatted, params);
      return {
        affectedRows: res.rowCount || 0,
      };
    } else if (config.dbType === 'mysql' && this.mysqlPool) {
      const [res] = await this.mysqlPool.execute(sql, params) as any;
      return {
        insertId: res.insertId,
        affectedRows: res.affectedRows,
      };
    }

    throw new Error('Database not initialized');
  }

  // Repository Methods
  public async findOrCreateUser(xiaomiUserId: string): Promise<User> {
    let user = await this.getOne<User>('SELECT * FROM users WHERE xiaomi_user_id = ?', [xiaomiUserId]);
    if (!user) {
      const now = new Date().toISOString();
      await this.execute(
        'INSERT INTO users (xiaomi_user_id, created_at, updated_at) VALUES (?, ?, ?)',
        [xiaomiUserId, now, now]
      );
      user = await this.getOne<User>('SELECT * FROM users WHERE xiaomi_user_id = ?', [xiaomiUserId]);
    }
    return user!;
  }

  public async getFirstUser(): Promise<User | null> {
    return this.getOne<User>('SELECT * FROM users ORDER BY id ASC LIMIT 1');
  }

  public async saveTokens(
    userId: number,
    accessTokenEncrypted: string,
    refreshTokenEncrypted: string | null,
    expiresAt: string | null
  ): Promise<void> {
    const existing = await this.getOne<XiaomiToken>('SELECT * FROM xiaomi_tokens WHERE user_id = ?', [userId]);
    const now = new Date().toISOString();
    if (existing) {
      await this.execute(
        'UPDATE xiaomi_tokens SET access_token_encrypted = ?, refresh_token_encrypted = ?, expires_at = ?, updated_at = ? WHERE user_id = ?',
        [accessTokenEncrypted, refreshTokenEncrypted, expiresAt, now, userId]
      );
    } else {
      await this.execute(
        'INSERT INTO xiaomi_tokens (user_id, access_token_encrypted, refresh_token_encrypted, expires_at, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
        [userId, accessTokenEncrypted, refreshTokenEncrypted, expiresAt, now, now]
      );
    }
  }

  public async getTokens(userId: number): Promise<XiaomiToken | null> {
    return this.getOne<XiaomiToken>('SELECT * FROM xiaomi_tokens WHERE user_id = ?', [userId]);
  }

  public async deleteTokens(userId: number): Promise<void> {
    await this.execute('DELETE FROM xiaomi_tokens WHERE user_id = ?', [userId]);
  }

  public async saveDevice(
    userId: number,
    deviceId: string,
    deviceName: string,
    deviceType: string,
    connectionInfo: string = 'Mi Fitness Cloud Sync (Cloud-to-Cloud)',
    lastSyncTime?: string
  ): Promise<Device> {
    const existing = await this.getOne<Device>('SELECT * FROM devices WHERE user_id = ? AND device_id = ?', [userId, deviceId]);
    const now = new Date().toISOString();
    const syncTime = lastSyncTime || now;

    if (existing) {
      await this.execute(
        'UPDATE devices SET device_name = ?, device_type = ?, connection_info = ?, last_sync_time = ?, updated_at = ? WHERE id = ?',
        [deviceName, deviceType, connectionInfo, syncTime, now, existing.id]
      );
      return (await this.getOne<Device>('SELECT * FROM devices WHERE id = ?', [existing.id]))!;
    } else {
      await this.execute(
        'INSERT INTO devices (user_id, device_id, device_name, device_type, connection_info, last_sync_time, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [userId, deviceId, deviceName, deviceType, connectionInfo, syncTime, now, now]
      );
      return (await this.getOne<Device>('SELECT * FROM devices WHERE user_id = ? AND device_id = ?', [userId, deviceId]))!;
    }
  }

  public async getUserDevices(userId: number): Promise<Device[]> {
    return this.query<Device>('SELECT * FROM devices WHERE user_id = ? ORDER BY id DESC', [userId]);
  }

  public async updateDeviceSyncTime(deviceId: string, syncTime: string): Promise<void> {
    await this.execute('UPDATE devices SET last_sync_time = ?, updated_at = ? WHERE device_id = ?', [syncTime, new Date().toISOString(), deviceId]);
  }

  public async insertHealthData(data: InsertHealthData): Promise<HealthData> {
    const now = new Date().toISOString();
    const source = data.source || 'Xiaomi HealthKit';
    const rawRef = data.raw_data_reference || null;

    await this.execute(
      'INSERT INTO health_data (user_id, device_id, data_type, value, unit, timestamp, source, raw_data_reference, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        data.user_id,
        data.device_id || null,
        data.data_type,
        data.value,
        data.unit,
        data.timestamp,
        source,
        rawRef,
        now,
      ]
    );

    const inserted = await this.getOne<HealthData>(
      'SELECT * FROM health_data WHERE user_id = ? AND data_type = ? AND timestamp = ? ORDER BY id DESC LIMIT 1',
      [data.user_id, data.data_type, data.timestamp]
    );
    return inserted!;
  }

  public async getLatestHealthData(userId: number): Promise<{
    heartRate: HealthData | null;
    spo2: HealthData | null;
  }> {
    const heartRate = await this.getOne<HealthData>(
      'SELECT * FROM health_data WHERE user_id = ? AND data_type = ? ORDER BY timestamp DESC LIMIT 1',
      [userId, 'com.xiaomi.heart_rate.delta']
    );

    const spo2 = await this.getOne<HealthData>(
      'SELECT * FROM health_data WHERE user_id = ? AND data_type = ? ORDER BY timestamp DESC LIMIT 1',
      [userId, 'com.xiaomi.spo2.instantaneous']
    );

    return { heartRate, spo2 };
  }

  public async getHealthDataHistory(
    userId: number,
    dataType?: string,
    limit: number = 50
  ): Promise<HealthData[]> {
    if (dataType) {
      return this.query<HealthData>(
        'SELECT * FROM health_data WHERE user_id = ? AND data_type = ? ORDER BY timestamp DESC LIMIT ?',
        [userId, dataType, limit]
      );
    }
    return this.query<HealthData>(
      'SELECT * FROM health_data WHERE user_id = ? ORDER BY timestamp DESC LIMIT ?',
      [userId, limit]
    );
  }

  public async insertApiLog(log: InsertApiLog): Promise<void> {
    const now = new Date().toISOString();
    await this.execute(
      'INSERT INTO api_logs (user_id, endpoint, http_status, response_time_ms, data_type, sanitized_response, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        log.user_id || null,
        log.endpoint,
        log.http_status,
        log.response_time_ms,
        log.data_type || null,
        log.sanitized_response,
        now,
      ]
    );
  }

  public async getApiLogs(limit: number = 50): Promise<ApiLog[]> {
    return this.query<ApiLog>('SELECT * FROM api_logs ORDER BY created_at DESC LIMIT ?', [limit]);
  }

  public async clearApiLogs(): Promise<void> {
    await this.execute('DELETE FROM api_logs');
  }
}

export const db = new DatabaseManager();
