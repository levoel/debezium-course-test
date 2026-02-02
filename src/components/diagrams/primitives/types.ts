/**
 * Type definitions for diagram primitives
 * Used by FlowNode, Arrow, and future components
 */

export type FlowNodeVariant = 'database' | 'connector' | 'cluster' | 'sink' | 'app' | 'target';
export type ArrowDirection = 'right' | 'down' | 'left' | 'up';

export interface FlowNodeProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: FlowNodeVariant;
  size?: 'sm' | 'md' | 'lg';
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

// DiagramTooltip types (click-based popover for Safari compatibility)
export interface DiagramTooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
  sideOffset?: number;
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

// SequenceDiagram layout types
export interface SequenceActorDef {
  id: string;
  label: string;
  variant?: SequenceActorVariant;
  tooltip?: React.ReactNode;
}

export interface SequenceMessageDef {
  id: string;
  from: string;
  to: string;
  label: string;
  variant?: SequenceMessageVariant;
  tooltip?: React.ReactNode;
}

export interface SequenceDiagramProps {
  actors: SequenceActorDef[];
  messages: SequenceMessageDef[];
  messageSpacing?: number;
  className?: string;
}
