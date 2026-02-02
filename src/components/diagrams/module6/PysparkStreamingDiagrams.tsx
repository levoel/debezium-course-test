/**
 * PySpark Structured Streaming Diagrams
 *
 * Exports:
 * - PyflinkVsPysparkComparisonDiagram: Side-by-side philosophy comparison
 * - StructuredStreamingConceptDiagram: Horizontal flow showing streaming model
 * - PysparkWatermarkDiagram: Late event handling with watermark threshold
 * - MicroBatchVsContinuousDiagram: Comparison of processing modes
 */

import { FlowNode } from '../primitives/FlowNode';
import { Arrow } from '../primitives/Arrow';
import { DiagramContainer } from '../primitives/DiagramContainer';
import { DiagramTooltip } from '../primitives/Tooltip';

/**
 * PyflinkVsPysparkComparisonDiagram - Shows philosophy differences between PyFlink and PySpark
 */
export function PyflinkVsPysparkComparisonDiagram() {
  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* PyFlink Philosophy */}
      <DiagramContainer
        title="PyFlink Philosophy"
        color="blue"
        className="flex-1 bg-blue-500/10"
      >
        <div className="flex flex-col items-center gap-3">
          <DiagramTooltip
            content={
              <div>
                <strong>Pure Streaming</strong>
                <p className="mt-1">
                  Event-by-event обработка. Каждое событие обрабатывается
                  немедленно по мере поступления, без micro-batching.
                </p>
              </div>
            }
          >
            <FlowNode variant="sink" size="sm" tabIndex={0}>
              Pure Streaming
              <span className="block text-xs text-gray-400 mt-1">
                Event-by-event processing
              </span>
            </FlowNode>
          </DiagramTooltip>

          <DiagramTooltip
            content={
              <div>
                <strong>Low Latency</strong>
                <p className="mt-1">
                  Миллисекундная latency благодаря continuous processing.
                  Критично для real-time alerting систем.
                </p>
              </div>
            }
          >
            <FlowNode variant="sink" size="sm" tabIndex={0}>
              Low Latency
              <span className="block text-xs text-gray-400 mt-1">
                Millisecond response
              </span>
            </FlowNode>
          </DiagramTooltip>

          <DiagramTooltip
            content={
              <div>
                <strong>Exactly-Once</strong>
                <p className="mt-1">
                  Строгие гарантии exactly-once даже при записи в Kafka
                  через transactional producer API.
                </p>
              </div>
            }
          >
            <FlowNode variant="sink" size="sm" tabIndex={0}>
              Exactly-Once
              <span className="block text-xs text-gray-400 mt-1">
                Strong guarantees
              </span>
            </FlowNode>
          </DiagramTooltip>

          <DiagramTooltip
            content={
              <div>
                <strong>Complex CEP</strong>
                <p className="mt-1">
                  Complex Event Processing library для pattern matching.
                  Например, детекция fraud patterns в real-time.
                </p>
              </div>
            }
          >
            <FlowNode variant="sink" size="sm" tabIndex={0}>
              Complex CEP
              <span className="block text-xs text-gray-400 mt-1">
                Pattern matching
              </span>
            </FlowNode>
          </DiagramTooltip>
        </div>
      </DiagramContainer>

      {/* PySpark Philosophy */}
      <DiagramContainer
        title="PySpark Philosophy"
        color="purple"
        className="flex-1 bg-purple-500/10"
      >
        <div className="flex flex-col items-center gap-3">
          <DiagramTooltip
            content={
              <div>
                <strong>Unified Batch + Streaming</strong>
                <p className="mt-1">
                  Один DataFrame API для batch и streaming данных. Можно
                  использовать те же операции (select, filter, groupBy).
                </p>
              </div>
            }
          >
            <FlowNode
              variant="connector"
              className="bg-purple-500/20 border-purple-400/30 text-purple-200"
              size="sm"
              tabIndex={0}
            >
              Unified Batch + Streaming
              <span className="block text-xs text-gray-400 mt-1">
                Same API for both
              </span>
            </FlowNode>
          </DiagramTooltip>

          <DiagramTooltip
            content={
              <div>
                <strong>Micro-batching</strong>
                <p className="mt-1">
                  Stream обрабатывается как последовательность small batches.
                  Latency ~1-10 seconds, но проще отлаживать.
                </p>
              </div>
            }
          >
            <FlowNode
              variant="connector"
              className="bg-purple-500/20 border-purple-400/30 text-purple-200"
              size="sm"
              tabIndex={0}
            >
              Micro-batching
              <span className="block text-xs text-gray-400 mt-1">
                Second-scale latency
              </span>
            </FlowNode>
          </DiagramTooltip>

          <DiagramTooltip
            content={
              <div>
                <strong>Data Lake Native</strong>
                <p className="mt-1">
                  Native интеграция с data lake форматами: Parquet, Delta Lake,
                  Apache Iceberg. Оптимизировано для batch + streaming writes.
                </p>
              </div>
            }
          >
            <FlowNode
              variant="connector"
              className="bg-purple-500/20 border-purple-400/30 text-purple-200"
              size="sm"
              tabIndex={0}
            >
              Data Lake Native
              <span className="block text-xs text-gray-400 mt-1">
                Parquet, Delta, Iceberg
              </span>
            </FlowNode>
          </DiagramTooltip>

          <DiagramTooltip
            content={
              <div>
                <strong>ML Integration</strong>
                <p className="mt-1">
                  Spark MLlib ecosystem для feature engineering и model training.
                  Можно использовать streaming data для online ML.
                </p>
              </div>
            }
          >
            <FlowNode
              variant="connector"
              className="bg-purple-500/20 border-purple-400/30 text-purple-200"
              size="sm"
              tabIndex={0}
            >
              ML Integration
              <span className="block text-xs text-gray-400 mt-1">
                Spark MLlib ecosystem
              </span>
            </FlowNode>
          </DiagramTooltip>
        </div>
      </DiagramContainer>
    </div>
  );
}

/**
 * StructuredStreamingConceptDiagram - Shows Structured Streaming conceptual model
 */
export function StructuredStreamingConceptDiagram() {
  return (
    <DiagramContainer
      title="Structured Streaming Conceptual Model"
      color="purple"
      description="Unbounded table abstraction для streaming data"
    >
      <div className="flex flex-col md:flex-row items-center gap-4 justify-center">
        {/* Input Stream */}
        <DiagramContainer
          title="Input Stream"
          color="blue"
          className="bg-blue-500/10 flex-1"
        >
          <div className="flex flex-col items-center gap-2">
            <DiagramTooltip
              content={
                <div>
                  <strong>Kafka Topic as Unbounded Table</strong>
                  <p className="mt-1">
                    Kafka topic рассматривается как unbounded table, где каждое
                    событие — это новая строка. Можно применять SQL-like операции.
                  </p>
                </div>
              }
            >
              <FlowNode variant="sink" size="sm" tabIndex={0}>
                Kafka Topic
                <span className="block text-xs text-blue-300 mt-1">
                  Unbounded table
                </span>
              </FlowNode>
            </DiagramTooltip>
          </div>
        </DiagramContainer>

        <Arrow direction="right" label="readStream" />

        {/* Spark Processing */}
        <DiagramContainer
          title="Spark Processing"
          color="purple"
          className="bg-purple-500/10 flex-1"
        >
          <div className="flex flex-col items-center gap-2">
            <DiagramTooltip
              content={
                <div>
                  <strong>DataFrame API</strong>
                  <p className="mt-1">
                    Те же операции, что и для batch: select, filter, groupBy,
                    join. DataFrame API работает одинаково для batch и streaming.
                  </p>
                </div>
              }
            >
              <FlowNode
                variant="connector"
                className="bg-purple-500/20 border-purple-400/30 text-purple-200"
                size="sm"
                tabIndex={0}
              >
                DataFrame API
              </FlowNode>
            </DiagramTooltip>

            <Arrow direction="down" />

            <DiagramTooltip
              content={
                <div>
                  <strong>Trigger Configuration</strong>
                  <p className="mt-1">
                    Trigger определяет частоту micro-batch обработки:
                    processingTime="30 seconds" или as fast as possible.
                  </p>
                </div>
              }
            >
              <FlowNode
                variant="connector"
                className="bg-amber-500/20 border-amber-400/30 text-amber-200"
                size="sm"
                tabIndex={0}
              >
                Trigger
                <span className="block text-xs text-gray-400 mt-1">
                  Micro-batch intervals
                </span>
              </FlowNode>
            </DiagramTooltip>
          </div>
        </DiagramContainer>

        <Arrow direction="right" label="writeStream" />

        {/* Output Stream */}
        <DiagramContainer
          title="Output Stream"
          color="emerald"
          className="bg-emerald-500/10 flex-1"
        >
          <div className="flex flex-col items-center gap-2">
            <DiagramTooltip
              content={
                <div>
                  <strong>Sink Configuration</strong>
                  <p className="mt-1">
                    Результаты пишутся в sink: Parquet (data lake), Kafka
                    (downstream processing), Console (debugging).
                  </p>
                </div>
              }
            >
              <FlowNode
                variant="cluster"
                size="sm"
                tabIndex={0}
              >
                Sink
                <span className="block text-xs text-gray-400 mt-1">
                  Parquet, Kafka, Console
                </span>
              </FlowNode>
            </DiagramTooltip>
          </div>
        </DiagramContainer>
      </div>

      <div className="mt-4 text-sm text-purple-400 border-l-2 border-purple-400 pl-3">
        <strong>Key Concept:</strong>
        <p className="mt-1 text-gray-300">
          Structured Streaming использует DataFrame API для унификации batch
          и streaming processing. Один код работает для обоих режимов.
        </p>
      </div>
    </DiagramContainer>
  );
}

/**
 * PysparkWatermarkDiagram - Shows late event handling with watermark
 */
export function PysparkWatermarkDiagram() {
  return (
    <DiagramContainer
      title="Watermark для Late Events"
      color="amber"
      description="PySpark отбрасывает события позже watermark threshold"
    >
      <div className="flex flex-col gap-4">
        {/* Timeline visualization */}
        <div className="flex items-center gap-2">
          <div className="text-xs text-gray-400 w-20">10:00</div>
          <div className="flex-1 h-px bg-gray-600" />
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="text-xs text-gray-400 w-20">10:01</div>
            <DiagramTooltip
              content={
                <div>
                  <strong>On-time Event</strong>
                  <p className="mt-1">
                    Событие прибыло в пределах watermark threshold.
                    Обрабатывается нормально.
                  </p>
                </div>
              }
            >
              <FlowNode
                variant="cluster"
                size="sm"
                className="flex-1"
                tabIndex={0}
              >
                Event at 10:01 (arrives 10:01)
              </FlowNode>
            </DiagramTooltip>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-xs text-gray-400 w-20">10:03</div>
            <DiagramTooltip
              content={
                <div>
                  <strong>On-time Event</strong>
                  <p className="mt-1">
                    Событие прибыло в пределах watermark. Window 10:00-10:05
                    еще не finalized.
                  </p>
                </div>
              }
            >
              <FlowNode
                variant="cluster"
                size="sm"
                className="flex-1"
                tabIndex={0}
              >
                Event at 10:03 (arrives 10:03)
              </FlowNode>
            </DiagramTooltip>
          </div>

          <div className="flex items-center gap-2">
            <div className="text-xs text-amber-400 w-20">10:05</div>
            <div className="flex-1 h-px bg-amber-600" />
            <span className="text-xs text-amber-300">Watermark threshold</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-xs text-gray-400 w-20">10:10</div>
            <DiagramTooltip
              content={
                <div>
                  <strong>Late Event - DROPPED</strong>
                  <p className="mt-1">
                    Событие с timestamp 10:02 прибыло в 10:10 — после
                    watermark. PySpark отбрасывает его silent data loss.
                  </p>
                  <p className="mt-2 text-rose-300">
                    Решение: увеличить watermark threshold или использовать
                    side output для late events.
                  </p>
                </div>
              }
            >
              <FlowNode
                variant="app"
                size="sm"
                className="flex-1 bg-rose-500/20 border-rose-400/30 text-rose-200"
                tabIndex={0}
              >
                Event at 10:02 (arrives 10:10!)
                <span className="block text-xs text-rose-400 mt-1">
                  ❌ Dropped (too late)
                </span>
              </FlowNode>
            </DiagramTooltip>
          </div>
        </div>

        <div className="mt-2 text-sm text-amber-400 border-l-2 border-amber-400 pl-3">
          <strong>Watermark Configuration:</strong>
          <p className="mt-1 text-gray-300">
            <code className="text-xs bg-gray-800 px-2 py-1 rounded">
              .withWatermark("event_time", "10 minutes")
            </code>
          </p>
          <p className="mt-2 text-gray-300">
            События с event_time более чем на 10 минут старше текущего
            max(event_time) будут отброшены.
          </p>
        </div>
      </div>
    </DiagramContainer>
  );
}

/**
 * MicroBatchVsContinuousDiagram - Comparison of processing modes
 */
export function MicroBatchVsContinuousDiagram() {
  return (
    <DiagramContainer
      title="Micro-batch vs Continuous Processing"
      color="neutral"
      description="Выбор режима обработки влияет на latency и stability"
    >
      <div className="flex flex-col md:flex-row gap-6">
        {/* Micro-batch Mode */}
        <DiagramContainer
          title="Micro-batch (Default)"
          color="amber"
          className="flex-1 bg-amber-500/10"
          recommended
        >
          <div className="flex flex-col gap-3">
            <DiagramTooltip
              content={
                <div>
                  <strong>Batch as Transaction</strong>
                  <p className="mt-1">
                    Каждый micro-batch обрабатывается как отдельная транзакция.
                    Если batch fails — весь batch retries.
                  </p>
                </div>
              }
            >
              <div className="text-sm text-gray-300 p-3 bg-gray-800/50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-amber-400" />
                  <span className="font-medium text-amber-300">
                    Каждый batch как отдельная транзакция
                  </span>
                </div>
                <p className="text-xs text-gray-400">
                  Checkpoint между batches для fault tolerance
                </p>
              </div>
            </DiagramTooltip>

            <DiagramTooltip
              content={
                <div>
                  <strong>Latency ~100ms+</strong>
                  <p className="mt-1">
                    Micro-batch mode имеет latency от 100ms до нескольких секунд
                    в зависимости от trigger configuration.
                  </p>
                </div>
              }
            >
              <div className="text-sm text-gray-300 p-3 bg-gray-800/50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-amber-400" />
                  <span className="font-medium text-amber-300">
                    Latency ~100ms+
                  </span>
                </div>
                <p className="text-xs text-gray-400">
                  Configurable через trigger interval
                </p>
              </div>
            </DiagramTooltip>

            <DiagramTooltip
              content={
                <div>
                  <strong>Production Ready</strong>
                  <p className="mt-1">
                    Micro-batch mode — стабильный и проверенный временем режим.
                    Используется в production для CDC processing.
                  </p>
                </div>
              }
            >
              <div className="text-sm text-gray-300 p-3 bg-gray-800/50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="font-medium text-emerald-300">
                    Стабильный и проверенный режим
                  </span>
                </div>
                <p className="text-xs text-gray-400">
                  Recommended для CDC → data lake pipelines
                </p>
              </div>
            </DiagramTooltip>
          </div>
        </DiagramContainer>

        {/* Continuous Mode */}
        <DiagramContainer
          title="Continuous (Experimental)"
          color="rose"
          className="flex-1 bg-rose-500/10"
        >
          <div className="flex flex-col gap-3">
            <DiagramTooltip
              content={
                <div>
                  <strong>Event-by-Event</strong>
                  <p className="mt-1">
                    Continuous mode обрабатывает события по мере поступления,
                    без batching. Похоже на PyFlink.
                  </p>
                </div>
              }
            >
              <div className="text-sm text-gray-300 p-3 bg-gray-800/50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-rose-400" />
                  <span className="font-medium text-rose-300">
                    Event-by-event processing
                  </span>
                </div>
                <p className="text-xs text-gray-400">
                  No batching overhead
                </p>
              </div>
            </DiagramTooltip>

            <DiagramTooltip
              content={
                <div>
                  <strong>Low Latency</strong>
                  <p className="mt-1">
                    Latency ~1ms — сопоставимо с PyFlink. Но stability issues
                    в Spark 4.x.
                  </p>
                </div>
              }
            >
              <div className="text-sm text-gray-300 p-3 bg-gray-800/50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-rose-400" />
                  <span className="font-medium text-rose-300">
                    Latency ~1ms
                  </span>
                </div>
                <p className="text-xs text-gray-400">
                  Ultra-low latency processing
                </p>
              </div>
            </DiagramTooltip>

            <DiagramTooltip
              content={
                <div>
                  <strong>Experimental Status</strong>
                  <p className="mt-1">
                    Continuous mode — экспериментальный в Spark 4.x. Не
                    рекомендуется для production CDC pipelines.
                  </p>
                  <p className="mt-2 text-rose-300">
                    Если нужна низкая latency — используйте PyFlink.
                  </p>
                </div>
              }
            >
              <div className="text-sm text-gray-300 p-3 bg-gray-800/50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-rose-400" />
                  <span className="font-medium text-rose-300">
                    Экспериментальный режим
                  </span>
                </div>
                <p className="text-xs text-gray-400">
                  Not recommended для production
                </p>
              </div>
            </DiagramTooltip>
          </div>
        </DiagramContainer>
      </div>

      <div className="mt-4 text-sm text-amber-400 border-l-2 border-amber-400 pl-3">
        <strong>Рекомендация для CDC:</strong>
        <p className="mt-1 text-gray-300">
          Используйте micro-batch mode с trigger interval 30-60 seconds.
          Continuous mode нестабилен и не нужен для CDC → data lake use case.
        </p>
      </div>
    </DiagramContainer>
  );
}
