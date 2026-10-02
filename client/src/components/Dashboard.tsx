import React from 'react';
import {
  Heart,
  Droplets,
  Watch,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Clock,
  Cloud,
} from 'lucide-react';
import type { ConnectionStatus, LatestHealthData } from '../types';

interface DashboardProps {
  status: ConnectionStatus | null;
  latestHealth: LatestHealthData | null;
  syncing: boolean;
  onSync: () => void;
  onConnect: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  status,
  latestHealth,
  syncing,
  onSync,
  onConnect,
}) => {
  const isConnected = !!status?.connected;
  const hr = latestHealth?.heartRate;
  const spo2 = latestHealth?.spo2;

  // Format date cleanly: e.g. "October 2, 2026 3:15 PM"
  const formatDate = (isoString?: string) => {
    if (!isoString) return 'Never';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    } catch {
      return isoString;
    }
  };

  const latestTimestamp = hr?.timestamp || spo2?.timestamp;
  const deviceName = status?.device?.name || latestHealth?.device || 'Xiaomi Smart Band 9 Active';

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto' }}>
      {/* Top Header & Quick Sync */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        <div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)' }}>
            Health Monitor
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Real-time biometric telemetry from your Xiaomi Smart Band
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            id="dashboard-sync-btn"
            className="btn btn-primary"
            onClick={onSync}
            disabled={syncing}
          >
            <RefreshCw size={15} className={syncing ? 'animate-spin' : ''} />
            <span>{syncing ? 'Syncing...' : 'Sync Now'}</span>
          </button>

          {!isConnected && (
            <button className="btn btn-xiaomi" onClick={onConnect}>
              Connect Xiaomi
            </button>
          )}
        </div>
      </div>

      {/* Clean Device Summary Bar */}
      <div
        className="card"
        style={{
          padding: '1rem 1.25rem',
          marginBottom: '1.75rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          background: '#ffffff',
          borderRadius: 'var(--radius-md)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              background: '#f1f5f9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ea580c',
            }}
          >
            <Watch size={22} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)' }}>
              {deviceName}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-subtle)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Cloud size={13} /> Xiaomi HealthKit (Mi Fitness)
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', fontSize: '0.825rem', color: 'var(--text-muted)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Clock size={14} color="var(--text-subtle)" />
            <span>Last Synced: <strong>{formatDate(latestTimestamp)}</strong></span>
          </div>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.2rem 0.6rem',
              borderRadius: 'var(--radius-full)',
              background: isConnected ? '#ecfdf5' : '#fef2f2',
              color: isConnected ? '#059669' : '#dc2626',
              fontWeight: 600,
              fontSize: '0.75rem',
            }}
          >
            {isConnected ? <CheckCircle2 size={13} /> : <AlertCircle size={13} />}
            <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
          </div>
        </div>
      </div>

      {/* Main Health Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Heart Rate Card */}
        <div
          className="card"
          style={{
            position: 'relative',
            padding: '1.75rem',
            borderRadius: 'var(--radius-lg)',
            borderTop: '4px solid var(--heart-rose)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  background: 'var(--heart-rose-subtle)',
                  color: 'var(--heart-rose)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Heart size={20} fill="var(--heart-rose)" className="animate-pulse-slow" />
              </div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
                Heart Rate
              </h2>
            </div>

            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                color: '#059669',
                background: '#ecfdf5',
                padding: '0.25rem 0.65rem',
                borderRadius: 'var(--radius-full)',
              }}
            >
              Normal (60–100)
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', margin: '1.5rem 0 0.5rem 0' }}>
            <span style={{ fontFamily: 'var(--font-heading)', fontSize: '3.75rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1 }}>
              {hr?.value ?? '--'}
            </span>
            <span style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--text-subtle)' }}>
              {hr?.unit || 'BPM'}
            </span>
          </div>

          <div style={{ fontSize: '0.78rem', color: 'var(--text-subtle)', marginTop: '0.75rem' }}>
            Source: <strong>Xiaomi HealthKit</strong> • {formatDate(hr?.timestamp)}
          </div>
        </div>

        {/* SpO2 Card */}
        <div
          className="card"
          style={{
            position: 'relative',
            padding: '1.75rem',
            borderRadius: 'var(--radius-lg)',
            borderTop: '4px solid var(--clinical-blue)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  background: 'var(--clinical-blue-subtle)',
                  color: 'var(--clinical-blue)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Droplets size={20} />
              </div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
                Blood Oxygen
              </h2>
            </div>

            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                color: '#059669',
                background: '#ecfdf5',
                padding: '0.25rem 0.65rem',
                borderRadius: 'var(--radius-full)',
              }}
            >
              Normal (≥95%)
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', margin: '1.5rem 0 0.5rem 0' }}>
            <span style={{ fontFamily: 'var(--font-heading)', fontSize: '3.75rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1 }}>
              {spo2?.value ?? '--'}
            </span>
            <span style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--text-subtle)' }}>
              {spo2?.unit || '%'}
            </span>
          </div>

          <div style={{ fontSize: '0.78rem', color: 'var(--text-subtle)', marginTop: '0.75rem' }}>
            Source: <strong>Xiaomi HealthKit</strong> • {formatDate(spo2?.timestamp)}
          </div>
        </div>
      </div>
    </div>
  );
};
