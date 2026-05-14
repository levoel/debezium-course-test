/** @jsxImportSource solid-js */
/**
 * Module Summary Diagrams (Module 4)
 *
 * Exports:
 * - DiagnosticTreeDiagram: Lag troubleshooting decision tree
 */

import { FlowNode } from '@primitives/FlowNode';
import { Arrow } from '@primitives/Arrow';
import { DiagramContainer } from '@primitives/DiagramContainer';
import { DiagramTooltip } from '@primitives/Tooltip';

/**
 * DiagnosticTreeDiagram — decision tree for high-lag troubleshooting.
 * Replaces ASCII tree in 08-module-summary.mdx.
 */
export function DiagnosticTreeDiagram() {
  const branches = [
    {
      question: 'Queue full?',
      action: 'Increase max.queue.size',
      tooltip: 'Внутренняя очередь Debezium Connect переполнена. Увеличьте max.queue.size (по умолчанию 8192).',
      color: 'amber' as const,
    },
    {
      question: 'Slow consumers?',
      action: 'Check downstream',
      tooltip: 'Потребители не успевают обрабатывать события. Проверьте latency downstream систем.',
      color: 'blue' as const,
    },
    {
      question: 'Source overload?',
      action: 'Snapshot in progress?',
      tooltip: 'Высокая нагрузка на источник. Возможно, идёт snapshot — проверьте статус коннектора.',
      color: 'purple' as const,
    },
    {
      question: 'Network issues?',
      action: 'Check connectivity',
      tooltip: 'Сетевые проблемы между Debezium и базой или Kafka. Проверьте latency и connectivity.',
      color: 'rose' as const,
    },
  ];

  const variantMap: Record<string, 'app' | 'connector' | 'cluster' | 'target'> = {
    amber: 'app',
    blue: 'connector',
    purple: 'cluster',
    rose: 'target',
  };

  return (
    <DiagramContainer title="Диагностика: High Lag" color="rose">
      <div class="flex flex-col items-center gap-4">
        {/* Root */}
        <FlowNode variant="target" tabIndex={0} className="border-2 border-rose-400">
          <span class="font-semibold">High lag?</span>
        </FlowNode>

        {/* Branches */}
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
          {branches.map((b) => (
            <DiagramTooltip content={b.tooltip}>
              <div class="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--line-thin)] cursor-help">
                <FlowNode variant={variantMap[b.color]} tabIndex={0} size="sm">
                  {b.question}
                </FlowNode>
                <Arrow direction="right" />
                <span class="text-xs text-[var(--ink-default)] shrink-0">{b.action}</span>
              </div>
            </DiagramTooltip>
          ))}
        </div>
      </div>
    </DiagramContainer>
  );
}
