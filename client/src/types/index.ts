export interface ConnectionStatus {
  connected: boolean;
  message?: string;
  user?: {
    id: number;
    xiaomiUserId: string;
    connectedAt: string;
    tokenExpiresAt?: string;
  } | null;
  device?: {
    id: number;
    deviceId: string;
    name: string;
    type: string;
    connectionInfo: string;
    lastSyncTime: string;
  } | null;
  simulationMode?: boolean;
}

export interface MetricPoint {
  id: number;
  dataType: string;
  value: number;
  unit: string;
  timestamp: string;
  source: string;
}

export interface LatestHealthData {
  success: boolean;
  device: string;
  source: string;
  heartRate: MetricPoint | null;
  spo2: MetricPoint | null;
}

export interface HealthDataRecord {
  id: number;
  timestamp: string;
  dataType: string;
  value: number;
  unit: string;
  source: string;
  deviceId: string;
  status: string;
  rawDataReference?: string;
}

export interface ApiLogItem {
  id: number;
  requestTime: string;
  endpoint: string;
  httpStatus: number;
  responseTimeMs: number;
  dataType?: string;
  sanitizedResponse: any;
}

export interface SyncResponse {
  success: boolean;
  message: string;
  heartRate: MetricPoint | null;
  spo2: MetricPoint | null;
  syncedCount: number;
  timestamp: string;
}
