/** @jsxImportSource solid-js */
/**
 * WAL Bloat and Heartbeat Diagrams for Module 4 Lesson 05
 *
 * Exports:
 * - LowTrafficWalScenarioDiagram: Sequence diagram showing WAL accumulation problem
 * - MultiLayerDefenseDiagram: 4-layer defense against WAL bloat
 * - HeartbeatFlowDiagram: How heartbeat advances slot position
 */

import { FlowNode } from '@primitives/FlowNode';
import { Arrow } from '@primitives/Arrow';
import { DiagramContainer } from '@primitives/DiagramContainer';
import { DiagramTooltip } from '@primitives/Tooltip';
import { SequenceDiagram } from '@primitives/SequenceDiagram';
import type { SequenceActorDef, SequenceMessageDef } from '@primitives/types';

/**
 * LowTrafficWalScenarioDiagram - WAL accumulation due to inactive slot
 */
export function LowTrafficWalScenarioDiagram() {
  const actors: SequenceActorDef[] = [
    {
      id: 'orders',
      label: 'Orders Table',
      variant: 'database',
      tooltip:
        'Low-traffic таблица: изменения редкие (1 запись/день). Если таблица не меняется, slot не продвигается.',
    },
    {
      id: 'slot',
      label: 'Replication Slot',
      variant: 'service',
      tooltip:
        'Slot удерживает WAL после restart_lsn. Если CDC читает события, restart_lsn продвигается. Если нет событий - позиция застывает.',
    },
    {
      id: 'wal',
      label: 'WAL Segments',
      variant: 'queue',
      tooltip:
        'Write-Ahead Log накапливает события от ВСЕХ транзакций в БД, не только мониторируемых таблиц. PostgreSQL не удаляет WAL после restart_lsn.',
    },
    {
      id: 'disk',
      label: 'Disk Space',
      variant: 'external',
      tooltip:
        'Диск заполняется WAL файлами. Без защиты - 100% заполнение = PostgreSQL read-only = production outage.',
    },
  ];

  const messages: SequenceMessageDef[] = [
    // Normal flow
    {
      id: 'msg1',
      from: 'orders',
      to: 'slot',
      label: 'CDC события (1000/час)',
      variant: 'sync',
      tooltip: 'Активная таблица: много изменений. Debezium читает события, restart_lsn продвигается.',
    },
    {
      id: 'msg2',
      from: 'slot',
      to: 'slot',
      label: 'restart_lsn продвигается',
      variant: 'sync',
      tooltip: 'Slot позиция обновляется с каждым обработанным событием. WAL до этой позиции можно удалить.',
    },
    {
      id: 'msg3',
      from: 'wal',
      to: 'wal',
      label: 'Старые сегменты удаляются',
      variant: 'async',
      tooltip: 'PostgreSQL удаляет WAL файлы, которые уже не нужны ни одному слоту. Disk space стабилен.',
    },
    {
      id: 'msg4',
      from: 'disk',
      to: 'disk',
      label: 'Стабильно 1GB',
      variant: 'return',
      tooltip: 'Диск используется равномерно: новые WAL записываются, старые удаляются.',
    },
    // Problem scenario
    {
      id: 'msg5',
      from: 'orders',
      to: 'orders',
      label: '--- Low-traffic режим ---',
      variant: 'async',
      tooltip: 'Таблица переходит в режим редких изменений. Типичная ситуация для архивных или справочных таблиц.',
    },
    {
      id: 'msg6',
      from: 'orders',
      to: 'slot',
      label: 'Нет изменений 7 дней',
      variant: 'async',
      tooltip: 'Таблица не меняется неделю. Debezium не получает события для этой таблицы.',
    },
    {
      id: 'msg7',
      from: 'slot',
      to: 'slot',
      label: 'restart_lsn НЕ МЕНЯЕТСЯ!',
      variant: 'sync',
      tooltip: 'ПРОБЛЕМА: slot позиция застыла! WAL накапливается от других транзакций в БД.',
    },
    {
      id: 'msg8',
      from: 'wal',
      to: 'disk',
      label: '+500 MB/день накапливается',
      variant: 'sync',
      tooltip: 'WAL растет от других таблиц и транзакций. PostgreSQL не может удалить сегменты - slot их держит.',
    },
    {
      id: 'msg9',
      from: 'disk',
      to: 'disk',
      label: 'День 14: Disk full!',
      variant: 'sync',
      tooltip: 'OUTAGE: диск заполнен на 100%. PostgreSQL переходит в read-only. Production недоступен.',
    },
  ];

  return (
    <div class="space-y-6">
      <DiagramContainer title="Low-Traffic Table Scenario" color="rose">
        <SequenceDiagram actors={actors} messages={messages} messageSpacing={45} />
      </DiagramContainer>

      {/* Consequences */}
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DiagramTooltip content="PostgreSQL в read-only: все write операции блокированы. Приложения падают с ошибками. Critical production incident.">
          <div class="bg-rose-900/20 border border-rose-500/30 p-4 rounded-lg text-center">
            <div class="text-rose-400 font-semibold">Database Read-Only</div>
            <div class="text-xs text-[var(--ink-muted)] mt-1">Production outage</div>
          </div>
        </DiagramTooltip>

        <DiagramTooltip content="Recovery требует ручного вмешательства: DROP slot, освобождение места, перезапуск. Потенциально часы downtime.">
          <div class="bg-amber-900/20 border border-amber-500/30 p-4 rounded-lg text-center">
            <div class="text-amber-400 font-semibold">Manual Recovery</div>
            <div class="text-xs text-[var(--ink-muted)] mt-1">Часы downtime</div>
          </div>
        </DiagramTooltip>
      </div>
    </div>
  );
}

/**
 * MultiLayerDefenseDiagram - 4-layer defense against WAL bloat
 */
export function MultiLayerDefenseDiagram() {
  return (
    <DiagramContainer
      title="Многослойная защита от WAL Bloat"
      color="neutral"
      description="Один слой может отказать - многослойность обеспечивает resilience"
    >
      <div class="flex flex-col gap-6">
        {/* Threats section */}
        <div class="flex flex-col items-center">
          <DiagramTooltip content="Три основные угрозы WAL bloat: abandoned slot (забытый коннектор), low-traffic table (редкие изменения), slow consumer (Kafka тормозит).">
            <div class="bg-rose-900/30 border border-rose-500/40 p-4 rounded-xl mb-4">
              <div class="text-rose-400 font-semibold text-center mb-2">Угрозы</div>
              <div class="flex flex-wrap gap-2 justify-center">
                <span class="px-2 py-1 bg-rose-800/30 rounded text-xs text-rose-700">
                  Abandoned Slot
                </span>
                <span class="px-2 py-1 bg-rose-800/30 rounded text-xs text-rose-700">
                  Low-Traffic Table
                </span>
                <span class="px-2 py-1 bg-rose-800/30 rounded text-xs text-rose-700">
                  Slow Consumer
                </span>
              </div>
            </div>
          </DiagramTooltip>

          <Arrow direction="down" />
        </div>

        {/* Defense layers */}
        <div class="flex flex-col items-center gap-3">
          {/* Layer 1: max_slot_wal_keep_size */}
          <DiagramTooltip content="Layer 1: max_slot_wal_keep_size - PostgreSQL parameter. Жесткий лимит WAL на slot. При превышении slot инвалидируется (wal_status='lost'). Требует resnapshot, но защищает диск.">
            <FlowNode variant="connector" tabIndex={0} className="bg-emerald-500/20 border-emerald-400/30 w-full max-w-md">
              <div class="text-sm">
                <div class="font-semibold text-emerald-700">Layer 1: max_slot_wal_keep_size</div>
                <div class="text-xs text-emerald-700/70">PostgreSQL parameter - жесткий лимит WAL на slot</div>
              </div>
            </FlowNode>
          </DiagramTooltip>

          <Arrow direction="down" />

          {/* Layer 2: Heartbeat */}
          <DiagramTooltip content="Layer 2: Heartbeat - Debezium configuration. Принудительное продвижение slot каждые 10 секунд через pg_logical_emit_message(). Предотвращает застой позиции.">
            <FlowNode variant="sink" tabIndex={0} className="bg-blue-500/20 border-blue-400/30 w-full max-w-md">
              <div class="text-sm">
                <div class="font-semibold text-blue-700">Layer 2: Heartbeat Events</div>
                <div class="text-xs text-blue-700/70">Debezium config - принудительное продвижение slot</div>
              </div>
            </FlowNode>
          </DiagramTooltip>

          <Arrow direction="down" />

          {/* Layer 3: Monitoring */}
          <DiagramTooltip content="Layer 3: Monitoring - pg_replication_slots мониторинг. Алерты на retained_wal > threshold и wal_status != 'reserved'. Раннее обнаружение проблем.">
            <FlowNode variant="connector" tabIndex={0} className="bg-amber-500/20 border-amber-400/30 w-full max-w-md">
              <div class="text-sm">
                <div class="font-semibold text-amber-700">Layer 3: Monitoring & Alerting</div>
                <div class="text-xs text-amber-700/70">pg_replication_slots - алерты на lag и wal_status</div>
              </div>
            </FlowNode>
          </DiagramTooltip>

          <Arrow direction="down" />

          {/* Layer 4: Runbooks */}
          <DiagramTooltip content="Layer 4: Runbooks - операционные процедуры. Документированные чеклисты для реагирования на инциденты. Human can intervene когда автоматика не справляется.">
            <FlowNode variant="database" tabIndex={0} className="bg-purple-500/20 border-purple-400/30 w-full max-w-md">
              <div class="text-sm">
                <div class="font-semibold text-purple-700">Layer 4: Runbooks & Procedures</div>
                <div class="text-xs text-purple-700/70">Операционные процедуры - чеклисты реагирования</div>
              </div>
            </FlowNode>
          </DiagramTooltip>

          <Arrow direction="down" />

          {/* Protected */}
          <DiagramTooltip content="Результат многослойной защиты: WAL bloat предотвращен или быстро обнаружен. Production стабилен.">
            <div class="bg-emerald-900/30 border border-emerald-500/40 p-4 rounded-xl">
              <div class="text-emerald-400 font-semibold text-center">Protected</div>
            </div>
          </DiagramTooltip>
        </div>
      </div>
    </DiagramContainer>
  );
}

/**
 * HeartbeatFlowDiagram - How heartbeat advances slot position
 */
export function HeartbeatFlowDiagram() {
  return (
    <DiagramContainer
      title="Heartbeat Flow"
      color="blue"
      description="pg_logical_emit_message() - рекомендуемый подход для PostgreSQL 14+"
    >
      <div class="flex items-center justify-center gap-3 flex-wrap">
        {/* Debezium Timer */}
        <DiagramTooltip content="Heartbeat Timer: Debezium выполняет heartbeat.action.query каждые heartbeat.interval.ms (рекомендуется 10 секунд).">
          <FlowNode variant="connector" tabIndex={0} size="sm" className="bg-amber-500/20 border-amber-400/30">
            <div class="text-xs">
              <div>Debezium</div>
              <div class="text-amber-700/70">Timer 10s</div>
            </div>
          </FlowNode>
        </DiagramTooltip>

        <Arrow direction="right" label="SELECT" />

        {/* pg_logical_emit_message */}
        <DiagramTooltip content="pg_logical_emit_message(false, 'heartbeat', now()): функция PostgreSQL 14+. Записывает logical message в WAL без таблицы. Минимальная нагрузка.">
          <FlowNode variant="database" tabIndex={0} size="sm">
            <div class="text-xs">
              <div>pg_logical_</div>
              <div>emit_message()</div>
            </div>
          </FlowNode>
        </DiagramTooltip>

        <Arrow direction="right" label="записывает" />

        {/* WAL */}
        <DiagramTooltip content="WAL получает heartbeat event как logical message. Это легковесная запись без блокировок таблиц.">
          <FlowNode variant="sink" tabIndex={0} size="sm">
            <div class="text-xs">
              <div>WAL</div>
              <div class="text-blue-700/70">logical msg</div>
            </div>
          </FlowNode>
        </DiagramTooltip>

        <Arrow direction="right" label="читает" />

        {/* Slot */}
        <DiagramTooltip content="Debezium читает heartbeat event через replication slot. restart_lsn ПРОДВИГАЕТСЯ на текущую позицию. Старый WAL можно удалить.">
          <FlowNode variant="connector" tabIndex={0} size="sm">
            <div class="text-xs">
              <div>Slot</div>
              <div class="text-emerald-700/70">restart_lsn++</div>
            </div>
          </FlowNode>
        </DiagramTooltip>

        <Arrow direction="right" />

        {/* Kafka */}
        <DiagramTooltip content="Heartbeat event отправляется в __debezium-heartbeat.prefix topic в Kafka. Offset обновлен, позиция свежая.">
          <FlowNode variant="cluster" tabIndex={0} size="sm">
            <div class="text-xs">
              <div>Kafka</div>
              <div class="text-emerald-700/70">heartbeat topic</div>
            </div>
          </FlowNode>
        </DiagramTooltip>
      </div>

      {/* Result */}
      <div class="mt-6 flex flex-col md:flex-row gap-4 justify-center">
        <DiagramTooltip content="Slot продвигается даже без изменений в мониторируемых таблицах. WAL bloat предотвращен.">
          <div class="bg-emerald-900/20 border border-emerald-500/30 p-3 rounded-lg text-center">
            <div class="text-emerald-400 font-semibold text-sm">Slot продвигается</div>
            <div class="text-xs text-[var(--ink-muted)] mt-1">даже без изменений в таблицах</div>
          </div>
        </DiagramTooltip>

        <DiagramTooltip content="Старые WAL сегменты удаляются автоматически. Disk space стабилен. Production защищен.">
          <div class="bg-blue-900/20 border border-blue-500/30 p-3 rounded-lg text-center">
            <div class="text-blue-400 font-semibold text-sm">Старый WAL удаляется</div>
            <div class="text-xs text-[var(--ink-muted)] mt-1">disk space стабилен</div>
          </div>
        </DiagramTooltip>
      </div>
    </DiagramContainer>
  );
}
