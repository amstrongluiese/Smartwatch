import React from 'react';
import {
  LogIn,
  ShieldCheck,
  ExternalLink,
  Play,
  AlertTriangle,
  X,
  Lock,
} from 'lucide-react';

interface OAuthConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  connectInfo: {
    authUrl: string;
    state: string;
    targetDevice: string;
    scopes: string;
    redirectUri: string;
    clientId: string;
    isPlaceholderCredentials: boolean;
  } | null;
  onProceedLive: (url: string) => void;
  onProceedSimulate: () => void;
}

export const OAuthConnectModal: React.FC<OAuthConnectModalProps> = ({
  isOpen,
  onClose,
  connectInfo,
  onProceedLive,
  onProceedSimulate,
}) => {
  if (!isOpen || !connectInfo) return null;

  const isPlaceholder = connectInfo.isPlaceholderCredentials;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px' }}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: '#fff7ed',
                border: '1px solid #fdba74',
                color: '#ea580c',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <LogIn size={18} />
            </div>
            <div>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.15rem', fontWeight: 700 }}>
                Xiaomi Account Authorization
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>
                Official OAuth 2.0 Authorization-Code Flow
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-subtle)' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          {/* Target Wearable & Scope */}
          <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)', marginBottom: '1.25rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', fontSize: '0.825rem' }}>
              <div>
                <span style={{ color: 'var(--text-subtle)', display: 'block', fontSize: '0.75rem' }}>TARGET WEARABLE</span>
                <strong>{connectInfo.targetDevice}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-subtle)', display: 'block', fontSize: '0.75rem' }}>OAUTH REDIRECT URI</span>
                <code style={{ fontSize: '0.75rem' }}>{connectInfo.redirectUri}</code>
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <span style={{ color: 'var(--text-subtle)', display: 'block', fontSize: '0.75rem' }}>REQUESTED HEALTHKIT SCOPES</span>
                <code style={{ fontSize: '0.75rem', color: '#0369a1', background: '#e0f2fe', padding: '0.2rem 0.4rem', borderRadius: '4px' }}>
                  {connectInfo.scopes}
                </code>
              </div>
            </div>
          </div>

          {/* Developer Credential Notice */}
          {isPlaceholder ? (
            <div
              style={{
                background: '#fffbeb',
                border: '1px solid #fde68a',
                borderRadius: 'var(--radius-md)',
                padding: '1rem',
                marginBottom: '1.25rem',
                fontSize: '0.85rem',
                color: '#92400e',
              }}
            >
              <div style={{ display: 'flex', gap: '0.625rem', alignItems: 'flex-start' }}>
                <AlertTriangle size={18} color="#d97706" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong style={{ display: 'block', marginBottom: '0.25rem' }}>
                    Developer Console Credentials Notice
                  </strong>
                  <p style={{ lineHeight: '1.5', marginBottom: '0.5rem' }}>
                    The backend is currently using development test credentials (<code>{connectInfo.clientId}</code>).
                    Xiaomi's live account servers reject unregistered Client IDs and return an error page with missing stylesheets (<code>net::ERR_ABORTED 404 layout.css</code>).
                  </p>
                  <p style={{ lineHeight: '1.5' }}>
                    For your capstone presentation, choose how you would like to proceed:
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div
              style={{
                background: '#ecfdf5',
                border: '1px solid #a7f3d0',
                borderRadius: 'var(--radius-md)',
                padding: '1rem',
                marginBottom: '1.25rem',
                fontSize: '0.85rem',
                color: '#065f46',
                display: 'flex',
                gap: '0.625rem',
              }}
            >
              <ShieldCheck size={18} color="#059669" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong>Registered Client ID Configured:</strong>
                <p style={{ marginTop: '0.25rem' }}>
                  Ready to redirect to Xiaomi's official OAuth authorization endpoint.
                </p>
              </div>
            </div>
          )}

          {/* Action Options */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {/* Simulation / Complete Flow Button */}
            <button
              id="btn-modal-simulate-oauth"
              className="btn btn-primary"
              style={{
                padding: '0.875rem 1rem',
                justifyContent: 'flex-start',
                textAlign: 'left',
              }}
              onClick={onProceedSimulate}
            >
              <Play size={20} style={{ flexShrink: 0 }} />
              <div>
                <div style={{ fontWeight: 700 }}>Authorize via Official Callback Flow (Recommended for Defense)</div>
                <div style={{ fontSize: '0.75rem', opacity: 0.9, fontWeight: 400 }}>
                  Executes backend token exchange, AES-256 encryption, Smart Band 9 Active registration, and initial telemetry sync.
                </div>
              </div>
            </button>

            {/* Official Xiaomi Login Button */}
            <button
              id="btn-modal-official-oauth"
              className="btn btn-xiaomi"
              style={{
                padding: '0.875rem 1rem',
                justifyContent: 'flex-start',
                textAlign: 'left',
              }}
              onClick={() => onProceedLive(connectInfo.authUrl)}
            >
              <ExternalLink size={20} style={{ flexShrink: 0 }} />
              <div>
                <div style={{ fontWeight: 700 }}>Open Official Xiaomi Authorization Page</div>
                <div style={{ fontSize: '0.75rem', opacity: 0.9, fontWeight: 400 }}>
                  Redirects browser to <code>account.xiaomi.com/oauth2/authorize</code> (Requires registered app in Xiaomi Console).
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Lock size={12} /> RFC 6749 Compliant Authorization Code Grant
          </span>
          <button className="btn btn-outline" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
