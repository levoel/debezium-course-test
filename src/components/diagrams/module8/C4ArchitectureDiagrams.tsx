/** @jsxImportSource solid-js */
/**
 * C4 Architecture Diagrams for Module 8 Lesson 02
 *
 * Exports:
 * - SystemContextDiagram: C4 Level 1 - external actors and system boundaries
 * - ContainerDiagram: C4 Level 2 - internal components with technology details
 * - CapstoneProjectStructureDiagram: Recommended capstone directory layout
 */

import { FlowNode } from '@primitives/FlowNode';
import { Arrow } from '@primitives/Arrow';
import { DiagramContainer } from '@primitives/DiagramContainer';
import { DiagramTooltip } from '@primitives/Tooltip';

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
      <div class="flex flex-col items-center gap-6">
        {/* External actor - Person */}
        <DiagramTooltip content={
          <div>
            <p class="font-semibold mb-1">Data Analyst</p>
            <p class="text-sm">Внешний актер, использующий систему</p>
            <p class="text-sm mt-1">Запускает SQL queries для real-time analytics</p>
            <p class="text-sm mt-1">Ожидает данные с latency &lt; 5 секунд</p>
          </div>
        }>
          <FlowNode variant="app" className="rounded-full px-6">
            Data Analyst
          </FlowNode>
        </DiagramTooltip>

        <Arrow direction="down" label="Queries real-time data" />

        {/* Main System - CDC Pipeline */}
        <div class="border-2 border-blue-400/30 rounded-lg p-6 bg-blue-500/10 w-full max-w-md">
          <DiagramTooltip content={
            <div>
              <p class="font-semibold mb-1">CDC Pipeline</p>
              <p class="text-sm">Центральная система: захватывает и стримит изменения</p>
              <p class="text-sm mt-1">Aurora {'→'} Debezium {'→'} PyFlink {'→'} BigQuery</p>
              <p class="text-sm mt-1">Owned by: Data Engineering team</p>
            </div>
          }>
            <FlowNode variant="connector" className="text-lg font-bold w-full">
              CDC Pipeline
              <div class="text-xs font-normal text-[var(--ink-muted)] mt-1">
                Captures and streams changes from Aurora to BigQuery
              </div>
            </FlowNode>
          </DiagramTooltip>
        </div>

        {/* External systems */}
        <div class="flex flex-col md:flex-row gap-8 w-full justify-center">
          <div class="flex flex-col items-center gap-2">
            <Arrow direction="down" label="Writes to outbox" />
            <DiagramTooltip content={
              <div>
                <p class="font-semibold mb-1">E-commerce Application</p>
                <p class="text-sm">Внешняя система вне нашего контроля</p>
                <p class="text-sm mt-1">Записывает заказы в Aurora с Outbox Pattern</p>
                <p class="text-sm mt-1">Owned by: Product team</p>
              </div>
            }>
              <FlowNode variant="sink" className="border-dashed">
                E-commerce Application
                <div class="text-xs text-[var(--ink-muted)] mt-1">[System_Ext]</div>
              </FlowNode>
            </DiagramTooltip>
          </div>

          <div class="flex flex-col items-center gap-2">
            <Arrow direction="down" label="Streams CDC events" />
            <DiagramTooltip content={
              <div>
                <p class="font-semibold mb-1">BigQuery</p>
                <p class="text-sm">Внешняя система: Google Cloud data warehouse</p>
                <p class="text-sm mt-1">Хранит CDC события для analytics</p>
                <p class="text-sm mt-1">Managed service (Google Cloud)</p>
              </div>
            }>
              <FlowNode variant="sink" className="border-dashed">
                BigQuery
                <div class="text-xs text-[var(--ink-muted)] mt-1">[System_Ext]</div>
              </FlowNode>
            </DiagramTooltip>
          </div>
        </div>
      </div>

      <div class="mt-4 pt-3 border-t border-[var(--line-thin)] text-xs text-[var(--ink-muted)]">
        <p class="font-semibold mb-1">C4 System Context показывает:</p>
        <ul class="space-y-1">
          <li><span class="text-blue-700">Person</span> (rounded node) - внешний актер, взаимодействующий с системой</li>
          <li><span class="text-blue-700">System</span> (solid border) - наша система, которую документируем</li>
          <li><span class="text-blue-700">System_Ext</span> (dashed border) - внешние системы вне нашего контроля</li>
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
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Source boundary */}
        <DiagramContainer color="purple" title="Source" className="h-fit">
          <div class="flex flex-col gap-2">
            <DiagramTooltip content={
              <div>
                <p class="font-semibold mb-1">Aurora PostgreSQL</p>
                <p class="text-sm">Transactional database с logical replication</p>
                <p class="text-sm mt-1">wal_level=logical, max_replication_slots=10</p>
                <p class="text-sm mt-1">Instance type: db.r5.large</p>
              </div>
            }>
              <FlowNode variant="database">
                Aurora PostgreSQL
                <div class="text-xs text-[var(--ink-muted)] mt-1">Database</div>
              </FlowNode>
            </DiagramTooltip>
            <DiagramTooltip content={
              <div>
                <p class="font-semibold mb-1">Outbox Table</p>
                <p class="text-sm">Transactional event publishing</p>
                <p class="text-sm mt-1">REPLICA IDENTITY FULL для CDC</p>
                <p class="text-sm mt-1">Поля: id, aggregatetype, payload (JSONB)</p>
              </div>
            }>
              <FlowNode variant="connector">
                Outbox Table
                <div class="text-xs text-[var(--ink-muted)] mt-1">PostgreSQL Table</div>
              </FlowNode>
            </DiagramTooltip>
          </div>
        </DiagramContainer>

        {/* CDC Layer boundary */}
        <DiagramContainer color="emerald" title="CDC Layer" className="h-fit">
          <div class="flex flex-col gap-2">
            <DiagramTooltip content={
              <div>
                <p class="font-semibold mb-1">Debezium Connector</p>
                <p class="text-sm">Captures WAL changes с Outbox Event Router SMT</p>
                <p class="text-sm mt-1">plugin.name=pgoutput, snapshot.mode=initial</p>
                <p class="text-sm mt-1">Runs on Kafka Connect cluster (3 workers)</p>
              </div>
            }>
              <FlowNode variant="connector">
                Debezium Connector
                <div class="text-xs text-[var(--ink-muted)] mt-1">Kafka Connect</div>
              </FlowNode>
            </DiagramTooltip>
            <DiagramTooltip content={
              <div>
                <p class="font-semibold mb-1">Kafka</p>
                <p class="text-sm">Durable event log</p>
                <p class="text-sm mt-1">Replication factor: 3, min.insync.replicas: 2</p>
                <p class="text-sm mt-1">Topics: outbox.event.* (routed by aggregatetype)</p>
              </div>
            }>
              <FlowNode variant="cluster">
                Kafka
                <div class="text-xs text-[var(--ink-muted)] mt-1">Event Streaming</div>
              </FlowNode>
            </DiagramTooltip>
          </div>
        </DiagramContainer>

        {/* Stream Processing boundary */}
        <DiagramContainer color="purple" title="Stream Processing" className="h-fit">
          <DiagramTooltip content={
            <div>
              <p class="font-semibold mb-1">PyFlink Job</p>
              <p class="text-sm">Transforms and enriches CDC events</p>
              <p class="text-sm mt-1">format='debezium-json', checkpoint interval=60s</p>
              <p class="text-sm mt-1">Parallelism: 4, taskmanager memory: 2GB</p>
            </div>
          }>
            <FlowNode variant="connector">
              PyFlink Job
              <div class="text-xs text-[var(--ink-muted)] mt-1">Python/Flink</div>
            </FlowNode>
          </DiagramTooltip>
        </DiagramContainer>

        {/* Warehouse boundary */}
        <DiagramContainer color="amber" title="Analytics Warehouse" className="h-fit">
          <DiagramTooltip content={
            <div>
              <p class="font-semibold mb-1">BigQuery</p>
              <p class="text-sm">CDC-enabled tables с primary keys</p>
              <p class="text-sm mt-1">PRIMARY KEY (NOT ENFORCED), partitioned by date</p>
              <p class="text-sm mt-1">Storage Write API для streaming ingestion</p>
            </div>
          }>
            <FlowNode variant="sink">
              BigQuery
              <div class="text-xs text-[var(--ink-muted)] mt-1">Data Warehouse</div>
            </FlowNode>
          </DiagramTooltip>
        </DiagramContainer>

        {/* Monitoring boundary */}
        <DiagramContainer color="blue" title="Observability" className="h-fit">
          <div class="flex flex-col gap-2">
            <DiagramTooltip content={
              <div>
                <p class="font-semibold mb-1">Prometheus</p>
                <p class="text-sm">Scrapes JMX metrics</p>
                <p class="text-sm mt-1">Scrape interval: 15s, retention: 15 days</p>
                <p class="text-sm mt-1">Key metrics: MilliSecondsBehindSource, QueueRemainingCapacity</p>
              </div>
            }>
              <FlowNode variant="sink">
                Prometheus
                <div class="text-xs text-[var(--ink-muted)] mt-1">Metrics DB</div>
              </FlowNode>
            </DiagramTooltip>
            <DiagramTooltip content={
              <div>
                <p class="font-semibold mb-1">Grafana</p>
                <p class="text-sm">Visualizes metrics</p>
                <p class="text-sm mt-1">Dashboards: Four Golden Signals for CDC</p>
                <p class="text-sm mt-1">Alerts: PagerDuty for critical, Slack for warning</p>
              </div>
            }>
              <FlowNode variant="connector">
                Grafana
                <div class="text-xs text-[var(--ink-muted)] mt-1">Dashboards</div>
              </FlowNode>
            </DiagramTooltip>
          </div>
        </DiagramContainer>
      </div>

      <div class="mt-4 pt-3 border-t border-[var(--line-thin)] text-xs text-[var(--ink-muted)]">
        <p class="font-semibold mb-1">C4 Container Diagram показывает:</p>
        <ul class="space-y-1">
          <li><span class="text-blue-700">Container_Boundary</span> - границы подсистем (DiagramContainer)</li>
          <li><span class="text-blue-700">ContainerDb</span> - database компоненты (variant="database")</li>
          <li><span class="text-blue-700">Container</span> - application компоненты (variant="connector")</li>
          <li><span class="text-blue-700">ContainerQueue</span> - messaging компоненты (variant="cluster")</li>
          <li>Технология указана под каждым компонентом</li>
        </ul>
      </div>
    </DiagramContainer>
  );
}

/**
 * CapstoneProjectStructureDiagram — recommended capstone project directory.
 * Replaces ASCII tree in 02-architecture-deliverables.mdx.
 */
export function CapstoneProjectStructureDiagram() {
  type TreeNode = { name: string; comment?: string; children?: TreeNode[] };

  const tree: TreeNode[] = [
    { name: 'infrastructure/', comment: 'Docker Compose, Kubernetes manifests', children: [
      { name: 'docker-compose.yml', comment: 'Local dev environment' },
      { name: 'debezium/', comment: 'Connector configs', children: [
        { name: 'connector.json', comment: 'Debezium connector configuration' },
      ]},
      { name: 'monitoring/', comment: 'Prometheus, Grafana configs', children: [
        { name: 'prometheus.yml', comment: 'Prometheus scrape configs' },
        { name: 'grafana/', comment: 'Grafana dashboards (JSON exports)' },
      ]},
    ]},
    { name: 'database/', comment: 'Aurora/PostgreSQL schema and migrations', children: [
      { name: 'schema.sql', comment: 'Tables including outbox' },
      { name: 'migrations/', comment: 'Schema evolution scripts' },
      { name: 'seed-data/', comment: 'Test data generation scripts', children: [
        { name: 'generate_orders.sql' },
      ]},
    ]},
    { name: 'pyflink-jobs/', comment: 'Stream processing applications', children: [
      { name: 'cdc_processor.py', comment: 'Main PyFlink Table API job' },
      { name: 'requirements.txt', comment: 'Python dependencies' },
      { name: 'tests/', comment: 'Unit and integration tests', children: [
        { name: 'test_transformations.py' },
      ]},
    ]},
    { name: 'bigquery/', comment: 'Warehouse schema and config', children: [
      { name: 'schema.sql', comment: 'Table definitions with primary keys' },
      { name: 'ddl/', comment: 'BigQuery-specific DDL scripts' },
    ]},
    { name: 'monitoring/', comment: 'Dashboards and alerts', children: [
      { name: 'dashboards/', comment: 'Grafana JSON exports', children: [
        { name: 'debezium-overview.json' },
      ]},
      { name: 'alerts/', comment: 'Alert rules (Prometheus)', children: [
        { name: 'debezium-alerts.yml' },
      ]},
    ]},
    { name: 'docs/', comment: 'Project documentation', children: [
      { name: 'architecture.md', comment: 'C4 diagrams, system context' },
      { name: 'runbook.md', comment: 'Operational procedures' },
      { name: 'testing-strategy.md', comment: 'Validation approach' },
    ]},
    { name: 'README.md', comment: 'Project overview and setup instructions' },
  ];

  function renderNode(node: TreeNode, depth: number) {
    const isDir = !!node.children;
    return (
      <div>
        <div class="flex items-center gap-2" style={{ 'padding-left': `${depth * 16}px` }}>
          <span class="text-[var(--ink-subtle)] select-none text-xs">{isDir ? '📁' : '📄'}</span>
          <span class={`text-xs ${isDir ? 'text-[var(--ink-default)] font-medium' : 'text-[var(--ink-muted)] font-mono'}`}>{node.name}</span>
          {node.comment && <span class="text-[10px] text-[var(--ink-subtle)] ml-1">{'// ' + node.comment}</span>}
        </div>
        {node.children?.map((c) => renderNode(c, depth + 1))}
      </div>
    );
  }

  return (
    <DiagramContainer title="capstone-project/" color="emerald">
      <div class="space-y-0.5">
        {tree.map((node) => renderNode(node, 0))}
      </div>
    </DiagramContainer>
  );
}
