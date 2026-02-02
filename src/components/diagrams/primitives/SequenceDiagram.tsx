/**
 * SequenceDiagram - Layout container for sequence diagrams
 *
 * Composes SequenceActor, SequenceLifeline, and SequenceMessage primitives
 * into complete interactive sequence diagrams with tooltip support.
 *
 * Features:
 * - Percentage-based responsive layout
 * - Automatic lifeline positioning
 * - Click-to-open tooltips on actors and messages
 * - Supports 3-7 actors (typical course diagrams)
 */

import { useRef, useLayoutEffect, useState } from 'react';
import { SequenceActor } from './SequenceActor';
import { DiagramTooltip } from './Tooltip';
import type { SequenceDiagramProps } from './types';

export function SequenceDiagram({
  actors,
  messages,
  messageSpacing = 40,
  className = '',
}: SequenceDiagramProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [svgWidth, setSvgWidth] = useState(600);

  // Calculate diagram height based on message count
  const diagramHeight = 20 + messages.length * messageSpacing;

  // Calculate column width as percentage
  const columnWidth = 100 / actors.length;

  // Helper to get actor column center X position (as percentage)
  const getActorCenterPercent = (actorId: string): number => {
    const index = actors.findIndex((a) => a.id === actorId);
    if (index === -1) return 50; // fallback to center
    return columnWidth * index + columnWidth / 2;
  };

  // Get SVG width for pixel calculations (for message arrows)
  useLayoutEffect(() => {
    const updateWidth = () => {
      if (svgRef.current) {
        setSvgWidth(svgRef.current.getBoundingClientRect().width);
      }
    };
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  // Convert percentage to pixel for SVG elements that need it
  const percentToPixel = (percent: number): number => {
    return (percent / 100) * svgWidth;
  };

  return (
    <div className={`relative ${className}`}>
      {/* Actor row */}
      <div className="flex justify-around mb-4">
        {actors.map((actor) =>
          actor.tooltip ? (
            <DiagramTooltip key={actor.id} content={actor.tooltip}>
              <SequenceActor variant={actor.variant} tabIndex={0}>
                {actor.label}
              </SequenceActor>
            </DiagramTooltip>
          ) : (
            <SequenceActor key={actor.id} variant={actor.variant}>
              {actor.label}
            </SequenceActor>
          )
        )}
      </div>

      {/* SVG for lifelines and messages */}
      <svg
        ref={svgRef}
        width="100%"
        height={diagramHeight}
        className="overflow-visible"
        aria-label="Sequence diagram messages"
      >
        {/* Lifelines - positioned at actor column centers */}
        {actors.map((actor) => {
          const xPercent = getActorCenterPercent(actor.id);
          return (
            <line
              key={`lifeline-${actor.id}`}
              x1={`${xPercent}%`}
              y1="0"
              x2={`${xPercent}%`}
              y2={diagramHeight}
              stroke="currentColor"
              strokeWidth="1"
              strokeDasharray="4 3"
              className="text-gray-500"
            />
          );
        })}

        {/* Messages */}
        {messages.map((msg, i) => {
          const fromPercent = getActorCenterPercent(msg.from);
          const toPercent = getActorCenterPercent(msg.to);
          const fromX = percentToPixel(fromPercent);
          const toX = percentToPixel(toPercent);
          const y = 20 + i * messageSpacing;

          const isLeftToRight = toX > fromX;
          const arrowheadSize = 8;
          const lineStyle =
            msg.variant === 'return' ? { strokeDasharray: '4 2' } : {};
          const arrowFill = msg.variant === 'sync' ? 'currentColor' : 'none';

          // Arrow path - arrowhead at destination end
          const arrowPath = isLeftToRight
            ? `M${toX - arrowheadSize},${y - arrowheadSize / 2} L${toX},${y} L${toX - arrowheadSize},${y + arrowheadSize / 2}`
            : `M${toX + arrowheadSize},${y - arrowheadSize / 2} L${toX},${y} L${toX + arrowheadSize},${y + arrowheadSize / 2}`;

          const messageContent = (
            <g
              key={msg.id}
              className="text-gray-400"
              tabIndex={msg.tooltip ? 0 : undefined}
              role={msg.tooltip ? 'button' : undefined}
              style={{ cursor: msg.tooltip ? 'pointer' : undefined }}
              aria-label={msg.label}
            >
              {/* Line */}
              <line
                x1={fromX}
                y1={y}
                x2={toX}
                y2={y}
                stroke="currentColor"
                strokeWidth="1.5"
                {...lineStyle}
              />

              {/* Arrowhead */}
              <path
                d={arrowPath}
                stroke="currentColor"
                strokeWidth="1.5"
                fill={arrowFill}
                strokeLinejoin="round"
              />

              {/* Label */}
              <text
                x={(fromX + toX) / 2}
                y={y - 6}
                textAnchor="middle"
                className="text-xs fill-gray-300"
              >
                {msg.label}
              </text>
            </g>
          );

          // Wrap in tooltip if tooltip content provided
          if (msg.tooltip) {
            return (
              <DiagramTooltip key={msg.id} content={msg.tooltip}>
                {messageContent}
              </DiagramTooltip>
            );
          }
          return messageContent;
        })}
      </svg>
    </div>
  );
}

export type { SequenceDiagramProps };
