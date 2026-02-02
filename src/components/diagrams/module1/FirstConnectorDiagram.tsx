/**
 * FirstConnectorDiagram - Connector data flow sequence diagram
 *
 * Exports:
 * - FirstConnectorDiagram: Sequence diagram showing PostgreSQL connector data flow
 */

import { SequenceDiagram } from '../primitives/SequenceDiagram';
import type { SequenceActorDef, SequenceMessageDef } from '../primitives/types';

/**
 * FirstConnectorDiagram - Sequence diagram showing connector data flow
 */
export function FirstConnectorDiagram() {
  const actors: SequenceActorDef[] = [
    {
      id: 'psql',
      label: 'psql',
      variant: 'service',
      tooltip: 'PostgreSQL CLI клиент для выполнения SQL команд. В лабораторных мы используем его через docker compose exec postgres psql.',
    },
    {
      id: 'postgresql',
      label: 'PostgreSQL',
      variant: 'database',
      tooltip: 'База данных с настроенной logical replication. Параметры: wal_level=logical, max_replication_slots>=10.',
    },
    {
      id: 'wal',
      label: 'WAL',
      variant: 'queue',
      tooltip: 'Write-Ahead Log хранит изменения до прочтения Debezium. Replication slot гарантирует что сегменты не будут удалены преждевременно.',
    },
    {
      id: 'debezium',
      label: 'Debezium',
      variant: 'service',
      tooltip: 'Коннектор читает WAL через pgoutput плагин и преобразует в CDC envelope-формат с полями before/after/op/source.',
    },
    {
      id: 'kafka',
      label: 'Kafka',
      variant: 'queue',
      tooltip: 'Топик inventory.public.customers хранит все CDC-события для таблицы customers.',
    },
  ];

  const messages: SequenceMessageDef[] = [
    {
      id: 'msg1',
      from: 'psql',
      to: 'postgresql',
      label: 'INSERT INTO customers',
      variant: 'sync',
    },
    {
      id: 'msg2',
      from: 'postgresql',
      to: 'wal',
      label: 'Write to transaction log',
      variant: 'sync',
    },
    {
      id: 'msg3',
      from: 'postgresql',
      to: 'psql',
      label: 'OK',
      variant: 'return',
    },
    {
      id: 'msg4',
      from: 'debezium',
      to: 'wal',
      label: 'Read via logical replication',
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
      label: 'Publish to inventory.public.customers',
      variant: 'async',
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
