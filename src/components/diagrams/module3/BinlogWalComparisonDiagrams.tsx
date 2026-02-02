/**
 * Binlog vs WAL Comparison Diagrams
 *
 * Exports:
 * - DetailedArchitectureComparisonDiagram: Side-by-side PostgreSQL vs MySQL architecture
 * - EventFormatComparisonDiagram: Event structure comparison (LSN vs GTID)
 * - ReplicationModesDiagram: Replication topology comparison
 * - SlotVsBinlogDiagram: Position tracking comparison
 * - CdcReadinessDiagram: CDC configuration requirements comparison
 */

import { FlowNode } from '../primitives/FlowNode';
import { Arrow } from '../primitives/Arrow';
import { DiagramContainer } from '../primitives/DiagramContainer';
import { DiagramTooltip } from '../primitives/Tooltip';

/**
 * DetailedArchitectureComparisonDiagram - Side-by-side deep dive
 * PostgreSQL: WAL segments -> Replication Slots -> pgoutput -> CDC
 * MySQL: Binlog files -> Binary Log -> CDC
 */
export function DetailedArchitectureComparisonDiagram() {
  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* PostgreSQL Architecture */}
      <DiagramContainer
        title="PostgreSQL WAL Architecture"
        color="blue"
        className="flex-1"
      >
        <div className="flex flex-col items-center gap-4">
          <DiagramTooltip content="PostgreSQL сервер записывает ВСЕ изменения в Write-Ahead Log (WAL). При wal_level=logical WAL содержит дополнительные данные для декодирования: OID таблиц, tuple data.">
            <FlowNode variant="database" tabIndex={0}>
              PostgreSQL Server
            </FlowNode>
          </DiagramTooltip>

          <Arrow direction="down" label="Записывает изменения" />

          <DiagramTooltip content="WAL сегменты — 16MB файлы (по умолчанию), хранящие бинарные изменения страниц. Файлы именуются как 000000010000000000000001. При физической репликации копируются побайтово.">
            <FlowNode variant="sink" tabIndex={0}>
              WAL Segments
            </FlowNode>
          </DiagramTooltip>

          <Arrow direction="down" label="Гарантирует сохранность" />

          <DiagramTooltip content="Replication Slot — серверный объект, который ГАРАНТИРУЕТ сохранение WAL до прочтения клиентом. Хранит restart_lsn и confirmed_flush_lsn. Если slot забыт — WAL накапливается бесконечно!">
            <FlowNode variant="connector" tabIndex={0} className="border-2 border-amber-400">
              Replication Slot
            </FlowNode>
          </DiagramTooltip>

          <Arrow direction="down" label="pgoutput plugin" />

          <DiagramTooltip content="Logical Decoder преобразует бинарный WAL в структурированные события INSERT/UPDATE/DELETE. pgoutput — стандартный плагин PostgreSQL 10+, работает на Aurora/RDS/Cloud SQL.">
            <FlowNode variant="connector" tabIndex={0}>
              Logical Decoder
            </FlowNode>
          </DiagramTooltip>

          <Arrow direction="down" label="Структурированные события" />

          <DiagramTooltip content="Debezium читает через streaming replication protocol. Каждое событие содержит полную схему таблицы — schema history topic НЕ нужен!">
            <FlowNode variant="app" tabIndex={0}>
              Debezium CDC
            </FlowNode>
          </DiagramTooltip>
        </div>
      </DiagramContainer>

      {/* MySQL Architecture */}
      <DiagramContainer
        title="MySQL Binlog Architecture"
        color="emerald"
        className="flex-1"
      >
        <div className="flex flex-col items-center gap-4">
          <DiagramTooltip content="MySQL сервер с binlog_format=ROW записывает логические изменения строк в binary log. В отличие от PostgreSQL WAL, binlog изначально логический — не требует декодирования.">
            <FlowNode variant="database" tabIndex={0}>
              MySQL Server
            </FlowNode>
          </DiagramTooltip>

          <Arrow direction="down" label="Записывает ROW events" />

          <DiagramTooltip content="Binlog файлы (mysql-bin.000001, mysql-bin.000002) хранят TABLE_MAP и WRITE_ROWS/UPDATE_ROWS/DELETE_ROWS события. Ротация по размеру (max_binlog_size) или времени.">
            <FlowNode variant="sink" tabIndex={0}>
              Binlog Files
            </FlowNode>
          </DiagramTooltip>

          <Arrow direction="down" label="binlog_expire_logs_seconds" />

          <DiagramTooltip content="КРИТИЧНО: MySQL чистит binlog по расписанию (binlog_expire_logs_seconds), НЕЗАВИСИМО от того, прочитал ли Debezium данные. Нет server-side гарантии сохранности!">
            <FlowNode variant="connector" tabIndex={0} className="border-2 border-rose-400">
              Retention Policy
            </FlowNode>
          </DiagramTooltip>

          <Arrow direction="down" label="GTID tracking" />

          <DiagramTooltip content="Debezium хранит позицию (GTID или file:offset) в Kafka Connect offsets topic. Если connector down дольше retention — данные потеряны, требуется resnapshot.">
            <FlowNode variant="connector" tabIndex={0}>
              Client-Side Offset
            </FlowNode>
          </DiagramTooltip>

          <Arrow direction="down" label="+ Schema History Topic" />

          <DiagramTooltip content="ОБЯЗАТЕЛЬНЫЙ компонент: schema history topic хранит все DDL изменения для восстановления структуры таблиц. Без него connector не может стартовать после restart!">
            <FlowNode variant="app" tabIndex={0}>
              Debezium CDC
            </FlowNode>
          </DiagramTooltip>
        </div>
      </DiagramContainer>
    </div>
  );
}

/**
 * EventFormatComparisonDiagram - Event structure comparison
 * PostgreSQL: LSN-based, page-level changes
 * MySQL: GTID-based, row-level changes
 */
export function EventFormatComparisonDiagram() {
  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* PostgreSQL LSN */}
      <DiagramContainer
        title="PostgreSQL: LSN Position"
        color="blue"
        className="flex-1"
      >
        <div className="space-y-4">
          <DiagramTooltip content="Log Sequence Number (LSN) — 64-битное число, представленное как hexadecimal. Формат: timeline/offset, например 0/16B374D8 = timeline 0, offset 381101272 bytes.">
            <FlowNode variant="sink" tabIndex={0} size="sm">
              <div className="flex flex-col items-center">
                <span className="text-[10px] text-blue-400">Position Format</span>
                <span className="font-mono">0/16B374D8</span>
              </div>
            </FlowNode>
          </DiagramTooltip>

          <div className="text-xs text-gray-400 space-y-2 px-2">
            <DiagramTooltip content="LSN монотонно возрастает внутри одного сервера. При failover timeline может измениться (1/..., 2/...). Debezium отслеживает через replication slot.">
              <div className="flex items-center gap-2 cursor-help">
                <span className="text-blue-400">+</span>
                <span>Монотонно возрастает</span>
              </div>
            </DiagramTooltip>
            <DiagramTooltip content="LSN уникален только в пределах одного PostgreSQL сервера. При переключении на replica LSN может отличаться от primary.">
              <div className="flex items-center gap-2 cursor-help">
                <span className="text-blue-400">+</span>
                <span>Scope: single server</span>
              </div>
            </DiagramTooltip>
            <DiagramTooltip content="Сервер хранит restart_lsn в replication slot. Клиент (Debezium) не обязан хранить позицию — slot помнит.">
              <div className="flex items-center gap-2 cursor-help">
                <span className="text-blue-400">+</span>
                <span>Server-side хранение</span>
              </div>
            </DiagramTooltip>
          </div>

          <DiagramTooltip content="Schema встроена в каждое WAL событие через pgoutput plugin. Debezium получает полную структуру таблицы без дополнительных запросов.">
            <FlowNode variant="connector" tabIndex={0} size="sm">
              Schema: встроена в событие
            </FlowNode>
          </DiagramTooltip>
        </div>
      </DiagramContainer>

      {/* MySQL GTID */}
      <DiagramContainer
        title="MySQL: GTID Position"
        color="emerald"
        className="flex-1"
      >
        <div className="space-y-4">
          <DiagramTooltip content="Global Transaction ID (GTID) — UUID:sequence_number, например 3E11FA47-71CA-11E1-9E33-C80AA9429562:1-150. UUID уникален для каждого MySQL сервера.">
            <FlowNode variant="sink" tabIndex={0} size="sm">
              <div className="flex flex-col items-center">
                <span className="text-[10px] text-emerald-400">Position Format</span>
                <span className="font-mono text-xs">uuid:1-150</span>
              </div>
            </FlowNode>
          </DiagramTooltip>

          <div className="text-xs text-gray-400 space-y-2 px-2">
            <DiagramTooltip content="GTID глобально уникален во всём MySQL кластере, включая все реплики. При failover GTID продолжает нумерацию — нет reset.">
              <div className="flex items-center gap-2 cursor-help">
                <span className="text-emerald-400">+</span>
                <span>Глобально уникален в кластере</span>
              </div>
            </DiagramTooltip>
            <DiagramTooltip content="Failover прозрачен: Debezium просто переподключается к новому primary с последним GTID. Нет server-side state для миграции.">
              <div className="flex items-center gap-2 cursor-help">
                <span className="text-emerald-400">+</span>
                <span>Failover прозрачен</span>
              </div>
            </DiagramTooltip>
            <DiagramTooltip content="MySQL НЕ хранит позицию клиента. Debezium сохраняет GTID в Kafka Connect offsets topic. Client-side ответственность!">
              <div className="flex items-center gap-2 cursor-help">
                <span className="text-amber-400">!</span>
                <span>Client-side хранение</span>
              </div>
            </DiagramTooltip>
          </div>

          <DiagramTooltip content="TABLE_MAP_EVENT содержит только table_id, схема НЕ включена. Debezium требует schema history topic для восстановления структуры таблиц.">
            <FlowNode variant="connector" tabIndex={0} size="sm" className="border border-amber-400/50">
              Schema: требует history topic
            </FlowNode>
          </DiagramTooltip>
        </div>
      </DiagramContainer>
    </div>
  );
}

/**
 * ReplicationModesDiagram - Replication topology comparison
 * PostgreSQL: Physical vs Logical replication
 * MySQL: Traditional vs Group replication
 */
export function ReplicationModesDiagram() {
  return (
    <div className="space-y-6">
      {/* PostgreSQL Modes */}
      <DiagramContainer title="PostgreSQL Replication Modes" color="blue">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Physical */}
          <div className="flex-1 space-y-3">
            <DiagramTooltip content="Physical (Streaming) Replication — побайтовая копия WAL на реплику. Используется для High Availability и failover. Реплика идентична мастеру на уровне блоков.">
              <FlowNode variant="database" tabIndex={0} size="sm">
                Physical Replication
              </FlowNode>
            </DiagramTooltip>
            <div className="text-xs text-gray-400 px-2 space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-blue-400">+</span> Побайтовая копия
              </div>
              <div className="flex items-center gap-2">
                <span className="text-blue-400">+</span> Только PG &rarr; PG
              </div>
              <div className="flex items-center gap-2">
                <span className="text-blue-400">+</span> Вся база целиком
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-500">-</span> Не для CDC
              </div>
            </div>
          </div>

          {/* Logical */}
          <div className="flex-1 space-y-3">
            <DiagramTooltip content="Logical Replication — преобразование WAL в структурированные события INSERT/UPDATE/DELETE. Debezium использует этот режим. Требует wal_level=logical.">
              <FlowNode variant="connector" tabIndex={0} size="sm" className="border border-emerald-400">
                Logical Replication
              </FlowNode>
            </DiagramTooltip>
            <div className="text-xs text-gray-400 px-2 space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-emerald-400">+</span> Структурированные события
              </div>
              <div className="flex items-center gap-2">
                <span className="text-emerald-400">+</span> Выборочные таблицы
              </div>
              <div className="flex items-center gap-2">
                <span className="text-emerald-400">+</span> Кросс-версионность
              </div>
              <div className="flex items-center gap-2">
                <span className="text-emerald-400">+</span> CDC через Debezium
              </div>
            </div>
          </div>
        </div>
      </DiagramContainer>

      {/* MySQL Modes */}
      <DiagramContainer title="MySQL Replication Modes" color="emerald">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Traditional */}
          <div className="flex-1 space-y-3">
            <DiagramTooltip content="Traditional (Async) Replication — binlog события асинхронно отправляются на реплику. Простой single-master setup. Debezium читает binlog напрямую.">
              <FlowNode variant="database" tabIndex={0} size="sm">
                Traditional Replication
              </FlowNode>
            </DiagramTooltip>
            <div className="text-xs text-gray-400 px-2 space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-emerald-400">+</span> Простая настройка
              </div>
              <div className="flex items-center gap-2">
                <span className="text-emerald-400">+</span> Single-master
              </div>
              <div className="flex items-center gap-2">
                <span className="text-emerald-400">+</span> Binlog уже логический
              </div>
              <div className="flex items-center gap-2">
                <span className="text-emerald-400">+</span> CDC через Debezium
              </div>
            </div>
          </div>

          {/* Group */}
          <div className="flex-1 space-y-3">
            <DiagramTooltip content="Group Replication — multi-master topology с automatic failover. Используется в InnoDB Cluster. Debezium подключается к primary, при failover переключается автоматически (с GTID).">
              <FlowNode variant="connector" tabIndex={0} size="sm">
                Group Replication
              </FlowNode>
            </DiagramTooltip>
            <div className="text-xs text-gray-400 px-2 space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-emerald-400">+</span> Multi-master
              </div>
              <div className="flex items-center gap-2">
                <span className="text-emerald-400">+</span> Automatic failover
              </div>
              <div className="flex items-center gap-2">
                <span className="text-emerald-400">+</span> GTID обязателен
              </div>
              <div className="flex items-center gap-2">
                <span className="text-emerald-400">+</span> CDC через GTID
              </div>
            </div>
          </div>
        </div>
      </DiagramContainer>
    </div>
  );
}

/**
 * SlotVsBinlogDiagram - Position tracking comparison
 * PostgreSQL: Replication slot with restart_lsn (server-side)
 * MySQL: Binlog file + position + GTID (client-side)
 */
export function SlotVsBinlogDiagram() {
  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* PostgreSQL Slot */}
      <DiagramContainer
        title="PostgreSQL: Server-Side Tracking"
        color="blue"
        recommended
        className="flex-1"
      >
        <div className="space-y-4">
          <DiagramTooltip content="Replication Slot создаётся на сервере PostgreSQL. Хранит restart_lsn (позицию для возобновления) и confirmed_flush_lsn (подтверждённая позиция).">
            <FlowNode variant="connector" tabIndex={0}>
              <div className="flex flex-col items-center">
                <span className="text-sm font-medium">Replication Slot</span>
                <span className="text-[10px] text-gray-400">restart_lsn, confirmed_flush_lsn</span>
              </div>
            </FlowNode>
          </DiagramTooltip>

          <div className="text-xs text-gray-400 space-y-2 px-2">
            <DiagramTooltip content="Slot гарантирует сохранение WAL: пока Debezium не подтвердил чтение, PostgreSQL НЕ удалит WAL сегменты. Никаких потерь при crash.">
              <div className="flex items-center gap-2 cursor-help">
                <span className="text-emerald-400">+</span>
                <span>WAL сохраняется до подтверждения</span>
              </div>
            </DiagramTooltip>
            <DiagramTooltip content="При перезапуске Debezium PostgreSQL сообщает сохранённый restart_lsn. Клиент продолжает с точной позиции.">
              <div className="flex items-center gap-2 cursor-help">
                <span className="text-emerald-400">+</span>
                <span>Автоматическое возобновление</span>
              </div>
            </DiagramTooltip>
            <DiagramTooltip content="ОПАСНОСТЬ: Если slot забыт (active=false), WAL накапливается бесконечно и переполняет диск. Требуется мониторинг pg_replication_slots!">
              <div className="flex items-center gap-2 cursor-help">
                <span className="text-rose-400">!</span>
                <span>Abandoned slot &rarr; disk full</span>
              </div>
            </DiagramTooltip>
          </div>
        </div>
      </DiagramContainer>

      {/* MySQL Client-Side */}
      <DiagramContainer
        title="MySQL: Client-Side Tracking"
        color="emerald"
        className="flex-1"
      >
        <div className="space-y-4">
          <DiagramTooltip content="MySQL НЕ создаёт server-side объект для CDC. Debezium хранит позицию (GTID или file:offset) в Kafka Connect offsets topic.">
            <FlowNode variant="connector" tabIndex={0}>
              <div className="flex flex-col items-center">
                <span className="text-sm font-medium">Kafka Connect Offsets</span>
                <span className="text-[10px] text-gray-400">GTID или file:position</span>
              </div>
            </FlowNode>
          </DiagramTooltip>

          <div className="text-xs text-gray-400 space-y-2 px-2">
            <DiagramTooltip content="Нет server-side state — чище для сервера. Abandoned connector не влияет на MySQL (binlog чистится по расписанию независимо).">
              <div className="flex items-center gap-2 cursor-help">
                <span className="text-emerald-400">+</span>
                <span>Нет влияния на сервер</span>
              </div>
            </DiagramTooltip>
            <DiagramTooltip content="GTID глобально уникален — при failover Debezium просто переподключается к новому primary с сохранённым GTID.">
              <div className="flex items-center gap-2 cursor-help">
                <span className="text-emerald-400">+</span>
                <span>Failover проще с GTID</span>
              </div>
            </DiagramTooltip>
            <DiagramTooltip content="КРИТИЧНО: Если Debezium down дольше binlog_expire_logs_seconds (default 7 дней), binlog удаляется. Восстановление невозможно — требуется resnapshot!">
              <div className="flex items-center gap-2 cursor-help">
                <span className="text-rose-400">!</span>
                <span>Lag &gt; retention &rarr; resnapshot</span>
              </div>
            </DiagramTooltip>
          </div>
        </div>
      </DiagramContainer>
    </div>
  );
}

/**
 * CdcReadinessDiagram - CDC configuration requirements comparison
 * PostgreSQL: wal_level=logical required
 * MySQL: binlog_format=ROW required
 */
export function CdcReadinessDiagram() {
  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* PostgreSQL Requirements */}
      <DiagramContainer
        title="PostgreSQL CDC Requirements"
        color="blue"
        className="flex-1"
      >
        <div className="space-y-4">
          <div className="text-sm text-gray-300 mb-3 text-center">
            Обязательные параметры для CDC
          </div>

          <div className="space-y-3">
            <DiagramTooltip content="КРИТИЧЕСКИ ВАЖНО: wal_level=logical включает запись дополнительных данных в WAL для логического декодирования. Без этого параметра Debezium не сможет подключиться.">
              <FlowNode variant="sink" tabIndex={0} size="sm" className="border-2 border-blue-400">
                wal_level = logical
              </FlowNode>
            </DiagramTooltip>

            <DiagramTooltip content="Максимум слотов репликации. Каждый Debezium connector требует один слот. Рекомендуется 10 для production с запасом.">
              <FlowNode variant="sink" tabIndex={0} size="sm">
                max_replication_slots = 10
              </FlowNode>
            </DiagramTooltip>

            <DiagramTooltip content="Максимум соединений для чтения WAL. Должен быть >= max_replication_slots. Каждый активный слот использует одно соединение.">
              <FlowNode variant="sink" tabIndex={0} size="sm">
                max_wal_senders = 10
              </FlowNode>
            </DiagramTooltip>
          </div>

          <div className="text-xs text-gray-500 text-center mt-4">
            После изменения параметров требуется restart PostgreSQL
          </div>
        </div>
      </DiagramContainer>

      {/* MySQL Requirements */}
      <DiagramContainer
        title="MySQL CDC Requirements"
        color="emerald"
        className="flex-1"
      >
        <div className="space-y-4">
          <div className="text-sm text-gray-300 mb-3 text-center">
            Обязательные параметры для CDC
          </div>

          <div className="space-y-3">
            <DiagramTooltip content="КРИТИЧЕСКИ ВАЖНО: binlog_format=ROW записывает row-level изменения. При STATEMENT или MIXED Debezium не сможет корректно захватывать данные.">
              <FlowNode variant="sink" tabIndex={0} size="sm" className="border-2 border-emerald-400">
                binlog_format = ROW
              </FlowNode>
            </DiagramTooltip>

            <DiagramTooltip content="Рекомендуется FULL для получения полных данных строки до и после изменения. При MINIMAL Debezium получает только изменённые колонки.">
              <FlowNode variant="sink" tabIndex={0} size="sm">
                binlog_row_image = FULL
              </FlowNode>
            </DiagramTooltip>

            <DiagramTooltip content="GTID mode для надёжного failover. При включённом GTID Debezium может автоматически переключиться на новый primary без потери данных.">
              <FlowNode variant="sink" tabIndex={0} size="sm">
                gtid_mode = ON
              </FlowNode>
            </DiagramTooltip>
          </div>

          <div className="text-xs text-gray-500 text-center mt-4">
            Aurora MySQL: настраивается через Parameter Groups
          </div>
        </div>
      </DiagramContainer>
    </div>
  );
}
