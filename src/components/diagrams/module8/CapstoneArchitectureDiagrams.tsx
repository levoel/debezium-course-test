/** @jsxImportSource solid-js */
/**
 * Capstone Architecture Diagrams for Module 8 Lesson 01
 *
 * Exports:
 * - CapstoneArchitectureDiagram: Hero 5-layer diagram showing complete CDC pipeline
 *   (Source Aurora -> CDC Debezium -> Processing PyFlink -> Warehouse BigQuery -> Observability)
 */

import { FlowNode } from '@primitives/FlowNode';
import { Arrow } from '@primitives/Arrow';
import { DiagramContainer } from '@primitives/DiagramContainer';
import { DiagramTooltip } from '@primitives/Tooltip';

/**
 * CapstoneArchitectureDiagram - Complete 5-layer CDC pipeline architecture
 * Shows: Aurora (Application -> orders table -> outbox table) -> Debezium (Connector + Kafka)
 *        -> PyFlink (transformations) -> BigQuery (Storage Write API + Table) -> Prometheus + Grafana
 */
export function CapstoneArchitectureDiagram() {
  return (
    <div class="flex flex-col gap-4">
      {/* Layer 1: Source - Aurora PostgreSQL */}
      <DiagramContainer color="purple" title="Source: Aurora PostgreSQL">
        <div class="flex flex-col md:flex-row items-center justify-center gap-3 flex-wrap">
          <DiagramTooltip content={
            <div>
              <p class="font-semibold mb-1">Application</p>
              <p class="text-sm">Пишет заказы в orders table и события в outbox table</p>
              <p class="text-sm mt-1">В одной транзакции - атомарность гарантирована</p>
            </div>
          }>
            <FlowNode variant="app">Application</FlowNode>
          </DiagramTooltip>

          <div class="flex flex-col items-center gap-1">
            <Arrow direction="down" label="INSERT order" className="md:hidden" />
            <Arrow direction="right" label="INSERT order" className="hidden md:block" />
          </div>

          <DiagramTooltip content={
            <div>
              <p class="font-semibold mb-1">orders table</p>
              <p class="text-sm">Бизнес-данные: заказы клиентов</p>
              <p class="text-sm mt-1">REPLICA IDENTITY DEFAULT (pk достаточно)</p>
            </div>
          }>
            <FlowNode variant="database">orders table</FlowNode>
          </DiagramTooltip>

          <div class="flex items-center gap-2 text-xs text-purple-700/70">
            <span class="hidden md:inline">+</span>
            <span class="md:hidden">+</span>
            <span>same transaction</span>
          </div>

          <DiagramTooltip content={
            <div>
              <p class="font-semibold mb-1">outbox table</p>
              <p class="text-sm">Transactional event publishing pattern</p>
              <p class="text-sm mt-1">REPLICA IDENTITY FULL для CDC</p>
              <p class="text-sm mt-1">Поля: id, aggregatetype, payload (JSONB)</p>
            </div>
          }>
            <FlowNode variant="connector" className="bg-red-500/20 border-red-400/30 text-red-700">
              outbox table
            </FlowNode>
          </DiagramTooltip>
        </div>
      </DiagramContainer>

      <Arrow direction="down" label="WAL stream" className="self-center" />

      {/* Layer 2: CDC - Debezium */}
      <DiagramContainer color="emerald" title="CDC Layer: Debezium">
        <div class="flex flex-col md:flex-row items-center justify-center gap-3 flex-wrap">
          <DiagramTooltip content={
            <div>
              <p class="font-semibold mb-1">Debezium Connector</p>
              <p class="text-sm">Захватывает события из outbox через WAL</p>
              <p class="text-sm mt-1">Outbox Event Router SMT роутирует по aggregatetype</p>
              <p class="text-sm mt-1">table.include.list: public.outbox</p>
            </div>
          }>
            <FlowNode variant="connector">
              Debezium Connector
              <div class="text-xs text-[var(--ink-muted)] mt-1">(Outbox Event Router SMT)</div>
            </FlowNode>
          </DiagramTooltip>

          <div class="flex flex-col items-center gap-1">
            <Arrow direction="down" label="Route events" className="md:hidden" />
            <Arrow direction="right" label="Route events" className="hidden md:block" />
          </div>

          <DiagramTooltip content={
            <div>
              <p class="font-semibold mb-1">Kafka Topic</p>
              <p class="text-sm">outbox.event.orders - роутированные события</p>
              <p class="text-sm mt-1">Durable log с at-least-once delivery</p>
              <p class="text-sm mt-1">Retention: 7 days (default)</p>
            </div>
          }>
            <FlowNode variant="cluster">
              Kafka Topic
              <div class="text-xs text-[var(--ink-muted)] mt-1">outbox.event.orders</div>
            </FlowNode>
          </DiagramTooltip>
        </div>
      </DiagramContainer>

      <Arrow direction="down" label="Consume CDC" className="self-center" />

      {/* Layer 3: Processing - PyFlink */}
      <DiagramContainer color="purple" title="Stream Processing: PyFlink">
        <div class="flex flex-col md:flex-row items-center justify-center gap-3 flex-wrap">
          <DiagramTooltip content={
            <div>
              <p class="font-semibold mb-1">PyFlink Table API</p>
              <p class="text-sm">format='debezium-json' для автоматического парсинга</p>
              <p class="text-sm mt-1">Трансформации: enrichment, filtering, aggregation</p>
              <p class="text-sm mt-1">Checkpoint interval: 60s для fault tolerance</p>
            </div>
          }>
            <FlowNode variant="connector">
              PyFlink Table API
              <div class="text-xs text-[var(--ink-muted)] mt-1">(transformations)</div>
            </FlowNode>
          </DiagramTooltip>

          <div class="flex flex-col items-center gap-1">
            <Arrow direction="down" label="Publish enriched" className="md:hidden" />
            <Arrow direction="right" label="Publish enriched" className="hidden md:block" />
          </div>

          <DiagramTooltip content={
            <div>
              <p class="font-semibold mb-1">Kafka Sink Topic</p>
              <p class="text-sm">bigquery.orders - обогащенные события</p>
              <p class="text-sm mt-1">Готовы для ingestion в warehouse</p>
            </div>
          }>
            <FlowNode variant="cluster">
              Kafka Topic
              <div class="text-xs text-[var(--ink-muted)] mt-1">bigquery.orders</div>
            </FlowNode>
          </DiagramTooltip>
        </div>
      </DiagramContainer>

      <Arrow direction="down" label="Stream ingestion" className="self-center" />

      {/* Layer 4: Warehouse - BigQuery */}
      <DiagramContainer color="amber" title="Analytics: BigQuery">
        <div class="flex flex-col md:flex-row items-center justify-center gap-3 flex-wrap">
          <DiagramTooltip content={
            <div>
              <p class="font-semibold mb-1">BigQuery Connector</p>
              <p class="text-sm">Storage Write API для CDC ingestion</p>
              <p class="text-sm mt-1">upsertEnabled=true для UPSERT/DELETE</p>
              <p class="text-sm mt-1">intermediateTableSuffix=_bqc для staging</p>
            </div>
          }>
            <FlowNode variant="sink">
              BigQuery Connector
              <div class="text-xs text-[var(--ink-muted)] mt-1">(Storage Write API)</div>
            </FlowNode>
          </DiagramTooltip>

          <div class="flex flex-col items-center gap-1">
            <Arrow direction="down" label="UPSERT/DELETE" className="md:hidden" />
            <Arrow direction="right" label="UPSERT/DELETE" className="hidden md:block" />
          </div>

          <DiagramTooltip content={
            <div>
              <p class="font-semibold mb-1">BigQuery Table</p>
              <p class="text-sm">project.dataset.orders с PRIMARY KEY (NOT ENFORCED)</p>
              <p class="text-sm mt-1">CDC-enabled для UPSERT operations</p>
              <p class="text-sm mt-1">Partitioned by DATE(created_at) для performance</p>
            </div>
          }>
            <FlowNode variant="target">
              BigQuery Table
              <div class="text-xs text-[var(--ink-muted)] mt-1">project.dataset.orders</div>
            </FlowNode>
          </DiagramTooltip>
        </div>
      </DiagramContainer>

      <Arrow direction="down" label="Export metrics" className="self-center" />

      {/* Layer 5: Monitoring - Observability */}
      <DiagramContainer color="blue" title="Observability">
        <div class="flex flex-col md:flex-row items-center justify-center gap-3 flex-wrap">
          <DiagramTooltip content={
            <div>
              <p class="font-semibold mb-1">Prometheus</p>
              <p class="text-sm">Скрапит JMX metrics от Debezium</p>
              <p class="text-sm mt-1">Scrape interval: 15s</p>
              <p class="text-sm mt-1">Key metrics: MilliSecondsBehindSource, QueueRemainingCapacity</p>
            </div>
          }>
            <FlowNode variant="sink">
              Prometheus
              <div class="text-xs text-[var(--ink-muted)] mt-1">(JMX metrics)</div>
            </FlowNode>
          </DiagramTooltip>

          <div class="flex flex-col items-center gap-1">
            <Arrow direction="down" className="md:hidden" />
            <Arrow direction="right" className="hidden md:block" />
          </div>

          <DiagramTooltip content={
            <div>
              <p class="font-semibold mb-1">Grafana</p>
              <p class="text-sm">Dashboard с Four Golden Signals</p>
              <p class="text-sm mt-1">Alerts для connector failures и lag {'>'} 5 min</p>
            </div>
          }>
            <FlowNode variant="connector">
              Grafana
              <div class="text-xs text-[var(--ink-muted)] mt-1">(dashboards)</div>
            </FlowNode>
          </DiagramTooltip>
        </div>
      </DiagramContainer>

      <div class="mt-4 pt-3 border-t border-[var(--line-thin)] text-xs text-[var(--ink-muted)]">
        <p class="font-semibold mb-2">End-to-End Latency (typical):</p>
        <ul class="space-y-1">
          <li>Application {'->'} outbox insert: &lt;1ms (same transaction)</li>
          <li>Debezium WAL polling: 100-500ms (configurable)</li>
          <li>Kafka publish: 10-50ms (network latency)</li>
          <li>PyFlink processing: 50-200ms (depends on transformation complexity)</li>
          <li>BigQuery ingestion: 100-500ms (Storage Write API)</li>
          <li><span class="font-semibold text-emerald-400">Total: ~500-2000ms end-to-end</span></li>
        </ul>
      </div>
    </div>
  );
}
