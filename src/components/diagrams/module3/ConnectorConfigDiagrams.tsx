/**
 * MySQL Connector Configuration Diagrams
 *
 * Exports:
 * - MysqlConnectorDataFlowDiagram: Complete data flow through MySQL CDC connector
 */

import { FlowNode } from '../primitives/FlowNode';
import { Arrow } from '../primitives/Arrow';
import { DiagramContainer } from '../primitives/DiagramContainer';
import { DiagramTooltip } from '../primitives/Tooltip';
import { SequenceDiagram } from '../primitives/SequenceDiagram';
import type { SequenceActorDef, SequenceMessageDef } from '../primitives/types';

/**
 * MysqlConnectorDataFlowDiagram - Complete data flow through MySQL CDC connector
 */
export function MysqlConnectorDataFlowDiagram() {
  const actors: SequenceActorDef[] = [
    {
      id: 'connector',
      label: 'Connector',
      variant: 'service',
      tooltip: 'Debezium MySQL Connector конфигурируется через REST API. Выполняет snapshot и binlog streaming. Хранит offset и schema history в Kafka.',
    },
    {
      id: 'mysql',
      label: 'MySQL',
      variant: 'database',
      tooltip: 'MySQL Server с binlog_format=ROW и gtid_mode=ON. Connector подключается как replica используя database.server.id.',
    },
    {
      id: 'kafka',
      label: 'Kafka',
      variant: 'queue',
      tooltip: 'Kafka cluster получает CDC события в топики формата {server.name}.{database}.{table}. Хранит schema history с infinite retention.',
    },
  ];

  const messages: SequenceMessageDef[] = [
    {
      id: 'msg1',
      from: 'connector',
      to: 'mysql',
      label: 'SET GLOBAL read_lock (if allowed)',
      variant: 'sync',
      tooltip: 'Snapshot Phase: Connector получает consistent snapshot. При отсутствии SUPER privilege используется альтернативный метод.',
    },
    {
      id: 'msg2',
      from: 'connector',
      to: 'mysql',
      label: 'SELECT * FROM customers',
      variant: 'sync',
      tooltip: 'Connector читает все строки из таблицы. Для больших таблиц это может занять минуты/часы.',
    },
    {
      id: 'msg3',
      from: 'mysql',
      to: 'connector',
      label: '100,000 rows',
      variant: 'return',
      tooltip: 'MySQL возвращает результат. Connector преобразует каждую строку в CDC event с op=r (read).',
    },
    {
      id: 'msg4',
      from: 'connector',
      to: 'kafka',
      label: 'Publish 100K events',
      variant: 'async',
      tooltip: 'Snapshot events публикуются в Kafka topic mysql-server.inventory.customers. Каждый event содержит before=null, after={row data}.',
    },
    {
      id: 'msg5',
      from: 'connector',
      to: 'mysql',
      label: 'SELECT * FROM orders',
      variant: 'sync',
      tooltip: 'Следующая таблица в списке table.include.list. Процесс повторяется.',
    },
    {
      id: 'msg6',
      from: 'mysql',
      to: 'connector',
      label: '500,000 rows',
      variant: 'return',
      tooltip: 'Таблица orders может быть значительно больше. Connector обрабатывает порциями.',
    },
    {
      id: 'msg7',
      from: 'connector',
      to: 'kafka',
      label: 'Publish 500K events',
      variant: 'async',
      tooltip: 'Все snapshot events для orders публикуются в mysql-server.inventory.orders.',
    },
    {
      id: 'msg8',
      from: 'connector',
      to: 'mysql',
      label: 'UNLOCK TABLES',
      variant: 'sync',
      tooltip: 'Snapshot Phase COMPLETE: Lock освобождается. Connector переходит в streaming mode.',
    },
    {
      id: 'msg9',
      from: 'connector',
      to: 'mysql',
      label: 'Start reading binlog from GTID',
      variant: 'sync',
      tooltip: 'Streaming Phase: Connector читает binlog через MySQL replication protocol начиная с GTID, зафиксированного при snapshot.',
    },
    {
      id: 'msg10',
      from: 'mysql',
      to: 'connector',
      label: 'Stream INSERT/UPDATE/DELETE',
      variant: 'return',
      tooltip: 'Real-time события из binlog. Каждое событие содержит GTID, позицию в файле, before/after state.',
    },
    {
      id: 'msg11',
      from: 'connector',
      to: 'kafka',
      label: 'Publish real-time CDC events',
      variant: 'async',
      tooltip: 'CDC envelope: {"before": {...}, "after": {...}, "source": {"gtid": "..."}, "op": "c/u/d"}. Latency: миллисекунды.',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Phase headers */}
      <div className="flex flex-col md:flex-row gap-4">
        <DiagramContainer title="Snapshot Phase" color="blue" className="flex-1">
          <div className="text-xs text-gray-400 text-center">
            <DiagramTooltip content="Первичное чтение всех данных из таблиц. Может занять часы для больших баз. События с op=r.">
              <span className="cursor-help">
                SELECT * FROM tables<br />
                op=r (read events)
              </span>
            </DiagramTooltip>
          </div>
        </DiagramContainer>

        <DiagramContainer title="Streaming Phase" color="emerald" className="flex-1">
          <div className="text-xs text-gray-400 text-center">
            <DiagramTooltip content="Непрерывное чтение binlog. Real-time события с минимальной latency. События с op=c/u/d.">
              <span className="cursor-help">
                Read binlog events<br />
                op=c/u/d (real-time)
              </span>
            </DiagramTooltip>
          </div>
        </DiagramContainer>
      </div>

      {/* Sequence diagram */}
      <SequenceDiagram
        actors={actors}
        messages={messages}
        messageSpacing={42}
      />

      {/* Key configuration */}
      <DiagramContainer title="Критические параметры" color="purple">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <DiagramTooltip content="Уникальный ID в MySQL cluster. Не должен совпадать с server_id primary или replica. Типичные значения: 184000-184999.">
            <div className="bg-gray-800/50 p-3 rounded-lg">
              <div className="text-xs text-gray-400">database.server.id</div>
              <div className="font-mono text-blue-400">184054</div>
              <div className="text-xs text-gray-500 mt-1">Unique in cluster</div>
            </div>
          </DiagramTooltip>

          <DiagramTooltip content="Schema history topic с infinite retention. Single partition обязательно для сохранения порядка DDL.">
            <div className="bg-gray-800/50 p-3 rounded-lg">
              <div className="text-xs text-gray-400">schema.history.topic</div>
              <div className="font-mono text-emerald-400 text-xs">schema-changes.mysql</div>
              <div className="text-xs text-gray-500 mt-1">retention.ms=-1</div>
            </div>
          </DiagramTooltip>

          <DiagramTooltip content="Heartbeat для предотвращения position loss на idle таблицах. Рекомендуется 10-60 секунд.">
            <div className="bg-gray-800/50 p-3 rounded-lg">
              <div className="text-xs text-gray-400">heartbeat.interval.ms</div>
              <div className="font-mono text-amber-400">10000</div>
              <div className="text-xs text-gray-500 mt-1">Keep offset fresh</div>
            </div>
          </DiagramTooltip>
        </div>
      </DiagramContainer>
    </div>
  );
}
