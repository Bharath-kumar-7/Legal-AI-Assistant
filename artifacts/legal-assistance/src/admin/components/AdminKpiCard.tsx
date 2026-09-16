import React from 'react';
import { LucideIcon } from 'lucide-react';

interface SubStat {
  label: string;
  value: number;
  tone?: 'success' | 'warning' | 'danger' | 'neutral';
}

interface AdminKpiCardProps {
  title: string;
  totalValue: number;
  icon: LucideIcon;
  subStats?: SubStat[];
  badge?: string;
  tone?: 'gold' | 'teal' | 'navy' | 'danger';
  onClick?: () => void;
}

export const AdminKpiCard: React.FC<AdminKpiCardProps> = ({
  title,
  totalValue,
  icon: Icon,
  subStats,
  badge,
  tone = 'navy',
  onClick,
}) => {
  return (
    <div
      className={`admin-kpi-card tone-${tone} ${onClick ? 'interactive' : ''}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className="kpi-header">
        <span className="kpi-title">{title}</span>
        <div className="kpi-icon-wrap">
          <Icon size={18} />
        </div>
      </div>

      <div className="kpi-main">
        <span className="kpi-number">{totalValue}</span>
        {badge && <span className="kpi-badge">{badge}</span>}
      </div>

      {subStats && subStats.length > 0 && (
        <div className="kpi-substats">
          {subStats.map((sub, idx) => (
            <div key={idx} className="kpi-sub-item">
              <span className="kpi-sub-label">{sub.label}:</span>
              <span className={`kpi-sub-value val-${sub.tone || 'neutral'}`}>{sub.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
