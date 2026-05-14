/** @jsxImportSource solid-js */
/**
 * Lab Environment Diagram (Module 0)
 *
 * Docker Compose stack overview: 6 services in a 2×3 grid.
 * Replaces the ASCII box diagram in 04-lab-environment.mdx.
 */

import { FlowNode } from '@primitives/FlowNode';
import { DiagramContainer } from '@primitives/DiagramContainer';
import { DiagramTooltip } from '@primitives/Tooltip';

export function DockerComposeStackDiagram() {
  return (
    <DiagramContainer title="Docker Compose" color="blue">
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Row 1 */}
        <DiagramTooltip content="Основная база данных с wal_level=logical для CDC. Используется Debezium PostgreSQL коннектором.">
          <FlowNode variant="database" tabIndex={0}>
            <div class="flex flex-col items-center">
              <span class="font-medium">PostgreSQL</span>
              <span class="text-xs opacity-75">:5432</span>
            </div>
          </FlowNode>
        </DiagramTooltip>

        <DiagramTooltip content="Apache Kafka в KRaft режиме. Хранит CDC-события и internal топики Kafka Connect.">
          <FlowNode variant="cluster" tabIndex={0}>
            <div class="flex flex-col items-center">
              <span class="font-medium">Kafka</span>
              <span class="text-xs opacity-75">:9092</span>
            </div>
          </FlowNode>
        </DiagramTooltip>

        <DiagramTooltip content="Kafka Connect с установленным Debezium коннектором. REST API для управления.">
          <FlowNode variant="connector" tabIndex={0}>
            <div class="flex flex-col items-center">
              <span class="font-medium">Debezium</span>
              <span class="text-xs opacity-75">Connect :8083</span>
            </div>
          </FlowNode>
        </DiagramTooltip>

        {/* Row 2 */}
        <DiagramTooltip content="Вторая база данных для Module 3. binlog_format=ROW для MySQL CDC.">
          <FlowNode variant="database" tabIndex={0}>
            <div class="flex flex-col items-center">
              <span class="font-medium">MySQL</span>
              <span class="text-xs opacity-75">:3307</span>
            </div>
          </FlowNode>
        </DiagramTooltip>

        <DiagramTooltip content="Confluent Schema Registry. Хранит Avro/JSON схемы для эволюции структуры событий.">
          <FlowNode variant="sink" tabIndex={0}>
            <div class="flex flex-col items-center">
              <span class="font-medium">Schema Registry</span>
              <span class="text-xs opacity-75">:8081</span>
            </div>
          </FlowNode>
        </DiagramTooltip>

        <DiagramTooltip content="Prometheus собирает метрики, Grafana визуализирует дашборды мониторинга CDC pipeline.">
          <FlowNode variant="app" tabIndex={0}>
            <div class="flex flex-col items-center">
              <span class="font-medium">Prometheus</span>
              <span class="text-xs opacity-75">+ Grafana</span>
            </div>
          </FlowNode>
        </DiagramTooltip>
      </div>
    </DiagramContainer>
  );
}
