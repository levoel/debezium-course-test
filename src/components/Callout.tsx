import React from 'react';

interface CalloutProps {
  type?: 'note' | 'tip' | 'warning' | 'danger';
  children: React.ReactNode;
}

const Callout: React.FC<CalloutProps> = ({ type = 'note', children }) => {
  const styles = {
    note: {
      bg: 'bg-blue-50 dark:bg-blue-950/30',
      border: 'border-blue-200 dark:border-blue-800',
      icon: 'ℹ️',
      title: 'Note',
    },
    tip: {
      bg: 'bg-green-50 dark:bg-green-950/30',
      border: 'border-green-200 dark:border-green-800',
      icon: '💡',
      title: 'Tip',
    },
    warning: {
      bg: 'bg-yellow-50 dark:bg-yellow-950/30',
      border: 'border-yellow-200 dark:border-yellow-800',
      icon: '⚠️',
      title: 'Warning',
    },
    danger: {
      bg: 'bg-red-50 dark:bg-red-950/30',
      border: 'border-red-200 dark:border-red-800',
      icon: '🚨',
      title: 'Danger',
    },
  };

  const style = styles[type];

  return (
    <div className={`my-6 p-4 rounded-lg border-l-4 ${style.bg} ${style.border}`}>
      <div className="flex items-start gap-3">
        <span className="text-xl flex-shrink-0 mt-0.5">{style.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="font-semibold mb-2 text-gray-900 dark:text-gray-100">
            {style.title}
          </div>
          <div className="prose prose-sm dark:prose-invert max-w-none">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Callout;
