/**
 * Binlog Retention and Heartbeat Diagrams
 *
 * Exports:
 * - BinlogRetentionFlowDiagram: Timeline of binlog retention problem
 * - HeartbeatMonitoringDiagram: How heartbeat events keep offset fresh
 * - RetentionConfigDiagram: Retention configuration decision matrix
 */

import { FlowNode } from '../primitives/FlowNode';
import { Arrow } from '../primitives/Arrow';
import { DiagramContainer } from '../primitives/DiagramContainer';
import { DiagramTooltip } from '../primitives/Tooltip';
import { SequenceDiagram } from '../primitives/SequenceDiagram';
import type { SequenceActorDef, SequenceMessageDef } from '../primitives/types';

/**
 * BinlogRetentionFlowDiagram - Timeline of binlog retention problem
 */
export function BinlogRetentionFlowDiagram() {
  return (
    <div className="space-y-6">
      {/* Timeline */}
      <DiagramContainer title="Binlog Retention Problem" color="rose">
        <div className="flex flex-col gap-4">
          {/* Day 1 */}
          <div className="flex items-center gap-4">
            <DiagramTooltip content="Debezium активно читает события из binlog. Offset сохранен: mysql-bin.000010:154. Все работает нормально.">
              <FlowNode variant="connector" tabIndex={0} size="sm">
                <div className="text-xs">
                  <span className="text-gray-400">Day 1:</span>{' '}
                  <span className="text-emerald-400">Debezium reading</span>
                  <div className="font-mono text-gray-400 mt-1">mysql-bin.000010:154</div>
                </div>
              </FlowNode>
            </DiagramTooltip>
          </div>

          <Arrow direction="down" />

          {/* Day 3 */}
          <div className="flex items-center gap-4">
            <DiagramTooltip content="Debezium offline из-за обновления, проблемы Kafka, или сетевого сбоя. Offset не обновляется.">
              <FlowNode variant="sink" tabIndex={0} size="sm">
                <div className="text-xs">
                  <span className="text-gray-400">Day 3:</span>{' '}
                  <span className="text-amber-400">Debezium offline</span>
                  <div className="text-gray-500 mt-1">(обновление, проблема Kafka...)</div>
                </div>
              </FlowNode>
            </DiagramTooltip>
          </div>

          <Arrow direction="down" />

          {/* Day 8 */}
          <div className="flex items-center gap-4">
            <DiagramTooltip content="MySQL purge: binlog_expire_logs_seconds=7 дней истек. Файлы mysql-bin.000001 - 000012 удалены. Offset Debezium указывает на несуществующий файл.">
              <FlowNode variant="database" tabIndex={0} size="sm">
                <div className="text-xs">
                  <span className="text-gray-400">Day 8:</span>{' '}
                  <span className="text-rose-400">MySQL purge</span>
                  <div className="text-gray-500 mt-1">mysql-bin.000001-000012 deleted</div>
                </div>
              </FlowNode>
            </DiagramTooltip>
          </div>

          <Arrow direction="down" />

          {/* Day 9 */}
          <div className="flex items-center gap-4">
            <DiagramTooltip content="Debezium возвращается online, пытается читать mysql-bin.000010. Файл не найден! Требуется full resnapshot базы данных.">
              <FlowNode variant="app" tabIndex={0} size="sm">
                <div className="text-xs">
                  <span className="text-gray-400">Day 9:</span>{' '}
                  <span className="text-rose-400 font-semibold">ERROR!</span>
                  <div className="font-mono text-rose-400 mt-1">File not found!</div>
                </div>
              </FlowNode>
            </DiagramTooltip>
          </div>
        </div>
      </DiagramContainer>

      {/* Consequence */}
      <DiagramContainer title="Последствия" color="neutral">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DiagramTooltip content="Cannot replicate because the master purged required binary logs. Требуется resnapshot.">
            <div className="bg-rose-900/20 border border-rose-500/30 p-3 rounded-lg">
              <div className="text-rose-400 font-semibold text-sm mb-1">Full Resnapshot</div>
              <div className="text-xs text-gray-400">Часы/дни для больших баз</div>
            </div>
          </DiagramTooltip>

          <DiagramTooltip content="CDC pipeline остановлен пока идет resnapshot. Новые события буферизуются или теряются.">
            <div className="bg-amber-900/20 border border-amber-500/30 p-3 rounded-lg">
              <div className="text-amber-400 font-semibold text-sm mb-1">Downtime</div>
              <div className="text-xs text-gray-400">Потенциальная потеря событий</div>
            </div>
          </DiagramTooltip>
        </div>
      </DiagramContainer>
    </div>
  );
}

/**
 * HeartbeatMonitoringDiagram - How heartbeat events keep offset fresh
 */
export function HeartbeatMonitoringDiagram() {
  const actors: SequenceActorDef[] = [
    {
      id: 'debezium',
      label: 'Debezium',
      variant: 'service',
      tooltip: 'CDC connector с настроенным heartbeat.interval.ms. Периодически обновляет heartbeat таблицу для поддержания актуального offset.',
    },
    {
      id: 'heartbeat',
      label: 'Heartbeat Table',
      variant: 'database',
      tooltip: 'Специальная таблица debezium_heartbeat с одной записью. UPDATE ts создает событие в binlog, обновляя offset Debezium.',
    },
    {
      id: 'binlog',
      label: 'Binlog',
      variant: 'queue',
      tooltip: 'Binary Log записывает heartbeat UPDATE как обычное событие. Debezium читает это событие и обновляет свой offset.',
    },
    {
      id: 'kafka',
      label: 'Kafka Offset',
      variant: 'queue',
      tooltip: 'Kafka Connect offset storage хранит текущую позицию Debezium. Постоянно обновляется благодаря heartbeat events.',
    },
  ];

  const messages: SequenceMessageDef[] = [
    {
      id: 'msg1',
      from: 'debezium',
      to: 'heartbeat',
      label: 'INSERT...ON DUPLICATE KEY UPDATE ts=NOW()',
      variant: 'sync',
      tooltip: 'Debezium выполняет heartbeat query каждые 10 секунд. ON DUPLICATE KEY UPDATE обновляет существующую запись.',
    },
    {
      id: 'msg2',
      from: 'heartbeat',
      to: 'binlog',
      label: 'Heartbeat event recorded',
      variant: 'sync',
      tooltip: 'MySQL записывает UPDATE event в текущий активный binlog файл. Event содержит актуальный timestamp.',
    },
    {
      id: 'msg3',
      from: 'binlog',
      to: 'debezium',
      label: 'Debezium reads heartbeat event',
      variant: 'return',
      tooltip: 'Debezium читает heartbeat event через replication protocol. Позиция binlog файла обновляется.',
    },
    {
      id: 'msg4',
      from: 'debezium',
      to: 'kafka',
      label: 'Update offset to current file',
      variant: 'async',
      tooltip: 'Debezium сохраняет новый offset в Kafka Connect storage. Offset теперь указывает на свежий binlog файл.',
    },
  ];

  return (
    <div className="space-y-6">
      <SequenceDiagram
        actors={actors}
        messages={messages}
        messageSpacing={55}
      />

      {/* Result */}
      <div className="flex flex-col md:flex-row gap-4 justify-center">
        <DiagramTooltip content="Старые binlog файлы (до текущего offset) могут быть безопасно удалены MySQL при binlog_expire_logs_seconds.">
          <div className="bg-emerald-900/20 border border-emerald-500/30 p-4 rounded-lg text-center">
            <div className="text-emerald-400 font-semibold">Старые binlog can be purged</div>
            <div className="text-xs text-gray-400 mt-1">Offset всегда актуален</div>
          </div>
        </DiagramTooltip>

        <DiagramTooltip content="Даже если business таблицы idle, heartbeat поддерживает offset. Нет риска position loss.">
          <div className="bg-blue-900/20 border border-blue-500/30 p-4 rounded-lg text-center">
            <div className="text-blue-400 font-semibold">Idle tables protected</div>
            <div className="text-xs text-gray-400 mt-1">Heartbeat каждые 10 сек</div>
          </div>
        </DiagramTooltip>
      </div>
    </div>
  );
}

/**
 * RetentionConfigDiagram - Retention configuration decision matrix
 */
export function RetentionConfigDiagram() {
  return (
    <div className="space-y-6">
      {/* Formula */}
      <DiagramContainer title="Формула расчета Retention" color="blue">
        <div className="flex flex-col items-center gap-4">
          <div className="bg-gray-800/50 p-4 rounded-lg font-mono text-center">
            <DiagramTooltip content="Базовая формула: определите максимальное время простоя Debezium и добавьте safety margin для защиты от непредвиденных ситуаций.">
              <span className="cursor-help">
                <span className="text-emerald-400">Retention</span>{' '}
                <span className="text-gray-400">=</span>{' '}
                <span className="text-blue-400">Max Downtime</span>{' '}
                <span className="text-gray-400">+</span>{' '}
                <span className="text-amber-400">Safety Margin</span>
              </span>
            </DiagramTooltip>
          </div>
        </div>
      </DiagramContainer>

      {/* Decision matrix */}
      <DiagramContainer title="Примеры конфигураций" color="neutral">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DiagramTooltip content="Stable production: редкие сбои, max downtime 2 дня. Safety margin 2x дает 4 дня retention = 345600 секунд.">
            <FlowNode variant="connector" tabIndex={0}>
              <div className="text-xs text-left">
                <div className="text-emerald-400 font-semibold">Stable Production</div>
                <div className="text-gray-400 mt-1">Max downtime: 2 дня</div>
                <div className="text-gray-400">Safety: 2x</div>
                <div className="font-mono text-blue-400 mt-2">345600s (4 дня)</div>
              </div>
            </FlowNode>
          </DiagramTooltip>

          <DiagramTooltip content="Frequent deployments: частые обновления, max downtime 1 день. Safety margin 3x дает 3 дня = 259200 секунд.">
            <FlowNode variant="connector" tabIndex={0}>
              <div className="text-xs text-left">
                <div className="text-blue-400 font-semibold">Frequent Deployments</div>
                <div className="text-gray-400 mt-1">Max downtime: 1 день</div>
                <div className="text-gray-400">Safety: 3x</div>
                <div className="font-mono text-blue-400 mt-2">259200s (3 дня)</div>
              </div>
            </FlowNode>
          </DiagramTooltip>

          <DiagramTooltip content="Dev/Test environment: может быть неделя простоя. Минимальный safety margin 1x = 7 дней = 604800 секунд.">
            <FlowNode variant="connector" tabIndex={0}>
              <div className="text-xs text-left">
                <div className="text-amber-400 font-semibold">Dev/Test</div>
                <div className="text-gray-400 mt-1">Max downtime: 1 неделя</div>
                <div className="text-gray-400">Safety: 1x</div>
                <div className="font-mono text-blue-400 mt-2">604800s (7 дней)</div>
              </div>
            </FlowNode>
          </DiagramTooltip>

          <DiagramTooltip content="Critical production: zero tolerance для потери данных. Max downtime 3 дня, safety 5x = 15 дней = 1296000 секунд.">
            <FlowNode variant="connector" tabIndex={0}>
              <div className="text-xs text-left">
                <div className="text-rose-400 font-semibold">Critical Production</div>
                <div className="text-gray-400 mt-1">Max downtime: 3 дня</div>
                <div className="text-gray-400">Safety: 5x</div>
                <div className="font-mono text-blue-400 mt-2">1296000s (15 дней)</div>
              </div>
            </FlowNode>
          </DiagramTooltip>
        </div>
      </DiagramContainer>

      {/* Trade-off */}
      <div className="flex flex-col md:flex-row gap-6">
        <DiagramContainer title="Больше retention" color="emerald" className="flex-1">
          <div className="text-center">
            <DiagramTooltip content="Меньше риск position loss, но больше disk space. Binlog файлы накапливаются.">
              <div className="cursor-help">
                <div className="text-lg text-emerald-400">+ Безопасность</div>
                <div className="text-sm text-gray-400 mt-2">- Disk space</div>
              </div>
            </DiagramTooltip>
          </div>
        </DiagramContainer>

        <DiagramContainer title="Меньше retention" color="rose" className="flex-1">
          <div className="text-center">
            <DiagramTooltip content="Экономия disk space, но выше риск position loss при длительном downtime.">
              <div className="cursor-help">
                <div className="text-lg text-emerald-400">+ Disk space</div>
                <div className="text-sm text-gray-400 mt-2">- Риск position loss</div>
              </div>
            </DiagramTooltip>
          </div>
        </DiagramContainer>
      </div>
    </div>
  );
}
