/**
 * Monitoring Multi-Database Diagrams for Module 8 Lesson 05
 *
 * Exports:
 * - MonitoringMultiDatabaseDiagram: Unified monitoring for PostgreSQL + MySQL connectors
 */

import { FlowNode } from '../primitives/FlowNode';
import { Arrow } from '../primitives/Arrow';
import { DiagramContainer } from '../primitives/DiagramContainer';
import { DiagramTooltip } from '../primitives/Tooltip';

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
      <div className="space-y-4">
        {/* Source metrics layer */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* PostgreSQL metrics */}
          <DiagramContainer color="blue" title="PostgreSQL Metrics">
            <div className="flex flex-col gap-2">
              <DiagramTooltip content={
                <div>
                  <p className="font-semibold mb-1">WAL Lag (bytes)</p>
                  <p className="text-sm">pg_wal_lsn_diff между confirmed_flush_lsn и sent_lsn</p>
                  <p className="text-sm mt-1">Измеряется в байтах WAL</p>
                </div>
              }>
                <FlowNode variant="connector" size="sm" className="bg-blue-500/20 border-blue-400/30 text-blue-200">
                  WAL Lag (bytes)
                </FlowNode>
              </DiagramTooltip>
              <DiagramTooltip content={
                <div>
                  <p className="font-semibold mb-1">Replication Slot Status</p>
                  <p className="text-sm">active=true, restart_lsn прогрессирует</p>
                  <p className="text-sm mt-1">Alert если slot inactive {'>'} 5 min</p>
                </div>
              }>
                <FlowNode variant="connector" size="sm" className="bg-blue-500/20 border-blue-400/30 text-blue-200">
                  Slot Status
                </FlowNode>
              </DiagramTooltip>
            </div>
          </DiagramContainer>

          {/* MySQL metrics */}
          <DiagramContainer color="rose" title="MySQL Metrics">
            <div className="flex flex-col gap-2">
              <DiagramTooltip content={
                <div>
                  <p className="font-semibold mb-1">Binlog Lag (time)</p>
                  <p className="text-sm">MilliSecondsBehindSource в миллисекундах</p>
                  <p className="text-sm mt-1">Измеряется во ВРЕМЕНИ, не в байтах</p>
                </div>
              }>
                <FlowNode variant="connector" size="sm" className="bg-red-500/20 border-red-400/30 text-red-200">
                  Binlog Lag (time)
                </FlowNode>
              </DiagramTooltip>
              <DiagramTooltip content={
                <div>
                  <p className="font-semibold mb-1">Binlog Position</p>
                  <p className="text-sm">GTID executed_gtid_set прогрессирует</p>
                  <p className="text-sm mt-1">Alert если position stuck {'>'} 5 min</p>
                </div>
              }>
                <FlowNode variant="connector" size="sm" className="bg-red-500/20 border-red-400/30 text-red-200">
                  Binlog Position
                </FlowNode>
              </DiagramTooltip>
            </div>
          </DiagramContainer>
        </div>

        {/* Unified monitoring layer */}
        <div className="flex flex-col items-center gap-2 pt-3 border-t border-white/10">
          <div className="text-xs text-gray-400">Export JMX metrics</div>
          <Arrow direction="down" />
          <DiagramTooltip content={
            <div>
              <p className="font-semibold mb-1">Prometheus</p>
              <p className="text-sm">Скрапит metrics от обоих connectors</p>
              <p className="text-sm mt-1">Label: connector_name (postgres_prod, mysql_prod)</p>
            </div>
          }>
            <FlowNode variant="sink">
              <div>Prometheus</div>
              <div className="text-xs text-gray-400 mt-1">(unified scraping)</div>
            </FlowNode>
          </DiagramTooltip>
          <Arrow direction="down" />
          <DiagramTooltip content={
            <div>
              <p className="font-semibold mb-1">Grafana Dashboard</p>
              <p className="text-sm">Multi-connector view с filter по connector_name</p>
              <p className="text-sm mt-1">Normalized metrics: WAL bytes → latency estimate</p>
            </div>
          }>
            <FlowNode variant="connector">
              <div>Grafana Dashboard</div>
              <div className="text-xs text-gray-400 mt-1">(multi-database view)</div>
            </FlowNode>
          </DiagramTooltip>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-white/10 text-xs text-blue-200/70">
        <p className="font-semibold mb-1">Key Differences в metrics:</p>
        <ul className="space-y-1">
          <li>• <span className="text-blue-300">PostgreSQL:</span> WAL lag измеряется в байтах (pg_wal_lsn_diff)</li>
          <li>• <span className="text-red-300">MySQL:</span> Binlog lag измеряется во времени (MilliSecondsBehindSource)</li>
          <li>• Unified view: normalize обе метрики к latency (ms) для сравнения</li>
          <li>• source_database column в CDC events критична для traceability</li>
        </ul>
      </div>
    </DiagramContainer>
  );
}
