import React from 'react';

interface CalloutProps {
  type?: 'note' | 'tip' | 'warning' | 'danger';
  children: React.ReactNode;
}

const Callout: React.FC<CalloutProps> = ({ type = 'note', children }) => {
  const styles = {
    note: {
      bg: 'bg-blue-500/10 backdrop-blur-sm',
      border: 'border-l-4 border-blue-500',
      icon: 'ℹ️',
      title: 'Note',
    },
    tip: {
      bg: 'bg-green-500/10 backdrop-blur-sm',
      border: 'border-l-4 border-green-500',
      icon: '💡',
      title: 'Tip',
    },
    warning: {
      bg: 'bg-yellow-500/10 backdrop-blur-sm',
      border: 'border-l-4 border-yellow-500',
      icon: '⚠️',
      title: 'Warning',
    },
    danger: {
      bg: 'bg-red-500/10 backdrop-blur-sm',
      border: 'border-l-4 border-red-500',
      icon: '🚨',
      title: 'Danger',
    },
  };

  const style = styles[type];

  return (
    <div className={`my-6 p-4 rounded-xl ${style.bg} ${style.border}`}>
      <div className="flex items-start gap-3">
        <span className="text-xl flex-shrink-0 mt-0.5">{style.icon}</span>
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
