import React, { useState } from 'react';
import {
  RefreshCw,
  Trash2,
  Copy,
  Check,
  ChevronDown,
  ChevronRight,
  Clock,
  Zap,
} from 'lucide-react';
import type { ApiLogItem } from '../types';

interface ApiLogViewProps {
  logs: ApiLogItem[];
  onRefresh: () => void;
  onClear: () => void;
  loading: boolean;
}

export const ApiLogView: React.FC<ApiLogViewProps> = ({
  logs,
  onRefresh,
  onClear,
  loading,
}) => {
  const [expandedLogId, setExpandedLogId] = useState<number | null>(logs.length > 0 ? logs[0].id : null);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const formatTimestamp = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleTimeString('en-US', {
        hour12: true,
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit',
      }) + `.${d.getMilliseconds().toString().padStart(3, '0')}`;
    } catch {
      return iso;
    }
  };

  const copyToClipboard = (text: string, id: number) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleExpand = (id: number) => {
    setExpandedLogId(expandedLogId === id ? null : id);
  };

  return (
    <div style={{ maxWidth: '1080px', margin: '0 auto' }}>
      {/* Header & Controls */}
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
        <div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 800 }}>
            API Logs
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Recent requests and responses from Xiaomi Cloud API
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            className="btn btn-outline"
            onClick={onRefresh}
            disabled={loading}
            title="Reload logs from database"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
          <button
            className="btn btn-danger"
            onClick={onClear}
            disabled={logs.length === 0}
            title="Purge recorded API logs"
          >
            <Trash2 size={14} />
            <span>Clear Logs</span>
          </button>
        </div>
      </div>

      {/* Logs List Accordion */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {logs.map((log) => {
          const isExpanded = expandedLogId === log.id;
          const jsonString =
            typeof log.sanitizedResponse === 'string'
              ? log.sanitizedResponse
              : JSON.stringify(log.sanitizedResponse, null, 2);

          return (
            <div
              key={log.id}
              className="card"
              style={{
                padding: '0',
                overflow: 'hidden',
                borderColor: isExpanded ? 'var(--clinical-blue-border)' : 'var(--border-light)',
              }}
            >
              {/* Log Header Row */}
              <div
                onClick={() => toggleExpand(log.id)}
                style={{
                  padding: '1rem 1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  background: isExpanded ? 'var(--clinical-blue-subtle)' : 'var(--bg-surface)',
                  transition: 'background var(--transition-fast)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                  {isExpanded ? (
                    <ChevronDown size={18} color="var(--clinical-blue)" />
                  ) : (
                    <ChevronRight size={18} color="var(--text-subtle)" />
                  )}

                  {/* HTTP Status Badge */}
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      padding: '0.2rem 0.5rem',
                      borderRadius: '4px',
                      background: log.httpStatus >= 200 && log.httpStatus < 300 ? '#ecfdf5' : '#fef2f2',
                      color: log.httpStatus >= 200 && log.httpStatus < 300 ? '#059669' : '#dc2626',
                      border: `1px solid ${log.httpStatus >= 200 && log.httpStatus < 300 ? '#a7f3d0' : '#fecaca'}`,
                    }}
                  >
                    HTTP {log.httpStatus}
                  </span>

                  {/* Endpoint URL */}
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>
                    {log.endpoint}
                  </span>

                  {/* Data Type pill if present */}
                  {log.dataType && (
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.75rem',
                        padding: '0.15rem 0.45rem',
                        borderRadius: '4px',
                        background: log.dataType.includes('heart_rate') ? 'var(--heart-rose-subtle)' : 'var(--bg-subtle)',
                        color: log.dataType.includes('heart_rate') ? 'var(--heart-rose)' : 'var(--text-muted)',
                      }}
                    >
                      {log.dataType}
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Zap size={13} color="#d97706" />
                    <strong>{log.responseTimeMs} ms</strong>
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Clock size={13} />
                    {formatTimestamp(log.requestTime)}
                  </span>
                </div>
              </div>

              {/* Collapsible JSON Body */}
              {isExpanded && (
                <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid var(--border-light)', background: '#0b1120' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>
                      SANITIZED JSON PAYLOAD (RESPONSE)
                    </span>
                    <button
                      className="btn btn-outline"
                      style={{
                        padding: '0.2rem 0.5rem',
                        fontSize: '0.75rem',
                        background: '#1e293b',
                        borderColor: '#334155',
                        color: '#cbd5e1',
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        copyToClipboard(jsonString, log.id);
                      }}
                    >
                      {copiedId === log.id ? (
                        <>
                          <Check size={12} color="#10b981" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy size={12} />
                          <span>Copy JSON</span>
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="code-block" style={{ margin: 0, maxHeight: '350px' }}>
                    {jsonString}
                  </pre>
                </div>
              )}
            </div>
          );
        })}

        {logs.length === 0 && (
          <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-subtle)' }}>
            No API transaction logs captured yet. Click <strong>Sync Cloud</strong> to trigger a request to Xiaomi HealthKit.
          </div>
        )}
      </div>
    </div>
  );
};
