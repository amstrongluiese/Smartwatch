import React from 'react';
import {
  Activity,
  Table2,
  FileCode2,
  LogIn,
  LogOut,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import type { ConnectionStatus } from '../types';

interface NavbarProps {
  activeTab: 'dashboard' | 'monitor' | 'logs';
  setActiveTab: (tab: 'dashboard' | 'monitor' | 'logs') => void;
  status: ConnectionStatus | null;
  onConnect: () => void;
  onDisconnect: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  status,
  onConnect,
  onDisconnect,
}) => {
  const isConnected = !!status?.connected;

  return (
    <header className="navbar">
      <div className="navbar-inner" style={{ maxWidth: '1080px' }}>
        {/* Brand */}
        <div className="navbar-brand">
          <div className="brand-icon-wrapper" style={{ width: '36px', height: '36px' }}>
            <Activity size={20} />
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)' }}>
              HealthKit Monitor
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-subtle)' }}>
              Xiaomi Smart Band 9 Active
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="nav-tabs">
          <button
            id="nav-tab-dashboard"
            className={`nav-tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <Activity size={15} />
            <span>Dashboard</span>
          </button>

          <button
            id="nav-tab-monitor"
            className={`nav-tab-btn ${activeTab === 'monitor' ? 'active' : ''}`}
            onClick={() => setActiveTab('monitor')}
          >
            <Table2 size={15} />
            <span>Data Monitor</span>
          </button>

          <button
            id="nav-tab-logs"
            className={`nav-tab-btn ${activeTab === 'logs' ? 'active' : ''}`}
            onClick={() => setActiveTab('logs')}
          >
            <FileCode2 size={15} />
            <span>API Logs</span>
          </button>
        </nav>

        {/* Account Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              fontSize: '0.78rem',
              fontWeight: 500,
              padding: '0.25rem 0.6rem',
              borderRadius: 'var(--radius-full)',
              background: isConnected ? '#ecfdf5' : '#f8fafc',
              border: `1px solid ${isConnected ? '#a7f3d0' : '#e2e8f0'}`,
              color: isConnected ? '#059669' : '#64748b',
            }}
          >
            {isConnected ? <CheckCircle2 size={13} /> : <AlertCircle size={13} />}
            <span>{isConnected ? 'Connected' : 'Offline'}</span>
          </div>

          {isConnected ? (
            <button
              id="btn-disconnect-xiaomi"
              className="btn btn-outline"
              style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem' }}
              onClick={onDisconnect}
            >
              <LogOut size={14} />
              <span>Disconnect</span>
            </button>
          ) : (
            <button
              id="btn-connect-xiaomi"
              className="btn btn-xiaomi"
              style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem' }}
              onClick={onConnect}
            >
              <LogIn size={14} />
              <span>Connect Xiaomi</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
