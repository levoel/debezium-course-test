/**
 * CDC Fundamentals Diagrams
 *
 * Exports:
 * - CdcComparisonDiagram: Polling vs Log-based CDC comparison
 * - CdcSequenceDiagram: CDC event flow sequence
 */

import { FlowNode } from '../primitives/FlowNode';
import { Arrow } from '../primitives/Arrow';
import { DiagramContainer } from '../primitives/DiagramContainer';
import { DiagramTooltip } from '../primitives/Tooltip';
import { SequenceDiagram } from '../primitives/SequenceDiagram';
import type { SequenceActorDef, SequenceMessageDef } from '../primitives/types';

/**
 * CdcComparisonDiagram - Side-by-side comparison of Polling vs CDC
 */
export function CdcComparisonDiagram() {
  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Polling Approach */}
      <DiagramContainer
        title="Подход через Polling"
        color="rose"
        className="flex-1"
      >
        <div className="flex flex-col items-center gap-4">
          {/* APP */}
          <DiagramTooltip content="Приложение периодически опрашивает базу данных для поиска изменений. Этот подход создает постоянную нагрузку на БД и может пропускать быстрые изменения между интервалами опроса.">
            <FlowNode variant="app" tabIndex={0}>
              Application
            </FlowNode>
          </DiagramTooltip>

          <Arrow direction="down" label="SELECT каждые N минут" />

          {/* Database */}
          <DiagramTooltip content="База данных хранит данные и ведет журнал транзакций (WAL). Для CDC используется этот встроенный механизм — никакой дополнительной нагрузки.">
            <FlowNode variant="database" tabIndex={0}>
              Database
            </FlowNode>
          </DiagramTooltip>

          <Arrow direction="up" label="ResultSet" />

          {/* Back to APP */}
          <div className="text-xs text-gray-400 text-center">
            ↑ Обработка в приложении
          </div>
        </div>
      </DiagramContainer>

      {/* CDC Approach */}
      <DiagramContainer
        title="Log-based CDC"
        color="emerald"
        className="flex-1"
      >
        <div className="flex flex-col items-center gap-4">
          {/* APP */}
          <DiagramTooltip content="Приложение записывает данные в базу как обычно, не зная о CDC. Все изменения автоматически попадают в Kafka через Debezium без дополнительного кода.">
            <FlowNode variant="app" tabIndex={0}>
              Application
            </FlowNode>
          </DiagramTooltip>

          <Arrow direction="down" label="INSERT/UPDATE/DELETE" />

          {/* Database */}
          <DiagramTooltip content="База данных хранит данные и ведет журнал транзакций (WAL). Для CDC используется этот встроенный механизм — никакой дополнительной нагрузки.">
            <FlowNode variant="database" tabIndex={0}>
              PostgreSQL
            </FlowNode>
          </DiagramTooltip>

          <Arrow direction="down" label="Запись в WAL" />

          {/* WAL */}
          <DiagramTooltip content="Write-Ahead Log — журнал транзакций, который PostgreSQL использует для durability. Каждое зафиксированное изменение гарантированно записано в WAL.">
            <FlowNode variant="database" tabIndex={0} size="sm">
              WAL
            </FlowNode>
          </DiagramTooltip>

          <Arrow direction="down" label="Чтение через replication slot" />

          {/* Debezium */}
          <DiagramTooltip content="Debezium читает WAL через logical replication и преобразует записи в события Kafka. Работает как источник истины для потока изменений.">
            <FlowNode variant="connector" tabIndex={0}>
              Debezium
            </FlowNode>
          </DiagramTooltip>

          <Arrow direction="down" label="CDC Event" />

          {/* Kafka */}
          <DiagramTooltip content="Apache Kafka хранит поток CDC-событий и доставляет их потребителям. События сохраняются и могут быть перечитаны при необходимости.">
            <FlowNode variant="cluster" tabIndex={0}>
              Kafka
            </FlowNode>
          </DiagramTooltip>
        </div>
      </DiagramContainer>
    </div>
  );
}

/**
 * CdcSequenceDiagram - Sequence flow showing CDC event lifecycle
 */
export function CdcSequenceDiagram() {
  const actors: SequenceActorDef[] = [
    {
      id: 'app',
      label: 'App',
      variant: 'service',
      tooltip: 'Приложение выполняет операции с базой данных (INSERT, UPDATE, DELETE). Не знает о CDC — просто работает с PostgreSQL как обычно.',
    },
    {
      id: 'pg',
      label: 'PostgreSQL',
      variant: 'database',
      tooltip: 'СУБД принимает SQL-команды, выполняет их и записывает изменения в WAL. Подтверждает транзакцию после записи в журнал.',
    },
    {
      id: 'wal',
      label: 'WAL',
      variant: 'queue',
      tooltip: 'Transaction Log хранит последовательность всех изменений. Debezium читает этот журнал через механизм logical replication.',
    },
    {
      id: 'debezium',
      label: 'Debezium',
      variant: 'service',
      tooltip: 'CDC-коннектор читает WAL, преобразует изменения в структурированные события и отправляет в Kafka с гарантией доставки.',
    },
    {
      id: 'kafka',
      label: 'Kafka',
      variant: 'queue',
      tooltip: 'Брокер сообщений хранит события в топиках. Подтверждает запись (ACK) и доставляет события потребителям по запросу.',
    },
    {
      id: 'consumer',
      label: 'Consumer',
      variant: 'external',
      tooltip: 'Потребитель получает CDC-события через poll(). Может обрабатывать в реальном времени или батчами.',
    },
  ];

  const messages: SequenceMessageDef[] = [
    {
      id: 'msg1',
      from: 'app',
      to: 'pg',
      label: 'INSERT',
      variant: 'sync',
    },
    {
      id: 'msg2',
      from: 'pg',
      to: 'wal',
      label: 'Write to WAL',
      variant: 'sync',
    },
    {
      id: 'msg3',
      from: 'pg',
      to: 'app',
      label: 'OK',
      variant: 'return',
    },
    {
      id: 'msg4',
      from: 'debezium',
      to: 'wal',
      label: 'Read changes',
      variant: 'async',
    },
    {
      id: 'msg5',
      from: 'wal',
      to: 'debezium',
      label: 'Change event',
      variant: 'return',
    },
    {
      id: 'msg6',
      from: 'debezium',
      to: 'kafka',
      label: 'CDC Event',
      variant: 'async',
    },
    {
      id: 'msg7',
      from: 'kafka',
      to: 'debezium',
      label: 'ACK',
      variant: 'return',
    },
    {
      id: 'msg8',
      from: 'consumer',
      to: 'kafka',
      label: 'poll()',
      variant: 'async',
    },
    {
      id: 'msg9',
      from: 'kafka',
      to: 'consumer',
      label: 'CDC Event',
      variant: 'return',
    },
    {
      id: 'msg10',
      from: 'consumer',
      to: 'consumer',
      label: 'Process',
      variant: 'sync',
    },
  ];

  return (
    <div className="w-full">
      <SequenceDiagram
        actors={actors}
        messages={messages}
        messageSpacing={50}
      />
    </div>
  );
}
