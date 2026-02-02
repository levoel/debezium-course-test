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

// DiagramContainer types
export type ContainerColor = 'emerald' | 'blue' | 'rose' | 'amber' | 'purple' | 'neutral';

export interface DiagramContainerProps {
  title: string;
  description?: string;
  color?: ContainerColor;
  recommended?: boolean;
  children: React.ReactNode;
  className?: string;
}

// DiagramTooltip types
export interface DiagramTooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
  sideOffset?: number;
  delayDuration?: number;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

// Sequence diagram types
export type SequenceActorVariant = 'database' | 'service' | 'queue' | 'external';

export interface SequenceActorProps {
  children: React.ReactNode;
  variant?: SequenceActorVariant;
  className?: string;
  onClick?: () => void;
  tabIndex?: number;
  'aria-label'?: string;
}

export interface SequenceLifelineProps {
  height: number;
  className?: string;
}

export type SequenceMessageVariant = 'sync' | 'async' | 'return';

export interface SequenceMessageProps {
  fromX: number;
  toX: number;
  y: number;
  label: string;
  variant?: SequenceMessageVariant;
  className?: string;
  onClick?: () => void;
  tabIndex?: number;
  'aria-label'?: string;
}
