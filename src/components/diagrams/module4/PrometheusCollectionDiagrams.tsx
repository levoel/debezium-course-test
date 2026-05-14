/** @jsxImportSource solid-js */
/**
 * Prometheus Collection Diagrams
 *
 * Exports:
 * - PrometheusScrapingDiagram: Full scraping architecture with nested containers
 */

import { FlowNode } from '@primitives/FlowNode';
import { Arrow } from '@primitives/Arrow';
import { DiagramContainer } from '@primitives/DiagramContainer';
import { DiagramTooltip } from '@primitives/Tooltip';

/**
 * PrometheusScrapingDiagram - Complete Prometheus scraping architecture
 */
export function PrometheusScrapingDiagram() {
  return (
    <DiagramContainer
      title="Prometheus Scraping Architecture"
      color="blue"
      description="Pull-модель сбора метрик от Kafka Connect до визуализации"
    >
      <div class="flex flex-col lg:flex-row items-center justify-center gap-4">
        {/* Kafka Connect Container */}
        <div class="p-4 rounded-xl border border-emerald-400/30 bg-emerald-500/10">
          <div class="text-xs text-emerald-700 font-medium mb-3 text-center">
            Kafka Connect Container
          </div>
          <div class="flex flex-col items-center gap-2">
            <DiagramTooltip
              content={
                <div>
                  <strong>Debezium JVM</strong>
                  <p class="mt-1">
                    Java Virtual Machine с Debezium connector.
                    Регистрирует метрики в JMX MBeans автоматически.
                    ObjectName: debezium.postgres:type=connector-metrics,...
                  </p>
                </div>
              }
            >
              <FlowNode variant="connector" size="sm" tabIndex={0}>
                Debezium JVM
              </FlowNode>
            </DiagramTooltip>

            <Arrow direction="down" />

            <DiagramTooltip
              content={
                <div>
                  <strong>JMX MBeans</strong>
                  <p class="mt-1">
                    Стандартный Java-механизм для экспорта метрик.
                    Доступен внутри JVM через JMX API.
                    Не доступен напрямую по HTTP.
                  </p>
                </div>
              }
            >
              <FlowNode variant="sink" size="sm" tabIndex={0}>
                JMX MBeans
              </FlowNode>
            </DiagramTooltip>

            <Arrow direction="down" />

            <DiagramTooltip
              content={
                <div>
                  <strong>JMX Exporter Agent</strong>
                  <p class="mt-1">
                    Java agent, встроенный в Debezium Connect образ.
                    Читает JMX MBeans и экспортирует в Prometheus формат.
                    HTTP endpoint на порту 9404.
                  </p>
                  <p class="mt-1 text-amber-700">
                    JMXPORT=9404 в docker-compose.yml
                  </p>
                </div>
              }
            >
              <FlowNode
                variant="connector"
                size="sm"
                className="bg-amber-500/20 border-amber-400/30 text-amber-700"
                tabIndex={0}
              >
                <div class="text-center">
                  <div>JMX Exporter</div>
                  <div class="text-xs text-[var(--ink-muted)]">:9404</div>
                </div>
              </FlowNode>
            </DiagramTooltip>
          </div>
        </div>

        <Arrow direction="right" label="GET /metrics" />

        {/* Prometheus Container */}
        <div class="p-4 rounded-xl border border-rose-400/30 bg-rose-500/10">
          <div class="text-xs text-rose-700 font-medium mb-3 text-center">
            Prometheus Container
          </div>
          <div class="flex flex-col items-center gap-2">
            <DiagramTooltip
              content={
                <div>
                  <strong>Scraper</strong>
                  <p class="mt-1">
                    Pull-модель: Prometheus инициирует запросы.
                    scrape_interval: 15s - оптимальный баланс.
                    job_name: kafka-connect в prometheus.yml.
                  </p>
                  <p class="mt-1 text-blue-700">
                    Targets: connect:9404 (Docker service name)
                  </p>
                </div>
              }
            >
              <FlowNode variant="app" size="sm" tabIndex={0}>
                <div class="text-center">
                  <div>Scraper</div>
                  <div class="text-xs text-[var(--ink-muted)]">каждые 15s</div>
                </div>
              </FlowNode>
            </DiagramTooltip>

            <Arrow direction="down" />

            <DiagramTooltip
              content={
                <div>
                  <strong>Time Series DB</strong>
                  <p class="mt-1">
                    TSDB хранит все метрики с timestamps.
                    Retention по умолчанию 15 дней.
                    Поддерживает PromQL для запросов.
                  </p>
                  <p class="mt-1 text-purple-700">
                    metric_relabel_configs фильтрует ненужные метрики
                  </p>
                </div>
              }
            >
              <FlowNode variant="database" size="sm" tabIndex={0}>
                TSDB
              </FlowNode>
            </DiagramTooltip>
          </div>
        </div>

        <Arrow direction="right" label="PromQL" />

        {/* Clients */}
        <div class="p-4 rounded-xl border border-purple-400/30 bg-purple-500/10">
          <div class="text-xs text-purple-700 font-medium mb-3 text-center">
            Потребители
          </div>
          <div class="flex flex-col items-center gap-3">
            <DiagramTooltip
              content={
                <div>
                  <strong>Grafana</strong>
                  <p class="mt-1">
                    Визуализация метрик через dashboards.
                    Datasource: Prometheus (по умолчанию localhost:9090).
                    Auto-refresh: 15s (соответствует scrape_interval).
                  </p>
                </div>
              }
            >
              <FlowNode variant="connector" size="sm" tabIndex={0}>
                Grafana
              </FlowNode>
            </DiagramTooltip>

            <DiagramTooltip
              content={
                <div>
                  <strong>Alertmanager</strong>
                  <p class="mt-1">
                    Маршрутизация алертов по severity.
                    Интеграция с email, Slack, PagerDuty.
                    Группировка и дедупликация уведомлений.
                  </p>
                </div>
              }
            >
              <FlowNode variant="app" size="sm" tabIndex={0}>
                Alertmanager
              </FlowNode>
            </DiagramTooltip>
          </div>
        </div>
      </div>

      {/* Key points */}
      <div class="mt-4 text-xs text-[var(--ink-muted)] text-center px-4 py-2 bg-[var(--bg-sunken)] rounded-lg">
        <strong class="text-[var(--ink-default)]">Pull vs Push:</strong> Prometheus
        инициирует запросы (pull) - проще firewall правила, нет потери данных
        при недоступности Prometheus
      </div>
    </DiagramContainer>
  );
}
