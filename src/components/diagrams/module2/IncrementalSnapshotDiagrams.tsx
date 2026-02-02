/**
 * Incremental Snapshot Lab Diagrams
 *
 * Exports:
 * - IncrementalSnapshotLabDiagram: Lab architecture
 * - LabCompletionDiagram: Summary of lab achievements
 */

import { FlowNode } from '../primitives/FlowNode';
import { Arrow } from '../primitives/Arrow';
import { DiagramContainer } from '../primitives/DiagramContainer';
import { DiagramTooltip } from '../primitives/Tooltip';

/**
 * IncrementalSnapshotLabDiagram - Lab architecture
 */
export function IncrementalSnapshotLabDiagram() {
  return (
    <div className="space-y-6">
      {/* Main architecture */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* PostgreSQL */}
        <DiagramContainer title="PostgreSQL" color="purple" className="flex-1">
          <div className="flex flex-col items-center gap-4">
            <DiagramTooltip content="debezium_signal — таблица для управления snapshot. INSERT с execute-snapshot запускает процесс. Структура: id (VARCHAR), type (VARCHAR), data (TEXT JSON).">
              <FlowNode variant="database" tabIndex={0} size="sm">
                debezium_signal
              </FlowNode>
            </DiagramTooltip>

            <Arrow direction="down" dashed label="trigger" />

            <DiagramTooltip content="Тестовая таблица orders_large с 10,000 записями. Демонстрирует chunked чтение по primary key (id). Chunk size 512 = ~20 chunks для полного snapshot.">
              <FlowNode variant="database" tabIndex={0}>
                orders_large
                <br />
                <span className="text-xs text-gray-400">10,000 rows</span>
              </FlowNode>
            </DiagramTooltip>
          </div>
        </DiagramContainer>

        {/* Debezium */}
        <DiagramContainer title="Debezium" color="amber" className="flex-1">
          <div className="flex flex-col items-center gap-4">
            <DiagramTooltip content="Коннектор orders-incremental с snapshot.mode=never и signal.data.collection настроенной. Читает signaling table и выполняет incremental snapshot по команде.">
              <FlowNode variant="connector" tabIndex={0}>
                orders-incremental
              </FlowNode>
            </DiagramTooltip>

            <div className="text-xs text-gray-400 text-center font-mono space-y-1">
              <div>snapshot.mode=never</div>
              <div>chunk.size=512</div>
            </div>
          </div>
        </DiagramContainer>
      </div>

      {/* Data flow */}
      <div className="flex flex-col md:flex-row items-center justify-center gap-4">
        <div className="text-xs text-gray-400">PostgreSQL</div>
        <Arrow direction="right" label="chunks" />
        <div className="text-xs text-gray-400">Connector</div>
        <Arrow direction="right" label="events" />
        <div className="text-xs text-gray-400">Kafka</div>
        <Arrow direction="right" label="consume" />
        <div className="text-xs text-gray-400">Python</div>
      </div>

      {/* Kafka + Python */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Kafka */}
        <DiagramContainer title="Kafka" color="blue" className="flex-1">
          <div className="flex flex-col items-center gap-3">
            <DiagramTooltip content="inventory.public.orders_large — топик с snapshot (op='r') и streaming (op='c/u/d') событиями. Consumer различает типы по полю source.snapshot.">
              <FlowNode variant="cluster" tabIndex={0}>
                inventory.public.orders_large
              </FlowNode>
            </DiagramTooltip>

            <div className="text-xs text-gray-400 text-center">
              op='r' (snapshot) + op='c/u/d' (streaming)
            </div>
          </div>
        </DiagramContainer>

        {/* Python Monitor */}
        <DiagramContainer title="Python Monitor" color="emerald" className="flex-1">
          <div className="flex flex-col items-center gap-3">
            <DiagramTooltip content="Consumer на Python с confluent-kafka. Считает snapshot события, отслеживает chunk boundaries (каждые 512 записей), показывает прогресс в реальном времени.">
              <FlowNode variant="app" tabIndex={0}>
                Snapshot Monitor
              </FlowNode>
            </DiagramTooltip>

            <div className="text-xs text-gray-400 text-center">
              Считает события, отслеживает chunks
            </div>
          </div>
        </DiagramContainer>
      </div>

      {/* Signal flow explanation */}
      <DiagramContainer title="Процесс запуска snapshot" color="neutral">
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-xs text-gray-300">
          <div className="flex items-center gap-2">
            <span className="bg-purple-500/20 px-2 py-1 rounded">1. INSERT signal</span>
          </div>
          <Arrow direction="right" />
          <div className="flex items-center gap-2">
            <span className="bg-amber-500/20 px-2 py-1 rounded">2. Connector reads</span>
          </div>
          <Arrow direction="right" />
          <div className="flex items-center gap-2">
            <span className="bg-blue-500/20 px-2 py-1 rounded">3. Chunks to Kafka</span>
          </div>
          <Arrow direction="right" />
          <div className="flex items-center gap-2">
            <span className="bg-emerald-500/20 px-2 py-1 rounded">4. Monitor displays</span>
          </div>
        </div>
      </DiagramContainer>
    </div>
  );
}

/**
 * LabCompletionDiagram - Summary of lab achievements
 */
export function LabCompletionDiagram() {
  const steps = [
    {
      label: 'Signaling Table создана',
      tooltip:
        'Создана таблица debezium_signal с колонками id, type, data. Права на INSERT выданы пользователю postgres. Готова к приему команд.',
    },
    {
      label: 'Orders Large: 10K записей',
      tooltip:
        'Сгенерирована таблица orders_large с 10,000 тестовыми записями. Структура: id, customer_id, order_date, total_amount, status, notes, created_at.',
    },
    {
      label: 'Коннектор с incremental snapshot',
      tooltip:
        'Развернут коннектор orders-incremental с snapshot.mode=never, signal.data.collection=public.debezium_signal, chunk.size=512.',
    },
    {
      label: 'Python Monitor запущен',
      tooltip:
        'Consumer на Python подписан на топик inventory.public.orders_large. Считает snapshot и streaming события, отображает chunk boundaries.',
    },
    {
      label: 'INSERT execute-snapshot',
      tooltip:
        'Выполнен INSERT в signaling table с type=execute-snapshot и data={"data-collections": ["public.orders_large"]}. Snapshot запущен.',
    },
    {
      label: 'Наблюдение chunk-by-chunk',
      tooltip:
        'В Python Monitor отображались события op="r" по chunk-ам (каждые 512 записей). Всего ~20 chunks для 10,000 записей.',
    },
    {
      label: 'Stop/Resume демонстрация',
      tooltip:
        'Продемонстрирована возможность остановки snapshot через stop-snapshot сигнал и возобновления с последнего chunk при рестарте.',
    },
    {
      label: 'Filtered snapshot',
      tooltip:
        'Выполнен filtered snapshot с additional-conditions для выборки только заказов 2025 года. Позволяет синхронизировать подмножество данных.',
    },
  ];

  return (
    <DiagramContainer title="Итоги лабораторной работы" color="emerald" recommended>
      <div className="flex flex-col gap-3">
        {steps.map((step, index) => (
          <div key={index} className="flex items-center gap-3">
            <DiagramTooltip content={step.tooltip}>
              <FlowNode variant="cluster" tabIndex={0} size="sm" className="flex-1">
                <div className="flex items-center gap-3">
                  <span className="text-emerald-400 font-bold text-xs">{index + 1}</span>
                  <span>{step.label}</span>
                </div>
              </FlowNode>
            </DiagramTooltip>
          </div>
        ))}

        {/* Summary stats */}
        <div className="mt-4 pt-4 border-t border-gray-700 flex flex-col md:flex-row gap-4 justify-center text-xs text-gray-400">
          <div className="text-center">
            <div className="text-emerald-400 text-lg font-bold">10,000</div>
            <div>записей в snapshot</div>
          </div>
          <div className="text-center">
            <div className="text-emerald-400 text-lg font-bold">~20</div>
            <div>chunks обработано</div>
          </div>
          <div className="text-center">
            <div className="text-emerald-400 text-lg font-bold">512</div>
            <div>строк на chunk</div>
          </div>
        </div>
      </div>
    </DiagramContainer>
  );
}
