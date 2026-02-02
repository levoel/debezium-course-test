/**
 * JMX Metrics Diagrams
 *
 * Exports:
 * - JmxMetricsPipelineDiagram: 5-node flow from Debezium to Grafana
 * - LagCalculationDiagram: MilliSecondsBehindSource calculation flow
 * - StalenessScenariosDiagram: 3 scenarios (Normal, No Activity, Stuck)
 * - DiagnosticDecisionTreeDiagram: Troubleshooting decision framework
 */

import { FlowNode } from '../primitives/FlowNode';
import { Arrow } from '../primitives/Arrow';
import { DiagramContainer } from '../primitives/DiagramContainer';
import { DiagramTooltip } from '../primitives/Tooltip';

/**
 * JmxMetricsPipelineDiagram - JMX metrics pipeline from Debezium to visualization
 */
export function JmxMetricsPipelineDiagram() {
  return (
    <DiagramContainer
      title="JMX Metrics Pipeline"
      color="blue"
      description="Поток метрик от Debezium до визуализации"
    >
      <div className="flex items-center justify-center gap-2 md:gap-3 flex-wrap">
        <DiagramTooltip
          content={
            <div>
              <strong>Debezium Connector</strong>
              <p className="mt-1">
                Регистрирует метрики как JMX MBeans внутри JVM Kafka Connect.
                Ключевые метрики: MilliSecondsBehindSource, QueueRemainingCapacity,
                TotalNumberOfEventsSeen.
              </p>
            </div>
          }
        >
          <FlowNode variant="database" tabIndex={0}>
            Debezium
          </FlowNode>
        </DiagramTooltip>

        <Arrow direction="right" label="MBeans" />

        <DiagramTooltip
          content={
            <div>
              <strong>JMX MBeans</strong>
              <p className="mt-1">
                Стандартный механизм мониторинга Java-приложений.
                ObjectName: debezium.postgres:type=connector-metrics,context=streaming,server=...
              </p>
            </div>
          }
        >
          <FlowNode variant="connector" tabIndex={0}>
            JMX
          </FlowNode>
        </DiagramTooltip>

        <Arrow direction="right" label=":9404" />

        <DiagramTooltip
          content={
            <div>
              <strong>JMX Exporter</strong>
              <p className="mt-1">
                Java agent, конвертирует JMX MBeans в Prometheus формат.
                HTTP endpoint на порту 9404. Pull-модель сбора метрик.
              </p>
            </div>
          }
        >
          <FlowNode
            variant="connector"
            className="bg-amber-500/20 border-amber-400/30 text-amber-200"
            tabIndex={0}
          >
            JMX Exporter
          </FlowNode>
        </DiagramTooltip>

        <Arrow direction="right" label="/metrics" />

        <DiagramTooltip
          content={
            <div>
              <strong>Prometheus</strong>
              <p className="mt-1">
                Pull-модель: скрапит метрики каждые 15 секунд (scrape_interval).
                Хранит time series данные. Поддерживает PromQL для запросов.
              </p>
            </div>
          }
        >
          <FlowNode variant="sink" tabIndex={0}>
            Prometheus
          </FlowNode>
        </DiagramTooltip>

        <Arrow direction="right" />

        <DiagramTooltip
          content={
            <div>
              <strong>Grafana</strong>
              <p className="mt-1">
                Визуализация метрик через dashboards.
                Alerting rules для уведомлений.
                Интеграция с Alertmanager для routing.
              </p>
            </div>
          }
        >
          <FlowNode variant="connector" tabIndex={0}>
            Grafana
          </FlowNode>
        </DiagramTooltip>
      </div>
    </DiagramContainer>
  );
}

/**
 * LagCalculationDiagram - How MilliSecondsBehindSource is calculated
 */
export function LagCalculationDiagram() {
  return (
    <DiagramContainer
      title="MilliSecondsBehindSource Calculation"
      color="amber"
      description="Расчет отставания от источника"
    >
      <div className="flex items-center justify-center gap-3 flex-wrap">
        <DiagramTooltip
          content={
            <div>
              <strong>DB Transaction</strong>
              <p className="mt-1">
                Транзакция в PostgreSQL с timestamp события.
                Например: 10:00:00.000 - момент COMMIT в БД.
              </p>
            </div>
          }
        >
          <FlowNode variant="database" tabIndex={0}>
            <div className="text-center">
              <div>Transaction</div>
              <div className="text-xs text-gray-400 mt-1">
                timestamp: 10:00:00.000
              </div>
            </div>
          </FlowNode>
        </DiagramTooltip>

        <Arrow direction="right" label="WAL event" />

        <DiagramTooltip
          content={
            <div>
              <strong>Debezium Processing</strong>
              <p className="mt-1">
                Debezium читает событие из WAL и обрабатывает.
                Текущее время обработки: 10:00:00.150.
                Разница = lag.
              </p>
            </div>
          }
        >
          <FlowNode variant="connector" tabIndex={0}>
            <div className="text-center">
              <div>Processing</div>
              <div className="text-xs text-gray-400 mt-1">
                time: 10:00:00.150
              </div>
            </div>
          </FlowNode>
        </DiagramTooltip>

        <Arrow direction="right" />

        <DiagramTooltip
          content={
            <div>
              <strong>MilliSecondsBehindSource</strong>
              <p className="mt-1">
                Формула: current_time - event_timestamp_in_db
              </p>
              <p className="mt-1">
                150ms = 10:00:00.150 - 10:00:00.000
              </p>
              <p className="mt-1 text-amber-300">
                PRIMARY metric для lag мониторинга!
              </p>
            </div>
          }
        >
          <FlowNode
            variant="app"
            className="bg-amber-500/20 border-amber-400/30 text-amber-200"
            tabIndex={0}
          >
            <div className="text-center">
              <div>Lag Value</div>
              <div className="text-xs font-mono mt-1">= 150ms</div>
            </div>
          </FlowNode>
        </DiagramTooltip>
      </div>
    </DiagramContainer>
  );
}

/**
 * StalenessScenariosDiagram - Three scenarios for interpreting staleness
 */
export function StalenessScenariosDiagram() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Scenario 1: Normal Work */}
      <DiagramContainer title="Нормальная работа" color="emerald">
        <div className="flex flex-col items-center gap-3">
          <DiagramTooltip
            content={
              <div>
                <strong>Здоровый pipeline</strong>
                <p className="mt-1">
                  События поступают регулярно. MilliSecondsBehindSource
                  обновляется с каждым событием. Типичный lag 100-500ms.
                </p>
              </div>
            }
          >
            <FlowNode variant="connector" size="sm" tabIndex={0}>
              Events поступают
            </FlowNode>
          </DiagramTooltip>

          <Arrow direction="down" />

          <div className="text-center text-sm">
            <div className="text-emerald-300 font-medium">
              MilliSecondsBehindSource
            </div>
            <div className="text-emerald-400 font-mono">100ms</div>
          </div>

          <div className="text-center text-sm">
            <div className="text-emerald-300 font-medium">
              MilliSecondsSinceLastEvent
            </div>
            <div className="text-emerald-400 font-mono">50ms</div>
          </div>
        </div>
      </DiagramContainer>

      {/* Scenario 2: No Activity */}
      <DiagramContainer title="Нет активности в БД" color="blue">
        <div className="flex flex-col items-center gap-3">
          <DiagramTooltip
            content={
              <div>
                <strong>БД idle - это нормально</strong>
                <p className="mt-1">
                  Нет новых транзакций в базе данных. MilliSecondsBehindSource
                  &quot;замирает&quot; на последнем значении. MilliSecondsSinceLastEvent
                  растет - это ожидаемо.
                </p>
                <p className="mt-1 text-blue-300">
                  Решение: настроить heartbeat.interval.ms
                </p>
              </div>
            }
          >
            <FlowNode variant="sink" size="sm" tabIndex={0}>
              Нет новых транзакций
            </FlowNode>
          </DiagramTooltip>

          <Arrow direction="down" />

          <div className="text-center text-sm">
            <div className="text-blue-300 font-medium">
              MilliSecondsBehindSource
            </div>
            <div className="text-blue-400 font-mono">100ms</div>
            <div className="text-xs text-gray-500">(не обновляется)</div>
          </div>

          <div className="text-center text-sm">
            <div className="text-blue-300 font-medium">
              MilliSecondsSinceLastEvent
            </div>
            <div className="text-blue-400 font-mono">5 min</div>
          </div>
        </div>
      </DiagramContainer>

      {/* Scenario 3: Stuck Connector */}
      <DiagramContainer title="Коннектор застрял" color="rose">
        <div className="flex flex-col items-center gap-3">
          <DiagramTooltip
            content={
              <div>
                <strong>Проблема: требуется расследование</strong>
                <p className="mt-1">
                  Ошибка чтения WAL, потеря соединения, или slot
                  wal_status=&apos;lost&apos;. MilliSecondsBehindSource замер,
                  MilliSecondsSinceLastEvent критично высокий.
                </p>
                <p className="mt-1 text-rose-300">
                  Действие: проверить Connected, логи коннектора, статус slot
                </p>
              </div>
            }
          >
            <FlowNode variant="app" size="sm" tabIndex={0}>
              Ошибка чтения WAL
            </FlowNode>
          </DiagramTooltip>

          <Arrow direction="down" />

          <div className="text-center text-sm">
            <div className="text-rose-300 font-medium">
              MilliSecondsBehindSource
            </div>
            <div className="text-rose-400 font-mono">100ms</div>
            <div className="text-xs text-gray-500">(замер)</div>
          </div>

          <div className="text-center text-sm">
            <div className="text-rose-300 font-medium">
              MilliSecondsSinceLastEvent
            </div>
            <div className="text-rose-400 font-mono">10 min</div>
          </div>
        </div>
      </DiagramContainer>
    </div>
  );
}

/**
 * DiagnosticDecisionTreeDiagram - Troubleshooting decision framework
 */
export function DiagnosticDecisionTreeDiagram() {
  return (
    <DiagramContainer
      title="Diagnostic Decision Tree"
      color="neutral"
      description="Framework диагностики проблем CDC pipeline"
    >
      <div className="flex flex-col items-center gap-3">
        {/* Root question */}
        <DiagramTooltip
          content={
            <div>
              <strong>Первый вопрос диагностики</strong>
              <p className="mt-1">
                Начните с проверки MilliSecondsBehindSource.
                Если растет со временем - проблема с производительностью.
                Если стабильный - проверяем staleness.
              </p>
            </div>
          }
        >
          <FlowNode variant="connector" tabIndex={0}>
            MilliSecondsBehindSource растет?
          </FlowNode>
        </DiagramTooltip>

        {/* Yes/No branches */}
        <div className="flex gap-8 md:gap-16">
          {/* YES branch - lag growing */}
          <div className="flex flex-col items-center gap-2">
            <Arrow direction="down" label="Да" />

            <DiagramTooltip
              content={
                <div>
                  <strong>Проверка backpressure</strong>
                  <p className="mt-1">
                    Queue utilization = (Total - Remaining) / Total * 100.
                    Если более 80% - проблема в Kafka write.
                  </p>
                </div>
              }
            >
              <FlowNode variant="connector" size="sm" tabIndex={0}>
                Queue utilization &gt;80%?
              </FlowNode>
            </DiagramTooltip>

            <div className="flex gap-4">
              {/* Queue high */}
              <div className="flex flex-col items-center gap-2">
                <Arrow direction="down" label="Да" />
                <DiagramTooltip
                  content={
                    <div>
                      <strong>Kafka Write Bottleneck</strong>
                      <ul className="mt-1 list-disc list-inside text-sm">
                        <li>Проверить Kafka broker latency</li>
                        <li>Проверить producer errors в логах</li>
                        <li>Увеличить max.batch.size</li>
                        <li>Проверить disk I/O на broker</li>
                      </ul>
                    </div>
                  }
                >
                  <FlowNode
                    variant="app"
                    size="sm"
                    className="bg-amber-500/20 border-amber-400/30 text-amber-200"
                    tabIndex={0}
                  >
                    Kafka bottleneck
                  </FlowNode>
                </DiagramTooltip>
              </div>

              {/* Queue normal */}
              <div className="flex flex-col items-center gap-2">
                <Arrow direction="down" label="Нет" />
                <DiagramTooltip
                  content={
                    <div>
                      <strong>WAL Processing Slow</strong>
                      <ul className="mt-1 list-disc list-inside text-sm">
                        <li>Большие транзакции (много строк)?</li>
                        <li>LOB колонки (BYTEA, TEXT)?</li>
                        <li>Сложные SMT transforms?</li>
                        <li>Проверить transforms performance</li>
                      </ul>
                    </div>
                  }
                >
                  <FlowNode variant="sink" size="sm" tabIndex={0}>
                    WAL slow
                  </FlowNode>
                </DiagramTooltip>
              </div>
            </div>
          </div>

          {/* NO branch - lag stable */}
          <div className="flex flex-col items-center gap-2">
            <Arrow direction="down" label="Нет" />

            <DiagramTooltip
              content={
                <div>
                  <strong>Проверка staleness</strong>
                  <p className="mt-1">
                    MilliSecondsSinceLastEvent показывает как давно
                    было последнее событие. Более 30 секунд требует внимания.
                  </p>
                </div>
              }
            >
              <FlowNode variant="sink" size="sm" tabIndex={0}>
                SinceLastEvent &gt;30s?
              </FlowNode>
            </DiagramTooltip>

            <div className="flex gap-4">
              {/* Staleness high */}
              <div className="flex flex-col items-center gap-2">
                <Arrow direction="down" label="Да" />

                <DiagramTooltip
                  content={
                    <div>
                      <strong>Проверка соединения</strong>
                      <p className="mt-1">
                        debezium_metrics_Connected = 0 означает потерю
                        соединения с БД.
                      </p>
                    </div>
                  }
                >
                  <FlowNode variant="sink" size="sm" tabIndex={0}>
                    Connected = true?
                  </FlowNode>
                </DiagramTooltip>

                <div className="flex gap-4">
                  <div className="flex flex-col items-center gap-2">
                    <Arrow direction="down" label="Нет" />
                    <DiagramTooltip
                      content={
                        <div>
                          <strong>Connection Loss</strong>
                          <ul className="mt-1 list-disc list-inside text-sm">
                            <li>PostgreSQL доступен?</li>
                            <li>Credentials валидны?</li>
                            <li>Network issues?</li>
                            <li>Replication slot существует?</li>
                          </ul>
                        </div>
                      }
                    >
                      <FlowNode variant="app" size="sm" tabIndex={0}>
                        Connection loss
                      </FlowNode>
                    </DiagramTooltip>
                  </div>

                  <div className="flex flex-col items-center gap-2">
                    <Arrow direction="down" label="Да" />
                    <DiagramTooltip
                      content={
                        <div>
                          <strong>Staleness Issue</strong>
                          <ul className="mt-1 list-disc list-inside text-sm">
                            <li>БД idle? (нормально)</li>
                            <li>Heartbeat настроен?</li>
                            <li>Slot wal_status=&apos;lost&apos;?</li>
                            <li>Проверить pg_replication_slots</li>
                          </ul>
                        </div>
                      }
                    >
                      <FlowNode
                        variant="database"
                        size="sm"
                        tabIndex={0}
                      >
                        Staleness
                      </FlowNode>
                    </DiagramTooltip>
                  </div>
                </div>
              </div>

              {/* Everything OK */}
              <div className="flex flex-col items-center gap-2">
                <Arrow direction="down" label="Нет" />
                <DiagramTooltip
                  content={
                    <div>
                      <strong>Pipeline Healthy</strong>
                      <p className="mt-1">
                        Lag стабильный, события поступают регулярно.
                        Продолжайте мониторинг.
                      </p>
                    </div>
                  }
                >
                  <FlowNode
                    variant="connector"
                    size="sm"
                    className="bg-emerald-500/20 border-emerald-400/30 text-emerald-200"
                    tabIndex={0}
                  >
                    Pipeline здоров
                  </FlowNode>
                </DiagramTooltip>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DiagramContainer>
  );
}
