import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="px-8 py-4 border-t border-slate-800/80 text-slate-500 text-xs flex justify-between items-center">
      <span>© 2026 CRM Workspace. All rights reserved.</span>
      <span className="font-mono text-slate-600">v1.0.0-beta</span>
    </footer>
  );
};
