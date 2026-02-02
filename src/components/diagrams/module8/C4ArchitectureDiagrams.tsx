/**
 * C4 Architecture Diagrams for Module 8 Lesson 02
 *
 * Exports:
 * - SystemContextDiagram: C4 Level 1 - external actors and system boundaries
 * - ContainerDiagram: C4 Level 2 - internal components with technology details
 */

import { FlowNode } from '../primitives/FlowNode';
import { Arrow } from '../primitives/Arrow';
import { DiagramContainer } from '../primitives/DiagramContainer';
import { DiagramTooltip } from '../primitives/Tooltip';

/**
 * SystemContextDiagram - C4 Model Level 1
 * Shows: Data Analyst (Person) -> CDC Pipeline (System) <- E-commerce App (System_Ext) / BigQuery (System_Ext)
 */
export function SystemContextDiagram() {
  return (
    <DiagramContainer
      title="System Context: E-commerce CDC Pipeline"
      color="neutral"
      description="C4 Model Level 1: Внешние актеры и границы системы"
    >
      <div className="flex flex-col items-center gap-6">
        {/* External actor - Person */}
        <DiagramTooltip content={
          <div>
            <p className="font-semibold mb-1">Data Analyst</p>
            <p className="text-sm">Внешний актер, использующий систему</p>
            <p className="text-sm mt-1">Запускает SQL queries для real-time analytics</p>
            <p className="text-sm mt-1">Ожидает данные с latency &lt; 5 секунд</p>
          </div>
        }>
          <FlowNode variant="app" className="rounded-full px-6">
            Data Analyst
          </FlowNode>
        </DiagramTooltip>

        <Arrow direction="down" label="Queries real-time data" />

        {/* Main System - CDC Pipeline */}
        <div className="border-2 border-blue-400/30 rounded-lg p-6 bg-blue-500/10 w-full max-w-md">
          <DiagramTooltip content={
            <div>
              <p className="font-semibold mb-1">CDC Pipeline</p>
              <p className="text-sm">Центральная система: захватывает и стримит изменения</p>
              <p className="text-sm mt-1">Aurora {'→'} Debezium {'→'} PyFlink {'→'} BigQuery</p>
              <p className="text-sm mt-1">Owned by: Data Engineering team</p>
            </div>
          }>
            <FlowNode variant="connector" className="text-lg font-bold w-full">
              CDC Pipeline
              <div className="text-xs font-normal text-gray-400 mt-1">
                Captures and streams changes from Aurora to BigQuery
              </div>
            </FlowNode>
          </DiagramTooltip>
        </div>

        {/* External systems */}
        <div className="flex flex-col md:flex-row gap-8 w-full justify-center">
          <div className="flex flex-col items-center gap-2">
            <Arrow direction="down" label="Writes to outbox" />
            <DiagramTooltip content={
              <div>
                <p className="font-semibold mb-1">E-commerce Application</p>
                <p className="text-sm">Внешняя система вне нашего контроля</p>
                <p className="text-sm mt-1">Записывает заказы в Aurora с Outbox Pattern</p>
                <p className="text-sm mt-1">Owned by: Product team</p>
              </div>
            }>
              <FlowNode variant="sink" className="border-dashed">
                E-commerce Application
                <div className="text-xs text-gray-400 mt-1">[System_Ext]</div>
              </FlowNode>
            </DiagramTooltip>
          </div>

          <div className="flex flex-col items-center gap-2">
            <Arrow direction="down" label="Streams CDC events" />
            <DiagramTooltip content={
              <div>
                <p className="font-semibold mb-1">BigQuery</p>
                <p className="text-sm">Внешняя система: Google Cloud data warehouse</p>
                <p className="text-sm mt-1">Хранит CDC события для analytics</p>
                <p className="text-sm mt-1">Managed service (Google Cloud)</p>
              </div>
            }>
              <FlowNode variant="sink" className="border-dashed">
                BigQuery
                <div className="text-xs text-gray-400 mt-1">[System_Ext]</div>
              </FlowNode>
            </DiagramTooltip>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-white/10 text-xs text-gray-400">
        <p className="font-semibold mb-1">C4 System Context показывает:</p>
        <ul className="space-y-1">
          <li><span className="text-blue-300">Person</span> (rounded node) - внешний актер, взаимодействующий с системой</li>
          <li><span className="text-blue-300">System</span> (solid border) - наша система, которую документируем</li>
          <li><span className="text-blue-300">System_Ext</span> (dashed border) - внешние системы вне нашего контроля</li>
        </ul>
      </div>
    </DiagramContainer>
  );
}

/**
 * ContainerDiagram - C4 Model Level 2
 * Shows: Nested DiagramContainers for Source / CDC Layer / Processing / Warehouse / Monitoring boundaries
 */
export function ContainerDiagram() {
  return (
    <DiagramContainer
      title="Container Diagram: CDC Pipeline Components"
      color="neutral"
      description="C4 Model Level 2: Компоненты и технологии внутри CDC Pipeline"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Source boundary */}
        <DiagramContainer color="purple" title="Source" className="h-fit">
          <div className="flex flex-col gap-2">
            <DiagramTooltip content={
              <div>
                <p className="font-semibold mb-1">Aurora PostgreSQL</p>
                <p className="text-sm">Transactional database с logical replication</p>
                <p className="text-sm mt-1">wal_level=logical, max_replication_slots=10</p>
                <p className="text-sm mt-1">Instance type: db.r5.large</p>
              </div>
            }>
              <FlowNode variant="database">
                Aurora PostgreSQL
                <div className="text-xs text-gray-400 mt-1">Database</div>
              </FlowNode>
            </DiagramTooltip>
            <DiagramTooltip content={
              <div>
                <p className="font-semibold mb-1">Outbox Table</p>
                <p className="text-sm">Transactional event publishing</p>
                <p className="text-sm mt-1">REPLICA IDENTITY FULL для CDC</p>
                <p className="text-sm mt-1">Поля: id, aggregatetype, payload (JSONB)</p>
              </div>
            }>
              <FlowNode variant="connector">
                Outbox Table
                <div className="text-xs text-gray-400 mt-1">PostgreSQL Table</div>
              </FlowNode>
            </DiagramTooltip>
          </div>
        </DiagramContainer>

        {/* CDC Layer boundary */}
        <DiagramContainer color="emerald" title="CDC Layer" className="h-fit">
          <div className="flex flex-col gap-2">
            <DiagramTooltip content={
              <div>
                <p className="font-semibold mb-1">Debezium Connector</p>
                <p className="text-sm">Captures WAL changes с Outbox Event Router SMT</p>
                <p className="text-sm mt-1">plugin.name=pgoutput, snapshot.mode=initial</p>
                <p className="text-sm mt-1">Runs on Kafka Connect cluster (3 workers)</p>
              </div>
            }>
              <FlowNode variant="connector">
                Debezium Connector
                <div className="text-xs text-gray-400 mt-1">Kafka Connect</div>
              </FlowNode>
            </DiagramTooltip>
            <DiagramTooltip content={
              <div>
                <p className="font-semibold mb-1">Kafka</p>
                <p className="text-sm">Durable event log</p>
                <p className="text-sm mt-1">Replication factor: 3, min.insync.replicas: 2</p>
                <p className="text-sm mt-1">Topics: outbox.event.* (routed by aggregatetype)</p>
              </div>
            }>
              <FlowNode variant="cluster">
                Kafka
                <div className="text-xs text-gray-400 mt-1">Event Streaming</div>
              </FlowNode>
            </DiagramTooltip>
          </div>
        </DiagramContainer>

        {/* Stream Processing boundary */}
        <DiagramContainer color="purple" title="Stream Processing" className="h-fit">
          <DiagramTooltip content={
            <div>
              <p className="font-semibold mb-1">PyFlink Job</p>
              <p className="text-sm">Transforms and enriches CDC events</p>
              <p className="text-sm mt-1">format='debezium-json', checkpoint interval=60s</p>
              <p className="text-sm mt-1">Parallelism: 4, taskmanager memory: 2GB</p>
            </div>
          }>
            <FlowNode variant="connector">
              PyFlink Job
              <div className="text-xs text-gray-400 mt-1">Python/Flink</div>
            </FlowNode>
          </DiagramTooltip>
        </DiagramContainer>

        {/* Warehouse boundary */}
        <DiagramContainer color="amber" title="Analytics Warehouse" className="h-fit">
          <DiagramTooltip content={
            <div>
              <p className="font-semibold mb-1">BigQuery</p>
              <p className="text-sm">CDC-enabled tables с primary keys</p>
              <p className="text-sm mt-1">PRIMARY KEY (NOT ENFORCED), partitioned by date</p>
              <p className="text-sm mt-1">Storage Write API для streaming ingestion</p>
            </div>
          }>
            <FlowNode variant="sink">
              BigQuery
              <div className="text-xs text-gray-400 mt-1">Data Warehouse</div>
            </FlowNode>
          </DiagramTooltip>
        </DiagramContainer>

        {/* Monitoring boundary */}
        <DiagramContainer color="blue" title="Observability" className="h-fit">
          <div className="flex flex-col gap-2">
            <DiagramTooltip content={
              <div>
                <p className="font-semibold mb-1">Prometheus</p>
                <p className="text-sm">Scrapes JMX metrics</p>
                <p className="text-sm mt-1">Scrape interval: 15s, retention: 15 days</p>
                <p className="text-sm mt-1">Key metrics: MilliSecondsBehindSource, QueueRemainingCapacity</p>
              </div>
            }>
              <FlowNode variant="sink">
                Prometheus
                <div className="text-xs text-gray-400 mt-1">Metrics DB</div>
              </FlowNode>
            </DiagramTooltip>
            <DiagramTooltip content={
              <div>
                <p className="font-semibold mb-1">Grafana</p>
                <p className="text-sm">Visualizes metrics</p>
                <p className="text-sm mt-1">Dashboards: Four Golden Signals for CDC</p>
                <p className="text-sm mt-1">Alerts: PagerDuty for critical, Slack for warning</p>
              </div>
            }>
              <FlowNode variant="connector">
                Grafana
                <div className="text-xs text-gray-400 mt-1">Dashboards</div>
              </FlowNode>
            </DiagramTooltip>
          </div>
        </DiagramContainer>
      </div>

      <div className="mt-4 pt-3 border-t border-white/10 text-xs text-gray-400">
        <p className="font-semibold mb-1">C4 Container Diagram показывает:</p>
        <ul className="space-y-1">
          <li><span className="text-blue-300">Container_Boundary</span> - границы подсистем (DiagramContainer)</li>
          <li><span className="text-blue-300">ContainerDb</span> - database компоненты (variant="database")</li>
          <li><span className="text-blue-300">Container</span> - application компоненты (variant="connector")</li>
          <li><span className="text-blue-300">ContainerQueue</span> - messaging компоненты (variant="cluster")</li>
          <li>Технология указана под каждым компонентом</li>
        </ul>
      </div>
    </DiagramContainer>
  );
}
