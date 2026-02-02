/**
 * Production Readiness Diagrams for Module 8 Lesson 03
 *
 * Exports:
 * - ProductionGapDiagram: Local development vs production comparison
 * - FourGoldenSignalsDiagram: Google SRE signals mapped to CDC metrics
 */

import { FlowNode } from '../primitives/FlowNode';
import { DiagramContainer } from '../primitives/DiagramContainer';
import { DiagramTooltip } from '../primitives/Tooltip';

/**
 * ProductionGapDiagram - Shows the gap between local development and production
 * Pattern: Side-by-side comparison (amber local vs emerald production)
 */
export function ProductionGapDiagram() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Local Development */}
      <DiagramContainer color="amber" title="Local Development">
        <DiagramTooltip content={
          <div>
            <p className="font-semibold mb-1">Local Development</p>
            <p className="text-sm">"Работает на laptop" - необходимый, но недостаточный критерий</p>
            <p className="text-sm mt-1">Docker Compose, single instance, no monitoring</p>
            <p className="text-sm mt-1">Отсутствует: resilience, observability, scale</p>
          </div>
        }>
          <FlowNode variant="app" className="w-full">
            Code works in<br/>Docker Compose
          </FlowNode>
        </DiagramTooltip>
        <div className="mt-3 text-xs text-amber-200/70">
          <p>Functional, but not production-ready</p>
        </div>
      </DiagramContainer>

      {/* Production Requirements */}
      <DiagramContainer color="emerald" title="Production" recommended>
        <div className="flex flex-col gap-2">
          <DiagramTooltip content={
            <div>
              <p className="font-semibold mb-1">Monitoring</p>
              <p className="text-sm">Prometheus + Grafana для visibility</p>
              <p className="text-sm mt-1">Four Golden Signals: Latency, Traffic, Errors, Saturation</p>
              <p className="text-sm mt-1">Alerts: PagerDuty для critical, Slack для warning</p>
            </div>
          }>
            <FlowNode variant="connector" size="sm">
              Monitoring
            </FlowNode>
          </DiagramTooltip>
          <DiagramTooltip content={
            <div>
              <p className="font-semibold mb-1">Fault Tolerance</p>
              <p className="text-sm">At-least-once delivery + idempotency</p>
              <p className="text-sm mt-1">PyFlink checkpointing для state recovery</p>
              <p className="text-sm mt-1">Kafka replication factor 3, min.insync.replicas 2</p>
            </div>
          }>
            <FlowNode variant="connector" size="sm">
              Fault Tolerance
            </FlowNode>
          </DiagramTooltip>
          <DiagramTooltip content={
            <div>
              <p className="font-semibold mb-1">Scalability</p>
              <p className="text-sm">Horizontal scaling для high throughput</p>
              <p className="text-sm mt-1">Kafka partitions, Flink parallelism</p>
              <p className="text-sm mt-1">Target: 10K+ events/sec sustained throughput</p>
            </div>
          }>
            <FlowNode variant="connector" size="sm">
              Scalability
            </FlowNode>
          </DiagramTooltip>
          <DiagramTooltip content={
            <div>
              <p className="font-semibold mb-1">Operational Procedures</p>
              <p className="text-sm">Runbook для типичных failure scenarios</p>
              <p className="text-sm mt-1">Connector restart, slot cleanup, schema evolution</p>
              <p className="text-sm mt-1">On-call rotation с escalation policy</p>
            </div>
          }>
            <FlowNode variant="connector" size="sm">
              Operational Procedures
            </FlowNode>
          </DiagramTooltip>
          <DiagramTooltip content={
            <div>
              <p className="font-semibold mb-1">Documentation</p>
              <p className="text-sm">Architecture diagrams (C4 Model)</p>
              <p className="text-sm mt-1">Configuration examples, deployment guides</p>
              <p className="text-sm mt-1">Troubleshooting playbooks для common issues</p>
            </div>
          }>
            <FlowNode variant="connector" size="sm">
              Documentation
            </FlowNode>
          </DiagramTooltip>
        </div>
        <div className="mt-3 text-xs text-emerald-200/70">
          <p>Production-ready: reliable, observable, maintainable</p>
        </div>
      </DiagramContainer>
    </div>
  );
}

/**
 * FourGoldenSignalsDiagram - Google SRE signals mapped to CDC metrics
 * Shows: Generic signals (Latency, Traffic, Errors, Saturation) -> CDC-specific metrics
 */
export function FourGoldenSignalsDiagram() {
  return (
    <DiagramContainer
      title="Four Golden Signals для CDC"
      color="purple"
      description="Google SRE framework применённый к CDC monitoring"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Latency */}
        <div className="flex flex-col gap-2">
          <DiagramTooltip content={
            <div>
              <p className="font-semibold mb-1">Latency</p>
              <p className="text-sm">Время обработки событий</p>
              <p className="text-sm mt-1">SRE: "How long does it take to service a request?"</p>
            </div>
          }>
            <FlowNode variant="connector" size="sm" className="bg-purple-500/20 border-purple-400/30">
              Latency
            </FlowNode>
          </DiagramTooltip>
          <div className="text-xs text-purple-200/70 text-center">maps to</div>
          <DiagramTooltip content={
            <div>
              <p className="font-semibold mb-1">Replication Lag</p>
              <p className="text-sm">MilliSecondsBehindSource - PRIMARY CDC metric</p>
              <p className="text-sm mt-1">Target: &lt; 5 seconds для real-time analytics</p>
              <p className="text-sm mt-1">Alert threshold: {'>'} 60 seconds</p>
            </div>
          }>
            <FlowNode variant="database" size="sm">
              Replication Lag
            </FlowNode>
          </DiagramTooltip>
        </div>

        {/* Traffic */}
        <div className="flex flex-col gap-2">
          <DiagramTooltip content={
            <div>
              <p className="font-semibold mb-1">Traffic</p>
              <p className="text-sm">Объём запросов/событий</p>
              <p className="text-sm mt-1">SRE: "How much demand is being placed on the system?"</p>
            </div>
          }>
            <FlowNode variant="connector" size="sm" className="bg-purple-500/20 border-purple-400/30">
              Traffic
            </FlowNode>
          </DiagramTooltip>
          <div className="text-xs text-purple-200/70 text-center">maps to</div>
          <DiagramTooltip content={
            <div>
              <p className="font-semibold mb-1">Event Throughput</p>
              <p className="text-sm">Events/second через CDC pipeline</p>
              <p className="text-sm mt-1">Measure at: Debezium, Kafka, PyFlink</p>
              <p className="text-sm mt-1">Capacity planning: track peak vs sustained</p>
            </div>
          }>
            <FlowNode variant="cluster" size="sm">
              Event Throughput
            </FlowNode>
          </DiagramTooltip>
        </div>

        {/* Errors */}
        <div className="flex flex-col gap-2">
          <DiagramTooltip content={
            <div>
              <p className="font-semibold mb-1">Errors</p>
              <p className="text-sm">Частота ошибок</p>
              <p className="text-sm mt-1">SRE: "What is the rate of failed requests?"</p>
            </div>
          }>
            <FlowNode variant="connector" size="sm" className="bg-purple-500/20 border-purple-400/30">
              Errors
            </FlowNode>
          </DiagramTooltip>
          <div className="text-xs text-purple-200/70 text-center">maps to</div>
          <DiagramTooltip content={
            <div>
              <p className="font-semibold mb-1">Connector Failures</p>
              <p className="text-sm">Connector State = FAILED, task crashes</p>
              <p className="text-sm mt-1">Alert on ANY FAILED state transition</p>
              <p className="text-sm mt-1">Also: schema parsing errors, serialization failures</p>
            </div>
          }>
            <FlowNode variant="app" size="sm">
              Connector Failures
            </FlowNode>
          </DiagramTooltip>
        </div>

        {/* Saturation */}
        <div className="flex flex-col gap-2">
          <DiagramTooltip content={
            <div>
              <p className="font-semibold mb-1">Saturation</p>
              <p className="text-sm">Использование ресурсов</p>
              <p className="text-sm mt-1">SRE: "How 'full' is your service?"</p>
            </div>
          }>
            <FlowNode variant="connector" size="sm" className="bg-purple-500/20 border-purple-400/30">
              Saturation
            </FlowNode>
          </DiagramTooltip>
          <div className="text-xs text-purple-200/70 text-center">maps to</div>
          <DiagramTooltip content={
            <div>
              <p className="font-semibold mb-1">Queue Capacity</p>
              <p className="text-sm">QueueRemainingCapacity &lt; 20% - backpressure warning</p>
              <p className="text-sm mt-1">WAL disk utilization для PostgreSQL</p>
              <p className="text-sm mt-1">Kafka consumer lag (unprocessed messages)</p>
            </div>
          }>
            <FlowNode variant="sink" size="sm">
              Queue Capacity
            </FlowNode>
          </DiagramTooltip>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-white/10 text-xs text-purple-200/70">
        <p className="font-semibold mb-1">Four Golden Signals framework:</p>
        <ul className="space-y-1">
          <li><span className="text-purple-300">Latency</span> - Replication lag (ms behind source)</li>
          <li><span className="text-purple-300">Traffic</span> - Events/second throughput</li>
          <li><span className="text-purple-300">Errors</span> - Connector failures, task crashes</li>
          <li><span className="text-purple-300">Saturation</span> - Queue capacity, WAL bloat</li>
        </ul>
      </div>
    </DiagramContainer>
  );
}
