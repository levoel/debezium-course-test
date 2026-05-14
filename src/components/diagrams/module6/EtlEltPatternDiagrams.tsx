/** @jsxImportSource solid-js */
/**
 * ETL/ELT Pattern Diagrams
 *
 * Exports:
 * - TraditionalEtlDiagram: Classic ETL flow with staging area
 * (plus DataLakePartitionDiagram, DataLakeLabPartitionDiagram added below)
 * - ModernEltDiagram: ELT flow with CDC and data lake
 * - CdcToDataLakeDiagram: Multi-layer data lake architecture
 * - AppendOnlyHistoryDiagram: Metadata columns for append-only pattern
 * - OperationSeparationDiagram: Branching by operation type
 */

import { FlowNode } from '@primitives/FlowNode';
import { Arrow } from '@primitives/Arrow';
import { DiagramContainer } from '@primitives/DiagramContainer';
import { DiagramTooltip } from '@primitives/Tooltip';

/**
 * TraditionalEtlDiagram - Shows traditional ETL pattern
 */
export function TraditionalEtlDiagram() {
  return (
    <DiagramContainer
      title="Traditional ETL Pattern"
      color="amber"
      description="Extract → Transform → Load с трансформациями перед загрузкой"
    >
      <div class="flex flex-col md:flex-row items-center gap-4 justify-center">
        <DiagramTooltip
          content={
            <div>
              <strong>Source Database</strong>
              <p class="mt-1">
                Extract: читаем данные из source database. Обычно через
                periodic batch queries или full table dumps.
              </p>
            </div>
          }
        >
          <FlowNode variant="database" size="sm" tabIndex={0}>
            Source DB
            <span class="block text-xs text-[var(--ink-muted)] mt-1">
              PostgreSQL
            </span>
          </FlowNode>
        </DiagramTooltip>

        <Arrow direction="right" label="Extract" />

        <DiagramTooltip
          content={
            <div>
              <strong>Staging Area</strong>
              <p class="mt-1">
                Временное хранилище для raw данных перед трансформациями.
                Обычно простая таблица или файловая система.
              </p>
            </div>
          }
        >
          <FlowNode variant="sink" size="sm" tabIndex={0}>
            Staging Area
          </FlowNode>
        </DiagramTooltip>

        <Arrow direction="right" label="Transform" />

        <DiagramTooltip
          content={
            <div>
              <strong>ETL Engine</strong>
              <p class="mt-1">
                Transform: применяем бизнес-логику, фильтрацию, агрегации,
                joins, data cleaning. Трансформации до загрузки в warehouse.
              </p>
              <ul class="mt-2 list-disc list-inside text-sm">
                <li>Data cleaning и validation</li>
                <li>Business rules application</li>
                <li>Aggregations и calculations</li>
                <li>Denormalization для analytics</li>
              </ul>
            </div>
          }
        >
          <FlowNode
            variant="connector"
            className="bg-amber-500/20 border-amber-400/30 text-amber-700"
            tabIndex={0}
          >
            ETL Engine
            <span class="block text-xs text-[var(--ink-muted)] mt-1">
              Filter, aggregate, join, clean
            </span>
          </FlowNode>
        </DiagramTooltip>

        <Arrow direction="right" label="Load" />

        <DiagramTooltip
          content={
            <div>
              <strong>Data Warehouse</strong>
              <p class="mt-1">
                Load: загружаем готовые, clean данные в warehouse. Данные уже
                трансформированы и готовы для analytics.
              </p>
              <p class="mt-2 text-emerald-700">
                Плюс: warehouse хранит только clean data. Минус: потеря raw data.
              </p>
            </div>
          }
        >
          <FlowNode
            variant="cluster"
            tabIndex={0}
          >
            Data Warehouse
            <span class="block text-xs text-emerald-700 mt-1">
              Clean, aggregated
            </span>
          </FlowNode>
        </DiagramTooltip>
      </div>

      <div class="mt-4 text-sm text-amber-400 border-l-2 border-amber-400 pl-3">
        <strong>Традиционный подход:</strong>
        <p class="mt-1 text-[var(--ink-default)]">
          ETL трансформирует данные перед загрузкой в warehouse. Проблема: нет
          raw data для re-processing, сложность изменений (новая метрика =
          переделка ETL).
        </p>
      </div>
    </DiagramContainer>
  );
}

/**
 * ModernEltDiagram - Shows modern ELT pattern with CDC
 */
export function ModernEltDiagram() {
  return (
    <DiagramContainer
      title="Modern ELT Pattern с CDC"
      color="emerald"
      description="Extract → Load → Transform с трансформациями в warehouse"
    >
      <div class="flex flex-col md:flex-row items-center gap-4 justify-center">
        <DiagramTooltip
          content={
            <div>
              <strong>Source Database</strong>
              <p class="mt-1">
                Extract: CDC (Debezium) захватывает изменения в real-time через
                logical replication. Incremental updates вместо full dumps.
              </p>
            </div>
          }
        >
          <FlowNode variant="database" size="sm" tabIndex={0}>
            Source DB
            <span class="block text-xs text-[var(--ink-muted)] mt-1">
              PostgreSQL
            </span>
          </FlowNode>
        </DiagramTooltip>

        <Arrow direction="right" label="Extract" />

        <DiagramTooltip
          content={
            <div>
              <strong>CDC Stream</strong>
              <p class="mt-1">
                Debezium публикует CDC события в Kafka. Continuous stream
                изменений вместо periodic batch extracts.
              </p>
            </div>
          }
        >
          <FlowNode variant="connector" size="sm" tabIndex={0}>
            CDC Stream
            <span class="block text-xs text-[var(--ink-muted)] mt-1">
              Debezium
            </span>
          </FlowNode>
        </DiagramTooltip>

        <Arrow direction="right" label="Load Raw" />

        <DiagramTooltip
          content={
            <div>
              <strong>Data Lake</strong>
              <p class="mt-1">
                Load: сырые CDC events пишутся в data lake (Parquet, Delta).
                Raw data сохранен для re-processing и audit.
              </p>
              <p class="mt-2 text-blue-700">
                Cheap storage (S3, Azure Blob) позволяет хранить all history.
              </p>
            </div>
          }
        >
          <FlowNode
            variant="sink"
            tabIndex={0}
          >
            Data Lake
            <span class="block text-xs text-blue-700 mt-1">
              Parquet, Delta
            </span>
          </FlowNode>
        </DiagramTooltip>

        <Arrow direction="right" label="Transform" />

        <DiagramTooltip
          content={
            <div>
              <strong>Data Warehouse</strong>
              <p class="mt-1">
                Transform: трансформации выполняются в warehouse через SQL, dbt,
                Spark SQL. Warehouse использует свою compute power.
              </p>
              <ul class="mt-2 list-disc list-inside text-sm">
                <li>dbt для declarative transformations</li>
                <li>Spark SQL для complex processing</li>
                <li>Materialized views для aggregations</li>
              </ul>
            </div>
          }
        >
          <FlowNode
            variant="cluster"
            tabindex={0}
          >
            Data Warehouse
            <span class="block text-xs text-[var(--ink-muted)] mt-1">
              dbt, Spark SQL
            </span>
          </FlowNode>
        </DiagramTooltip>
      </div>

      <div class="mt-4 text-sm text-emerald-400 border-l-2 border-emerald-400 pl-3">
        <strong>Современный подход:</strong>
        <p class="mt-1 text-[var(--ink-default)]">
          ELT загружает raw data в lake, трансформации в warehouse. Преимущества:
          raw data для re-processing, гибкость (новая метрика = новый SQL query),
          warehouse выполняет трансформации.
        </p>
      </div>
    </DiagramContainer>
  );
}

/**
 * CdcToDataLakeDiagram - Shows multi-layer data lake architecture
 */
export function CdcToDataLakeDiagram() {
  return (
    <DiagramContainer
      title="CDC → Data Lake: Multi-Layer Architecture"
      color="blue"
      description="Один CDC stream → несколько output layers"
    >
      <div class="flex flex-col gap-4">
        {/* Source Layer */}
        <DiagramTooltip
          content={
            <div>
              <strong>Transactional Database</strong>
              <p class="mt-1">
                Source database с customer changes. INSERT, UPDATE, DELETE
                операции захватываются через CDC.
              </p>
            </div>
          }
        >
          <div class="flex justify-center">
            <FlowNode variant="database" tabIndex={0}>
              Transactional Database
              <span class="block text-xs text-[var(--ink-muted)] mt-1">
                Customer changes (INSERT, UPDATE, DELETE)
              </span>
            </FlowNode>
          </div>
        </DiagramTooltip>

        <div class="flex justify-center">
          <Arrow direction="down" label="CDC capture" />
        </div>

        {/* Data Lake Layer */}
        <DiagramContainer
          title="Data Lake (Parquet)"
          color="blue"
          className="bg-blue-500/10"
        >
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Raw CDC Events */}
            <DiagramContainer
              title="Raw CDC events"
              color="blue"
              className="bg-blue-500/10"
            >
              <div class="flex flex-col gap-2">
                <DiagramTooltip
                  content={
                    <div>
                      <strong>Append-Only Log</strong>
                      <p class="mt-1">
                        Все CDC события сохраняются как append-only log. Never
                        update or delete. Полная история изменений.
                      </p>
                      <p class="mt-2 text-blue-700">
                        Use case: Audit trail, compliance (GDPR), time travel.
                      </p>
                    </div>
                  }
                >
                  <div class="text-sm text-[var(--ink-default)] p-3 bg-[var(--bg-sunken)] rounded-lg">
                    <div class="flex items-center gap-2 mb-2">
                      <div class="w-2 h-2 rounded-full bg-blue-400" />
                      <span class="font-medium text-blue-700">
                        Append-only log
                      </span>
                    </div>
                    <p class="text-xs text-[var(--ink-muted)]">
                      All change events
                    </p>
                    <p class="text-xs text-[var(--ink-muted)] mt-1">
                      + metadata columns
                    </p>
                  </div>
                </DiagramTooltip>
              </div>
            </DiagramContainer>

            {/* Latest Snapshot */}
            <DiagramContainer
              title="Latest snapshot"
              color="emerald"
              className="bg-emerald-500/10"
            >
              <div class="flex flex-col gap-2">
                <DiagramTooltip
                  content={
                    <div>
                      <strong>Current State</strong>
                      <p class="mt-1">
                        Latest snapshot — это current state каждой записи. Built
                        from raw events через MERGE или GROUP BY + LAST_VALUE.
                      </p>
                      <p class="mt-2 text-emerald-700">
                        Use case: Analytics queries, dashboards, reporting.
                      </p>
                    </div>
                  }
                >
                  <div class="text-sm text-[var(--ink-default)] p-3 bg-[var(--bg-sunken)] rounded-lg">
                    <div class="flex items-center gap-2 mb-2">
                      <div class="w-2 h-2 rounded-full bg-emerald-400" />
                      <span class="font-medium text-emerald-700">
                        Current state
                      </span>
                    </div>
                    <p class="text-xs text-[var(--ink-muted)]">
                      One row per entity
                    </p>
                    <p class="text-xs text-[var(--ink-muted)] mt-1">
                      Latest values only
                    </p>
                  </div>
                </DiagramTooltip>
              </div>
            </DiagramContainer>

            {/* Change History */}
            <DiagramContainer
              title="Change history"
              color="purple"
              className="bg-purple-500/10"
            >
              <div class="flex flex-col gap-2">
                <DiagramTooltip
                  content={
                    <div>
                      <strong>Audit Trail</strong>
                      <p class="mt-1">
                        Change history — это audit trail с timestamps. Можно
                        восстановить состояние на любую дату.
                      </p>
                      <p class="mt-2 text-purple-700">
                        Use case: Historical analysis, "what was the value on
                        2023-05-15?", regulatory compliance.
                      </p>
                    </div>
                  }
                >
                  <div class="text-sm text-[var(--ink-default)] p-3 bg-[var(--bg-sunken)] rounded-lg">
                    <div class="flex items-center gap-2 mb-2">
                      <div class="w-2 h-2 rounded-full bg-purple-400" />
                      <span class="font-medium text-purple-700">
                        Audit trail
                      </span>
                    </div>
                    <p class="text-xs text-[var(--ink-muted)]">
                      All historical values
                    </p>
                    <p class="text-xs text-[var(--ink-muted)] mt-1">
                      With timestamps
                    </p>
                  </div>
                </DiagramTooltip>
              </div>
            </DiagramContainer>
          </div>
        </DiagramContainer>

        <div class="mt-2 text-sm text-blue-400 border-l-2 border-blue-400 pl-3">
          <strong>Три слоя data lake:</strong>
          <p class="mt-1 text-[var(--ink-default)]">
            CDC stream записывается как raw events (append-only). Downstream
            processing создает snapshot (current state) и history (audit trail).
            Один source → три output layers для разных use cases.
          </p>
        </div>
      </div>
    </DiagramContainer>
  );
}

/**
 * AppendOnlyHistoryDiagram - Shows metadata columns for append-only pattern
 */
export function AppendOnlyHistoryDiagram() {
  return (
    <DiagramContainer
      title="Append-Only History с Metadata"
      color="purple"
      description="Добавление metadata columns для downstream processing"
    >
      <div class="flex flex-col items-center gap-4">
        <DiagramTooltip
          content={
            <div>
              <strong>Source Database</strong>
              <p class="mt-1">
                PostgreSQL или MySQL с transactional data. CDC capture через
                logical replication.
              </p>
            </div>
          }
        >
          <FlowNode variant="database" size="sm" tabindex={0}>
            Source Database
          </FlowNode>
        </DiagramTooltip>

        <Arrow direction="down" />

        <DiagramTooltip
          content={
            <div>
              <strong>Debezium CDC</strong>
              <p class="mt-1">
                Debezium connector захватывает изменения и публикует в Kafka.
                CDC envelope содержит before/after state и metadata.
              </p>
            </div>
          }
        >
          <FlowNode variant="connector" size="sm" tabindex={0}>
            Debezium
          </FlowNode>
        </DiagramTooltip>

        <Arrow direction="down" />

        <DiagramTooltip
          content={
            <div>
              <strong>Kafka Topic</strong>
              <p class="mt-1">
                CDC события в Kafka topic. PySpark читает через readStream.
              </p>
            </div>
          }
        >
          <FlowNode variant="sink" size="sm" tabindex={0}>
            Kafka Topic
          </FlowNode>
        </DiagramTooltip>

        <Arrow direction="down" />

        <DiagramTooltip
          content={
            <div>
              <strong>PySpark Streaming</strong>
              <p class="mt-1">
                PySpark добавляет metadata columns к CDC событиям для downstream
                processing и troubleshooting.
              </p>
            </div>
          }
        >
          <FlowNode
            variant="connector"
            className="bg-purple-500/20 border-purple-400/30 text-purple-700"
            tabindex={0}
          >
            PySpark + Metadata
          </FlowNode>
        </DiagramTooltip>

        {/* Metadata columns */}
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-3xl">
          <DiagramTooltip
            content={
              <div>
                <strong>_operation Column</strong>
                <p class="mt-1">
                  Тип операции из Debezium: c (create), u (update), d (delete),
                  r (read/snapshot). Критично для правильной обработки.
                </p>
              </div>
            }
          >
            <div class="text-sm text-[var(--ink-default)] p-3 bg-[var(--bg-sunken)] rounded-lg border border-purple-400/30">
              <div class="font-medium text-purple-700 mb-1">
                _operation
              </div>
              <div class="text-xs text-[var(--ink-muted)]">
                c, u, d, r
              </div>
            </div>
          </DiagramTooltip>

          <DiagramTooltip
            content={
              <div>
                <strong>_cdc_timestamp Column</strong>
                <p class="mt-1">
                  Timestamp от database transaction commit (ts_ms field). True
                  event time для watermark и ordering.
                </p>
              </div>
            }
          >
            <div class="text-sm text-[var(--ink-default)] p-3 bg-[var(--bg-sunken)] rounded-lg border border-purple-400/30">
              <div class="font-medium text-purple-700 mb-1">
                _cdc_timestamp
              </div>
              <div class="text-xs text-[var(--ink-muted)]">
                from ts_ms
              </div>
            </div>
          </DiagramTooltip>

          <DiagramTooltip
            content={
              <div>
                <strong>_processed_at Column</strong>
                <p class="mt-1">
                  Timestamp когда Spark обработал событие. Для lag monitoring и
                  troubleshooting pipeline delays.
                </p>
              </div>
            }
          >
            <div class="text-sm text-[var(--ink-default)] p-3 bg-[var(--bg-sunken)] rounded-lg border border-purple-400/30">
              <div class="font-medium text-purple-700 mb-1">
                _processed_at
              </div>
              <div class="text-xs text-[var(--ink-muted)]">
                current_timestamp()
              </div>
            </div>
          </DiagramTooltip>

          <DiagramTooltip
            content={
              <div>
                <strong>_source_db / _source_table</strong>
                <p class="mt-1">
                  Source database и table name из Debezium metadata. Критично
                  для multi-table CDC pipelines.
                </p>
              </div>
            }
          >
            <div class="text-sm text-[var(--ink-default)] p-3 bg-[var(--bg-sunken)] rounded-lg border border-purple-400/30">
              <div class="font-medium text-purple-700 mb-1">
                _source_db / _source_table
              </div>
              <div class="text-xs text-[var(--ink-muted)]">
                from source metadata
              </div>
            </div>
          </DiagramTooltip>
        </div>

        <Arrow direction="down" />

        <DiagramTooltip
          content={
            <div>
              <strong>Parquet Sink</strong>
              <p class="mt-1">
                Финальная запись в Parquet с partitioning по _processed_date.
                Metadata columns включены для downstream analytics.
              </p>
            </div>
          }
        >
          <FlowNode
            variant="cluster"
            tabindex={0}
          >
            Parquet Sink
            <span class="block text-xs text-emerald-700 mt-1">
              With metadata columns
            </span>
          </FlowNode>
        </DiagramTooltip>
      </div>

      <div class="mt-4 text-sm text-purple-400 border-l-2 border-purple-400 pl-3">
        <strong>Metadata columns essential:</strong>
        <p class="mt-1 text-[var(--ink-default)]">
          Metadata columns критически важны для troubleshooting, lag monitoring,
          правильной обработки operation types, и multi-table pipelines. Всегда
          добавляйте их при записи CDC data в data lake.
        </p>
      </div>
    </DiagramContainer>
  );
}

/**
 * OperationSeparationDiagram - Shows branching by operation type
 */
export function OperationSeparationDiagram() {
  return (
    <DiagramContainer
      title="Operation Separation Pattern"
      color="neutral"
      description="Разделение CDC stream по типу операции"
    >
      <div class="flex flex-col items-center gap-4">
        <DiagramTooltip
          content={
            <div>
              <strong>CDC Stream</strong>
              <p class="mt-1">
                Единый Kafka topic с CDC событиями. Содержит все типы операций:
                INSERT, UPDATE, DELETE.
              </p>
            </div>
          }
        >
          <FlowNode variant="connector" tabindex={0}>
            CDC Stream
            <span class="block text-xs text-[var(--ink-muted)] mt-1">
              Mixed operations
            </span>
          </FlowNode>
        </DiagramTooltip>

        <Arrow direction="down" />

        <DiagramTooltip
          content={
            <div>
              <strong>Operation Filter</strong>
              <p class="mt-1">
                PySpark фильтрует stream по op field: c (INSERT), u (UPDATE),
                d (DELETE). Каждый тип операции идет в separate output.
              </p>
            </div>
          }
        >
          <FlowNode
            variant="connector"
            className="bg-purple-500/20 border-purple-400/30 text-purple-700"
            tabindex={0}
          >
            Operation Type Filter
          </FlowNode>
        </DiagramTooltip>

        <div class="flex flex-col gap-2 w-full max-w-2xl">
          <Arrow direction="down" />
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* INSERT Stream */}
            <div class="flex flex-col items-center gap-2">
              <DiagramTooltip
                content={
                  <div>
                    <strong>INSERT Stream (op='c')</strong>
                    <p class="mt-1">
                      Только CREATE операции. Содержат after state. Простой
                      append в Parquet без upsert logic.
                    </p>
                    <p class="mt-2 text-emerald-700">
                      Output: inserts_parquet/ directory
                    </p>
                  </div>
                }
              >
                <FlowNode
                  variant="cluster"
                  size="sm"
                  className="bg-emerald-500/20 border-emerald-400/30 text-emerald-700"
                  tabindex={0}
                >
                  op='c'
                  <span class="block text-xs text-[var(--ink-muted)] mt-1">
                    INSERT
                  </span>
                </FlowNode>
              </DiagramTooltip>

              <Arrow direction="down" />

              <DiagramTooltip
                content={
                  <div>
                    <strong>Inserts Output</strong>
                    <p class="mt-1">
                      Append-only Parquet files с новыми записями. Downstream
                      processing может просто append в финальную таблицу.
                    </p>
                  </div>
                }
              >
                <div class="text-sm text-[var(--ink-default)] p-3 bg-[var(--bg-sunken)] rounded-lg border border-emerald-400/30 w-full">
                  <div class="font-medium text-emerald-700 mb-1">
                    inserts_parquet/
                  </div>
                  <div class="text-xs text-[var(--ink-muted)]">
                    Append-only
                  </div>
                </div>
              </DiagramTooltip>
            </div>

            {/* UPDATE Stream */}
            <div class="flex flex-col items-center gap-2">
              <DiagramTooltip
                content={
                  <div>
                    <strong>UPDATE Stream (op='u')</strong>
                    <p class="mt-1">
                      Только UPDATE операции. Содержат before и after state.
                      Требуют MERGE или upsert logic downstream.
                    </p>
                    <p class="mt-2 text-amber-700">
                      Output: updates_parquet/ directory
                    </p>
                  </div>
                }
              >
                <FlowNode
                  variant="connector"
                  size="sm"
                  className="bg-amber-500/20 border-amber-400/30 text-amber-700"
                  tabindex={0}
                >
                  op='u'
                  <span class="block text-xs text-[var(--ink-muted)] mt-1">
                    UPDATE
                  </span>
                </FlowNode>
              </DiagramTooltip>

              <Arrow direction="down" />

              <DiagramTooltip
                content={
                  <div>
                    <strong>Updates Output</strong>
                    <p class="mt-1">
                      Parquet files с changed records. Downstream batch job
                      применяет MERGE для upsert в финальную таблицу.
                    </p>
                  </div>
                }
              >
                <div class="text-sm text-[var(--ink-default)] p-3 bg-[var(--bg-sunken)] rounded-lg border border-amber-400/30 w-full">
                  <div class="font-medium text-amber-700 mb-1">
                    updates_parquet/
                  </div>
                  <div class="text-xs text-[var(--ink-muted)]">
                    Requires MERGE
                  </div>
                </div>
              </DiagramTooltip>
            </div>

            {/* DELETE Stream */}
            <div class="flex flex-col items-center gap-2">
              <DiagramTooltip
                content={
                  <div>
                    <strong>DELETE Stream (op='d')</strong>
                    <p class="mt-1">
                      Только DELETE операции. Содержат before state. Требуют
                      soft-delete (set deleted_at) или hard delete downstream.
                    </p>
                    <p class="mt-2 text-rose-700">
                      Output: deletes_parquet/ directory
                    </p>
                  </div>
                }
              >
                <FlowNode
                  variant="app"
                  size="sm"
                  className="bg-rose-500/20 border-rose-400/30 text-rose-700"
                  tabindex={0}
                >
                  op='d'
                  <span class="block text-xs text-[var(--ink-muted)] mt-1">
                    DELETE
                  </span>
                </FlowNode>
              </DiagramTooltip>

              <Arrow direction="down" />

              <DiagramTooltip
                content={
                  <div>
                    <strong>Deletes Output</strong>
                    <p class="mt-1">
                      Parquet files с deleted record IDs. Downstream batch job
                      применяет soft-delete (UPDATE set deleted_at) или hard
                      delete.
                    </p>
                  </div>
                }
              >
                <div class="text-sm text-[var(--ink-default)] p-3 bg-[var(--bg-sunken)] rounded-lg border border-rose-400/30 w-full">
                  <div class="font-medium text-rose-700 mb-1">
                    deletes_parquet/
                  </div>
                  <div class="text-xs text-[var(--ink-muted)]">
                    Soft/hard delete
                  </div>
                </div>
              </DiagramTooltip>
            </div>
          </div>
        </div>

        <div class="mt-4 text-sm text-[var(--ink-muted)] border-l-2 border-[var(--line-medium)] pl-3">
          <strong>Зачем разделять по operation type:</strong>
          <p class="mt-1 text-[var(--ink-default)]">
            Разные операции требуют разной обработки downstream. INSERT — простой
            append, UPDATE — MERGE/upsert, DELETE — soft-delete. Разделение
            упрощает downstream logic и позволяет настроить separate partitioning,
            compression, monitoring для каждого типа.
          </p>
        </div>
      </div>
    </DiagramContainer>
  );
}

/** Helper: renders a file tree from a nested data structure. */
function FileTreeItem({ name, children, indent = 0 }: { name: string; children?: { name: string; children?: { name: string }[] }[]; indent?: number }) {
  return (
    <>
      <div class="flex items-center gap-1.5" style={{ 'padding-left': `${indent * 16}px` }}>
        <span class="text-[var(--ink-subtle)] select-none">{children ? '📁' : '📄'}</span>
        <span class={`text-xs ${children ? 'text-[var(--ink-default)] font-medium' : 'text-[var(--ink-muted)] font-mono'}`}>{name}</span>
      </div>
      {children?.map((c) => (
        <FileTreeItem name={c.name} children={(c as any).children} indent={indent + 1} />
      ))}
    </>
  );
}

/**
 * DataLakePartitionDiagram — Parquet partitioned directory structure.
 * Replaces first ASCII tree in 06-etl-elt-patterns.mdx (~line 182).
 */
export function DataLakePartitionDiagram() {
  const tree = [
    { name: '_processed_date=2026-01-01/', children: [
      { name: 'part-00000.parquet' },
      { name: 'part-00001.parquet' },
    ]},
    { name: '_processed_date=2026-01-02/', children: [
      { name: 'part-00000.parquet' },
    ]},
  ];

  return (
    <DiagramContainer title="/data/lake/orders_history/" color="purple">
      <div class="space-y-0.5">
        {tree.map((item) => (
          <FileTreeItem name={item.name} children={item.children} />
        ))}
      </div>
    </DiagramContainer>
  );
}

/**
 * DataLakeLabPartitionDiagram — Lab exercise expected directory output.
 * Replaces second ASCII tree in 06-etl-elt-patterns.mdx (~line 594).
 */
export function DataLakeLabPartitionDiagram() {
  const tree = [
    { name: '_processed_date=2026-02-01/', children: [
      { name: 'part-00000-xxx.snappy.parquet' },
      { name: 'part-00001-xxx.snappy.parquet' },
    ]},
    { name: '_processed_date=2026-02-02/', children: [
      { name: 'part-00000-xxx.snappy.parquet' },
    ]},
  ];

  return (
    <DiagramContainer title="/data/lake/orders/" color="emerald">
      <div class="space-y-0.5">
        {tree.map((item) => (
          <FileTreeItem name={item.name} children={item.children} />
        ))}
      </div>
    </DiagramContainer>
  );
}
