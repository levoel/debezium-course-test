/**
 * Type definitions for diagram primitives
 * Used by FlowNode, Arrow, and future components
 */

export type FlowNodeVariant = 'database' | 'connector' | 'cluster' | 'sink' | 'app' | 'target';
export type ArrowDirection = 'right' | 'down' | 'left' | 'up';

export interface FlowNodeProps {
  children: React.ReactNode;
  variant?: FlowNodeVariant;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
  tabIndex?: number;
  'aria-label'?: string;
}

export interface ArrowProps {
  direction?: ArrowDirection;
  label?: string;
  dashed?: boolean;
  className?: string;
}
