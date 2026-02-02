/**
 * DiagramTooltip - Radix-based tooltip with glass styling
 *
 * Features:
 * - Click-to-open pattern for mobile accessibility (not hover-only)
 * - Glass styling matching design system
 * - Keyboard accessible (Enter/Space to open, Escape to close)
 * - Smart positioning that auto-flips at viewport edges
 */

import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import type { DiagramTooltipProps } from './types';

export function DiagramTooltip({
  content,
  children,
  side = 'top',
  sideOffset = 8,
  delayDuration = 0,
  open,
  onOpenChange,
}: DiagramTooltipProps) {
  return (
    <TooltipPrimitive.Provider delayDuration={delayDuration}>
      <TooltipPrimitive.Root open={open} onOpenChange={onOpenChange}>
        <TooltipPrimitive.Trigger asChild>
          {children}
        </TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            className={`
              glass-panel px-4 py-3 max-w-xs
              text-sm text-gray-200 leading-relaxed
              z-50
            `.trim()}
            sideOffset={sideOffset}
            side={side}
            collisionPadding={8}
          >
            {content}
            <TooltipPrimitive.Arrow className="fill-white/10" />
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
}

export type { DiagramTooltipProps };
