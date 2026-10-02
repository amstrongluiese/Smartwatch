import React from 'react';
import { ArrowRight, ShieldCheck, Watch } from 'lucide-react';

export const ArchitectureBanner: React.FC = () => {
  return (
    <div className="architecture-strip">
      <div className="architecture-strip-inner">
        <div className="pipeline-flow">
          <span style={{ fontWeight: 600, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Watch size={15} color="#ea580c" /> Pipeline:
          </span>
          <span className="pipeline-node target-device">Smart Band 9 Active</span>
          <ArrowRight size={12} className="pipeline-arrow" />
          <span className="pipeline-node">Mi Fitness App</span>
          <ArrowRight size={12} className="pipeline-arrow" />
          <span className="pipeline-node">Xiaomi Cloud (HealthKit)</span>
          <ArrowRight size={12} className="pipeline-arrow" />
          <span className="pipeline-node">OAuth 2.0 Auth</span>
          <ArrowRight size={12} className="pipeline-arrow" />
          <span className="pipeline-node">Our Backend API</span>
          <ArrowRight size={12} className="pipeline-arrow" />
          <span className="pipeline-node">Database</span>
          <ArrowRight size={12} className="pipeline-arrow" />
          <span className="pipeline-node" style={{ background: '#f0f9ff', borderColor: '#bae6fd', color: '#0369a1' }}>
            Web Dashboard
          </span>
        </div>

        <div className="security-badge-note">
          <ShieldCheck size={14} />
          <span>Cloud-to-Cloud API Only • No Direct BLE • Mi Fitness Intact</span>
        </div>
      </div>
    </div>
  );
};
