/**
 * Lab Setup Diagram
 *
 * Shows the complete Docker Compose stack with 4 subgroups:
 * - DATA: PostgreSQL
 * - STREAMING: Kafka, Schema Registry, Debezium Connect
 * - MONITORING: Prometheus, Grafana
 * - EXERCISES: JupyterLab
 */

import { FlowNode } from '../primitives/FlowNode';
import { Arrow } from '../primitives/Arrow';
import { DiagramContainer } from '../primitives/DiagramContainer';
import { DiagramTooltip } from '../primitives/Tooltip';

/**
 * LabSetupDiagram - Docker Compose architecture with 4 subgroups
 */
export function LabSetupDiagram() {
  return (
    <div className="flex flex-col gap-6">
      {/* Title */}
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-200">
          Docker Compose Stack
        </h3>
        <p className="text-sm text-gray-400">
          Полная среда для практических работ
        </p>
      </div>

      {/* Container Grid: 2x2 on desktop, single column on mobile */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* DATA Subgroup */}
        <DiagramContainer title="DATA" color="purple" className="min-h-[160px]">
          <div className="flex flex-col items-center gap-4">
            <DiagramTooltip content="База данных с wal_level=logical и настроенными replication slots. Порт 5433 (не 5432!) чтобы избежать конфликта с локальной установкой PostgreSQL.">
              <FlowNode variant="database" tabIndex={0}>
                PostgreSQL
                <br />
                <span className="text-xs opacity-75">:5433</span>
              </FlowNode>
            </DiagramTooltip>
          </div>
        </DiagramContainer>

        {/* STREAMING Subgroup */}
        <DiagramContainer title="STREAMING" color="blue" className="min-h-[160px]">
          <div className="flex flex-col items-center gap-4">
            <div className="flex flex-wrap justify-center gap-3">
              <DiagramTooltip content="Apache Kafka в KRaft режиме (без ZooKeeper). Confluent Platform 7.8.1. Хранит CDC-события и internal топики Kafka Connect.">
                <FlowNode variant="cluster" tabIndex={0} size="sm">
                  Kafka
                  <br />
                  <span className="text-xs opacity-75">:9092</span>
                </FlowNode>
              </DiagramTooltip>

              <DiagramTooltip content="Хранилище Avro/JSON схем. Позволяет эволюционировать структуру событий с проверкой совместимости.">
                <FlowNode variant="sink" tabIndex={0} size="sm">
                  Schema Registry
                  <br />
                  <span className="text-xs opacity-75">:8081</span>
                </FlowNode>
              </DiagramTooltip>
            </div>

            <DiagramTooltip content="Kafka Connect с установленным Debezium PostgreSQL коннектором. REST API на порту 8083 для управления.">
              <FlowNode variant="connector" tabIndex={0}>
                Debezium Connect
                <br />
                <span className="text-xs opacity-75">:8083</span>
              </FlowNode>
            </DiagramTooltip>
          </div>
        </DiagramContainer>

        {/* MONITORING Subgroup */}
        <DiagramContainer title="MONITORING" color="rose" className="min-h-[160px]">
          <div className="flex flex-col items-center gap-4">
            <div className="flex flex-wrap justify-center gap-3">
              <DiagramTooltip content="Сбор метрик из Kafka Connect через JMX. Хранит time-series данные для мониторинга CDC pipeline.">
                <FlowNode variant="sink" tabIndex={0} size="sm">
                  Prometheus
                  <br />
                  <span className="text-xs opacity-75">:9090</span>
                </FlowNode>
              </DiagramTooltip>

              <DiagramTooltip content="Дашборды для визуализации метрик. Логин: admin/admin. Подключен к Prometheus как data source.">
                <FlowNode variant="app" tabIndex={0} size="sm">
                  Grafana
                  <br />
                  <span className="text-xs opacity-75">:3000</span>
                </FlowNode>
              </DiagramTooltip>
            </div>
          </div>
        </DiagramContainer>

        {/* EXERCISES Subgroup */}
        <DiagramContainer title="EXERCISES" color="amber" className="min-h-[160px]">
          <div className="flex flex-col items-center gap-4">
            <DiagramTooltip content="Python окружение для экспериментов. confluent-kafka библиотека уже установлена. Подключается к Kafka как kafka:9092 (внутренняя сеть Docker).">
              <FlowNode variant="app" tabIndex={0}>
                JupyterLab
                <br />
                <span className="text-xs opacity-75">:8888</span>
              </FlowNode>
            </DiagramTooltip>
          </div>
        </DiagramContainer>
      </div>

      {/* Data Flow Legend */}
      <div className="mt-4 p-4 rounded-lg bg-gray-500/10 border border-gray-400/30">
        <h4 className="text-sm font-semibold text-gray-300 mb-3">
          Основные потоки данных:
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-400">
          <div className="flex items-center gap-2">
            <Arrow direction="right" />
            <span>PostgreSQL → Debezium Connect (WAL)</span>
          </div>
          <div className="flex items-center gap-2">
            <Arrow direction="right" />
            <span>Debezium Connect → Kafka (Events)</span>
          </div>
          <div className="flex items-center gap-2">
            <Arrow direction="right" />
            <span>Kafka → Schema Registry (Schema)</span>
          </div>
          <div className="flex items-center gap-2">
            <Arrow direction="right" />
            <span>Debezium Connect → Prometheus (Metrics)</span>
          </div>
          <div className="flex items-center gap-2">
            <Arrow direction="right" />
            <span>Prometheus → Grafana (Dashboard)</span>
          </div>
          <div className="flex items-center gap-2">
            <Arrow direction="right" />
            <span>Kafka → JupyterLab (Consume)</span>
          </div>
          <div className="flex items-center gap-2">
            <Arrow direction="right" />
            <span>PostgreSQL → JupyterLab (Query)</span>
          </div>
        </div>
      </div>

      {/* Quick Reference */}
      <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-400/30">
        <h4 className="text-sm font-semibold text-emerald-300 mb-2">
          Быстрый старт:
        </h4>
        <ul className="text-xs text-gray-300 space-y-1">
          <li><code className="text-emerald-400">docker compose up -d</code> — запустить всё окружение</li>
          <li><code className="text-emerald-400">localhost:8888</code> — JupyterLab для упражнений</li>
          <li><code className="text-emerald-400">localhost:8083</code> — Kafka Connect REST API</li>
          <li><code className="text-emerald-400">localhost:3000</code> — Grafana мониторинг</li>
        </ul>
      </div>
    </div>
  );
}
