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

import { SequenceActor } from './SequenceActor';
import { DiagramTooltip } from './Tooltip';
import type { SequenceDiagramProps } from './types';

// Fixed viewBox width for consistent coordinate system
const VIEWBOX_WIDTH = 1000;

export function SequenceDiagram({
  actors,
  messages,
  messageSpacing = 40,
  className = '',
}: SequenceDiagramProps) {
  // Calculate diagram height based on message count
  const diagramHeight = 20 + messages.length * messageSpacing;

  // Calculate column width in viewBox units
  const columnWidth = VIEWBOX_WIDTH / actors.length;

  // Helper to get actor column center X position in viewBox units
  const getActorCenterX = (actorId: string): number => {
    const index = actors.findIndex((a) => a.id === actorId);
    if (index === -1) return VIEWBOX_WIDTH / 2; // fallback to center
    return columnWidth * index + columnWidth / 2;
  };

  return (
    <div className={`relative ${className}`}>
      {/* Actor row - use grid to match lifeline positions exactly */}
      <div
        className="grid mb-4"
        style={{ gridTemplateColumns: `repeat(${actors.length}, 1fr)` }}
      >
        {actors.map((actor) => (
          <div key={actor.id} className="flex justify-center">
            {actor.tooltip ? (
              <DiagramTooltip content={actor.tooltip}>
                <SequenceActor variant={actor.variant} tabIndex={0}>
                  {actor.label}
                </SequenceActor>
              </DiagramTooltip>
            ) : (
              <SequenceActor variant={actor.variant}>
                {actor.label}
              </SequenceActor>
            )}
          </div>
        ))}
      </div>

      {/* SVG for lifelines and messages */}
      <svg
        width="100%"
        viewBox={`0 0 ${VIEWBOX_WIDTH} ${diagramHeight}`}
        preserveAspectRatio="xMidYMid meet"
        className="overflow-visible"
        aria-label="Sequence diagram messages"
      >
        {/* Lifelines - positioned at actor column centers */}
        {actors.map((actor) => {
          const x = getActorCenterX(actor.id);
          return (
            <line
              key={`lifeline-${actor.id}`}
              x1={x}
              y1="0"
              x2={x}
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
          const fromX = getActorCenterX(msg.from);
          const toX = getActorCenterX(msg.to);
          const y = 20 + i * messageSpacing;

          const isSelfMessage = msg.from === msg.to;
          const isLeftToRight = toX > fromX;
          const arrowheadSize = 8;
          const lineStyle =
            msg.variant === 'return' ? { strokeDasharray: '4 2' } : {};
          const arrowFill = msg.variant === 'sync' ? 'currentColor' : 'none';

          // Self-message: draw a loop to the right
          if (isSelfMessage) {
            const loopWidth = 40;
            const loopHeight = 20;
            const loopPath = `M${fromX},${y - loopHeight / 2} L${fromX + loopWidth},${y - loopHeight / 2} L${fromX + loopWidth},${y + loopHeight / 2} L${fromX},${y + loopHeight / 2}`;
            const selfArrowPath = `M${fromX + arrowheadSize},${y + loopHeight / 2 - arrowheadSize / 2} L${fromX},${y + loopHeight / 2} L${fromX + arrowheadSize},${y + loopHeight / 2 + arrowheadSize / 2}`;

            const selfMessageContent = (
              <g
                key={msg.id}
                className="text-gray-400"
                tabIndex={msg.tooltip ? 0 : undefined}
                role={msg.tooltip ? 'button' : undefined}
                style={{ cursor: msg.tooltip ? 'pointer' : undefined }}
                aria-label={msg.label}
              >
                {/* Loop path */}
                <path
                  d={loopPath}
                  stroke="currentColor"
                  strokeWidth="1.5"
                  fill="none"
                  {...lineStyle}
                />

                {/* Arrowhead */}
                <path
                  d={selfArrowPath}
                  stroke="currentColor"
                  strokeWidth="1.5"
                  fill={arrowFill}
                  strokeLinejoin="round"
                />

                {/* Label */}
                <text
                  x={fromX + loopWidth + 8}
                  y={y}
                  textAnchor="start"
                  className="text-xs fill-gray-300"
                >
                  {msg.label}
                </text>
              </g>
            );

            if (msg.tooltip) {
              return (
                <DiagramTooltip key={msg.id} content={msg.tooltip}>
                  {selfMessageContent}
                </DiagramTooltip>
              );
            }
            return selfMessageContent;
          }

          // Regular message: arrow from one actor to another
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
