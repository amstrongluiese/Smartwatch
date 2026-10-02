import React, { useState } from 'react';
import {
  Search,
  Code2,
  CheckCircle,
  X,
} from 'lucide-react';
import type { HealthDataRecord } from '../types';

interface DataMonitorProps {
  history: HealthDataRecord[];
  deviceName: string;
}

export const DataMonitor: React.FC<DataMonitorProps> = ({ history, deviceName }) => {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'hr' | 'spo2'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRecord, setSelectedRecord] = useState<HealthDataRecord | null>(null);

  // Filter records
  const filteredRecords = history.filter((rec) => {
    // Type filter
    if (selectedFilter === 'hr' && !rec.dataType.includes('heart_rate')) return false;
    if (selectedFilter === 'spo2' && !rec.dataType.includes('spo2')) return false;

    // Search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        rec.dataType.toLowerCase().includes(term) ||
        rec.value.toString().includes(term) ||
        rec.timestamp.toLowerCase().includes(term) ||
        (rec.deviceId && rec.deviceId.toLowerCase().includes(term))
      );
    }

    return true;
  });

  const formatTimestamp = (iso: string) => {
    try {
      const d = new Date(iso);
      const pad = (n: number) => n.toString().padStart(2, '0');
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
    } catch {
      return iso;
    }
  };

  return (
    <div style={{ maxWidth: '1080px', margin: '0 auto' }}>
      <div style={{ marginBottom: '1.25rem' }}>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 800 }}>
          Data Monitor
        </h1>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Health data packets received from Xiaomi HealthKit
        </p>
      </div>

      {/* Controls Bar: Filters & Search */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.25rem',
        }}
      >
        {/* Metric Type Filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            className={`btn ${selectedFilter === 'all' ? 'btn-primary' : 'btn-outline'}`}
            style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem' }}
            onClick={() => setSelectedFilter('all')}
          >
            All ({history.length})
          </button>
          <button
            className={`btn ${selectedFilter === 'hr' ? 'btn-primary' : 'btn-outline'}`}
            style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem' }}
            onClick={() => setSelectedFilter('hr')}
          >
            Heart Rate
          </button>
          <button
            className={`btn ${selectedFilter === 'spo2' ? 'btn-primary' : 'btn-outline'}`}
            style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem' }}
            onClick={() => setSelectedFilter('spo2')}
          >
            Blood Oxygen (SpO₂)
          </button>
        </div>

        {/* Search Input */}
        <div style={{ position: 'relative', width: '280px' }}>
          <Search
            size={16}
            color="var(--text-subtle)"
            style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }}
          />
          <input
            type="text"
            placeholder="Search timestamp, type, value..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '0.45rem 0.75rem 0.45rem 2.25rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-light)',
              fontSize: '0.85rem',
              background: 'white',
              outline: 'none',
            }}
          />
        </div>
      </div>

      {/* Exact Capstone Data Monitor Table */}
      <div className="table-container">
        <table className="data-table" id="data-monitor-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Data Type</th>
              <th>Value</th>
              <th>Unit</th>
              <th>Source</th>
              <th>Device</th>
              <th>Status</th>
              <th style={{ textAlign: 'center' }}>Raw Payload</th>
            </tr>
          </thead>
          <tbody>
            {filteredRecords.map((row) => (
              <tr key={row.id}>
                <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-main)' }}>
                  {formatTimestamp(row.timestamp)}
                </td>
                <td>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      color: row.dataType.includes('heart_rate') ? 'var(--heart-rose)' : 'var(--clinical-blue)',
                      background: row.dataType.includes('heart_rate') ? 'var(--heart-rose-subtle)' : 'var(--clinical-blue-subtle)',
                      padding: '0.2rem 0.5rem',
                      borderRadius: '4px',
                      border: `1px solid ${row.dataType.includes('heart_rate') ? 'var(--heart-rose-border)' : 'var(--clinical-blue-border)'}`,
                    }}
                  >
                    {row.dataType}
                  </span>
                </td>
                <td style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-main)' }}>
                  {row.value}
                </td>
                <td style={{ fontWeight: 600, color: 'var(--text-subtle)' }}>
                  {row.unit}
                </td>
                <td>
                  <span className="badge badge-info">{row.source}</span>
                </td>
                <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  {row.deviceId ? 'Smart Band 9 Active' : deviceName}
                </td>
                <td>
                  <span className="badge badge-success">
                    <CheckCircle size={12} /> {row.status || 'Received'}
                  </span>
                </td>
                <td style={{ textAlign: 'center' }}>
                  <button
                    className="btn btn-outline"
                    style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
                    onClick={() => setSelectedRecord(row)}
                    title="View Raw Xiaomi JSON packet vs Normalized record"
                  >
                    <Code2 size={13} />
                    <span>Inspect</span>
                  </button>
                </td>
              </tr>
            ))}

            {filteredRecords.length === 0 && (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-subtle)' }}>
                  No matching health data records found. Try adjusting filters or click <strong>Sync Cloud</strong>.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Raw vs Normalized Inspector Modal */}
      {selectedRecord && (
        <div className="modal-overlay" onClick={() => setSelectedRecord(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Code2 size={20} color="var(--clinical-blue)" />
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', fontWeight: 700 }}>
                  Telemetry Verification: Raw vs Normalized Data
                </h3>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-subtle)' }}
              >
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <div style={{ marginBottom: '1.25rem' }}>
                <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                  1. Normalized Database Record (PostgreSQL / MySQL / SQLite)
                </h4>
                <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem', fontSize: '0.85rem' }}>
                    <div>
                      <span style={{ color: 'var(--text-subtle)', display: 'block', fontSize: '0.75rem' }}>DATA TYPE</span>
                      <strong>{selectedRecord.dataType}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-subtle)', display: 'block', fontSize: '0.75rem' }}>VALUE & UNIT</span>
                      <strong>{selectedRecord.value} {selectedRecord.unit}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-subtle)', display: 'block', fontSize: '0.75rem' }}>DEVICE</span>
                      <strong>Xiaomi Smart Band 9 Active</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-subtle)', display: 'block', fontSize: '0.75rem' }}>INGESTION STATUS</span>
                      <strong style={{ color: 'var(--status-success)' }}>{selectedRecord.status}</strong>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                  2. Raw Authorized Xiaomi HealthKit Cloud Response Packet
                </h4>
                <pre className="code-block">
                  {(() => {
                    try {
                      if (!selectedRecord.rawDataReference) return 'No raw payload stored for this record.';
                      const parsed = JSON.parse(selectedRecord.rawDataReference);
                      return JSON.stringify(parsed, null, 2);
                    } catch {
                      return selectedRecord.rawDataReference || 'N/A';
                    }
                  })()}
                </pre>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setSelectedRecord(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
