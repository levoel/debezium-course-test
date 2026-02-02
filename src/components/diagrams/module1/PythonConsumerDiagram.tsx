/**
 * PythonConsumerDiagram - Python consumer data flow diagram
 *
 * Exports:
 * - PythonConsumerDiagram: Simple flowchart showing Python consumer data flow
 */

import { FlowNode } from '../primitives/FlowNode';
import { Arrow } from '../primitives/Arrow';
import { DiagramTooltip } from '../primitives/Tooltip';

/**
 * PythonConsumerDiagram - Simple flowchart showing Python consumer data flow
 */
export function PythonConsumerDiagram() {
  return (
    <div className="flex flex-col md:flex-row items-center justify-center gap-4 py-6 mb-8">
      {/* PostgreSQL */}
      <DiagramTooltip content="Источник данных. Изменения захватываются через logical replication без нагрузки на production запросы.">
        <FlowNode variant="database" tabIndex={0}>
          PostgreSQL
        </FlowNode>
      </DiagramTooltip>

      <Arrow direction="right" label="WAL" />

      {/* Debezium */}
      <DiagramTooltip content="Преобразует WAL-записи в структурированные JSON-события с envelope-форматом (before/after/op/source).">
        <FlowNode variant="connector" tabIndex={0}>
          Debezium
        </FlowNode>
      </DiagramTooltip>

      <Arrow direction="right" label="CDC Events" />

      {/* Kafka Topic */}
      <DiagramTooltip content="Топик inventory.public.customers хранит поток событий. Consumer может перечитать события при необходимости.">
        <FlowNode variant="cluster" tabIndex={0}>
          Kafka Topic
        </FlowNode>
      </DiagramTooltip>

      <Arrow direction="right" label="poll" />

      {/* Python Consumer */}
      <DiagramTooltip content="confluent-kafka библиотека на базе librdkafka. Подключается к kafka:9092 внутри Docker или localhost:9092 с хоста.">
        <FlowNode variant="app" tabIndex={0}>
          Python Consumer
        </FlowNode>
      </DiagramTooltip>
    </div>
  );
}
