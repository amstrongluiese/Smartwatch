import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { DataMonitor } from './components/DataMonitor';
import { ApiLogView } from './components/ApiLogView';
import { OAuthConnectModal } from './components/OAuthConnectModal';
import { api } from './services/api';
import type {
  ConnectionStatus,
  LatestHealthData,
  HealthDataRecord,
  ApiLogItem,
} from './types';
import { AlertCircle, CheckCircle2, X } from 'lucide-react';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'monitor' | 'logs'>('dashboard');
  const [status, setStatus] = useState<ConnectionStatus | null>(null);
  const [latestHealth, setLatestHealth] = useState<LatestHealthData | null>(null);
  const [history, setHistory] = useState<HealthDataRecord[]>([]);
  const [logs, setLogs] = useState<ApiLogItem[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [connectModalOpen, setConnectModalOpen] = useState(false);
  const [connectInfo, setConnectInfo] = useState<{
    authUrl: string;
    state: string;
    targetDevice: string;
    scopes: string;
    redirectUri: string;
    clientId: string;
    isPlaceholderCredentials: boolean;
  } | null>(null);

  // Check OAuth callback parameters from URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('auth') === 'success') {
      const uid = urlParams.get('uid') || 'Xiaomi User';
      setNotification({
        type: 'success',
        message: `Connected Xiaomi Account (${uid}). Telemetry synchronized.`,
      });
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (urlParams.get('auth_error')) {
      const err = urlParams.get('auth_error');
      setNotification({
        type: 'error',
        message: `Xiaomi authorization failed: ${decodeURIComponent(err || '')}`,
      });
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // Fetch all initial application data
  const loadData = useCallback(async () => {
    try {
      const [statusRes, latestRes, historyRes, logsRes] = await Promise.allSettled([
        api.getConnectionStatus(),
        api.getLatestHealth(),
        api.getHealthHistory(),
        api.getApiLogs(),
      ]);

      if (statusRes.status === 'fulfilled') setStatus(statusRes.value);
      if (latestRes.status === 'fulfilled') setLatestHealth(latestRes.value);
      if (historyRes.status === 'fulfilled') setHistory(historyRes.value.history);
      if (logsRes.status === 'fulfilled') setLogs(logsRes.value.logs);
    } catch (err: any) {
      console.error('[App] Failed to load data:', err);
    }
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 20000);
    return () => clearInterval(interval);
  }, [loadData]);

  // Initiate Xiaomi OAuth 2.0 flow
  const handleConnect = async () => {
    try {
      const info = await api.getConnectUrl();
      setConnectInfo(info);
      setConnectModalOpen(true);
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: `Could not initiate Xiaomi authorization: ${err.message}`,
      });
    }
  };

  const handleProceedLive = (url: string) => {
    window.location.href = url;
  };

  const handleProceedSimulate = async () => {
    setConnectModalOpen(false);
    await api.simulateAuthCallback('capstone_demo_auth_code');
  };

  // Disconnect Xiaomi account
  const handleDisconnect = async () => {
    try {
      await api.disconnect();
      setNotification({
        type: 'success',
        message: 'Xiaomi Account disconnected.',
      });
      await loadData();
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: `Failed to disconnect: ${err.message}`,
      });
    }
  };

  // Synchronize health telemetry through backend
  const handleSync = async () => {
    setSyncing(true);
    try {
      const res = await api.syncHealthData();
      setNotification({
        type: 'success',
        message: `Synchronized ${res.syncedCount} metrics from Xiaomi Cloud.`,
      });
      await loadData();
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: `Synchronization error: ${err.message}`,
      });
    } finally {
      setSyncing(false);
    }
  };

  // Refresh logs
  const handleRefreshLogs = async () => {
    setLoadingLogs(true);
    try {
      const res = await api.getApiLogs();
      setLogs(res.logs);
    } finally {
      setLoadingLogs(false);
    }
  };

  // Clear logs
  const handleClearLogs = async () => {
    try {
      await api.clearApiLogs();
      setLogs([]);
      setNotification({
        type: 'success',
        message: 'API logs cleared.',
      });
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: `Failed to clear logs: ${err.message}`,
      });
    }
  };

  return (
    <div className="app-container">
      {/* Clean Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        status={status}
        onConnect={handleConnect}
        onDisconnect={handleDisconnect}
      />

      {/* Main Container */}
      <main className="main-content" style={{ maxWidth: '1080px', padding: '1.75rem 1.5rem' }}>
        {/* Simple Notification */}
        {notification && (
          <div
            style={{
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: notification.type === 'success' ? '#ecfdf5' : '#fef2f2',
              border: `1px solid ${notification.type === 'success' ? '#a7f3d0' : '#fecaca'}`,
              color: notification.type === 'success' ? '#065f46' : '#991b1b',
              fontSize: '0.85rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {notification.type === 'success' ? (
                <CheckCircle2 size={16} color="#059669" />
              ) : (
                <AlertCircle size={16} color="#dc2626" />
              )}
              <span>{notification.message}</span>
            </div>
            <button
              onClick={() => setNotification(null)}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'inherit' }}
            >
              <X size={15} />
            </button>
          </div>
        )}

        {/* Clean Tabs */}
        {activeTab === 'dashboard' && (
          <Dashboard
            status={status}
            latestHealth={latestHealth}
            syncing={syncing}
            onSync={handleSync}
            onConnect={handleConnect}
          />
        )}

        {activeTab === 'monitor' && (
          <DataMonitor
            history={history}
            deviceName={status?.device?.name || 'Xiaomi Smart Band 9 Active'}
          />
        )}

        {activeTab === 'logs' && (
          <ApiLogView
            logs={logs}
            onRefresh={handleRefreshLogs}
            onClear={handleClearLogs}
            loading={loadingLogs}
          />
        )}

        {/* OAuth Modal */}
        <OAuthConnectModal
          isOpen={connectModalOpen}
          onClose={() => setConnectModalOpen(false)}
          connectInfo={connectInfo}
          onProceedLive={handleProceedLive}
          onProceedSimulate={handleProceedSimulate}
        />
      </main>

      {/* Clean Minimal Footer */}
      <footer
        style={{
          borderTop: '1px solid var(--border-light)',
          background: 'var(--bg-surface)',
          padding: '1.25rem',
          textAlign: 'center',
          fontSize: '0.78rem',
          color: 'var(--text-subtle)',
          marginTop: 'auto',
        }}
      >
        <div style={{ maxWidth: '1080px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <strong>Xiaomi HealthKit Monitor</strong> • Smart Band 9 Active
          </div>
          <div>
            Cloud API Integration
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
