/**
 * PyFlink Connector Diagrams
 *
 * Exports:
 * - PandasVsPyflinkComparisonDiagram: Side-by-side comparison of batch vs streaming
 * - PyflinkCdcArchitectureDiagram: Multi-layer CDC architecture with nested containers
 */

import { FlowNode } from '../primitives/FlowNode';
import { Arrow } from '../primitives/Arrow';
import { DiagramContainer } from '../primitives/DiagramContainer';
import { DiagramTooltip } from '../primitives/Tooltip';

/**
 * PandasVsPyflinkComparisonDiagram - Side-by-side comparison of batch vs streaming models
 */
export function PandasVsPyflinkComparisonDiagram() {
  return (
    <div className="flex flex-col md:flex-row gap-4">
      {/* Pandas (Batch) */}
      <DiagramContainer
        title="Pandas (Batch)"
        color="amber"
        description="Batch-обработка: накопить → обработать → записать"
        className="flex-1"
      >
        <div className="flex flex-col items-center gap-3">
          <DiagramTooltip
            content={
              <div>
                <strong>Накопить события</strong>
                <p className="mt-1">
                  Ждём накопления batch'а событий (например, за последний час).
                  Batch interval определяет latency.
                </p>
              </div>
            }
          >
            <FlowNode variant="sink" size="sm" tabIndex={0}>
              1. Накопить события
            </FlowNode>
          </DiagramTooltip>

          <Arrow direction="down" />

          <DiagramTooltip
            content={
              <div>
                <strong>Загрузить в DataFrame</strong>
                <p className="mt-1">
                  Загружаем batch в память как Pandas DataFrame. Ограничено
                  объёмом памяти single machine.
                </p>
              </div>
            }
          >
            <FlowNode variant="database" size="sm" tabIndex={0}>
              2. Загрузить в DataFrame
            </FlowNode>
          </DiagramTooltip>

          <Arrow direction="down" />

          <DiagramTooltip
            content={
              <div>
                <strong>Обработать batch</strong>
                <p className="mt-1">
                  Выполняем агрегации, трансформации на всём batch'е сразу.
                  Ephemeral state — после обработки DataFrame удаляется.
                </p>
              </div>
            }
          >
            <FlowNode variant="connector" size="sm" tabIndex={0}>
              3. Обработать batch
            </FlowNode>
          </DiagramTooltip>

          <Arrow direction="down" />

          <DiagramTooltip
            content={
              <div>
                <strong>Записать результат</strong>
                <p className="mt-1">
                  Результаты пишутся в БД или файл. Затем цикл повторяется для
                  следующего batch'а.
                </p>
              </div>
            }
          >
            <FlowNode variant="app" size="sm" tabIndex={0}>
              4. Записать результат
            </FlowNode>
          </DiagramTooltip>

          <Arrow direction="down" dashed />
          <span className="text-xs text-gray-400">Цикл повторяется</span>

          <div className="mt-2 text-sm text-amber-300 font-semibold">
            Latency: минуты/часы
          </div>
        </div>
      </DiagramContainer>

      {/* PyFlink (Streaming) */}
      <DiagramContainer
        title="PyFlink (Streaming)"
        color="emerald"
        description="Непрерывная обработка потока событий"
        recommended
        className="flex-1"
      >
        <div className="flex flex-col items-center gap-3">
          <DiagramTooltip
            content={
              <div>
                <strong>Непрерывный поток</strong>
                <p className="mt-1">
                  События читаются из Kafka непрерывно, без batch intervals.
                  Unbounded stream processing.
                </p>
              </div>
            }
          >
            <FlowNode variant="cluster" size="sm" tabIndex={0}>
              Непрерывный поток
            </FlowNode>
          </DiagramTooltip>

          <Arrow direction="down" />

          <DiagramTooltip
            content={
              <div>
                <strong>Event-by-event обработка</strong>
                <p className="mt-1">
                  Каждое событие обрабатывается сразу после прибытия.
                  Real-time processing.
                </p>
              </div>
            }
          >
            <FlowNode variant="connector" size="sm" tabIndex={0}>
              Event-by-event обработка
            </FlowNode>
          </DiagramTooltip>

          <Arrow direction="down" />

          <DiagramTooltip
            content={
              <div>
                <strong>Stateful агрегации</strong>
                <p className="mt-1">
                  Flink хранит managed state для агрегаций. State сохраняется
                  между событиями с checkpoint'ами для fault tolerance.
                </p>
              </div>
            }
          >
            <FlowNode
              variant="database"
              size="sm"
              tabIndex={0}
              className="bg-purple-500/20 border-purple-400/30 text-purple-200"
            >
              Stateful агрегации
            </FlowNode>
          </DiagramTooltip>

          <Arrow direction="down" />

          <DiagramTooltip
            content={
              <div>
                <strong>Непрерывный вывод</strong>
                <p className="mt-1">
                  Результаты выдаются непрерывно по мере обработки событий.
                  Латентность в миллисекундах/секундах.
                </p>
              </div>
            }
          >
            <FlowNode variant="app" size="sm" tabIndex={0}>
              Непрерывный вывод
            </FlowNode>
          </DiagramTooltip>

          <Arrow direction="down" dashed />
          <span className="text-xs text-gray-400">Поток продолжается</span>

          <div className="mt-2 text-sm text-emerald-300 font-semibold">
            Latency: миллисекунды/секунды
          </div>
        </div>
      </DiagramContainer>
    </div>
  );
}

/**
 * PyflinkCdcArchitectureDiagram - Multi-layer CDC architecture with nested containers
 */
export function PyflinkCdcArchitectureDiagram() {
  return (
    <DiagramContainer
      title="PyFlink CDC Pipeline Architecture"
      color="purple"
      description="От PostgreSQL до sink через Debezium, Kafka и PyFlink"
    >
      <div className="flex flex-col gap-4">
        {/* Source Layer */}
        <DiagramContainer
          title="Source Layer"
          color="blue"
          className="bg-blue-500/10"
        >
          <div className="flex justify-center">
            <DiagramTooltip
              content={
                <div>
                  <strong>PostgreSQL Source</strong>
                  <p className="mt-1">
                    Источник CDC событий. Генерирует изменения через
                    Write-Ahead Log (WAL). Logical replication slot читается
                    Debezium.
                  </p>
                </div>
              }
            >
              <FlowNode variant="database" tabIndex={0}>
                PostgreSQL
                <span className="block text-xs text-gray-400 mt-1">
                  orders table
                </span>
              </FlowNode>
            </DiagramTooltip>
          </div>
        </DiagramContainer>

        <Arrow direction="down" label="CDC events" />

        {/* CDC Layer */}
        <DiagramContainer
          title="CDC Layer"
          color="emerald"
          className="bg-emerald-500/10"
        >
          <div className="flex items-center gap-3 justify-center flex-wrap">
            <DiagramTooltip
              content={
                <div>
                  <strong>Debezium Connector</strong>
                  <p className="mt-1">
                    Читает PostgreSQL WAL через logical replication slot.
                    Публикует изменения в Kafka в Debezium envelope формате
                    (before/after/op/ts_ms/source).
                  </p>
                </div>
              }
            >
              <FlowNode variant="connector" size="sm" tabIndex={0}>
                Debezium Connector
              </FlowNode>
            </DiagramTooltip>

            <Arrow direction="right" label="Publish" />

            <DiagramTooltip
              content={
                <div>
                  <strong>Kafka Topic</strong>
                  <p className="mt-1">
                    CDC события в формате Debezium envelope. Topic name:
                    dbserver1.public.orders. Каждая таблица = отдельный топик.
                  </p>
                </div>
              }
            >
              <FlowNode
                variant="cluster"
                size="sm"
                tabIndex={0}
                className="bg-blue-500/20 border-blue-400/30 text-blue-200"
              >
                Kafka Topic
                <span className="block text-xs text-gray-400 mt-1">
                  dbserver1.public.orders
                </span>
              </FlowNode>
            </DiagramTooltip>
          </div>
        </DiagramContainer>

        <Arrow direction="down" label="Read stream" />

        {/* Processing Layer */}
        <DiagramContainer
          title="Processing Layer"
          color="purple"
          className="bg-purple-500/10"
        >
          <div className="flex items-center gap-3 justify-center flex-wrap">
            <DiagramTooltip
              content={
                <div>
                  <strong>Kafka Connector</strong>
                  <p className="mt-1">
                    PyFlink Table API Kafka connector. SQL DDL: CREATE TABLE
                    orders_cdc WITH ('connector' = 'kafka', ...). Читает
                    события из Kafka.
                  </p>
                </div>
              }
            >
              <FlowNode variant="connector" size="sm" tabIndex={0}>
                Kafka Connector
              </FlowNode>
            </DiagramTooltip>

            <Arrow direction="right" />

            <DiagramTooltip
              content={
                <div>
                  <strong>VIEW orders_current</strong>
                  <p className="mt-1">
                    SQL VIEW для извлечения after state: SELECT
                    payload.after.* FROM orders_cdc WHERE payload.op IN ('c',
                    'u', 'r'). Фильтрует deletes.
                  </p>
                </div>
              }
            >
              <FlowNode
                variant="database"
                size="sm"
                tabIndex={0}
                className="bg-purple-500/20 border-purple-400/30 text-purple-200"
              >
                VIEW orders_current
              </FlowNode>
            </DiagramTooltip>

            <Arrow direction="right" />

            <DiagramTooltip
              content={
                <div>
                  <strong>SQL Query</strong>
                  <p className="mt-1">
                    PyFlink SQL для агрегаций: tumbling/sliding windows,
                    GROUP BY, temporal joins. Stateful processing с managed
                    state.
                  </p>
                </div>
              }
            >
              <FlowNode
                variant="app"
                size="sm"
                tabIndex={0}
                className="bg-purple-500/20 border-purple-400/30 text-purple-200"
              >
                SQL Query
              </FlowNode>
            </DiagramTooltip>
          </div>
        </DiagramContainer>

        <Arrow direction="down" label="Results" />

        {/* Output Layer */}
        <DiagramContainer
          title="Output Layer"
          color="amber"
          className="bg-amber-500/10"
        >
          <div className="flex justify-center">
            <DiagramTooltip
              content={
                <div>
                  <strong>Sink Options</strong>
                  <p className="mt-1">
                    Результаты пишутся в sink в зависимости от use case:
                  </p>
                  <ul className="mt-1 list-disc list-inside text-sm">
                    <li>Kafka topic: Real-time dashboard</li>
                    <li>Database: Materialized view для queries</li>
                    <li>File (Parquet): Batch analytics в DWH</li>
                  </ul>
                </div>
              }
            >
              <FlowNode variant="sink" tabIndex={0}>
                Kafka topic / Database / File
              </FlowNode>
            </DiagramTooltip>
          </div>
        </DiagramContainer>

        <div className="mt-4 text-sm text-purple-400 border-l-2 border-purple-400 pl-3">
          <strong>Ключевое преимущество PyFlink:</strong>
          <p className="mt-1 text-gray-300">
            Distributed stream processing с stateful operations. Масштабируется
            горизонтально (кластер из N TaskManagers). Fault tolerance через
            checkpoints и state recovery.
          </p>
        </div>
      </div>
    </DiagramContainer>
  );
}
