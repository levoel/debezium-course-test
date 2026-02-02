/**
 * Binlog Lag Monitoring Diagrams
 *
 * Exports:
 * - LagMetricsFlowDiagram: Lag metrics data flow from MySQL to monitoring
 * - MonitoringArchitectureDiagram: Full monitoring architecture for MySQL CDC
 */

import { FlowNode } from '../primitives/FlowNode';
import { Arrow } from '../primitives/Arrow';
import { DiagramContainer } from '../primitives/DiagramContainer';
import { DiagramTooltip } from '../primitives/Tooltip';

/**
 * LagMetricsFlowDiagram - Lag metrics data flow
 */
export function LagMetricsFlowDiagram() {
  return (
    <div className="space-y-6">
      {/* Main metrics flow */}
      <DiagramContainer title="JMX Metrics: Data Flow" color="amber">
        <div className="flex flex-col gap-6">
          {/* Source -> Connector */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-4">
            <DiagramTooltip content="MySQL binlog event содержит timestamp создания события (source.ts_ms). Debezium извлекает этот timestamp для расчета lag.">
              <FlowNode variant="database" tabIndex={0}>
                Binlog Event
                <br />
                <span className="text-xs text-gray-400">source.ts_ms</span>
              </FlowNode>
            </DiagramTooltip>

            <Arrow direction="right" label="read" />

            <DiagramTooltip content="Debezium connector сравнивает event timestamp с текущим временем: lag = NOW() - source.ts_ms. Результат expose через JMX.">
              <FlowNode variant="connector" tabIndex={0}>
                Debezium Connector
                <br />
                <span className="text-xs text-gray-400">calculate lag</span>
              </FlowNode>
            </DiagramTooltip>
          </div>

          {/* Key metrics */}
          <div className="flex flex-col md:flex-row items-start justify-center gap-4">
            <DiagramTooltip content="MilliSecondsBehindSource — RECOMMENDED primary lag metric. Показывает задержку в миллисекундах. Более точный, чем SecondsBehindMaster.">
              <FlowNode variant="app" tabIndex={0} className="border-2 border-emerald-400">
                MilliSecondsBehindSource
                <br />
                <span className="text-xs text-emerald-400">Primary metric</span>
              </FlowNode>
            </DiagramTooltip>

            <DiagramTooltip content="SecondsBehindMaster — MySQL-calculated metric. Может быть -1 во время failover (это нормально). Используйте для cross-check с MilliSecondsBehindSource.">
              <FlowNode variant="app" tabIndex={0}>
                SecondsBehindMaster
                <br />
                <span className="text-xs text-gray-400">Cross-check</span>
              </FlowNode>
            </DiagramTooltip>
          </div>

          {/* Export to Prometheus */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-4">
            <DiagramTooltip content="JMX Exporter (port 9404) expose metrics в Prometheus format. Prometheus scrapes endpoint каждые 15-30 секунд.">
              <FlowNode variant="connector" tabIndex={0}>
                JMX Exporter
                <br />
                <span className="text-xs text-gray-400">:9404/metrics</span>
              </FlowNode>
            </DiagramTooltip>

            <Arrow direction="right" label="scrape" />

            <DiagramTooltip content="Prometheus хранит time series metrics. Поддерживает alerting rules, PromQL queries, и интеграцию с Grafana.">
              <FlowNode variant="cluster" tabIndex={0}>
                Prometheus
              </FlowNode>
            </DiagramTooltip>

            <Arrow direction="right" label="query" />

            <DiagramTooltip content="Grafana visualizes metrics и displays alerts. Debezium MySQL Dashboard ID: 11523 — recommended starting point.">
              <FlowNode variant="app" tabIndex={0} className="border-2 border-blue-400">
                Grafana
              </FlowNode>
            </DiagramTooltip>
          </div>
        </div>
      </DiagramContainer>

      {/* Key metrics explanation */}
      <div className="flex flex-col md:flex-row gap-4">
        <DiagramContainer title="Ключевые метрики" color="emerald" className="flex-1">
          <div className="text-xs text-gray-300 space-y-2">
            <div>
              <span className="text-emerald-400 font-mono">MilliSecondsBehindSource</span>
              <br />
              <span className="text-gray-400">Задержка connector от source DB (ms)</span>
            </div>
            <div>
              <span className="text-emerald-400 font-mono">BinlogPosition</span>
              <br />
              <span className="text-gray-400">Текущая позиция в binlog файле</span>
            </div>
            <div>
              <span className="text-emerald-400 font-mono">Connected</span>
              <br />
              <span className="text-gray-400">1 = connected, 0 = disconnected</span>
            </div>
          </div>
        </DiagramContainer>

        <DiagramContainer title="Queue метрики (backpressure)" color="amber" className="flex-1">
          <div className="text-xs text-gray-300 space-y-2">
            <div>
              <span className="text-amber-400 font-mono">QueueRemainingCapacity</span>
              <br />
              <span className="text-gray-400">Свободное место в internal queue</span>
            </div>
            <div>
              <span className="text-amber-400 font-mono">QueueTotalCapacity</span>
              <br />
              <span className="text-gray-400">Общий размер queue (default: 8192)</span>
            </div>
            <div className="text-gray-400 text-xs mt-2">
              Queue utilization &gt; 80% = Kafka write bottleneck
            </div>
          </div>
        </DiagramContainer>
      </div>

      {/* SecondsBehindMaster special case */}
      <DiagramContainer title="SecondsBehindMaster = -1 во время failover" color="neutral">
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-xs text-gray-300">
          <div className="flex items-center gap-2">
            <span className="bg-amber-500/20 px-2 py-1 rounded">Failover начат</span>
          </div>
          <Arrow direction="right" />
          <div className="flex items-center gap-2">
            <span className="bg-rose-500/20 px-2 py-1 rounded">SecondsBehindMaster = -1</span>
          </div>
          <Arrow direction="right" />
          <div className="flex items-center gap-2">
            <span className="bg-emerald-500/20 px-2 py-1 rounded">Reconnect (30-60s)</span>
          </div>
          <Arrow direction="right" />
          <div className="flex items-center gap-2">
            <span className="bg-emerald-500/20 px-2 py-1 rounded">Normal value</span>
          </div>
        </div>
        <div className="text-xs text-gray-400 text-center mt-3">
          Не создавайте alert на -1 — это expected behavior во время Aurora failover
        </div>
      </DiagramContainer>
    </div>
  );
}

/**
 * MonitoringArchitectureDiagram - Full monitoring architecture
 */
export function MonitoringArchitectureDiagram() {
  return (
    <div className="space-y-6">
      {/* Three-tier monitoring */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Tier 1: JMX */}
        <DiagramContainer title="Tier 1: JMX Metrics" color="amber" className="flex-1">
          <div className="flex flex-col items-center gap-3">
            <DiagramTooltip content="Connector-level health: что Debezium видит и делает. MilliSecondsBehindSource показывает, насколько connector отстает от database.">
              <FlowNode variant="connector" tabIndex={0} size="sm">
                Debezium JMX
              </FlowNode>
            </DiagramTooltip>

            <div className="text-xs text-gray-400 space-y-1 text-center">
              <div className="font-mono">MilliSecondsBehindSource</div>
              <div className="font-mono">Connected</div>
              <div className="font-mono">IsGtidModeEnabled</div>
              <div className="font-mono">QueueRemainingCapacity</div>
            </div>
          </div>
        </DiagramContainer>

        {/* Tier 2: CloudWatch */}
        <DiagramContainer title="Tier 2: CloudWatch" color="blue" className="flex-1">
          <div className="flex flex-col items-center gap-3">
            <DiagramTooltip content="Infrastructure-level health: что происходит на Aurora database layer. Критично для failover readiness и capacity planning.">
              <FlowNode variant="cluster" tabIndex={0} size="sm">
                AWS CloudWatch
              </FlowNode>
            </DiagramTooltip>

            <div className="text-xs text-gray-400 space-y-1 text-center">
              <div className="font-mono">AuroraBinlogReplicaLag</div>
              <div className="font-mono">ChangeLogBytesUsed</div>
              <div className="font-mono">ChangeLogReadIOPs</div>
              <div className="font-mono">ChangeLogWriteIOPs</div>
            </div>
          </div>
        </DiagramContainer>

        {/* Tier 3: Operational */}
        <DiagramContainer title="Tier 3: Operational" color="emerald" className="flex-1">
          <div className="flex flex-col items-center gap-3">
            <DiagramTooltip content="Application-level health: как события проходят через pipeline. Heartbeat events показывают, что connector активен даже на idle таблицах.">
              <FlowNode variant="app" tabIndex={0} size="sm">
                Operational Signals
              </FlowNode>
            </DiagramTooltip>

            <div className="text-xs text-gray-400 space-y-1 text-center">
              <div className="font-mono">Heartbeat Events</div>
              <div className="font-mono">Signal Table Events</div>
              <div className="font-mono">Kafka Consumer Lag</div>
            </div>
          </div>
        </DiagramContainer>
      </div>

      {/* Full architecture */}
      <DiagramContainer title="Production Monitoring Architecture" color="neutral">
        <div className="flex flex-col gap-6">
          {/* Data sources */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8">
            <DiagramTooltip content="Aurora MySQL writer instance — source of truth. Debezium читает binlog, CloudWatch мониторит instance health.">
              <FlowNode variant="database" tabIndex={0}>
                Aurora MySQL
              </FlowNode>
            </DiagramTooltip>

            <Arrow direction="right" label="binlog" />

            <DiagramTooltip content="Debezium connector читает binlog и expose JMX metrics. Для Aurora критично мониторить и connector, и infrastructure.">
              <FlowNode variant="connector" tabIndex={0}>
                Debezium
                <br />
                <span className="text-xs text-gray-400">JMX :9404</span>
              </FlowNode>
            </DiagramTooltip>

            <Arrow direction="right" label="events" />

            <DiagramTooltip content="Kafka хранит CDC события. Consumer lag показывает, насколько downstream системы отстают от Debezium.">
              <FlowNode variant="cluster" tabIndex={0}>
                Kafka
              </FlowNode>
            </DiagramTooltip>
          </div>

          {/* Monitoring stack */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8">
            <div className="flex flex-col items-center gap-2">
              <DiagramTooltip content="CloudWatch metrics для Aurora infrastructure. AuroraBinlogReplicaLag критичен для cross-region failover readiness.">
                <FlowNode variant="cluster" tabIndex={0} size="sm">
                  CloudWatch
                </FlowNode>
              </DiagramTooltip>
              <div className="text-xs text-gray-400">Aurora metrics</div>
            </div>

            <Arrow direction="right" />

            <div className="flex flex-col items-center gap-2">
              <DiagramTooltip content="Prometheus aggregates metrics от JMX и CloudWatch. Поддерживает alerting rules (PromQL) и Alertmanager integration.">
                <FlowNode variant="app" tabIndex={0} size="sm">
                  Prometheus
                </FlowNode>
              </DiagramTooltip>
              <div className="text-xs text-gray-400">Aggregation</div>
            </div>

            <Arrow direction="right" />

            <div className="flex flex-col items-center gap-2">
              <DiagramTooltip content="Grafana visualizes все метрики в unified dashboards. Dashboard ID 11523 — official Debezium MySQL dashboard.">
                <FlowNode variant="app" tabIndex={0} size="sm" className="border-2 border-blue-400">
                  Grafana
                </FlowNode>
              </DiagramTooltip>
              <div className="text-xs text-gray-400">Visualization</div>
            </div>

            <Arrow direction="right" />

            <div className="flex flex-col items-center gap-2">
              <DiagramTooltip content="Alertmanager роутит alerts в PagerDuty/Slack. Critical alerts (lag > 5 min, disconnect > 2 min) идут в PagerDuty для on-call.">
                <FlowNode variant="app" tabIndex={0} size="sm" className="border-2 border-rose-400">
                  Alertmanager
                </FlowNode>
              </DiagramTooltip>
              <div className="text-xs text-gray-400">Alerting</div>
            </div>
          </div>
        </div>
      </DiagramContainer>

      {/* Alert thresholds */}
      <div className="flex flex-col md:flex-row gap-4">
        <DiagramContainer title="Warning Alerts" color="amber" className="flex-1">
          <div className="text-xs text-gray-300 space-y-2">
            <div className="flex justify-between">
              <span>Binlog lag</span>
              <span className="font-mono text-amber-400">&gt; 60s for 5m</span>
            </div>
            <div className="flex justify-between">
              <span>Queue utilization</span>
              <span className="font-mono text-amber-400">&gt; 80%</span>
            </div>
            <div className="flex justify-between">
              <span>No events</span>
              <span className="font-mono text-amber-400">&gt; 60s</span>
            </div>
          </div>
        </DiagramContainer>

        <DiagramContainer title="Critical Alerts" color="rose" className="flex-1">
          <div className="text-xs text-gray-300 space-y-2">
            <div className="flex justify-between">
              <span>Binlog lag</span>
              <span className="font-mono text-rose-400">&gt; 300s for 5m</span>
            </div>
            <div className="flex justify-between">
              <span>Disconnected</span>
              <span className="font-mono text-rose-400">&gt; 2m</span>
            </div>
            <div className="flex justify-between">
              <span>GTID mode disabled</span>
              <span className="font-mono text-rose-400">immediate</span>
            </div>
          </div>
        </DiagramContainer>
      </div>

      {/* Why three tiers */}
      <DiagramContainer title="Почему три уровня мониторинга?" color="neutral">
        <div className="text-xs text-gray-300 space-y-3">
          <div>
            <span className="text-amber-400 font-bold">Сценарий:</span> JMX показывает lag = 100ms (отлично), но CloudWatch показывает AuroraBinlogReplicaLag = 300s (5 минут).
          </div>
          <div>
            <span className="text-blue-400 font-bold">Проблема:</span> Connector работает корректно, но Aurora cross-region replica отстает на 5 минут.
          </div>
          <div>
            <span className="text-rose-400 font-bold">Риск:</span> При regional failover последние 5 минут данных потеряны — replica не успела реплицировать.
          </div>
          <div>
            <span className="text-emerald-400 font-bold">Вывод:</span> Single-layer мониторинг (только JMX) пропустил бы эту проблему. Three-tier обеспечивает полную visibility.
          </div>
        </div>
      </DiagramContainer>
    </div>
  );
}
