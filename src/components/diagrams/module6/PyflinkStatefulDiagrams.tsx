/**
 * PyFlink Stateful Processing Diagrams
 *
 * Exports:
 * - StatefulOperationsDiagram: Side-by-side stateful operations and managed state
 * - OutOfOrderEventsSequenceDiagram: Sequence diagram showing out-of-order event arrival
 * - WatermarkProgressDiagram: Timeline with watermark indicator
 * - TumblingWindowsDiagram: Non-overlapping fixed-size windows
 * - SlidingWindowsDiagram: Overlapping windows with slide interval
 * - SessionWindowsDiagram: Dynamic windows with gap-based closure
 * - TemporalJoinSequenceDiagram: Sequence diagram for versioned temporal joins
 * - StateGrowthDiagram: Vertical flow showing state growth over time with OOM warning
 */

import { FlowNode } from '@primitives/FlowNode';
import { Arrow } from '@primitives/Arrow';
import { DiagramContainer } from '@primitives/DiagramContainer';
import { DiagramTooltip } from '@primitives/Tooltip';
import { SequenceDiagram } from '@primitives/SequenceDiagram';
import type {
  SequenceActorDef,
  SequenceMessageDef,
} from '@primitives/types';

/**
 * StatefulOperationsDiagram - Shows stateful operations and managed state relationship
 */
export function StatefulOperationsDiagram() {
  return (
    <div className="flex flex-col md:flex-row gap-4">
      {/* Stateful Operations */}
      <DiagramContainer
        title="Stateful Operations"
        color="purple"
        description="Операции требующие состояние"
        className="flex-1"
      >
        <div className="flex flex-col items-center gap-3">
          <DiagramTooltip
            content={
              <div>
                <strong>Агрегации</strong>
                <p className="mt-1">
                  COUNT, SUM, AVG по ключам. Требуют хранения счётчиков и сумм
                  для каждого ключа (например, customer_id).
                </p>
              </div>
            }
          >
            <FlowNode
              variant="app"
              className="bg-purple-500/20 border-purple-400/30 text-purple-700"
              tabIndex={0}
            >
              Aggregations<br />
              <span className="text-xs text-[var(--ink-muted)]">(COUNT, SUM, AVG)</span>
            </FlowNode>
          </DiagramTooltip>

          <DiagramTooltip
            content={
              <div>
                <strong>Joins</strong>
                <p className="mt-1">
                  Temporal joins требуют хранения версионированной истории
                  dimension table для lookup "as of" определённого времени.
                </p>
              </div>
            }
          >
            <FlowNode
              variant="app"
              className="bg-purple-500/20 border-purple-400/30 text-purple-700"
              tabIndex={0}
            >
              Joins
            </FlowNode>
          </DiagramTooltip>

          <DiagramTooltip
            content={
              <div>
                <strong>Deduplication</strong>
                <p className="mt-1">
                  Отбрасывание дубликатов требует хранения Set уже
                  обработанных ID событий.
                </p>
              </div>
            }
          >
            <FlowNode
              variant="app"
              className="bg-purple-500/20 border-purple-400/30 text-purple-700"
              tabIndex={0}
            >
              Deduplication
            </FlowNode>
          </DiagramTooltip>

          <DiagramTooltip
            content={
              <div>
                <strong>Sessionization</strong>
                <p className="mt-1">
                  Группировка событий в сессии требует хранения timestamp
                  последнего события для каждого пользователя.
                </p>
              </div>
            }
          >
            <FlowNode
              variant="app"
              className="bg-purple-500/20 border-purple-400/30 text-purple-700"
              tabIndex={0}
            >
              Sessionization
            </FlowNode>
          </DiagramTooltip>
        </div>
      </DiagramContainer>

      {/* Managed State */}
      <DiagramContainer
        title="Managed State"
        color="blue"
        description="Как Flink управляет состоянием"
        className="flex-1"
      >
        <div className="flex flex-col items-center gap-3">
          <DiagramTooltip
            content={
              <div>
                <strong>State Storage</strong>
                <p className="mt-1">
                  По умолчанию state хранится в памяти (heap). Для больших
                  state используйте RocksDB (on-disk state backend).
                </p>
                <p className="mt-2 text-blue-700">
                  RocksDB: поддерживает терабайты state
                </p>
              </div>
            }
          >
            <FlowNode
              variant="database"
              className="bg-blue-500/20 border-blue-400/30 text-blue-700"
              tabIndex={0}
            >
              State хранится<br />
              <span className="text-xs text-[var(--ink-muted)]">
                в памяти или RocksDB
              </span>
            </FlowNode>
          </DiagramTooltip>

          <Arrow direction="down" />

          <DiagramTooltip
            content={
              <div>
                <strong>Checkpoints</strong>
                <p className="mt-1">
                  Flink периодически сохраняет snapshot state в distributed
                  storage (S3, HDFS). Конфигурация: checkpoint interval (например,
                  каждые 5 минут).
                </p>
              </div>
            }
          >
            <FlowNode
              variant="sink"
              className="bg-blue-500/20 border-blue-400/30 text-blue-700"
              tabIndex={0}
            >
              Периодические checkpoints
            </FlowNode>
          </DiagramTooltip>

          <Arrow direction="down" />

          <DiagramTooltip
            content={
              <div>
                <strong>Fault Tolerance</strong>
                <p className="mt-1">
                  При сбое Flink восстанавливает job из последнего checkpoint.
                  State recovery + replay событий из Kafka = exactly-once
                  guarantees.
                </p>
              </div>
            }
          >
            <FlowNode
              variant="connector"
              className="bg-emerald-500/20 border-emerald-400/30 text-emerald-700"
              tabIndex={0}
            >
              Восстановление при сбоях
            </FlowNode>
          </DiagramTooltip>
        </div>
      </DiagramContainer>
    </div>
  );
}

/**
 * OutOfOrderEventsSequenceDiagram - Shows out-of-order event arrival in distributed systems
 */
export function OutOfOrderEventsSequenceDiagram() {
  const actors: SequenceActorDef[] = [
    {
      id: 'postgres',
      label: 'PostgreSQL',
      variant: 'database',
      tooltip: (
        <div>
          <strong>PostgreSQL Source</strong>
          <p className="mt-1">
            Генерирует события в порядке event time: E1 (10:00) → E2 (10:01) →
            E3 (10:02).
          </p>
        </div>
      ),
    },
    {
      id: 'k1',
      label: 'Kafka Partition 1',
      variant: 'queue',
      tooltip: (
        <div>
          <strong>Kafka Partition 1</strong>
          <p className="mt-1">
            Получает E1 и E3. Network delay на этом partition приводит к
            задержке доставки.
          </p>
        </div>
      ),
    },
    {
      id: 'k2',
      label: 'Kafka Partition 2',
      variant: 'queue',
      tooltip: (
        <div>
          <strong>Kafka Partition 2</strong>
          <p className="mt-1">
            Получает E2. Доставляет события быстрее чем Partition 1.
          </p>
        </div>
      ),
    },
    {
      id: 'flink',
      label: 'PyFlink',
      variant: 'service',
      tooltip: (
        <div>
          <strong>PyFlink Consumer</strong>
          <p className="mt-1">
            Читает из обоих partitions параллельно. Processing time порядок
            отличается от event time порядка.
          </p>
        </div>
      ),
    },
  ];

  const messages: SequenceMessageDef[] = [
    {
      id: 'e1_to_k1',
      from: 'postgres',
      to: 'k1',
      label: 'E1 (event_time=10:00)',
      variant: 'sync',
      tooltip: (
        <div>
          <strong>Event 1</strong>
          <p className="mt-1">
            Первое событие с event_time=10:00. Отправлено в Partition 1 (по
            hash ключа).
          </p>
        </div>
      ),
    },
    {
      id: 'e2_to_k2',
      from: 'postgres',
      to: 'k2',
      label: 'E2 (event_time=10:01)',
      variant: 'sync',
      tooltip: (
        <div>
          <strong>Event 2</strong>
          <p className="mt-1">
            Второе событие с event_time=10:01. Отправлено в Partition 2.
          </p>
        </div>
      ),
    },
    {
      id: 'e3_to_k1',
      from: 'postgres',
      to: 'k1',
      label: 'E3 (event_time=10:02)',
      variant: 'sync',
      tooltip: (
        <div>
          <strong>Event 3</strong>
          <p className="mt-1">
            Третье событие с event_time=10:02. Отправлено в Partition 1.
          </p>
        </div>
      ),
    },
    {
      id: 'e2_to_flink',
      from: 'k2',
      to: 'flink',
      label: 'E2 arrives FIRST',
      variant: 'sync',
      tooltip: (
        <div>
          <strong>E2 прибыл первым</strong>
          <p className="mt-1">
            Partition 2 быстрее доставил E2. Processing time: T1.
          </p>
        </div>
      ),
    },
    {
      id: 'e3_to_flink',
      from: 'k1',
      to: 'flink',
      label: 'E3 arrives second',
      variant: 'sync',
      tooltip: (
        <div>
          <strong>E3 прибыл вторым</strong>
          <p className="mt-1">
            E3 прибыл после E2, несмотря на более поздний event_time.
            Processing time: T2.
          </p>
        </div>
      ),
    },
    {
      id: 'e1_to_flink',
      from: 'k1',
      to: 'flink',
      label: 'E1 arrives LATE!',
      variant: 'async',
      tooltip: (
        <div>
          <strong>E1 прибыл поздно (late event)</strong>
          <p className="mt-1">
            E1 прибыл последним из-за network delay на Partition 1. Processing
            time: T3. Event time: 10:00 (самый ранний!).
          </p>
          <p className="mt-2 text-rose-700">
            Проблема: Watermark мог уже закрыть окно 10:00-10:05!
          </p>
        </div>
      ),
    },
  ];

  return (
    <DiagramContainer
      title="Out-of-Order Events Problem"
      color="rose"
      description="Event time порядок ≠ Processing time порядок"
    >
      <SequenceDiagram
        actors={actors}
        messages={messages}
        messageSpacing={60}
      />
      <div className="mt-4 text-sm text-rose-400 border-l-2 border-rose-400 pl-3">
        <strong>Почему это происходит:</strong>
        <p className="mt-1 text-[var(--ink-default)]">
          Processing time порядок: E2 → E3 → E1 (порядок прибытия в Flink)
          <br />
          Event time порядок: E1 → E2 → E3 (порядок генерации событий)
          <br />
          <br />
          Причины: network latency в distributed Kafka partitions, replication
          lag, connector restarts, backpressure.
        </p>
      </div>
    </DiagramContainer>
  );
}

/**
 * WatermarkProgressDiagram - Shows watermark progression on event time timeline
 */
export function WatermarkProgressDiagram() {
  return (
    <DiagramContainer
      title="Watermark Progress"
      color="amber"
      description="Watermark отслеживает прогресс event time"
    >
      <div className="flex flex-col gap-4">
        {/* Timeline */}
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <DiagramTooltip
            content={
              <div>
                <strong>10:00</strong>
                <p className="mt-1">Начало timeline. События прибывают.</p>
              </div>
            }
          >
            <FlowNode
              variant="sink"
              size="sm"
              className="bg-blue-500/20 border-blue-400/30 text-blue-700"
              tabIndex={0}
            >
              10:00
            </FlowNode>
          </DiagramTooltip>

          <Arrow direction="right" />

          <DiagramTooltip
            content={
              <div>
                <strong>10:01</strong>
                <p className="mt-1">События с event_time=10:01 обработаны.</p>
              </div>
            }
          >
            <FlowNode
              variant="sink"
              size="sm"
              className="bg-blue-500/20 border-blue-400/30 text-blue-700"
              tabIndex={0}
            >
              10:01
            </FlowNode>
          </DiagramTooltip>

          <Arrow direction="right" />

          <DiagramTooltip
            content={
              <div>
                <strong>10:02 (Watermark)</strong>
                <p className="mt-1">
                  Текущая позиция watermark. Flink считает, что все события до
                  10:02 уже прибыли (с учётом allowed lateness).
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
              10:02
              <span className="block text-xs text-amber-700 mt-1">
                ← Watermark
              </span>
            </FlowNode>
          </DiagramTooltip>

          <Arrow direction="right" />

          <DiagramTooltip
            content={
              <div>
                <strong>10:03</strong>
                <p className="mt-1">
                  События с event_time=10:03 ещё обрабатываются. Watermark ещё
                  не дошёл.
                </p>
              </div>
            }
          >
            <FlowNode
              variant="sink"
              size="sm"
              className="bg-[var(--bg-deep)] border-[var(--line-medium)] text-[var(--ink-default)]"
              tabIndex={0}
            >
              10:03
            </FlowNode>
          </DiagramTooltip>

          <Arrow direction="right" />

          <DiagramTooltip
            content={
              <div>
                <strong>10:04</strong>
                <p className="mt-1">Будущие события ещё не прибыли.</p>
              </div>
            }
          >
            <FlowNode
              variant="sink"
              size="sm"
              className="bg-[var(--bg-deep)] border-[var(--line-medium)] text-[var(--ink-default)]"
              tabIndex={0}
            >
              10:04
            </FlowNode>
          </DiagramTooltip>
        </div>

        {/* Action */}
        <div className="flex justify-center">
          <DiagramTooltip
            content={
              <div>
                <strong>Window Closure</strong>
                <p className="mt-1">
                  Когда watermark достигает window end time, окно закрывается и
                  выдаёт результат. Например, окно [10:00-10:05] закроется
                  когда watermark = 10:05.
                </p>
                <p className="mt-2 text-amber-700">
                  Формула: watermark = max_event_time - allowed_lateness
                </p>
              </div>
            }
          >
            <FlowNode
              variant="app"
              className="bg-amber-500/20 border-amber-400/30 text-amber-700"
              tabIndex={0}
            >
              Закрыть windows с end_time ≤ 10:02
            </FlowNode>
          </DiagramTooltip>
        </div>

        <div className="mt-2 text-sm text-amber-400 border-l-2 border-amber-400 pl-3">
          <strong>Watermark Definition:</strong>
          <p className="mt-1 text-[var(--ink-default)]">
            Watermark — это маркер, который говорит Flink: "Все события с
            event_time &lt; W уже прибыли (скорее всего)". Конфигурация:
            WATERMARK FOR event_time AS event_time - INTERVAL '5' SECONDS
          </p>
        </div>
      </div>
    </DiagramContainer>
  );
}

/**
 * TumblingWindowsDiagram - Fixed-size non-overlapping windows
 */
export function TumblingWindowsDiagram() {
  return (
    <DiagramContainer
      title="Tumbling Windows (размер = 5 минут)"
      color="blue"
      description="Неперекрывающиеся окна фиксированного размера"
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <DiagramTooltip
            content={
              <div>
                <strong>Window 1: 10:00-10:05</strong>
                <p className="mt-1">
                  Первое окно. Все события с event_time в диапазоне [10:00,
                  10:05) попадают в это окно.
                </p>
              </div>
            }
          >
            <FlowNode
              variant="sink"
              className="bg-blue-500/20 border-blue-400/30 text-blue-700"
              tabIndex={0}
            >
              10:00-10:05<br />
              <span className="text-xs text-[var(--ink-muted)]">Window 1</span>
            </FlowNode>
          </DiagramTooltip>

          <Arrow direction="right" />

          <DiagramTooltip
            content={
              <div>
                <strong>Window 2: 10:05-10:10</strong>
                <p className="mt-1">
                  Второе окно. Начинается сразу после конца Window 1. Без
                  перекрытия.
                </p>
              </div>
            }
          >
            <FlowNode
              variant="sink"
              className="bg-purple-500/20 border-purple-400/30 text-purple-700"
              tabIndex={0}
            >
              10:05-10:10<br />
              <span className="text-xs text-[var(--ink-muted)]">Window 2</span>
            </FlowNode>
          </DiagramTooltip>

          <Arrow direction="right" />

          <DiagramTooltip
            content={
              <div>
                <strong>Window 3: 10:10-10:15</strong>
                <p className="mt-1">Третье окно. Паттерн продолжается.</p>
              </div>
            }
          >
            <FlowNode
              variant="sink"
              className="bg-amber-500/20 border-amber-400/30 text-amber-700"
              tabIndex={0}
            >
              10:10-10:15<br />
              <span className="text-xs text-[var(--ink-muted)]">Window 3</span>
            </FlowNode>
          </DiagramTooltip>

          <Arrow direction="right" />

          <DiagramTooltip
            content={
              <div>
                <strong>Window 4: 10:15-10:20</strong>
                <p className="mt-1">Четвёртое окно.</p>
              </div>
            }
          >
            <FlowNode
              variant="sink"
              className="bg-emerald-500/20 border-emerald-400/30 text-emerald-700"
              tabIndex={0}
            >
              10:15-10:20<br />
              <span className="text-xs text-[var(--ink-muted)]">Window 4</span>
            </FlowNode>
          </DiagramTooltip>
        </div>

        <div className="text-sm text-blue-400 border-l-2 border-blue-400 pl-3">
          <strong>Характеристики:</strong>
          <p className="mt-1 text-[var(--ink-default)]">
            Неперекрывающиеся окна фиксированного размера. Каждое событие
            попадает ровно в одно окно. Use case: hourly/daily aggregations,
            periodic metrics.
          </p>
          <p className="mt-2 text-[var(--ink-default)]">
            SQL: TUMBLE(event_time, INTERVAL '5' MINUTES)
          </p>
        </div>
      </div>
    </DiagramContainer>
  );
}

/**
 * SlidingWindowsDiagram - Overlapping windows with slide interval
 */
export function SlidingWindowsDiagram() {
  return (
    <DiagramContainer
      title="Sliding Windows (размер = 10 минут, slide = 5 минут)"
      color="purple"
      description="Перекрывающиеся окна. Событие может попасть в несколько окон."
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <DiagramTooltip
            content={
              <div>
                <strong>Window 1: 10:00-10:10</strong>
                <p className="mt-1">
                  Первое окно размером 10 минут. События в диапазоне [10:00,
                  10:10).
                </p>
              </div>
            }
          >
            <FlowNode
              variant="sink"
              className="bg-purple-500/20 border-purple-400/30 text-purple-700 opacity-80"
              tabIndex={0}
            >
              10:00-10:10<br />
              <span className="text-xs text-[var(--ink-muted)]">Window 1</span>
            </FlowNode>
          </DiagramTooltip>

          <div className="text-[var(--ink-subtle)] text-sm px-2">overlap →</div>

          <DiagramTooltip
            content={
              <div>
                <strong>Window 2: 10:05-10:15</strong>
                <p className="mt-1">
                  Второе окно сдвинуто на 5 минут (slide). Перекрывается с
                  Window 1 в интервале [10:05, 10:10).
                </p>
                <p className="mt-2 text-purple-700">
                  Событие в 10:07 попадёт в оба окна!
                </p>
              </div>
            }
          >
            <FlowNode
              variant="sink"
              className="bg-purple-500/20 border-purple-400/30 text-purple-700 opacity-80"
              tabIndex={0}
            >
              10:05-10:15<br />
              <span className="text-xs text-[var(--ink-muted)]">Window 2</span>
            </FlowNode>
          </DiagramTooltip>

          <div className="text-[var(--ink-subtle)] text-sm px-2">overlap →</div>

          <DiagramTooltip
            content={
              <div>
                <strong>Window 3: 10:10-10:20</strong>
                <p className="mt-1">
                  Третье окно сдвинуто ещё на 5 минут. Перекрывается с Window
                  2.
                </p>
              </div>
            }
          >
            <FlowNode
              variant="sink"
              className="bg-purple-500/20 border-purple-400/30 text-purple-700 opacity-80"
              tabIndex={0}
            >
              10:10-10:20<br />
              <span className="text-xs text-[var(--ink-muted)]">Window 3</span>
            </FlowNode>
          </DiagramTooltip>
        </div>

        <div className="text-sm text-purple-400 border-l-2 border-purple-400 pl-3">
          <strong>Характеристики:</strong>
          <p className="mt-1 text-[var(--ink-default)]">
            Перекрывающиеся окна. Событие может попасть в несколько окон. Use
            case: moving averages, rolling metrics, trend analysis.
          </p>
          <p className="mt-2 text-[var(--ink-default)]">
            SQL: HOP(event_time, INTERVAL '5' MINUTES, INTERVAL '10' MINUTES)
          </p>
          <p className="mt-2 text-amber-700">
            Warning: Малый slide создаёт много окон → больше state → больше
            памяти
          </p>
        </div>
      </div>
    </DiagramContainer>
  );
}

/**
 * SessionWindowsDiagram - Dynamic windows with gap-based closure
 */
export function SessionWindowsDiagram() {
  return (
    <DiagramContainer
      title="Session Windows (gap = 30 минут)"
      color="emerald"
      description="Динамические окна. Закрываются после периода неактивности (gap)."
    >
      <div className="flex flex-col gap-4">
        {/* Session 1 */}
        <div className="flex flex-col gap-2">
          <div className="text-sm text-emerald-700 font-semibold">
            User 1 — Session 1:
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <DiagramTooltip
              content={
                <div>
                  <strong>Session 1: 10:00-10:15</strong>
                  <p className="mt-1">
                    Пользователь делает заказы в 10:00, 10:05, 10:15. Все
                    события в одной сессии, т.к. gap между ними &lt; 30 минут.
                  </p>
                </div>
              }
            >
              <FlowNode
                variant="sink"
                className="bg-emerald-500/20 border-emerald-400/30 text-emerald-700"
                tabIndex={0}
              >
                10:00-10:15<br />
                <span className="text-xs text-[var(--ink-muted)]">
                  Session 1 (3 события)
                </span>
              </FlowNode>
            </DiagramTooltip>

            <Arrow direction="right" dashed />

            <DiagramTooltip
              content={
                <div>
                  <strong>Gap (30 минут)</strong>
                  <p className="mt-1">
                    Период неактивности. Нет заказов с 10:15 до 10:45. Gap ≥ 30
                    минут → Session 1 закрывается.
                  </p>
                </div>
              }
            >
              <FlowNode
                variant="app"
                size="sm"
                className="bg-rose-500/20 border-rose-400/30 text-rose-700"
                tabIndex={0}
              >
                Gap: 30 min<br />
                <span className="text-xs text-[var(--ink-muted)]">(inactivity)</span>
              </FlowNode>
            </DiagramTooltip>

            <Arrow direction="right" dashed />

            <DiagramTooltip
              content={
                <div>
                  <strong>Session 2: 10:45-10:55</strong>
                  <p className="mt-1">
                    Новая сессия начинается после gap. События в 10:45, 10:50,
                    10:55.
                  </p>
                </div>
              }
            >
              <FlowNode
                variant="sink"
                className="bg-emerald-500/20 border-emerald-400/30 text-emerald-700"
                tabIndex={0}
              >
                10:45-10:55<br />
                <span className="text-xs text-[var(--ink-muted)]">
                  Session 2 (3 события)
                </span>
              </FlowNode>
            </DiagramTooltip>
          </div>
        </div>

        <div className="text-sm text-emerald-400 border-l-2 border-emerald-400 pl-3">
          <strong>Характеристики:</strong>
          <p className="mt-1 text-[var(--ink-default)]">
            Динамические окна. Размер зависит от событий. Закрываются после gap
            of inactivity. Use case: user session analysis, clickstream
            analytics, activity tracking.
          </p>
          <p className="mt-2 text-[var(--ink-default)]">
            SQL: SESSION(event_time, INTERVAL '30' MINUTES)
          </p>
          <p className="mt-2 text-amber-700">
            Note: Session windows сложнее для state management, т.к. session
            границы неизвестны заранее
          </p>
        </div>
      </div>
    </DiagramContainer>
  );
}

/**
 * TemporalJoinSequenceDiagram - Shows temporal join with versioned dimension table
 */
export function TemporalJoinSequenceDiagram() {
  const actors: SequenceActorDef[] = [
    {
      id: 'orders',
      label: 'Orders Stream',
      variant: 'queue',
      tooltip: (
        <div>
          <strong>Orders Stream</strong>
          <p className="mt-1">
            Поток заказов из Kafka. Каждый order имеет product_id и
            order_time.
          </p>
        </div>
      ),
    },
    {
      id: 'products',
      label: 'Products Table (Versioned)',
      variant: 'database',
      tooltip: (
        <div>
          <strong>Products Dimension Table</strong>
          <p className="mt-1">
            Versioned dimension table. Flink хранит историю изменений: [09:00]
            price=100.00, [10:00] price=120.00, [11:00] price=150.00.
          </p>
        </div>
      ),
    },
    {
      id: 'join',
      label: 'Temporal Join',
      variant: 'service',
      tooltip: (
        <div>
          <strong>Temporal Join Operation</strong>
          <p className="mt-1">
            FOR SYSTEM_TIME AS OF: Join выполняется "as of" order_time. Ищет
            версию product ≤ order_time.
          </p>
        </div>
      ),
    },
  ];

  const messages: SequenceMessageDef[] = [
    {
      id: 'version1',
      from: 'products',
      to: 'products',
      label: 'Version 1: product_id=101, price=100.00 (09:00)',
      variant: 'sync',
      tooltip: (
        <div>
          <strong>Product Version 1</strong>
          <p className="mt-1">
            Первая версия продукта. Цена 100.00 действует с 09:00.
          </p>
        </div>
      ),
    },
    {
      id: 'order1',
      from: 'orders',
      to: 'join',
      label: 'Order at 09:30: product_id=101',
      variant: 'sync',
      tooltip: (
        <div>
          <strong>Order 1</strong>
          <p className="mt-1">
            Заказ сделан в 09:30. Temporal join должен найти версию product "as
            of" 09:30.
          </p>
        </div>
      ),
    },
    {
      id: 'lookup1',
      from: 'join',
      to: 'products',
      label: 'Lookup AS OF 09:30',
      variant: 'sync',
      tooltip: (
        <div>
          <strong>Temporal Lookup</strong>
          <p className="mt-1">
            Flink ищет версию product ≤ 09:30. Находит Version 1 (09:00).
          </p>
        </div>
      ),
    },
    {
      id: 'result1',
      from: 'products',
      to: 'join',
      label: 'Returns price=100.00 (version 1)',
      variant: 'return',
      tooltip: (
        <div>
          <strong>Join Result</strong>
          <p className="mt-1">
            Возвращает price=100.00 из Version 1. Order обогащён правильной
            ценой на момент заказа.
          </p>
        </div>
      ),
    },
    {
      id: 'version2',
      from: 'products',
      to: 'products',
      label: 'Version 2: price=120.00 (10:00)',
      variant: 'sync',
      tooltip: (
        <div>
          <strong>Product Version 2</strong>
          <p className="mt-1">
            Цена изменилась на 120.00 в 10:00. Новая версия сохранена в state.
          </p>
        </div>
      ),
    },
    {
      id: 'order2',
      from: 'orders',
      to: 'join',
      label: 'Order at 10:30: product_id=101',
      variant: 'sync',
      tooltip: (
        <div>
          <strong>Order 2</strong>
          <p className="mt-1">
            Заказ сделан в 10:30. Temporal join должен найти версию "as of"
            10:30.
          </p>
        </div>
      ),
    },
    {
      id: 'lookup2',
      from: 'join',
      to: 'products',
      label: 'Lookup AS OF 10:30',
      variant: 'sync',
      tooltip: (
        <div>
          <strong>Temporal Lookup</strong>
          <p className="mt-1">
            Flink ищет версию product ≤ 10:30. Находит Version 2 (10:00).
          </p>
        </div>
      ),
    },
    {
      id: 'result2',
      from: 'products',
      to: 'join',
      label: 'Returns price=120.00 (version 2)',
      variant: 'return',
      tooltip: (
        <div>
          <strong>Join Result</strong>
          <p className="mt-1">
            Возвращает price=120.00 из Version 2. Order обогащён актуальной
            ценой на момент заказа.
          </p>
        </div>
      ),
    },
  ];

  return (
    <DiagramContainer
      title="Temporal Join: Versioned Dimension Enrichment"
      color="blue"
      description='FOR SYSTEM_TIME AS OF — join "as of" определённого времени'
    >
      <SequenceDiagram
        actors={actors}
        messages={messages}
        messageSpacing={55}
      />
      <div className="mt-4 text-sm text-blue-400 border-l-2 border-blue-400 pl-3">
        <strong>Ключевая идея:</strong>
        <p className="mt-1 text-[var(--ink-default)]">
          Temporal join использует event time из orders для поиска правильной
          версии product. Если цена изменилась между заказами — каждый заказ
          получит цену, актуальную на момент его создания.
        </p>
        <p className="mt-2 text-amber-700">
          Требования: PRIMARY KEY на dimension table, WATERMARK на обеих
          таблицах
        </p>
      </div>
    </DiagramContainer>
  );
}

/**
 * StateGrowthDiagram - Shows state growth over time with OOM warning
 */
export function StateGrowthDiagram() {
  return (
    <DiagramContainer
      title="State Size Explosion — Проблема Unbounded State"
      color="rose"
      description="State растёт unbounded без TTL конфигурации"
    >
      <div className="flex flex-col items-center gap-3">
        <DiagramTooltip
          content={
            <div>
              <strong>Day 1: 1 GB state</strong>
              <p className="mt-1">
                Начальный state size. Stateful aggregations для всех ключей.
              </p>
            </div>
          }
        >
          <FlowNode
            variant="database"
            className="bg-emerald-500/20 border-emerald-400/30 text-emerald-700"
            tabIndex={0}
          >
            Day 1: 1 GB state
          </FlowNode>
        </DiagramTooltip>

        <Arrow direction="down" />

        <DiagramTooltip
          content={
            <div>
              <strong>Day 7: 10 GB state</strong>
              <p className="mt-1">
                State растёт по мере накопления ключей. Window state, temporal
                join history, deduplication sets.
              </p>
            </div>
          }
        >
          <FlowNode
            variant="database"
            className="bg-amber-500/20 border-amber-400/30 text-amber-700"
            tabIndex={0}
          >
            Day 7: 10 GB state
          </FlowNode>
        </DiagramTooltip>

        <Arrow direction="down" />

        <DiagramTooltip
          content={
            <div>
              <strong>Day 30: 50 GB state</strong>
              <p className="mt-1">
                State продолжает расти. Memory pressure на TaskManagers.
              </p>
              <p className="mt-2 text-amber-700">
                Warning: Приближаемся к heap limit
              </p>
            </div>
          }
        >
          <FlowNode
            variant="database"
            className="bg-amber-500/20 border-amber-400/30 text-amber-700"
            tabIndex={0}
          >
            Day 30: 50 GB state
          </FlowNode>
        </DiagramTooltip>

        <Arrow direction="down" />

        <DiagramTooltip
          content={
            <div>
              <strong>Day 90: OutOfMemoryError!</strong>
              <p className="mt-1">
                State превысил heap memory. TaskManager crash. Job failure.
              </p>
              <p className="mt-2 text-rose-700">
                Критическая проблема: State растёт unbounded без cleanup
              </p>
            </div>
          }
        >
          <FlowNode
            variant="app"
            className="bg-rose-500/20 border-rose-400/30 text-rose-700 border-2 animate-pulse"
            tabIndex={0}
          >
            Day 90: OOM crash! 💥
          </FlowNode>
        </DiagramTooltip>

        <div className="mt-4 text-sm text-rose-400 border-l-2 border-rose-400 pl-3">
          <strong>Решения:</strong>
          <ul className="mt-1 list-disc list-inside text-[var(--ink-default)]">
            <li>
              <strong>State TTL:</strong> Автоматический cleanup старого state
              (например, TTL = 7 дней)
            </li>
            <li>
              <strong>RocksDB State Backend:</strong> On-disk state вместо
              in-memory (терабайты state)
            </li>
            <li>
              <strong>Session windows:</strong> Вместо global aggregations
              (state cleanup после session end)
            </li>
            <li>
              <strong>Мониторинг:</strong> Alert на state size &gt; 80% heap
              memory
            </li>
          </ul>
        </div>
      </div>
    </DiagramContainer>
  );
}
