import React from 'react';

interface CardProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const Card: React.FC<CardProps> = ({ title, subtitle, children, action, className = '', style }) => {
  return (
    <div
      className={`p-6 rounded-xl bg-slate-900/90 border border-slate-800/80 shadow-lg shadow-black/20 hover:border-slate-700/80 transition-all duration-200 max-w-full overflow-hidden ${className}`}
      style={style}
    >
      {(title || action) && (
        <div className="flex justify-between items-center mb-4">
          <div>
            {title && <h3 className="text-base font-semibold text-slate-100">{title}</h3>}
            {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
};
