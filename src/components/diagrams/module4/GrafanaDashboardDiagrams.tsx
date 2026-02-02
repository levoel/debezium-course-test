/**
 * Grafana Dashboard Diagrams
 *
 * Exports:
 * - DashboardArchitectureDiagram: 3-row dashboard structure with 9 panels
 * - PanelRowLayoutDiagram: Row 1 with 4 panels and sample values
 * - HealthStatesComparisonDiagram: Healthy vs Attention vs Critical states
 */

import { FlowNode } from '../primitives/FlowNode';
import { DiagramContainer } from '../primitives/DiagramContainer';
import { DiagramTooltip } from '../primitives/Tooltip';

/**
 * DashboardArchitectureDiagram - 3-row dashboard structure
 */
export function DashboardArchitectureDiagram() {
  return (
    <DiagramContainer
      title="Dashboard Architecture"
      color="blue"
      description="Структура production-ready дашборда: от общего к частному"
    >
      <div className="space-y-4">
        {/* Row 1: Health Overview */}
        <div className="p-3 rounded-xl border border-emerald-400/30 bg-emerald-500/10">
          <div className="text-xs text-emerald-300 font-medium mb-2">
            Row 1: Health Overview
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <DiagramTooltip
              content={
                <div>
                  <strong>Connector Status (Stat Panel)</strong>
                  <p className="mt-1">
                    Query: debezium_metrics_Connected
                  </p>
                  <p className="mt-1">
                    Value mapping: 1=Connected (green), 0=Disconnected (red)
                  </p>
                </div>
              }
            >
              <FlowNode variant="connector" size="sm" tabIndex={0}>
                Status
              </FlowNode>
            </DiagramTooltip>

            <DiagramTooltip
              content={
                <div>
                  <strong>Current Lag (Gauge)</strong>
                  <p className="mt-1">
                    Query: MilliSecondsBehindSource / 1000
                  </p>
                  <p className="mt-1">
                    Thresholds: green &lt;5s, yellow 5-30s, red &gt;30s
                  </p>
                </div>
              }
            >
              <FlowNode
                variant="connector"
                size="sm"
                className="bg-amber-500/20 border-amber-400/30 text-amber-200"
                tabIndex={0}
              >
                Lag
              </FlowNode>
            </DiagramTooltip>

            <DiagramTooltip
              content={
                <div>
                  <strong>Events/sec (Stat with Sparkline)</strong>
                  <p className="mt-1">
                    Query: rate(TotalNumberOfEventsSeen[1m])
                  </p>
                  <p className="mt-1">
                    Graph mode: Area для визуализации тренда
                  </p>
                </div>
              }
            >
              <FlowNode variant="sink" size="sm" tabIndex={0}>
                Events/sec
              </FlowNode>
            </DiagramTooltip>

            <DiagramTooltip
              content={
                <div>
                  <strong>Queue Usage (Gauge)</strong>
                  <p className="mt-1">
                    Query: 100 * (1 - Remaining/Total)
                  </p>
                  <p className="mt-1">
                    Thresholds: green &lt;50%, yellow 50-80%, red &gt;90%
                  </p>
                </div>
              }
            >
              <FlowNode variant="database" size="sm" tabIndex={0}>
                Queue %
              </FlowNode>
            </DiagramTooltip>
          </div>
        </div>

        {/* Row 2: Time Series */}
        <div className="p-3 rounded-xl border border-blue-400/30 bg-blue-500/10">
          <div className="text-xs text-blue-300 font-medium mb-2">
            Row 2: Time Series (Trends)
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <DiagramTooltip
              content={
                <div>
                  <strong>Lag Trend (Time Series)</strong>
                  <p className="mt-1">
                    Исторический lag для capacity planning.
                    Threshold lines на 5s и 30s для визуального контроля.
                  </p>
                </div>
              }
            >
              <FlowNode variant="sink" size="sm" tabIndex={0}>
                Lag Trend
              </FlowNode>
            </DiagramTooltip>

            <DiagramTooltip
              content={
                <div>
                  <strong>Throughput (Time Series)</strong>
                  <p className="mt-1">
                    События в секунду за время.
                    Падения указывают на проблемы источника или коннектора.
                  </p>
                </div>
              }
            >
              <FlowNode variant="sink" size="sm" tabIndex={0}>
                Throughput
              </FlowNode>
            </DiagramTooltip>

            <DiagramTooltip
              content={
                <div>
                  <strong>Queue Utilization (Time Series)</strong>
                  <p className="mt-1">
                    Постоянное &gt;80% указывает на Kafka write bottleneck.
                    Axis: 0-100%.
                  </p>
                </div>
              }
            >
              <FlowNode variant="sink" size="sm" tabIndex={0}>
                Queue Trend
              </FlowNode>
            </DiagramTooltip>
          </div>
        </div>

        {/* Row 3: Details */}
        <div className="p-3 rounded-xl border border-purple-400/30 bg-purple-500/10">
          <div className="text-xs text-purple-300 font-medium mb-2">
            Row 3: Details (Troubleshooting)
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <DiagramTooltip
              content={
                <div>
                  <strong>Time Since Last Event</strong>
                  <p className="mt-1">
                    MilliSecondsSinceLastEvent / 1000.
                    Высокие значения на активных таблицах = проблема.
                  </p>
                </div>
              }
            >
              <FlowNode variant="database" size="sm" tabIndex={0}>
                Staleness
              </FlowNode>
            </DiagramTooltip>

            <DiagramTooltip
              content={
                <div>
                  <strong>Transactions/sec</strong>
                  <p className="mt-1">
                    rate(NumberOfCommittedTransactions[1m]).
                    Скорость захвата транзакций из источника.
                  </p>
                </div>
              }
            >
              <FlowNode variant="database" size="sm" tabIndex={0}>
                Transactions
              </FlowNode>
            </DiagramTooltip>
          </div>
        </div>
      </div>

      <div className="mt-4 text-xs text-gray-400 text-center">
        <strong>Принцип:</strong> Row 1 для быстрой оценки (оператор видит
        проблему за секунду), Row 2 для трендов, Row 3 для детального анализа
      </div>
    </DiagramContainer>
  );
}

/**
 * PanelRowLayoutDiagram - Row 1 with sample values
 */
export function PanelRowLayoutDiagram() {
  return (
    <DiagramContainer
      title="Row 1: Health Overview"
      color="emerald"
      description="4 панели для мгновенной оценки состояния"
    >
      <div className="flex flex-wrap justify-center gap-4">
        <DiagramTooltip
          content={
            <div>
              <strong>Status Panel</strong>
              <p className="mt-1">
                Stat panel с value mapping.
                Connected = зеленый, Disconnected = красный.
              </p>
            </div>
          }
        >
          <div
            className="w-32 h-20 rounded-lg bg-emerald-500/20 border border-emerald-400/30 flex flex-col items-center justify-center cursor-pointer hover:brightness-110"
            tabIndex={0}
          >
            <div className="text-xs text-gray-400">Status</div>
            <div className="text-lg font-bold text-emerald-400">Connected</div>
          </div>
        </DiagramTooltip>

        <DiagramTooltip
          content={
            <div>
              <strong>Lag Gauge</strong>
              <p className="mt-1">
                Gauge panel, unit: seconds.
                0.3s = здоровый pipeline.
              </p>
            </div>
          }
        >
          <div
            className="w-32 h-20 rounded-lg bg-emerald-500/20 border border-emerald-400/30 flex flex-col items-center justify-center cursor-pointer hover:brightness-110"
            tabIndex={0}
          >
            <div className="text-xs text-gray-400">Current Lag</div>
            <div className="text-lg font-bold text-emerald-400">0.3s</div>
          </div>
        </DiagramTooltip>

        <DiagramTooltip
          content={
            <div>
              <strong>Events/sec Stat</strong>
              <p className="mt-1">
                Stat panel с sparkline (graph mode: area).
                Показывает текущий throughput.
              </p>
            </div>
          }
        >
          <div
            className="w-32 h-20 rounded-lg bg-blue-500/20 border border-blue-400/30 flex flex-col items-center justify-center cursor-pointer hover:brightness-110"
            tabIndex={0}
          >
            <div className="text-xs text-gray-400">Events/sec</div>
            <div className="text-lg font-bold text-blue-400">125.4</div>
          </div>
        </DiagramTooltip>

        <DiagramTooltip
          content={
            <div>
              <strong>Queue Usage Gauge</strong>
              <p className="mt-1">
                Gauge panel, unit: percent.
                12% = очередь почти пуста, Kafka успевает.
              </p>
            </div>
          }
        >
          <div
            className="w-32 h-20 rounded-lg bg-emerald-500/20 border border-emerald-400/30 flex flex-col items-center justify-center cursor-pointer hover:brightness-110"
            tabIndex={0}
          >
            <div className="text-xs text-gray-400">Queue Usage</div>
            <div className="text-lg font-bold text-emerald-400">12%</div>
          </div>
        </DiagramTooltip>
      </div>
    </DiagramContainer>
  );
}

/**
 * HealthStatesComparisonDiagram - 3 health states comparison
 */
export function HealthStatesComparisonDiagram() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Healthy State */}
      <DiagramContainer title="Healthy" color="emerald">
        <div className="space-y-3">
          <DiagramTooltip
            content={
              <div>
                <strong>Здоровый pipeline</strong>
                <p className="mt-1">
                  Все метрики в норме. Продолжайте мониторинг.
                  Такое состояние должно быть 99%+ времени.
                </p>
              </div>
            }
          >
            <div className="text-center mb-3" tabIndex={0}>
              <FlowNode
                variant="connector"
                size="sm"
                className="bg-emerald-500/20 border-emerald-400/30 text-emerald-200 inline-block"
              >
                All Green
              </FlowNode>
            </div>
          </DiagramTooltip>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Lag:</span>
              <span className="text-emerald-400 font-mono">&lt;1s</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Events/sec:</span>
              <span className="text-emerald-400 font-mono">stable</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Queue:</span>
              <span className="text-emerald-400 font-mono">&lt;50%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Staleness:</span>
              <span className="text-emerald-400 font-mono">&lt;30s</span>
            </div>
          </div>
        </div>
      </DiagramContainer>

      {/* Attention State */}
      <DiagramContainer title="Attention" color="amber">
        <div className="space-y-3">
          <DiagramTooltip
            content={
              <div>
                <strong>Требует внимания</strong>
                <p className="mt-1">
                  Warning состояние. Проверьте нагрузку на источник
                  и Kafka. Возможно временный spike.
                </p>
                <p className="mt-1 text-amber-300">
                  Если сохраняется более 5 минут - расследуйте.
                </p>
              </div>
            }
          >
            <div className="text-center mb-3" tabIndex={0}>
              <FlowNode
                variant="connector"
                size="sm"
                className="bg-amber-500/20 border-amber-400/30 text-amber-200 inline-block"
              >
                Warning
              </FlowNode>
            </div>
          </DiagramTooltip>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Lag:</span>
              <span className="text-amber-400 font-mono">5-30s</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Events/sec:</span>
              <span className="text-amber-400 font-mono">declining</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Queue:</span>
              <span className="text-amber-400 font-mono">50-80%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Staleness:</span>
              <span className="text-amber-400 font-mono">30s-5min</span>
            </div>
          </div>
        </div>
      </DiagramContainer>

      {/* Critical State */}
      <DiagramContainer title="Critical" color="rose">
        <div className="space-y-3">
          <DiagramTooltip
            content={
              <div>
                <strong>Критическое состояние</strong>
                <p className="mt-1">
                  SLO нарушен. Немедленное вмешательство требуется.
                  Проверьте: Kafka brokers, network, PostgreSQL.
                </p>
                <p className="mt-1 text-rose-300">
                  Возможен backpressure или потеря соединения.
                </p>
              </div>
            }
          >
            <div className="text-center mb-3" tabIndex={0}>
              <FlowNode variant="app" size="sm" className="inline-block">
                Critical
              </FlowNode>
            </div>
          </DiagramTooltip>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Lag:</span>
              <span className="text-rose-400 font-mono">&gt;30s</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Events/sec:</span>
              <span className="text-rose-400 font-mono">zero/dropping</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Queue:</span>
              <span className="text-rose-400 font-mono">&gt;90%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Staleness:</span>
              <span className="text-rose-400 font-mono">&gt;5min</span>
            </div>
          </div>
        </div>
      </DiagramContainer>
    </div>
  );
}
