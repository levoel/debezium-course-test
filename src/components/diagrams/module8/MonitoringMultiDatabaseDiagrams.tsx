/** @jsxImportSource solid-js */
/**
 * Monitoring Multi-Database Diagrams for Module 8 Lesson 05
 *
 * Exports:
 * - MonitoringMultiDatabaseDiagram: Unified monitoring for PostgreSQL + MySQL connectors
 */

import { FlowNode } from '@primitives/FlowNode';
import { Arrow } from '@primitives/Arrow';
import { DiagramContainer } from '@primitives/DiagramContainer';
import { DiagramTooltip } from '@primitives/Tooltip';

/**
 * MonitoringMultiDatabaseDiagram - Unified observability for heterogeneous sources
 * Shows: PostgreSQL metrics (WAL lag bytes) vs MySQL metrics (binlog lag time) → Prometheus → Grafana
 */
export function MonitoringMultiDatabaseDiagram() {
  return (
    <DiagramContainer
      title="Monitoring Multi-Database CDC"
      color="blue"
      description="Unified observability для PostgreSQL + MySQL connectors"
    >
      <div class="space-y-4">
        {/* Source metrics layer */}
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* PostgreSQL metrics */}
          <DiagramContainer color="blue" title="PostgreSQL Metrics">
            <div class="flex flex-col gap-2">
              <DiagramTooltip content={
                <div>
                  <p class="font-semibold mb-1">WAL Lag (bytes)</p>
                  <p class="text-sm">pg_wal_lsn_diff между confirmed_flush_lsn и sent_lsn</p>
                  <p class="text-sm mt-1">Измеряется в байтах WAL</p>
                </div>
              }>
                <FlowNode variant="connector" size="sm" className="bg-blue-500/20 border-blue-400/30 text-blue-700">
                  WAL Lag (bytes)
                </FlowNode>
              </DiagramTooltip>
              <DiagramTooltip content={
                <div>
                  <p class="font-semibold mb-1">Replication Slot Status</p>
                  <p class="text-sm">active=true, restart_lsn прогрессирует</p>
                  <p class="text-sm mt-1">Alert если slot inactive {'>'} 5 min</p>
                </div>
              }>
                <FlowNode variant="connector" size="sm" className="bg-blue-500/20 border-blue-400/30 text-blue-700">
                  Slot Status
                </FlowNode>
              </DiagramTooltip>
            </div>
          </DiagramContainer>

          {/* MySQL metrics */}
          <DiagramContainer color="rose" title="MySQL Metrics">
            <div class="flex flex-col gap-2">
              <DiagramTooltip content={
                <div>
                  <p class="font-semibold mb-1">Binlog Lag (time)</p>
                  <p class="text-sm">MilliSecondsBehindSource в миллисекундах</p>
                  <p class="text-sm mt-1">Измеряется во ВРЕМЕНИ, не в байтах</p>
                </div>
              }>
                <FlowNode variant="connector" size="sm" className="bg-red-500/20 border-red-400/30 text-red-700">
                  Binlog Lag (time)
                </FlowNode>
              </DiagramTooltip>
              <DiagramTooltip content={
                <div>
                  <p class="font-semibold mb-1">Binlog Position</p>
                  <p class="text-sm">GTID executed_gtid_set прогрессирует</p>
                  <p class="text-sm mt-1">Alert если position stuck {'>'} 5 min</p>
                </div>
              }>
                <FlowNode variant="connector" size="sm" className="bg-red-500/20 border-red-400/30 text-red-700">
                  Binlog Position
                </FlowNode>
              </DiagramTooltip>
            </div>
          </DiagramContainer>
        </div>

        {/* Unified monitoring layer */}
        <div class="flex flex-col items-center gap-2 pt-3 border-t border-[var(--line-thin)]">
          <div class="text-xs text-[var(--ink-muted)]">Export JMX metrics</div>
          <Arrow direction="down" />
          <DiagramTooltip content={
            <div>
              <p class="font-semibold mb-1">Prometheus</p>
              <p class="text-sm">Скрапит metrics от обоих connectors</p>
              <p class="text-sm mt-1">Label: connector_name (postgres_prod, mysql_prod)</p>
            </div>
          }>
            <FlowNode variant="sink">
              <div>Prometheus</div>
              <div class="text-xs text-[var(--ink-muted)] mt-1">(unified scraping)</div>
            </FlowNode>
          </DiagramTooltip>
          <Arrow direction="down" />
          <DiagramTooltip content={
            <div>
              <p class="font-semibold mb-1">Grafana Dashboard</p>
              <p class="text-sm">Multi-connector view с filter по connector_name</p>
              <p class="text-sm mt-1">Normalized metrics: WAL bytes → latency estimate</p>
            </div>
          }>
            <FlowNode variant="connector">
              <div>Grafana Dashboard</div>
              <div class="text-xs text-[var(--ink-muted)] mt-1">(multi-database view)</div>
            </FlowNode>
          </DiagramTooltip>
        </div>
      </div>

      <div class="mt-4 pt-3 border-t border-[var(--line-thin)] text-xs text-blue-700/70">
        <p class="font-semibold mb-1">Key Differences в metrics:</p>
        <ul class="space-y-1">
          <li>• <span class="text-blue-700">PostgreSQL:</span> WAL lag измеряется в байтах (pg_wal_lsn_diff)</li>
          <li>• <span class="text-red-700">MySQL:</span> Binlog lag измеряется во времени (MilliSecondsBehindSource)</li>
          <li>• Unified view: normalize обе метрики к latency (ms) для сравнения</li>
          <li>• source_database column в CDC events критична для traceability</li>
        </ul>
      </div>
    </DiagramContainer>
  );
}
