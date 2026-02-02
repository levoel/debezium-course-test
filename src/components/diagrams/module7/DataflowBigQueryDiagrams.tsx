/**
 * Dataflow and BigQuery Diagrams for Module 7 Lesson 04
 *
 * Exports:
 * - CdcToBigQueryDiagram: Multi-stage pipeline showing Cloud SQL → Dataflow → BigQuery
 * - DataflowEndToEndWorkflowDiagram: 5 nested stages showing full processing flow
 */

import { FlowNode } from '../primitives/FlowNode';
import { Arrow } from '../primitives/Arrow';
import { DiagramContainer } from '../primitives/DiagramContainer';
import { DiagramTooltip } from '../primitives/Tooltip';

/**
 * CdcToBigQueryDiagram - Horizontal multi-stage pipeline
 */
export function CdcToBigQueryDiagram() {
  return (
    <DiagramContainer
      title="Архитектура CDC → BigQuery"
      color="blue"
      description="Managed Dataflow template для репликации CDC событий"
    >
      <div className="flex flex-col gap-6">
        {/* Source Stage */}
        <div className="flex items-center gap-3 justify-center">
          <DiagramContainer title="Source" color="purple" className="flex-shrink-0">
            <DiagramTooltip content="Cloud SQL PostgreSQL с logical decoding настроенным">
              <FlowNode variant="gcp-database" size="sm" tabIndex={0}>
                Cloud SQL<br/>PostgreSQL
              </FlowNode>
            </DiagramTooltip>
          </DiagramContainer>

          <Arrow direction="right" label="WAL" />

          <DiagramContainer title="CDC Engine" color="emerald">
            <DiagramTooltip content="Debezium Server читает WAL и публикует в Pub/Sub">
              <FlowNode variant="connector" size="sm" tabIndex={0}>
                Debezium<br/>Server
              </FlowNode>
            </DiagramTooltip>
          </DiagramContainer>

          <Arrow direction="right" label="CDC Events" />

          <DiagramContainer title="Messaging" color="amber">
            <DiagramTooltip content="Pub/Sub Topics с ordering enabled для сохранения порядка событий">
              <FlowNode variant="gcp-messaging" size="sm" tabIndex={0}>
                Pub/Sub<br/>Topics
              </FlowNode>
            </DiagramTooltip>
          </DiagramContainer>
        </div>

        {/* Processing Stage */}
        <div className="flex items-center gap-3 justify-center">
          <DiagramContainer title="Stream Processing" color="emerald">
            <div className="flex flex-col gap-2">
              <DiagramTooltip content="Managed Dataflow template: Pub/Sub CDC to BigQuery">
                <FlowNode variant="gcp-compute" size="sm" tabIndex={0}>
                  Dataflow Job
                </FlowNode>
              </DiagramTooltip>
              <div className="text-xs text-emerald-200/70 text-center">
                MERGE каждые 60s
              </div>
            </div>
          </DiagramContainer>

          <div className="flex flex-col gap-2">
            <Arrow direction="right" label="Raw Events" />
            <Arrow direction="right" label="MERGE" dashed />
          </div>

          <DiagramContainer title="Storage" color="blue">
            <div className="flex flex-col gap-2">
              <DiagramTooltip content={
                <div>
                  <p className="font-semibold mb-1">Changelog Table</p>
                  <p className="text-sm">Staging: полная история всех CDC операций</p>
                  <p className="text-sm mt-1">Партиционирована по _metadata_timestamp</p>
                </div>
              }>
                <FlowNode variant="gcp-storage" size="sm" tabIndex={0}>
                  BigQuery<br/>Changelog
                </FlowNode>
              </DiagramTooltip>
              <DiagramTooltip content={
                <div>
                  <p className="font-semibold mb-1">Replica Table</p>
                  <p className="text-sm">Current state: результат MERGE операций</p>
                  <p className="text-sm mt-1">Отражает актуальное состояние источника</p>
                </div>
              }>
                <FlowNode variant="gcp-storage" size="sm" tabIndex={0}>
                  BigQuery<br/>Replica
                </FlowNode>
              </DiagramTooltip>
            </div>
          </DiagramContainer>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-white/10 text-xs text-blue-200/70">
        <p>updateFrequencySecs=60 определяет частоту MERGE (каждую минуту)</p>
        <p className="mt-1">At-least-once достаточно для CDC: MERGE по PK идемпотентен</p>
      </div>
    </DiagramContainer>
  );
}

/**
 * DataflowEndToEndWorkflowDiagram - Complex nested workflow with 5 stages
 */
export function DataflowEndToEndWorkflowDiagram() {
  return (
    <DiagramContainer
      title="End-to-End Workflow: Cloud SQL → BigQuery"
      color="purple"
      description="Полный цикл CDC репликации с использованием Dataflow template"
    >
      <div className="space-y-4">
        {/* Stage 1: Database Change */}
        <DiagramContainer title="1. Database Change Event" color="blue">
          <div className="flex items-center gap-2">
            <FlowNode variant="gcp-database" size="sm">Cloud SQL</FlowNode>
            <Arrow direction="right" label="INSERT/UPDATE/DELETE" />
            <DiagramTooltip content="PostgreSQL пишет транзакцию в WAL">
              <FlowNode variant="database" size="sm" tabIndex={0}>WAL</FlowNode>
            </DiagramTooltip>
          </div>
        </DiagramContainer>

        <Arrow direction="down" />

        {/* Stage 2: CDC Capture */}
        <DiagramContainer title="2. CDC Event Capture" color="emerald">
          <div className="flex items-center gap-2">
            <DiagramTooltip content="Debezium читает через replication slot">
              <FlowNode variant="connector" size="sm" tabIndex={0}>Debezium Server</FlowNode>
            </DiagramTooltip>
            <Arrow direction="right" label="Parse & Transform" />
            <DiagramTooltip content="JSON envelope: before, after, source, op, ts_ms">
              <FlowNode variant="app" size="sm" tabIndex={0}>CDC Event</FlowNode>
            </DiagramTooltip>
          </div>
        </DiagramContainer>

        <Arrow direction="down" />

        {/* Stage 3: Message Delivery */}
        <DiagramContainer title="3. Message Delivery" color="amber">
          <div className="flex items-center gap-2">
            <DiagramTooltip content="Pub/Sub topic: cdc.public.orders">
              <FlowNode variant="gcp-messaging" size="sm" tabIndex={0}>Pub/Sub Topic</FlowNode>
            </DiagramTooltip>
            <Arrow direction="right" label="Ordering Key = PK" />
            <DiagramTooltip content="Subscription читает Dataflow worker">
              <FlowNode variant="gcp-messaging" size="sm" tabIndex={0}>Subscription</FlowNode>
            </DiagramTooltip>
          </div>
        </DiagramContainer>

        <Arrow direction="down" />

        {/* Stage 4: Stream Processing */}
        <DiagramContainer title="4. Dataflow Processing" color="emerald">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <DiagramTooltip content="Windowed aggregation: micro-batch каждые 60 секунд">
                <FlowNode variant="gcp-compute" size="sm" tabIndex={0}>Window (60s)</FlowNode>
              </DiagramTooltip>
              <Arrow direction="right" />
              <DiagramTooltip content="Группировка по primary key для дедупликации">
                <FlowNode variant="gcp-compute" size="sm" tabIndex={0}>Group by PK</FlowNode>
              </DiagramTooltip>
              <Arrow direction="right" />
              <DiagramTooltip content="Последнее событие по ts_ms wins">
                <FlowNode variant="gcp-compute" size="sm" tabIndex={0}>Dedup</FlowNode>
              </DiagramTooltip>
            </div>
          </div>
        </DiagramContainer>

        <Arrow direction="down" />

        {/* Stage 5: Storage */}
        <DiagramContainer title="5. BigQuery Storage" color="blue">
          <div className="flex items-center gap-3">
            <div className="flex flex-col gap-2">
              <DiagramTooltip content="Все события записываются для аудита">
                <FlowNode variant="gcp-storage" size="sm" tabIndex={0}>Changelog Table</FlowNode>
              </DiagramTooltip>
              <div className="text-xs text-blue-200/70">Append-only</div>
            </div>
            <Arrow direction="right" label="MERGE" />
            <div className="flex flex-col gap-2">
              <DiagramTooltip content="MERGE ON primary_key WHEN MATCHED THEN UPDATE/DELETE">
                <FlowNode variant="gcp-storage" size="sm" tabIndex={0}>Replica Table</FlowNode>
              </DiagramTooltip>
              <div className="text-xs text-blue-200/70">Current state</div>
            </div>
          </div>
        </DiagramContainer>
      </div>

      <div className="mt-4 pt-3 border-t border-white/10 text-xs text-purple-200/70">
        <p className="font-semibold mb-1">Key Points:</p>
        <ul className="space-y-1">
          <li>• Latency: ~60-90 секунд от INSERT в Cloud SQL до Replica в BigQuery</li>
          <li>• Throughput: до 10,000 events/sec на 1 Dataflow worker</li>
          <li>• Auto-scaling: workers увеличиваются при росте Pub/Sub backlog</li>
          <li>• Idempotency: повторная обработка событий безопасна (MERGE по PK)</li>
        </ul>
      </div>
    </DiagramContainer>
  );
}
