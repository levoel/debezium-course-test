/**
 * DiagramContainer - Glass-styled wrapper for diagrams
 *
 * Provides consistent container styling with title pill badge,
 * optional description, and color variants.
 */

import type { DiagramContainerProps, ContainerColor } from './types';

const colorStyles: Record<ContainerColor, string> = {
  emerald: 'border-emerald-500/30 from-emerald-500/10 to-transparent',
  blue: 'border-blue-500/30 from-blue-500/10 to-transparent',
  rose: 'border-rose-500/30 from-rose-500/10 to-transparent',
  amber: 'border-amber-500/30 from-amber-500/10 to-transparent',
  purple: 'border-purple-500/30 from-purple-500/10 to-transparent',
  neutral: 'border-gray-500/30 from-gray-500/10 to-transparent',
};

const labelColors: Record<ContainerColor, string> = {
  emerald: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30',
  blue: 'bg-blue-500/20 text-blue-300 border-blue-400/30',
  rose: 'bg-rose-500/20 text-rose-300 border-rose-400/30',
  amber: 'bg-amber-500/20 text-amber-300 border-amber-400/30',
  purple: 'bg-purple-500/20 text-purple-300 border-purple-400/30',
  neutral: 'bg-gray-500/20 text-gray-300 border-gray-400/30',
};

export function DiagramContainer({
  title,
  description,
  color = 'neutral',
  recommended = false,
  children,
  className = '',
}: DiagramContainerProps) {
  return (
    <figure
      role="figure"
      aria-label={`Diagram: ${title}`}
      className={`
        relative p-5 rounded-2xl border backdrop-blur-lg
        bg-gradient-to-br ${colorStyles[color]}
        shadow-xl shadow-black/30
        not-prose
        ${className}
      `.trim()}
    >
      <figcaption className="flex items-center gap-2 mb-4">
        <span
          className={`
            px-3 py-1 rounded-full text-xs font-semibold border
            ${labelColors[color]}
          `.trim()}
        >
          {title}
        </span>
        {recommended && (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/30 text-emerald-200 border border-emerald-400/30">
            Рекомендуется
          </span>
        )}
      </figcaption>
      {description && (
        <p className="text-sm text-gray-400 mb-4">{description}</p>
      )}
      {children}
    </figure>
  );
}

export type { DiagramContainerProps };
