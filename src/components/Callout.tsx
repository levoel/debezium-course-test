import React from 'react';
import { Icon, type IconName } from './Icon';

interface CalloutProps {
  type?: 'note' | 'tip' | 'warning' | 'danger';
  children: React.ReactNode;
}

const styles: Record<string, { bg: string; border: string; icon: IconName; title: string }> = {
  note: {
    bg: 'bg-blue-500/10 backdrop-blur-sm',
    border: 'border-l-4 border-blue-400/70',
    icon: 'info',
    title: 'Note',
  },
  tip: {
    bg: 'bg-green-500/10 backdrop-blur-sm',
    border: 'border-l-4 border-emerald-400/70',
    icon: 'lightbulb',
    title: 'Tip',
  },
  warning: {
    bg: 'bg-amber-500/10 backdrop-blur-sm',
    border: 'border-l-4 border-amber-400/70',
    icon: 'warning',
    title: 'Warning',
  },
  danger: {
    bg: 'bg-rose-500/10 backdrop-blur-sm',
    border: 'border-l-4 border-rose-400/70',
    icon: 'alert',
    title: 'Danger',
  },
};

const Callout: React.FC<CalloutProps> = ({ type = 'note', children }) => {
  const style = styles[type];

  return (
    <div className={`my-6 p-4 rounded-xl ${style.bg} ${style.border}`}>
      <div className="flex items-start gap-3">
        <Icon name={style.icon} size={20} className="flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <div className="font-semibold mb-2 text-gray-100">
            {style.title}
          </div>
          <div className="prose prose-sm prose-invert max-w-none">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Callout;
