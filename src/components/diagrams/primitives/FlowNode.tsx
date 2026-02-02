/**
 * FlowNode - Glass-styled diagram node component
 *
 * Renders nodes with variant-specific colors, sizes, and accessibility features.
 * Uses forwardRef for Radix Tooltip compatibility.
 */

import { forwardRef } from 'react';
import type { FlowNodeProps, FlowNodeVariant } from './types';

const variantStyles: Record<FlowNodeVariant, string> = {
  database: 'bg-purple-500/20 border-purple-400/30 text-purple-200',
  connector: 'bg-emerald-500/15 border-emerald-400/30 text-emerald-200',
  cluster: 'bg-emerald-500/20 border-emerald-400/40 text-emerald-100',
  sink: 'bg-blue-500/15 border-blue-400/30 text-blue-200',
  app: 'bg-rose-500/15 border-rose-400/30 text-rose-200',
  target: 'bg-rose-500/20 border-rose-400/40 text-rose-100',
  // GCP-specific variants (official GCP brand colors)
  'gcp-database': 'bg-blue-500/20 border-blue-400/40 text-blue-100',
  'gcp-messaging': 'bg-amber-500/20 border-amber-400/40 text-amber-100',
  'gcp-compute': 'bg-emerald-500/20 border-emerald-400/40 text-emerald-100',
  'gcp-storage': 'bg-blue-600/20 border-blue-500/40 text-blue-100',
  'gcp-monitoring': 'bg-rose-500/20 border-rose-400/40 text-rose-100',
  'gcp-security': 'bg-purple-500/20 border-purple-400/40 text-purple-100',
};

const sizeStyles: Record<'sm' | 'md' | 'lg', string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-5 py-3 text-base',
};

export const FlowNode = forwardRef<HTMLDivElement, FlowNodeProps>(
  function FlowNode(
    {
      children,
      variant = 'connector',
      size = 'md',
      className = '',
      onClick,
      ...rest
    },
    ref
  ) {
    const isInteractive = !!onClick;

    return (
      <div
        ref={ref}
        {...rest}
        className={`
          rounded-xl border backdrop-blur-md
          font-medium text-center
          shadow-lg shadow-black/20
          hover:brightness-110 hover:scale-[1.02] transition-all duration-150
          focus:outline-none focus:ring-2 focus:ring-white/30 focus:ring-offset-2 focus:ring-offset-transparent
          ${variantStyles[variant]}
          ${sizeStyles[size]}
          ${isInteractive ? 'cursor-pointer' : ''}
          ${className}
        `.trim()}
        onClick={onClick}
      >
        {children}
      </div>
    );
  }
);

export type { FlowNodeProps };
