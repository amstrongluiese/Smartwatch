import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export interface Config {
  port: number;
  nodeEnv: string;
  clientUrl: string;

  // Xiaomi Developer credentials
  xiaomiClientId: string;
  xiaomiClientSecret: string;
  xiaomiRedirectUri: string;
  xiaomiApiBaseUrl: string;
  xiaomiAuthUrl: string;
  xiaomiTokenUrl: string;
  targetDeviceName: string;
  xiaomiHealthScopes: string;

  // Security
  encryptionKey: string;

  // Database
  dbType: 'sqlite' | 'postgres' | 'mysql';
  dbFile: string;
  dbHost?: string;
  dbPort?: number;
  dbUser?: string;
  dbPassword?: string;
  dbName?: string;

  // Demonstration mode
  enableSimulationFallback: boolean;
}

export const config: Config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',

  xiaomiClientId: process.env.XIAOMI_CLIENT_ID || '',
  xiaomiClientSecret: process.env.XIAOMI_CLIENT_SECRET || '',
  xiaomiRedirectUri: process.env.XIAOMI_REDIRECT_URI || 'http://localhost:5000/api/xiaomi/callback',
  xiaomiApiBaseUrl: process.env.XIAOMI_API_BASE_URL || 'https://open-api.aiot.xiaomi.com',
  xiaomiAuthUrl: process.env.XIAOMI_OAUTH_AUTH_URL || 'https://account.xiaomi.com/oauth2/authorize',
  xiaomiTokenUrl: process.env.XIAOMI_OAUTH_TOKEN_URL || 'https://account.xiaomi.com/oauth2/token',
  targetDeviceName: process.env.TARGET_DEVICE_NAME || 'Xiaomi Smart Band 9 Active',
  xiaomiHealthScopes: process.env.XIAOMI_HEALTH_SCOPES || 'com.xiaomi.heart_rate.delta.read com.xiaomi.spo2.instantaneous.read',

  // Ensure 32-byte key for AES-256
  encryptionKey: (process.env.ENCRYPTION_KEY || 'c3694f4a3e75e9b814a0f4886612d33451b689bc6a917a26f633e08c87ab42f1').padEnd(64, '0').slice(0, 64),

  dbType: (process.env.DB_TYPE as 'sqlite' | 'postgres' | 'mysql') || 'sqlite',
  dbFile: process.env.DB_FILE || './data/healthkit.sqlite',
  dbHost: process.env.DB_HOST,
  dbPort: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : undefined,
  dbUser: process.env.DB_USER,
  dbPassword: process.env.DB_PASSWORD,
  dbName: process.env.DB_NAME,

  enableSimulationFallback: process.env.ENABLE_SIMULATION_FALLBACK === 'true',
};
