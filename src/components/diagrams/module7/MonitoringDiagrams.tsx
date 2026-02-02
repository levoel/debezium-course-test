/**
 * Monitoring Diagrams for Module 7 Lesson 06
 *
 * Exports:
 * - MonitoringComponentsDiagram: End-to-end observability for CDC pipeline
 * - MonitoringPointsHierarchyDiagram: Key metrics per service (3-column grid)
 * - AlertFlowDiagram: Alert hierarchy with severity levels (Critical/Warning/Info)
 */

import { FlowNode } from '../primitives/FlowNode';
import { Arrow } from '../primitives/Arrow';
import { DiagramContainer } from '../primitives/DiagramContainer';
import { DiagramTooltip } from '../primitives/Tooltip';

/**
 * MonitoringComponentsDiagram - Shows all CDC pipeline components with monitoring points
 */
export function MonitoringComponentsDiagram() {
  return (
    <DiagramContainer
      title="Компоненты для мониторинга"
      color="rose"
      description="End-to-end observability для CDC pipeline"
    >
      <div className="space-y-4">
        {/* Pipeline flow */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          <DiagramTooltip content="Cloud SQL CPU, Disk, Replication lag">
            <FlowNode variant="gcp-database" size="sm" tabIndex={0}>Cloud SQL</FlowNode>
          </DiagramTooltip>
          <Arrow direction="right" label="WAL" />
          <DiagramTooltip content="Debezium system lag, queue capacity">
            <FlowNode variant="connector" size="sm" tabIndex={0}>Debezium</FlowNode>
          </DiagramTooltip>
          <Arrow direction="right" />
          <DiagramTooltip content="Pub/Sub oldest unacked message age, backlog">
            <FlowNode variant="gcp-messaging" size="sm" tabIndex={0}>Pub/Sub</FlowNode>
          </DiagramTooltip>
          <Arrow direction="right" />
          <DiagramTooltip content="Dataflow worker utilization, element count">
            <FlowNode variant="gcp-compute" size="sm" tabIndex={0}>Dataflow</FlowNode>
          </DiagramTooltip>
          <Arrow direction="right" />
          <DiagramTooltip content="BigQuery streaming inserts, DML queries">
            <FlowNode variant="gcp-storage" size="sm" tabIndex={0}>BigQuery</FlowNode>
          </DiagramTooltip>
        </div>

        {/* Monitoring layer */}
        <div className="flex items-center justify-center gap-2 pt-3 border-t border-white/10">
          <FlowNode variant="gcp-monitoring" size="sm" tabIndex={0}>Cloud Monitoring</FlowNode>
          <Arrow direction="right" />
          <FlowNode variant="app" size="sm" tabIndex={0}>Unified Dashboard</FlowNode>
          <Arrow direction="right" />
          <FlowNode variant="gcp-monitoring" size="sm" tabIndex={0}>Alert Policies</FlowNode>
        </div>
      </div>
    </DiagramContainer>
  );
}

/**
 * MonitoringPointsHierarchyDiagram - Shows key metrics per service in 3-column grid
 */
export function MonitoringPointsHierarchyDiagram() {
  return (
    <DiagramContainer
      title="Monitoring Points по компонентам"
      color="amber"
      description="Ключевые метрики для каждого сервиса CDC pipeline"
    >
      <div className="grid md:grid-cols-3 gap-4">
        {/* Cloud SQL Metrics */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-purple-200">Cloud SQL</h3>
          <DiagramTooltip content="CPU utilization > 80% → scale up instance tier">
            <FlowNode variant="gcp-monitoring" size="sm" tabIndex={0}>
              CPU/Memory
            </FlowNode>
          </DiagramTooltip>
          <DiagramTooltip content="WAL bloat из-за неактивного replication slot">
            <FlowNode variant="gcp-monitoring" size="sm" tabIndex={0}>
              Disk Utilization
            </FlowNode>
          </DiagramTooltip>
          <DiagramTooltip content="pg_wal_lsn_diff показывает отставание слота">
            <FlowNode variant="gcp-monitoring" size="sm" tabIndex={0}>
              Replication Lag
            </FlowNode>
          </DiagramTooltip>
        </div>

        {/* Debezium Metrics */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-emerald-200">Debezium Server</h3>
          <DiagramTooltip content="MilliSecondsBehindSource > 60000 → alert">
            <FlowNode variant="gcp-monitoring" size="sm" tabIndex={0}>
              System Lag
            </FlowNode>
          </DiagramTooltip>
          <DiagramTooltip content="Throughput в событиях в секунду">
            <FlowNode variant="gcp-monitoring" size="sm" tabIndex={0}>
              Events/sec
            </FlowNode>
          </DiagramTooltip>
          <DiagramTooltip content="QueueRemainingCapacity < 20% → backpressure">
            <FlowNode variant="gcp-monitoring" size="sm" tabIndex={0}>
              Queue Capacity
            </FlowNode>
          </DiagramTooltip>
        </div>

        {/* Pub/Sub Metrics */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-amber-200">Pub/Sub</h3>
          <DiagramTooltip content="oldest_unacked_message_age > 300s → consumer lag">
            <FlowNode variant="gcp-monitoring" size="sm" tabIndex={0}>
              Message Age
            </FlowNode>
          </DiagramTooltip>
          <DiagramTooltip content="num_undelivered_messages — размер backlog">
            <FlowNode variant="gcp-monitoring" size="sm" tabIndex={0}>
              Backlog Size
            </FlowNode>
          </DiagramTooltip>
          <DiagramTooltip content="dead_letter_message_count > 0 → poison messages">
            <FlowNode variant="gcp-monitoring" size="sm" tabIndex={0}>
              DLQ Count
            </FlowNode>
          </DiagramTooltip>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-white/10 text-xs text-amber-200/70">
        <p>System lag — ключевая метрика для real-time CDC (задержка обработки)</p>
      </div>
    </DiagramContainer>
  );
}

/**
 * AlertFlowDiagram - Shows alert hierarchy with severity levels
 */
export function AlertFlowDiagram() {
  return (
    <DiagramContainer
      title="Alert Flow и Severity Levels"
      color="rose"
      description="Иерархия алертов от Warning до Critical"
    >
      <div className="space-y-4">
        {/* Critical Alerts */}
        <DiagramContainer title="Critical (P0)" color="rose">
          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2">
              <DiagramTooltip content="Replication slot lag > 10GB → WAL bloat риск">
                <FlowNode variant="gcp-monitoring" size="sm" className="border-rose-500" tabIndex={0}>
                  Cloud SQL Lag
                </FlowNode>
              </DiagramTooltip>
              <Arrow direction="right" />
              <FlowNode variant="app" size="sm" tabIndex={0}>PagerDuty</FlowNode>
            </div>
            <div className="flex items-center gap-2">
              <DiagramTooltip content="Debezium system lag > 5 минут">
                <FlowNode variant="gcp-monitoring" size="sm" className="border-rose-500" tabIndex={0}>
                  Debezium Lag
                </FlowNode>
              </DiagramTooltip>
              <Arrow direction="right" />
              <FlowNode variant="app" size="sm" tabIndex={0}>PagerDuty</FlowNode>
            </div>
          </div>
        </DiagramContainer>

        {/* Warning Alerts */}
        <DiagramContainer title="Warning (P1)" color="amber">
          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2">
              <DiagramTooltip content="Pub/Sub oldest unacked message age > 5 минут">
                <FlowNode variant="gcp-monitoring" size="sm" className="border-amber-500" tabIndex={0}>
                  Pub/Sub Age
                </FlowNode>
              </DiagramTooltip>
              <Arrow direction="right" />
              <FlowNode variant="app" size="sm" tabIndex={0}>Slack</FlowNode>
            </div>
            <div className="flex items-center gap-2">
              <DiagramTooltip content="Dataflow worker CPU > 80%">
                <FlowNode variant="gcp-monitoring" size="sm" className="border-amber-500" tabIndex={0}>
                  Worker CPU
                </FlowNode>
              </DiagramTooltip>
              <Arrow direction="right" />
              <FlowNode variant="app" size="sm" tabIndex={0}>Slack</FlowNode>
            </div>
          </div>
        </DiagramContainer>

        {/* Info Alerts */}
        <DiagramContainer title="Info (P2)" color="blue">
          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2">
              <DiagramTooltip content="Debezium snapshot started">
                <FlowNode variant="gcp-monitoring" size="sm" className="border-blue-500" tabIndex={0}>
                  Snapshot Event
                </FlowNode>
              </DiagramTooltip>
              <Arrow direction="right" />
              <FlowNode variant="app" size="sm" tabIndex={0}>Email</FlowNode>
            </div>
          </div>
        </DiagramContainer>
      </div>

      <div className="mt-4 pt-3 border-t border-white/10 text-xs text-rose-200/70">
        <p className="font-semibold mb-1">Alert thresholds:</p>
        <ul className="space-y-1">
          <li>• Critical: immediate action required (page on-call)</li>
          <li>• Warning: investigate within 1 hour (Slack notification)</li>
          <li>• Info: awareness only (email digest)</li>
        </ul>
      </div>
    </DiagramContainer>
  );
}
