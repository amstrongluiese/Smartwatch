import React from 'react';
import {
  GitBranch,
  Shield,
  Database,
  Server,
  Smartphone,
  Watch,
  Cloud,
  Lock,
  FileCode2,
} from 'lucide-react';

export const ArchitectureView: React.FC = () => {
  return (
    <div>
      {/* Title */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.35rem', fontWeight: 800 }}>
          System Architecture & Technical Specifications
        </h2>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Comprehensive end-to-end data pipeline documentation for capstone presentation and evaluation
        </p>
      </div>

      {/* Visual Pipeline Flow */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div className="card-header">
          <div className="card-title-group">
            <GitBranch size={20} color="var(--clinical-blue)" />
            <h3 className="card-title">1. End-to-End Pipeline Architecture</h3>
          </div>
          <span className="badge badge-success">Approved Cloud Integration</span>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '1rem',
            padding: '1rem 0',
          }}
        >
          {/* Step 1 */}
          <div
            style={{
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid #fdba74',
              background: '#fff7ed',
              textAlign: 'center',
            }}
          >
            <Watch size={32} color="#ea580c" style={{ margin: '0 auto 0.5rem auto' }} />
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#9a3412' }}>Smart Band 9 Active</h4>
            <p style={{ fontSize: '0.75rem', color: '#c2410c', marginTop: '0.25rem' }}>
              Optical PPG sensor captures continuous HR and SpO₂ telemetry.
            </p>
          </div>

          {/* Step 2 */}
          <div
            style={{
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-light)',
              background: '#f8fafc',
              textAlign: 'center',
            }}
          >
            <Smartphone size={32} color="#475569" style={{ margin: '0 auto 0.5rem auto' }} />
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)' }}>Mi Fitness App</h4>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Official mobile app synchronizes telemetry via BLE to user phone.
            </p>
          </div>

          {/* Step 3 */}
          <div
            style={{
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid #bae6fd',
              background: '#f0f9ff',
              textAlign: 'center',
            }}
          >
            <Cloud size={32} color="#0284c7" style={{ margin: '0 auto 0.5rem auto' }} />
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0369a1' }}>Xiaomi Cloud / HealthKit</h4>
            <p style={{ fontSize: '0.75rem', color: '#0284c7', marginTop: '0.25rem' }}>
              Xiaomi Motion & Health Cloud securely aggregates user's authorized health data.
            </p>
          </div>

          {/* Step 4 */}
          <div
            style={{
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid #ddd6fe',
              background: '#faf5ff',
              textAlign: 'center',
            }}
          >
            <Lock size={32} color="#7c3aed" style={{ margin: '0 auto 0.5rem auto' }} />
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#5b21b6' }}>Xiaomi OAuth 2.0</h4>
            <p style={{ fontSize: '0.75rem', color: '#6d28d9', marginTop: '0.25rem' }}>
              User grants explicit authorization to our application backend.
            </p>
          </div>

          {/* Step 5 */}
          <div
            style={{
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid #a7f3d0',
              background: '#ecfdf5',
              textAlign: 'center',
            }}
          >
            <Server size={32} color="#059669" style={{ margin: '0 auto 0.5rem auto' }} />
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#065f46' }}>Our Backend API</h4>
            <p style={{ fontSize: '0.75rem', color: '#047857', marginTop: '0.25rem' }}>
              Node/Express service exchanges tokens, fetches and normalizes metrics.
            </p>
          </div>

          {/* Step 6 */}
          <div
            style={{
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid #fed7aa',
              background: '#fffbeb',
              textAlign: 'center',
            }}
          >
            <Database size={32} color="#d97706" style={{ margin: '0 auto 0.5rem auto' }} />
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#92400e' }}>Database Storage</h4>
            <p style={{ fontSize: '0.75rem', color: '#b45309', marginTop: '0.25rem' }}>
              Encrypted tokens and normalized data saved in PostgreSQL, MySQL, or SQLite.
            </p>
          </div>
        </div>
      </div>

      {/* Database Schema & Tables */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div className="card-header">
          <div className="card-title-group">
            <Database size={20} color="var(--clinical-blue)" />
            <h3 className="card-title">2. Relational Database Design</h3>
          </div>
          <span className="badge badge-info">PostgreSQL / MySQL / SQLite Dialect Support</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          {/* Table: health_data */}
          <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <FileCode2 size={16} color="var(--clinical-blue)" /> table: health_data
            </h4>
            <ul style={{ listStyle: 'none', fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.7' }}>
              <li><code>id</code> (PK, AUTOINCREMENT)</li>
              <li><code>user_id</code> (FK → users.id)</li>
              <li><code>device_id</code> (VARCHAR - Smart Band 9 Active ID)</li>
              <li><code>data_type</code> (<code>com.xiaomi.heart_rate.delta</code> / <code>com.xiaomi.spo2.instantaneous</code>)</li>
              <li><code>value</code> (DECIMAL / REAL)</li>
              <li><code>unit</code> (VARCHAR - 'bpm', '%')</li>
              <li><code>timestamp</code> (TIMESTAMP)</li>
              <li><code>source</code> ('Xiaomi HealthKit')</li>
              <li><code>raw_data_reference</code> (TEXT - JSON copy)</li>
            </ul>
          </div>

          {/* Table: xiaomi_tokens */}
          <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Lock size={16} color="#7c3aed" /> table: xiaomi_tokens
            </h4>
            <ul style={{ listStyle: 'none', fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.7' }}>
              <li><code>id</code> (PK, AUTOINCREMENT)</li>
              <li><code>user_id</code> (FK → users.id)</li>
              <li><code>access_token_encrypted</code> (AES-256-GCM encrypted)</li>
              <li><code>refresh_token_encrypted</code> (AES-256-GCM encrypted)</li>
              <li><code>expires_at</code> (TIMESTAMP)</li>
              <li><code>created_at</code> / <code>updated_at</code></li>
            </ul>
          </div>

          {/* Table: api_logs */}
          <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Shield size={16} color="#059669" /> table: api_logs
            </h4>
            <ul style={{ listStyle: 'none', fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.7' }}>
              <li><code>id</code> (PK, AUTOINCREMENT)</li>
              <li><code>endpoint</code> (VARCHAR)</li>
              <li><code>http_status</code> (INT - e.g. 200)</li>
              <li><code>response_time_ms</code> (INT)</li>
              <li><code>data_type</code> (VARCHAR)</li>
              <li><code>sanitized_response</code> (LONGTEXT - zero tokens)</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Security Policies */}
      <div className="card">
        <div className="card-header">
          <div className="card-title-group">
            <Shield size={20} color="#059669" />
            <h3 className="card-title">3. Security & Non-Invasive Compliance</h3>
          </div>
          <span className="badge badge-success">Zero Token Leak Guarantee</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem', fontSize: '0.85rem' }}>
          <div>
            <h4 style={{ fontWeight: 700, marginBottom: '0.25rem', color: 'var(--text-main)' }}>✓ No Direct Bluetooth Access</h4>
            <p style={{ color: 'var(--text-muted)' }}>
              Web application operates purely in cloud-to-cloud topology. Smart Band 9 Active retains manufacturer-certified BLE communication with the official Mi Fitness app.
            </p>
          </div>
          <div>
            <h4 style={{ fontWeight: 700, marginBottom: '0.25rem', color: 'var(--text-main)' }}>✓ No App Reverse-Engineering</h4>
            <p style={{ color: 'var(--text-muted)' }}>
              No private databases, APK binaries, or internal files of Mi Fitness are accessed or scraped. Integration strictly utilizes official Xiaomi OAuth 2.0 endpoints.
            </p>
          </div>
          <div>
            <h4 style={{ fontWeight: 700, marginBottom: '0.25rem', color: 'var(--text-main)' }}>✓ Server-Side Token Seclusion</h4>
            <p style={{ color: 'var(--text-muted)' }}>
              Xiaomi Client Secret and OAuth tokens are stored exclusively on the server and encrypted at rest using AES-256-GCM. The browser never receives raw authentication tokens.
            </p>
          </div>
          <div>
            <h4 style={{ fontWeight: 700, marginBottom: '0.25rem', color: 'var(--text-main)' }}>✓ Strict Scope Isolation</h4>
            <p style={{ color: 'var(--text-muted)' }}>
              Application requests only <code>com.xiaomi.heart_rate.delta</code> and <code>com.xiaomi.spo2.instantaneous</code>, omitting sleep, GPS, steps, or non-consented health data.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
