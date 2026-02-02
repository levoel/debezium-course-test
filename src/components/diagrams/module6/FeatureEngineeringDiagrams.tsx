/**
 * Feature Engineering Diagrams
 *
 * Exports:
 * - BatchFeaturesProblemDiagram: Traditional batch features with staleness issue
 * - RealTimeFeaturesPipelineDiagram: CDC-driven real-time features
 * - CustomerBehaviorFeaturesDiagram: Multi-layer feature architecture
 * - FeatureStoreArchitectureDiagram: Dual-write pattern (online + offline store)
 */

import { FlowNode } from '../primitives/FlowNode';
import { Arrow } from '../primitives/Arrow';
import { DiagramContainer } from '../primitives/DiagramContainer';
import { DiagramTooltip } from '../primitives/Tooltip';

/**
 * BatchFeaturesProblemDiagram - Shows traditional batch features with staleness
 */
export function BatchFeaturesProblemDiagram() {
  return (
    <DiagramContainer
      title="Traditional Batch Features (Проблема Staleness)"
      color="amber"
      description="Features обновляются раз в сутки — устаревают на 12-24 часа"
    >
      <div className="flex flex-col md:flex-row items-center gap-4 justify-center flex-wrap">
        <DiagramTooltip
          content={
            <div>
              <strong>Source Database</strong>
              <p className="mt-1">
                PostgreSQL с transactional data. Full dump или periodic batch
                extract раз в день.
              </p>
            </div>
          }
        >
          <FlowNode variant="database" size="sm" tabIndex={0}>
            PostgreSQL
          </FlowNode>
        </DiagramTooltip>

        <Arrow direction="right" label="Daily dump" />

        <DiagramTooltip
          content={
            <div>
              <strong>ETL Job (Runs at 2am)</strong>
              <p className="mt-1">
                Batch ETL job запускается по расписанию (например, в 2am).
                Читает полный dump базы и вычисляет features.
              </p>
              <p className="mt-2 text-amber-300">
                Проблема: к моменту запуска данные уже устаревшие.
              </p>
            </div>
          }
        >
          <FlowNode
            variant="connector"
            className="bg-amber-500/20 border-amber-400/30 text-amber-200"
            tabIndex={0}
          >
            ETL Job
            <span className="block text-xs text-gray-400 mt-1">
              Runs at 2am
            </span>
          </FlowNode>
        </DiagramTooltip>

        <Arrow direction="right" label="Extract" />

        <DiagramTooltip
          content={
            <div>
              <strong>Data Warehouse</strong>
              <p className="mt-1">
                Data warehouse с aggregated features. Обновляется раз в сутки.
              </p>
            </div>
          }
        >
          <FlowNode variant="sink" size="sm" tabIndex={0}>
            Data Warehouse
          </FlowNode>
        </DiagramTooltip>

        <Arrow direction="right" label="Feature query" />

        <DiagramTooltip
          content={
            <div>
              <strong>Feature Store</strong>
              <p className="mt-1">
                Feature Store с daily features. Features обновляются раз в
                сутки. К моменту prediction могут быть устаревшими на 12-24
                часа.
              </p>
              <p className="mt-2 text-amber-300">
                Staleness: features могут быть old на 12-24 часа.
              </p>
            </div>
          }
        >
          <FlowNode
            variant="cluster"
            className="bg-amber-500/20 border-amber-400/30 text-amber-200"
            tabIndex={0}
          >
            Feature Store
          </FlowNode>
        </DiagramTooltip>

        <Arrow direction="right" label="Lookup" />

        <DiagramTooltip
          content={
            <div>
              <strong>ML Model (Inference)</strong>
              <p className="mt-1">
                ML модель использует features для prediction. Получает stale
                features (устаревшие на 12-24 часа).
              </p>
              <p className="mt-2 text-rose-300">
                Риск: fraud detection — мошенник совершает 50 транзакций, пока
                features обновятся.
              </p>
            </div>
          }
        >
          <FlowNode variant="app" size="sm" tabIndex={0}>
            ML Model
            <span className="block text-xs text-gray-400 mt-1">
              Features (12h old)
            </span>
          </FlowNode>
        </DiagramTooltip>
      </div>

      <div className="mt-4 text-sm text-amber-400 border-l-2 border-amber-400 pl-3">
        <strong>Проблема:</strong>
        <p className="mt-1 text-gray-300">
          Features обновляются раз в сутки. К моменту prediction могут быть
          устаревшими на 12-24 часа. Fraud detection: мошенник успеет совершить
          50 транзакций, пока features обновятся.
        </p>
      </div>
    </DiagramContainer>
  );
}

/**
 * RealTimeFeaturesPipelineDiagram - Shows CDC-driven real-time features
 */
export function RealTimeFeaturesPipelineDiagram() {
  return (
    <DiagramContainer
      title="Real-time CDC Features"
      color="emerald"
      description="Features обновляются при каждом CDC событии (latency в секундах)"
    >
      <div className="flex flex-col md:flex-row items-center gap-4 justify-center flex-wrap">
        <DiagramTooltip
          content={
            <div>
              <strong>Source Database</strong>
              <p className="mt-1">
                PostgreSQL с transactional data. CDC захватывает изменения в
                real-time через logical replication.
              </p>
            </div>
          }
        >
          <FlowNode variant="database" size="sm" tabIndex={0}>
            PostgreSQL
          </FlowNode>
        </DiagramTooltip>

        <Arrow direction="right" label="CDC events" />

        <DiagramTooltip
          content={
            <div>
              <strong>Kafka Stream</strong>
              <p className="mt-1">
                Debezium публикует CDC события в Kafka. Latency в миллисекундах
                вместо часов.
              </p>
              <p className="mt-2 text-emerald-300">
                Преимущество: continuous stream изменений, не batch dumps.
              </p>
            </div>
          }
        >
          <FlowNode variant="cluster" size="sm" tabIndex={0}>
            Kafka
            <span className="block text-xs text-gray-400 mt-1">
              ms latency
            </span>
          </FlowNode>
        </DiagramTooltip>

        <Arrow direction="right" label="Read stream" />

        <DiagramTooltip
          content={
            <div>
              <strong>PySpark Feature Computation</strong>
              <p className="mt-1">
                PySpark Structured Streaming вычисляет features из CDC событий
                в real-time. Window aggregations с watermark.
              </p>
              <p className="mt-2 text-emerald-300">
                Features обновляются при каждом CDC событии. Latency в
                секундах, не часах.
              </p>
            </div>
          }
        >
          <FlowNode
            variant="connector"
            className="bg-emerald-500/20 border-emerald-400/30 text-emerald-200"
            tabIndex={0}
          >
            PySpark
            <span className="block text-xs text-gray-400 mt-1">
              Feature Computation
            </span>
          </FlowNode>
        </DiagramTooltip>

        <Arrow direction="right" label="Compute" />

        <DiagramTooltip
          content={
            <div>
              <strong>Fresh Features</strong>
              <p className="mt-1">
                Features вычислены из последних CDC событий. Свежесть в
                секундах, не часах.
              </p>
            </div>
          }
        >
          <FlowNode
            variant="connector"
            className="bg-emerald-500/20 border-emerald-400/30 text-emerald-200"
            size="sm"
            tabIndex={0}
          >
            Fresh features
            <span className="block text-xs text-gray-400 mt-1">
              seconds old
            </span>
          </FlowNode>
        </DiagramTooltip>

        <Arrow direction="right" label="Write" />

        <DiagramTooltip
          content={
            <div>
              <strong>Feature Store (Redis)</strong>
              <p className="mt-1">
                Redis — online feature store для low-latency lookups (μs).
                Features обновляются при каждом CDC событии.
              </p>
              <p className="mt-2 text-emerald-300">
                Real-time inference: модель видит последние транзакции клиента.
              </p>
            </div>
          }
        >
          <FlowNode
            variant="cluster"
            className="bg-emerald-500/20 border-emerald-400/30 text-emerald-200"
            tabIndex={0}
          >
            Feature Store
            <span className="block text-xs text-gray-400 mt-1">Redis</span>
          </FlowNode>
        </DiagramTooltip>

        <Arrow direction="right" label="Real-time lookup" />

        <DiagramTooltip
          content={
            <div>
              <strong>ML Model (Inference)</strong>
              <p className="mt-1">
                ML модель использует fresh features для prediction. Видит
                последние транзакции клиента в real-time.
              </p>
              <p className="mt-2 text-emerald-300">
                Fraud detection: модель обнаруживает anomalies в течение
                секунд, не часов.
              </p>
            </div>
          }
        >
          <FlowNode variant="app" size="sm" tabIndex={0}>
            ML Model
          </FlowNode>
        </DiagramTooltip>
      </div>

      <div className="mt-4 text-sm text-emerald-400 border-l-2 border-emerald-400 pl-3">
        <strong>Преимущество:</strong>
        <p className="mt-1 text-gray-300">
          Features обновляются при каждом CDC событии. Latency в секундах, не
          часах. Fraud detection: модель видит последние транзакции клиента в
          реальном времени.
        </p>
      </div>
    </DiagramContainer>
  );
}

/**
 * CustomerBehaviorFeaturesDiagram - Shows multi-layer feature architecture
 */
export function CustomerBehaviorFeaturesDiagram() {
  return (
    <DiagramContainer
      title="Customer Behavior Features Architecture"
      color="purple"
      description="4-слойная архитектура: Source → CDC → Computation → Store"
    >
      <div className="flex flex-col gap-6">
        {/* Source Database Layer */}
        <DiagramContainer
          title="Source Database"
          color="blue"
          className="bg-blue-500/10"
        >
          <div className="flex justify-center">
            <DiagramTooltip
              content={
                <div>
                  <strong>Orders Table (PostgreSQL)</strong>
                  <p className="mt-1">
                    PostgreSQL с transactional orders data. Каждый INSERT,
                    UPDATE, DELETE захватывается через CDC.
                  </p>
                </div>
              }
            >
              <FlowNode variant="database" tabIndex={0}>
                orders table
                <span className="block text-xs text-gray-400 mt-1">
                  PostgreSQL
                </span>
              </FlowNode>
            </DiagramTooltip>
          </div>
        </DiagramContainer>

        <div className="flex justify-center">
          <Arrow direction="down" label="CDC capture" />
        </div>

        {/* CDC Layer */}
        <DiagramContainer
          title="CDC Layer"
          color="emerald"
          className="bg-emerald-500/10"
        >
          <div className="flex flex-col md:flex-row items-center gap-4 justify-center">
            <DiagramTooltip
              content={
                <div>
                  <strong>Debezium Connector</strong>
                  <p className="mt-1">
                    Debezium PostgreSQL connector захватывает CDC события через
                    logical replication. Latency в миллисекундах.
                  </p>
                </div>
              }
            >
              <FlowNode variant="connector" tabIndex={0}>
                Debezium Connector
              </FlowNode>
            </DiagramTooltip>

            <Arrow direction="right" label="Publish" />

            <DiagramTooltip
              content={
                <div>
                  <strong>Kafka Topic</strong>
                  <p className="mt-1">
                    Kafka topic с CDC событиями. Continuous stream изменений
                    для downstream processing.
                  </p>
                </div>
              }
            >
              <FlowNode variant="cluster" tabIndex={0}>
                Kafka Topic
                <span className="block text-xs text-gray-400 mt-1">
                  dbserver1.public.orders
                </span>
              </FlowNode>
            </DiagramTooltip>
          </div>
        </DiagramContainer>

        <div className="flex justify-center">
          <Arrow direction="down" label="Read stream" />
        </div>

        {/* Feature Computation Layer */}
        <DiagramContainer
          title="Feature Computation"
          color="purple"
          className="bg-purple-500/10"
        >
          <div className="flex flex-col md:flex-row items-center gap-4 justify-center">
            <DiagramTooltip
              content={
                <div>
                  <strong>PySpark Streaming</strong>
                  <p className="mt-1">
                    PySpark Structured Streaming вычисляет customer features:
                    order_count_30d, total_spend_30d, avg_order_value_30d.
                  </p>
                  <p className="mt-2">
                    Window aggregations с 30-day tumbling window.
                  </p>
                </div>
              }
            >
              <FlowNode
                variant="connector"
                className="bg-purple-500/20 border-purple-400/30 text-purple-200"
                tabIndex={0}
              >
                PySpark Streaming
                <span className="block text-xs text-gray-400 mt-1">
                  Window aggregations
                </span>
              </FlowNode>
            </DiagramTooltip>

            <DiagramTooltip
              content={
                <div>
                  <strong>Watermark (1 hour late data)</strong>
                  <p className="mt-1">
                    Watermark позволяет обрабатывать late-arriving events
                    (события с опозданием до 1 часа).
                  </p>
                  <p className="mt-2 text-purple-300">
                    Events старше 1 часа от watermark будут dropped.
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
                Watermark
                <span className="block text-xs text-gray-400 mt-1">
                  1 hour late data
                </span>
              </FlowNode>
            </DiagramTooltip>
          </div>
        </DiagramContainer>

        <div className="flex justify-center">
          <Arrow direction="down" label="foreachBatch" />
        </div>

        {/* Feature Store Layer */}
        <DiagramContainer
          title="Feature Store (Dual Write)"
          color="amber"
          className="bg-amber-500/10"
        >
          <div className="flex flex-col md:flex-row items-center gap-4 justify-center">
            <DiagramTooltip
              content={
                <div>
                  <strong>Redis (Online Store)</strong>
                  <p className="mt-1">
                    Redis — online feature store для real-time inference. Low
                    latency reads (μs). Point lookups по customer_id.
                  </p>
                  <p className="mt-2 text-emerald-300">
                    Use case: Real-time ML model serving.
                  </p>
                </div>
              }
            >
              <FlowNode
                variant="cluster"
                className="bg-emerald-500/20 border-emerald-400/30 text-emerald-200"
                tabIndex={0}
              >
                Redis
                <span className="block text-xs text-gray-400 mt-1">
                  Online Store
                </span>
              </FlowNode>
            </DiagramTooltip>

            <DiagramTooltip
              content={
                <div>
                  <strong>Parquet (Offline Store)</strong>
                  <p className="mt-1">
                    Parquet files в data lake — offline feature store для batch
                    training. Historical features для model training.
                  </p>
                  <p className="mt-2 text-blue-300">
                    Use case: Model training, feature drift analysis.
                  </p>
                </div>
              }
            >
              <FlowNode
                variant="sink"
                className="bg-blue-500/20 border-blue-400/30 text-blue-200"
                tabIndex={0}
              >
                Parquet
                <span className="block text-xs text-gray-400 mt-1">
                  Offline Store
                </span>
              </FlowNode>
            </DiagramTooltip>
          </div>
        </DiagramContainer>
      </div>

      <div className="mt-4 text-sm text-purple-400 border-l-2 border-purple-400 pl-3">
        <strong>Multi-layer architecture:</strong>
        <p className="mt-1 text-gray-300">
          4-слойная архитектура разделяет concerns: source → CDC → computation
          → store. CDC Layer обеспечивает real-time capture. Computation Layer
          вычисляет features. Store Layer обеспечивает dual write: Redis для
          online inference, Parquet для offline training.
        </p>
      </div>
    </DiagramContainer>
  );
}

/**
 * FeatureStoreArchitectureDiagram - Shows dual-write pattern
 */
export function FeatureStoreArchitectureDiagram() {
  return (
    <DiagramContainer
      title="Feature Store Dual-Write Pattern"
      color="neutral"
      description="Один feature computation → два outputs (online + offline)"
    >
      <div className="flex flex-col items-center gap-6">
        <DiagramTooltip
          content={
            <div>
              <strong>Feature Computation</strong>
              <p className="mt-1">
                PySpark Streaming вычисляет features из CDC событий. Window
                aggregations, derived features, behavioral metrics.
              </p>
              <p className="mt-2">
                Результат: computed features для каждого customer/product.
              </p>
            </div>
          }
        >
          <FlowNode
            variant="connector"
            className="bg-purple-500/20 border-purple-400/30 text-purple-200"
            tabIndex={0}
          >
            Feature Computation
            <span className="block text-xs text-gray-400 mt-1">
              PySpark Streaming
            </span>
          </FlowNode>
        </DiagramTooltip>

        <div className="flex flex-col md:flex-row items-center gap-8">
          {/* Left path: Online Store */}
          <div className="flex flex-col items-center gap-2">
            <Arrow direction="down" label="foreachBatch" />

            <DiagramContainer
              title="Online Store (Redis)"
              color="emerald"
              className="bg-emerald-500/10"
            >
              <div className="flex flex-col gap-3">
                <DiagramTooltip
                  content={
                    <div>
                      <strong>Redis Online Store</strong>
                      <p className="mt-1">
                        Redis — key-value store для real-time feature lookups.
                        Low latency reads (μs).
                      </p>
                    </div>
                  }
                >
                  <FlowNode
                    variant="cluster"
                    className="bg-emerald-500/20 border-emerald-400/30 text-emerald-200"
                    tabIndex={0}
                  >
                    Redis
                    <span className="block text-xs text-gray-400 mt-1">
                      customer:123:features
                    </span>
                  </FlowNode>
                </DiagramTooltip>

                <div className="text-sm text-gray-300 space-y-2">
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 mt-1.5" />
                    <div>
                      <div className="font-medium text-emerald-300">
                        Low latency reads (ms)
                      </div>
                      <div className="text-xs text-gray-400">
                        Point lookups by key
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 mt-1.5" />
                    <div>
                      <div className="font-medium text-emerald-300">
                        Last N values per entity
                      </div>
                      <div className="text-xs text-gray-400">
                        Recent features only
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 mt-1.5" />
                    <div>
                      <div className="font-medium text-emerald-300">
                        Use case: Real-time inference
                      </div>
                      <div className="text-xs text-gray-400">
                        ML model serving
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </DiagramContainer>
          </div>

          {/* Right path: Offline Store */}
          <div className="flex flex-col items-center gap-2">
            <Arrow direction="down" label="Batch export" />

            <DiagramContainer
              title="Offline Store (Parquet)"
              color="blue"
              className="bg-blue-500/10"
            >
              <div className="flex flex-col gap-3">
                <DiagramTooltip
                  content={
                    <div>
                      <strong>Parquet Offline Store</strong>
                      <p className="mt-1">
                        Parquet files в data lake — offline feature store для
                        batch training. Historical features.
                      </p>
                    </div>
                  }
                >
                  <FlowNode
                    variant="sink"
                    className="bg-blue-500/20 border-blue-400/30 text-blue-200"
                    tabIndex={0}
                  >
                    Parquet Files
                    <span className="block text-xs text-gray-400 mt-1">
                      S3 / Data Lake
                    </span>
                  </FlowNode>
                </DiagramTooltip>

                <div className="text-sm text-gray-300 space-y-2">
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-400 mt-1.5" />
                    <div>
                      <div className="font-medium text-blue-300">
                        Batch reads for training
                      </div>
                      <div className="text-xs text-gray-400">
                        Historical point-in-time
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-400 mt-1.5" />
                    <div>
                      <div className="font-medium text-blue-300">
                        Historical features
                      </div>
                      <div className="text-xs text-gray-400">
                        All history retained
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-400 mt-1.5" />
                    <div>
                      <div className="font-medium text-blue-300">
                        Use case: Feature drift analysis
                      </div>
                      <div className="text-xs text-gray-400">
                        Model training
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </DiagramContainer>
          </div>
        </div>
      </div>

      <div className="mt-4 text-sm text-gray-400 border-l-2 border-gray-400 pl-3">
        <strong>Dual-write pattern essential:</strong>
        <p className="mt-1 text-gray-300">
          Один feature computation → два outputs. Online Store (Redis) для
          real-time inference с low latency. Offline Store (Parquet) для batch
          training с historical features. Dual-write обеспечивает consistency
          между training и inference.
        </p>
      </div>
    </DiagramContainer>
  );
}
