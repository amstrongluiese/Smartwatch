import type {
  ConnectionStatus,
  LatestHealthData,
  HealthDataRecord,
  ApiLogItem,
  SyncResponse,
} from '../types';

const API_BASE = '/api';

export const api = {
  // Connection & OAuth
  async getConnectionStatus(): Promise<ConnectionStatus> {
    const res = await fetch(`${API_BASE}/xiaomi/status`);
    if (!res.ok) throw new Error('Failed to fetch connection status');
    return res.json();
  },

  async getConnectUrl(): Promise<{
    authUrl: string;
    state: string;
    targetDevice: string;
    scopes: string;
    redirectUri: string;
    clientId: string;
    isPlaceholderCredentials: boolean;
  }> {
    const res = await fetch(`${API_BASE}/xiaomi/connect`);
    if (!res.ok) throw new Error('Failed to initiate Xiaomi OAuth');
    return res.json();
  },

  async simulateAuthCallback(code: string = 'capstone_demo_auth_code'): Promise<void> {
    window.location.href = `${API_BASE}/xiaomi/callback?code=${encodeURIComponent(code)}`;
  },

  async disconnect(): Promise<void> {
    const res = await fetch(`${API_BASE}/xiaomi/disconnect`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to disconnect Xiaomi account');
  },

  // HealthKit Synchronization & Data
  async syncHealthData(): Promise<SyncResponse> {
    const res = await fetch(`${API_BASE}/xiaomi/sync`, { method: 'POST' });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Sync failed' }));
      throw new Error(err.error || 'Failed to synchronize Xiaomi HealthKit data');
    }
    return res.json();
  },

  async getLatestHealth(): Promise<LatestHealthData> {
    const res = await fetch(`${API_BASE}/health/latest`);
    if (!res.ok) throw new Error('Failed to fetch latest health data');
    return res.json();
  },

  async getHealthHistory(dataType?: string, limit: number = 100): Promise<{ history: HealthDataRecord[]; count: number }> {
    const params = new URLSearchParams();
    if (dataType) params.append('dataType', dataType);
    params.append('limit', limit.toString());

    const res = await fetch(`${API_BASE}/health/history?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch health data history');
    return res.json();
  },

  // Devices
  async getDevices(): Promise<{ success: boolean; devices: any[] }> {
    const res = await fetch(`${API_BASE}/devices`);
    if (!res.ok) throw new Error('Failed to fetch devices');
    return res.json();
  },

  // API Response Logs
  async getApiLogs(limit: number = 50): Promise<{ logs: ApiLogItem[]; count: number }> {
    const res = await fetch(`${API_BASE}/logs?limit=${limit}`);
    if (!res.ok) throw new Error('Failed to fetch API logs');
    return res.json();
  },

  async clearApiLogs(): Promise<void> {
    const res = await fetch(`${API_BASE}/logs`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to clear API logs');
  },
};
