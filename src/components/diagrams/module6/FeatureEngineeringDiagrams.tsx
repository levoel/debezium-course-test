/** @jsxImportSource solid-js */
/**
 * Feature Engineering Diagrams
 *
 * Exports:
 * - BatchFeaturesProblemDiagram: Traditional batch features with staleness issue
 * - RealTimeFeaturesPipelineDiagram: CDC-driven real-time features
 * - CustomerBehaviorFeaturesDiagram: Multi-layer feature architecture
 * - FeatureStoreArchitectureDiagram: Dual-write pattern (online + offline store)
 */

import { FlowNode } from '@primitives/FlowNode';
import { Arrow } from '@primitives/Arrow';
import { DiagramContainer } from '@primitives/DiagramContainer';
import { DiagramTooltip } from '@primitives/Tooltip';

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
      <div class="flex flex-col md:flex-row items-center gap-4 justify-center flex-wrap">
        <DiagramTooltip
          content={
            <div>
              <strong>Source Database</strong>
              <p class="mt-1">
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
              <p class="mt-1">
                Batch ETL job запускается по расписанию (например, в 2am).
                Читает полный dump базы и вычисляет features.
              </p>
              <p class="mt-2 text-amber-700">
                Проблема: к моменту запуска данные уже устаревшие.
              </p>
            </div>
          }
        >
          <FlowNode
            variant="connector"
            className="bg-amber-500/20 border-amber-400/30 text-amber-700"
            tabIndex={0}
          >
            ETL Job
            <span class="block text-xs text-[var(--ink-muted)] mt-1">
              Runs at 2am
            </span>
          </FlowNode>
        </DiagramTooltip>

        <Arrow direction="right" label="Extract" />

        <DiagramTooltip
          content={
            <div>
              <strong>Data Warehouse</strong>
              <p class="mt-1">
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
              <p class="mt-1">
                Feature Store с daily features. Features обновляются раз в
                сутки. К моменту prediction могут быть устаревшими на 12-24
                часа.
              </p>
              <p class="mt-2 text-amber-700">
                Staleness: features могут быть old на 12-24 часа.
              </p>
            </div>
          }
        >
          <FlowNode
            variant="cluster"
            className="bg-amber-500/20 border-amber-400/30 text-amber-700"
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
              <p class="mt-1">
                ML модель использует features для prediction. Получает stale
                features (устаревшие на 12-24 часа).
              </p>
              <p class="mt-2 text-rose-700">
                Риск: fraud detection — мошенник совершает 50 транзакций, пока
                features обновятся.
              </p>
            </div>
          }
        >
          <FlowNode variant="app" size="sm" tabIndex={0}>
            ML Model
            <span class="block text-xs text-[var(--ink-muted)] mt-1">
              Features (12h old)
            </span>
          </FlowNode>
        </DiagramTooltip>
      </div>

      <div class="mt-4 text-sm text-amber-400 border-l-2 border-amber-400 pl-3">
        <strong>Проблема:</strong>
        <p class="mt-1 text-[var(--ink-default)]">
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
      <div class="flex flex-col md:flex-row items-center gap-4 justify-center flex-wrap">
        <DiagramTooltip
          content={
            <div>
              <strong>Source Database</strong>
              <p class="mt-1">
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
              <p class="mt-1">
                Debezium публикует CDC события в Kafka. Latency в миллисекундах
                вместо часов.
              </p>
              <p class="mt-2 text-emerald-700">
                Преимущество: continuous stream изменений, не batch dumps.
              </p>
            </div>
          }
        >
          <FlowNode variant="cluster" size="sm" tabIndex={0}>
            Kafka
            <span class="block text-xs text-[var(--ink-muted)] mt-1">
              ms latency
            </span>
          </FlowNode>
        </DiagramTooltip>

        <Arrow direction="right" label="Read stream" />

        <DiagramTooltip
          content={
            <div>
              <strong>PySpark Feature Computation</strong>
              <p class="mt-1">
                PySpark Structured Streaming вычисляет features из CDC событий
                в real-time. Window aggregations с watermark.
              </p>
              <p class="mt-2 text-emerald-700">
                Features обновляются при каждом CDC событии. Latency в
                секундах, не часах.
              </p>
            </div>
          }
        >
          <FlowNode
            variant="connector"
            className="bg-emerald-500/20 border-emerald-400/30 text-emerald-700"
            tabIndex={0}
          >
            PySpark
            <span class="block text-xs text-[var(--ink-muted)] mt-1">
              Feature Computation
            </span>
          </FlowNode>
        </DiagramTooltip>

        <Arrow direction="right" label="Compute" />

        <DiagramTooltip
          content={
            <div>
              <strong>Fresh Features</strong>
              <p class="mt-1">
                Features вычислены из последних CDC событий. Свежесть в
                секундах, не часах.
              </p>
            </div>
          }
        >
          <FlowNode
            variant="connector"
            className="bg-emerald-500/20 border-emerald-400/30 text-emerald-700"
            size="sm"
            tabIndex={0}
          >
            Fresh features
            <span class="block text-xs text-[var(--ink-muted)] mt-1">
              seconds old
            </span>
          </FlowNode>
        </DiagramTooltip>

        <Arrow direction="right" label="Write" />

        <DiagramTooltip
          content={
            <div>
              <strong>Feature Store (Redis)</strong>
              <p class="mt-1">
                Redis — online feature store для low-latency lookups (μs).
                Features обновляются при каждом CDC событии.
              </p>
              <p class="mt-2 text-emerald-700">
                Real-time inference: модель видит последние транзакции клиента.
              </p>
            </div>
          }
        >
          <FlowNode
            variant="cluster"
            className="bg-emerald-500/20 border-emerald-400/30 text-emerald-700"
            tabIndex={0}
          >
            Feature Store
            <span class="block text-xs text-[var(--ink-muted)] mt-1">Redis</span>
          </FlowNode>
        </DiagramTooltip>

        <Arrow direction="right" label="Real-time lookup" />

        <DiagramTooltip
          content={
            <div>
              <strong>ML Model (Inference)</strong>
              <p class="mt-1">
                ML модель использует fresh features для prediction. Видит
                последние транзакции клиента в real-time.
              </p>
              <p class="mt-2 text-emerald-700">
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

      <div class="mt-4 text-sm text-emerald-400 border-l-2 border-emerald-400 pl-3">
        <strong>Преимущество:</strong>
        <p class="mt-1 text-[var(--ink-default)]">
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
      <div class="flex flex-col gap-6">
        {/* Source Database Layer */}
        <DiagramContainer
          title="Source Database"
          color="blue"
          className="bg-blue-500/10"
        >
          <div class="flex justify-center">
            <DiagramTooltip
              content={
                <div>
                  <strong>Orders Table (PostgreSQL)</strong>
                  <p class="mt-1">
                    PostgreSQL с transactional orders data. Каждый INSERT,
                    UPDATE, DELETE захватывается через CDC.
                  </p>
                </div>
              }
            >
              <FlowNode variant="database" tabIndex={0}>
                orders table
                <span class="block text-xs text-[var(--ink-muted)] mt-1">
                  PostgreSQL
                </span>
              </FlowNode>
            </DiagramTooltip>
          </div>
        </DiagramContainer>

        <div class="flex justify-center">
          <Arrow direction="down" label="CDC capture" />
        </div>

        {/* CDC Layer */}
        <DiagramContainer
          title="CDC Layer"
          color="emerald"
          className="bg-emerald-500/10"
        >
          <div class="flex flex-col md:flex-row items-center gap-4 justify-center">
            <DiagramTooltip
              content={
                <div>
                  <strong>Debezium Connector</strong>
                  <p class="mt-1">
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
                  <p class="mt-1">
                    Kafka topic с CDC событиями. Continuous stream изменений
                    для downstream processing.
                  </p>
                </div>
              }
            >
              <FlowNode variant="cluster" tabIndex={0}>
                Kafka Topic
                <span class="block text-xs text-[var(--ink-muted)] mt-1">
                  dbserver1.public.orders
                </span>
              </FlowNode>
            </DiagramTooltip>
          </div>
        </DiagramContainer>

        <div class="flex justify-center">
          <Arrow direction="down" label="Read stream" />
        </div>

        {/* Feature Computation Layer */}
        <DiagramContainer
          title="Feature Computation"
          color="purple"
          className="bg-purple-500/10"
        >
          <div class="flex flex-col md:flex-row items-center gap-4 justify-center">
            <DiagramTooltip
              content={
                <div>
                  <strong>PySpark Streaming</strong>
                  <p class="mt-1">
                    PySpark Structured Streaming вычисляет customer features:
                    order_count_30d, total_spend_30d, avg_order_value_30d.
                  </p>
                  <p class="mt-2">
                    Window aggregations с 30-day tumbling window.
                  </p>
                </div>
              }
            >
              <FlowNode
                variant="connector"
                className="bg-purple-500/20 border-purple-400/30 text-purple-700"
                tabindex={0}
              >
                PySpark Streaming
                <span class="block text-xs text-[var(--ink-muted)] mt-1">
                  Window aggregations
                </span>
              </FlowNode>
            </DiagramTooltip>

            <DiagramTooltip
              content={
                <div>
                  <strong>Watermark (1 hour late data)</strong>
                  <p class="mt-1">
                    Watermark позволяет обрабатывать late-arriving events
                    (события с опозданием до 1 часа).
                  </p>
                  <p class="mt-2 text-purple-700">
                    Events старше 1 часа от watermark будут dropped.
                  </p>
                </div>
              }
            >
              <FlowNode
                variant="connector"
                className="bg-purple-500/20 border-purple-400/30 text-purple-700"
                size="sm"
                tabindex={0}
              >
                Watermark
                <span class="block text-xs text-[var(--ink-muted)] mt-1">
                  1 hour late data
                </span>
              </FlowNode>
            </DiagramTooltip>
          </div>
        </DiagramContainer>

        <div class="flex justify-center">
          <Arrow direction="down" label="foreachBatch" />
        </div>

        {/* Feature Store Layer */}
        <DiagramContainer
          title="Feature Store (Dual Write)"
          color="amber"
          className="bg-amber-500/10"
        >
          <div class="flex flex-col md:flex-row items-center gap-4 justify-center">
            <DiagramTooltip
              content={
                <div>
                  <strong>Redis (Online Store)</strong>
                  <p class="mt-1">
                    Redis — online feature store для real-time inference. Low
                    latency reads (μs). Point lookups по customer_id.
                  </p>
                  <p class="mt-2 text-emerald-700">
                    Use case: Real-time ML model serving.
                  </p>
                </div>
              }
            >
              <FlowNode
                variant="cluster"
                className="bg-emerald-500/20 border-emerald-400/30 text-emerald-700"
                tabindex={0}
              >
                Redis
                <span class="block text-xs text-[var(--ink-muted)] mt-1">
                  Online Store
                </span>
              </FlowNode>
            </DiagramTooltip>

            <DiagramTooltip
              content={
                <div>
                  <strong>Parquet (Offline Store)</strong>
                  <p class="mt-1">
                    Parquet files в data lake — offline feature store для batch
                    training. Historical features для model training.
                  </p>
                  <p class="mt-2 text-blue-700">
                    Use case: Model training, feature drift analysis.
                  </p>
                </div>
              }
            >
              <FlowNode
                variant="sink"
                className="bg-blue-500/20 border-blue-400/30 text-blue-700"
                tabindex={0}
              >
                Parquet
                <span class="block text-xs text-[var(--ink-muted)] mt-1">
                  Offline Store
                </span>
              </FlowNode>
            </DiagramTooltip>
          </div>
        </DiagramContainer>
      </div>

      <div class="mt-4 text-sm text-purple-400 border-l-2 border-purple-400 pl-3">
        <strong>Multi-layer architecture:</strong>
        <p class="mt-1 text-[var(--ink-default)]">
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
      <div class="flex flex-col items-center gap-6">
        <DiagramTooltip
          content={
            <div>
              <strong>Feature Computation</strong>
              <p class="mt-1">
                PySpark Streaming вычисляет features из CDC событий. Window
                aggregations, derived features, behavioral metrics.
              </p>
              <p class="mt-2">
                Результат: computed features для каждого customer/product.
              </p>
            </div>
          }
        >
          <FlowNode
            variant="connector"
            className="bg-purple-500/20 border-purple-400/30 text-purple-700"
            tabindex={0}
          >
            Feature Computation
            <span class="block text-xs text-[var(--ink-muted)] mt-1">
              PySpark Streaming
            </span>
          </FlowNode>
        </DiagramTooltip>

        <div class="flex flex-col md:flex-row items-center gap-8">
          {/* Left path: Online Store */}
          <div class="flex flex-col items-center gap-2">
            <Arrow direction="down" label="foreachBatch" />

            <DiagramContainer
              title="Online Store (Redis)"
              color="emerald"
              className="bg-emerald-500/10"
            >
              <div class="flex flex-col gap-3">
                <DiagramTooltip
                  content={
                    <div>
                      <strong>Redis Online Store</strong>
                      <p class="mt-1">
                        Redis — key-value store для real-time feature lookups.
                        Low latency reads (μs).
                      </p>
                    </div>
                  }
                >
                  <FlowNode
                    variant="cluster"
                    className="bg-emerald-500/20 border-emerald-400/30 text-emerald-700"
                    tabindex={0}
                  >
                    Redis
                    <span class="block text-xs text-[var(--ink-muted)] mt-1">
                      customer:123:features
                    </span>
                  </FlowNode>
                </DiagramTooltip>

                <div class="text-sm text-[var(--ink-default)] space-y-2">
                  <div class="flex items-start gap-2">
                    <div class="w-2 h-2 rounded-full bg-emerald-400 mt-1.5" />
                    <div>
                      <div class="font-medium text-emerald-700">
                        Low latency reads (ms)
                      </div>
                      <div class="text-xs text-[var(--ink-muted)]">
                        Point lookups by key
                      </div>
                    </div>
                  </div>

                  <div class="flex items-start gap-2">
                    <div class="w-2 h-2 rounded-full bg-emerald-400 mt-1.5" />
                    <div>
                      <div class="font-medium text-emerald-700">
                        Last N values per entity
                      </div>
                      <div class="text-xs text-[var(--ink-muted)]">
                        Recent features only
                      </div>
                    </div>
                  </div>

                  <div class="flex items-start gap-2">
                    <div class="w-2 h-2 rounded-full bg-emerald-400 mt-1.5" />
                    <div>
                      <div class="font-medium text-emerald-700">
                        Use case: Real-time inference
                      </div>
                      <div class="text-xs text-[var(--ink-muted)]">
                        ML model serving
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </DiagramContainer>
          </div>

          {/* Right path: Offline Store */}
          <div class="flex flex-col items-center gap-2">
            <Arrow direction="down" label="Batch export" />

            <DiagramContainer
              title="Offline Store (Parquet)"
              color="blue"
              className="bg-blue-500/10"
            >
              <div class="flex flex-col gap-3">
                <DiagramTooltip
                  content={
                    <div>
                      <strong>Parquet Offline Store</strong>
                      <p class="mt-1">
                        Parquet files в data lake — offline feature store для
                        batch training. Historical features.
                      </p>
                    </div>
                  }
                >
                  <FlowNode
                    variant="sink"
                    className="bg-blue-500/20 border-blue-400/30 text-blue-700"
                    tabindex={0}
                  >
                    Parquet Files
                    <span class="block text-xs text-[var(--ink-muted)] mt-1">
                      S3 / Data Lake
                    </span>
                  </FlowNode>
                </DiagramTooltip>

                <div class="text-sm text-[var(--ink-default)] space-y-2">
                  <div class="flex items-start gap-2">
                    <div class="w-2 h-2 rounded-full bg-blue-400 mt-1.5" />
                    <div>
                      <div class="font-medium text-blue-700">
                        Batch reads for training
                      </div>
                      <div class="text-xs text-[var(--ink-muted)]">
                        Historical point-in-time
                      </div>
                    </div>
                  </div>

                  <div class="flex items-start gap-2">
                    <div class="w-2 h-2 rounded-full bg-blue-400 mt-1.5" />
                    <div>
                      <div class="font-medium text-blue-700">
                        Historical features
                      </div>
                      <div class="text-xs text-[var(--ink-muted)]">
                        All history retained
                      </div>
                    </div>
                  </div>

                  <div class="flex items-start gap-2">
                    <div class="w-2 h-2 rounded-full bg-blue-400 mt-1.5" />
                    <div>
                      <div class="font-medium text-blue-700">
                        Use case: Feature drift analysis
                      </div>
                      <div class="text-xs text-[var(--ink-muted)]">
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

      <div class="mt-4 text-sm text-[var(--ink-muted)] border-l-2 border-[var(--line-medium)] pl-3">
        <strong>Dual-write pattern essential:</strong>
        <p class="mt-1 text-[var(--ink-default)]">
          Один feature computation → два outputs. Online Store (Redis) для
          real-time inference с low latency. Offline Store (Parquet) для batch
          training с historical features. Dual-write обеспечивает consistency
          между training и inference.
        </p>
      </div>
    </DiagramContainer>
  );
}
