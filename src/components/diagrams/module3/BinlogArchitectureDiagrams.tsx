/**
 * Binlog Architecture Diagrams
 *
 * Exports:
 * - BinlogVsWalDiagram: Comparison of MySQL binlog vs PostgreSQL WAL approaches
 * - RowFormatDiagram: How ROW format records UPDATE operations
 * - BinlogEventSequenceDiagram: Complete binlog event sequence for a transaction
 * - BinlogRotationDiagram: Binlog file rotation and Debezium position tracking
 */

import { FlowNode } from '../primitives/FlowNode';
import { Arrow } from '../primitives/Arrow';
import { DiagramContainer } from '../primitives/DiagramContainer';
import { DiagramTooltip } from '../primitives/Tooltip';
import { SequenceDiagram } from '../primitives/SequenceDiagram';
import type { SequenceActorDef, SequenceMessageDef } from '../primitives/types';

/**
 * BinlogVsWalDiagram - Comparison of MySQL binlog vs PostgreSQL WAL
 */
export function BinlogVsWalDiagram() {
  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* PostgreSQL: WAL -> Logical Decoding */}
      <DiagramContainer
        title="PostgreSQL: WAL -> Logical Decoding"
        color="blue"
        className="flex-1"
      >
        <div className="flex flex-col items-center gap-4">
          <DiagramTooltip content="Write-Ahead Log (WAL) - физический журнал транзакций PostgreSQL. По умолчанию содержит побайтовые изменения блоков страниц. Оптимизирован для durability и crash recovery.">
            <FlowNode variant="sink" tabIndex={0}>
              WAL
              <span className="block text-xs text-gray-400 mt-1">Физический лог</span>
            </FlowNode>
          </DiagramTooltip>

          <Arrow direction="down" label="wal_level=logical" />

          <DiagramTooltip content="Logical Decoding преобразует физический WAL в читаемые логические операции. Требует настройки wal_level=logical. Использует pgoutput plugin для формирования структурированного вывода.">
            <FlowNode variant="connector" tabIndex={0}>
              Logical Decoding
            </FlowNode>
          </DiagramTooltip>

          <Arrow direction="down" label="pgoutput plugin" />

          <DiagramTooltip content="Структурированные события INSERT/UPDATE/DELETE с before/after данными. Готовы для чтения Debezium connector. Требует replication slot для position tracking.">
            <FlowNode variant="app" tabIndex={0}>
              CDC Events
            </FlowNode>
          </DiagramTooltip>

          <div className="text-xs text-gray-400 text-center mt-2 px-4">
            Изначально физический формат<br />
            Требует декодирования<br />
            Оптимизирован для durability
          </div>
        </div>
      </DiagramContainer>

      {/* MySQL: Binary Log */}
      <DiagramContainer
        title="MySQL: Binary Log"
        color="emerald"
        recommended
        className="flex-1"
      >
        <div className="flex flex-col items-center gap-4">
          <DiagramTooltip content="Binary Log (binlog) - логический журнал изменений MySQL. Изначально создан для репликации. При binlog_format=ROW содержит готовые события с данными строк.">
            <FlowNode variant="sink" tabIndex={0}>
              Binary Log
              <span className="block text-xs text-gray-400 mt-1">Логический лог</span>
            </FlowNode>
          </DiagramTooltip>

          <Arrow direction="down" label="binlog_format=ROW" />

          <DiagramTooltip content="При ROW формате binlog сразу содержит логические изменения строк. Не требует дополнительного декодирования. Debezium читает события напрямую через replication protocol.">
            <FlowNode variant="app" tabIndex={0}>
              CDC Events
            </FlowNode>
          </DiagramTooltip>

          <div className="text-xs text-gray-400 text-center mt-2 px-4">
            Изначально логический формат<br />
            Готов для репликации<br />
            Оптимизирован для replication
          </div>
        </div>
      </DiagramContainer>
    </div>
  );
}

/**
 * RowFormatDiagram - How ROW format records UPDATE operations
 */
export function RowFormatDiagram() {
  return (
    <div className="space-y-6">
      {/* Application query */}
      <DiagramContainer title="Приложение" color="purple">
        <div className="flex items-center justify-center">
          <DiagramTooltip content="UPDATE запрос затрагивает N строк. При STATEMENT формате записывается SQL. При ROW формате записывается каждая измененная строка отдельно.">
            <FlowNode variant="app" tabIndex={0}>
              <div className="text-sm font-mono">
                UPDATE products<br />
                SET price = price * 1.1<br />
                WHERE category = 'electronics'
              </div>
            </FlowNode>
          </DiagramTooltip>
        </div>
      </DiagramContainer>

      <Arrow direction="down" />

      {/* ROW format output */}
      <DiagramContainer title="ROW формат" color="emerald" recommended>
        <div className="flex flex-col gap-3">
          <DiagramTooltip content="Первое UPDATE_ROWS_EVENT: before содержит старое значение цены 100, after содержит новое значение 110. Позволяет consumer вычислить точное изменение.">
            <FlowNode variant="connector" tabIndex={0}>
              <div className="text-xs font-mono text-left">
                UPDATE_ROWS_EVENT<br />
                Row 1: before={'{'}{`id:1, price:100`}{'}'}<br />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;after={'{'}{`id:1, price:110`}{'}'}
              </div>
            </FlowNode>
          </DiagramTooltip>

          <DiagramTooltip content="Второе UPDATE_ROWS_EVENT для следующей строки. ROW формат детерминированный - одинаковый результат на любой реплике.">
            <FlowNode variant="connector" tabIndex={0}>
              <div className="text-xs font-mono text-left">
                Row 2: before={'{'}{`id:2, price:200`}{'}'}<br />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;after={'{'}{`id:2, price:220`}{'}'}
              </div>
            </FlowNode>
          </DiagramTooltip>

          <DiagramTooltip content="Продолжение для всех затронутых строк. Массовый UPDATE может генерировать много событий. Debezium обрабатывает их последовательно.">
            <FlowNode variant="connector" tabIndex={0}>
              <div className="text-xs font-mono">
                Row N: ...
              </div>
            </FlowNode>
          </DiagramTooltip>
        </div>

        <div className="text-xs text-gray-400 text-center mt-4 px-4">
          Детерминированный<br />
          Полная информация о значениях<br />
          Единственный формат для CDC
        </div>
      </DiagramContainer>
    </div>
  );
}

/**
 * BinlogEventSequenceDiagram - Complete binlog event sequence for a transaction
 */
export function BinlogEventSequenceDiagram() {
  const actors: SequenceActorDef[] = [
    {
      id: 'app',
      label: 'App',
      variant: 'service',
      tooltip: 'Приложение выполняет SQL транзакцию: BEGIN, INSERT, UPDATE, COMMIT. MySQL обрабатывает и записывает в binlog.',
    },
    {
      id: 'mysql',
      label: 'MySQL',
      variant: 'database',
      tooltip: 'MySQL Server обрабатывает запросы и записывает события в Binary Log. Каждая операция порождает соответствующий event type.',
    },
    {
      id: 'binlog',
      label: 'Binlog',
      variant: 'queue',
      tooltip: 'Binary Log хранит последовательность событий. Каждое событие имеет position (file:offset) и GTID для точного отслеживания.',
    },
    {
      id: 'debezium',
      label: 'Debezium',
      variant: 'service',
      tooltip: 'Debezium connector читает события через MySQL replication protocol. Преобразует в CDC envelope и публикует в Kafka.',
    },
  ];

  const messages: SequenceMessageDef[] = [
    {
      id: 'msg1',
      from: 'app',
      to: 'mysql',
      label: 'BEGIN TRANSACTION',
      variant: 'sync',
      tooltip: 'Начало транзакции. MySQL создаст GTID_EVENT (при gtid_mode=ON) и QUERY_EVENT с BEGIN.',
    },
    {
      id: 'msg2',
      from: 'mysql',
      to: 'binlog',
      label: 'GTID_EVENT (transaction ID)',
      variant: 'sync',
      tooltip: 'Global Transaction ID присваивается транзакции. Формат: server_uuid:sequence_number. Уникален во всей топологии репликации.',
    },
    {
      id: 'msg3',
      from: 'app',
      to: 'mysql',
      label: 'CREATE TABLE products (...)',
      variant: 'sync',
      tooltip: 'DDL операция - создание таблицы. Записывается как QUERY_EVENT с полным SQL текстом.',
    },
    {
      id: 'msg4',
      from: 'mysql',
      to: 'binlog',
      label: 'QUERY_EVENT (DDL statement)',
      variant: 'sync',
      tooltip: 'DDL statement записывается полностью. Debezium использует для отслеживания schema evolution.',
    },
    {
      id: 'msg5',
      from: 'app',
      to: 'mysql',
      label: 'INSERT INTO customers VALUES (1, Alice)',
      variant: 'sync',
      tooltip: 'DML операция - вставка строки. При ROW формате записывается TABLE_MAP_EVENT + WRITE_ROWS_EVENT.',
    },
    {
      id: 'msg6',
      from: 'mysql',
      to: 'binlog',
      label: 'TABLE_MAP_EVENT (schema)',
      variant: 'sync',
      tooltip: 'Метаданные таблицы: table_id, имена колонок, типы данных. Предшествует каждому rows event.',
    },
    {
      id: 'msg7',
      from: 'mysql',
      to: 'binlog',
      label: 'WRITE_ROWS_EVENT (row data)',
      variant: 'sync',
      tooltip: 'Данные вставленной строки: {id: 1, name: Alice, email: ...}. Debezium создает CDC event с op=c.',
    },
    {
      id: 'msg8',
      from: 'app',
      to: 'mysql',
      label: 'UPDATE customers SET name=Bob',
      variant: 'sync',
      tooltip: 'DML операция - обновление строки. При ROW формате записывается before и after state.',
    },
    {
      id: 'msg9',
      from: 'mysql',
      to: 'binlog',
      label: 'TABLE_MAP_EVENT',
      variant: 'sync',
      tooltip: 'Повторный TABLE_MAP для UPDATE. Каждый rows event предшествуется своим TABLE_MAP.',
    },
    {
      id: 'msg10',
      from: 'mysql',
      to: 'binlog',
      label: 'UPDATE_ROWS_EVENT (before + after)',
      variant: 'sync',
      tooltip: 'Before: {id:1, name:Alice}, After: {id:1, name:Bob}. Полные данные при binlog-row-image=FULL.',
    },
    {
      id: 'msg11',
      from: 'app',
      to: 'mysql',
      label: 'DELETE FROM customers WHERE id=1',
      variant: 'sync',
      tooltip: 'DML операция - удаление строки. При ROW формате записывается полное состояние удаляемой строки.',
    },
    {
      id: 'msg12',
      from: 'mysql',
      to: 'binlog',
      label: 'DELETE_ROWS_EVENT (deleted row)',
      variant: 'sync',
      tooltip: 'Данные удаленной строки: {id:1, name:Bob}. Debezium создает CDC event с op=d и before state.',
    },
    {
      id: 'msg13',
      from: 'app',
      to: 'mysql',
      label: 'COMMIT',
      variant: 'sync',
      tooltip: 'Фиксация транзакции. MySQL записывает XID_EVENT, подтверждающий успешное завершение.',
    },
    {
      id: 'msg14',
      from: 'mysql',
      to: 'binlog',
      label: 'XID_EVENT (transaction commit)',
      variant: 'sync',
      tooltip: 'Маркер завершения транзакции с XID (InnoDB transaction ID). Debezium группирует все события между GTID и XID.',
    },
    {
      id: 'msg15',
      from: 'debezium',
      to: 'binlog',
      label: 'Read events',
      variant: 'async',
      tooltip: 'Debezium читает события через MySQL replication protocol. Отслеживает position через GTID или file:offset.',
    },
    {
      id: 'msg16',
      from: 'binlog',
      to: 'debezium',
      label: 'Stream of events',
      variant: 'return',
      tooltip: 'Поток событий передается Debezium. Каждое событие преобразуется в CDC envelope и публикуется в соответствующий Kafka topic.',
    },
  ];

  return (
    <div className="w-full">
      <SequenceDiagram
        actors={actors}
        messages={messages}
        messageSpacing={38}
      />
    </div>
  );
}

/**
 * BinlogRotationDiagram - Binlog file rotation and Debezium position tracking
 */
export function BinlogRotationDiagram() {
  return (
    <div className="space-y-6">
      {/* Binlog files */}
      <DiagramContainer title="Binlog файлы" color="blue">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-center">
          <DiagramTooltip content="Первый binlog файл после ротации. Содержит события 0-1073741824 bytes (до max_binlog_size). Status: CLOSED - запись завершена.">
            <FlowNode variant="sink" tabIndex={0}>
              <div className="text-xs">
                mysql-bin.000001<br />
                <span className="text-gray-400">0-1073741824 bytes</span><br />
                <span className="text-gray-500">Status: CLOSED</span>
              </div>
            </FlowNode>
          </DiagramTooltip>

          <Arrow direction="right" />

          <DiagramTooltip content="Второй binlog файл. Также закрыт после достижения max_binlog_size. MySQL может удалить старые файлы при binlog_expire_logs_seconds.">
            <FlowNode variant="sink" tabIndex={0}>
              <div className="text-xs">
                mysql-bin.000002<br />
                <span className="text-gray-400">0-1073741824 bytes</span><br />
                <span className="text-gray-500">Status: CLOSED</span>
              </div>
            </FlowNode>
          </DiagramTooltip>

          <Arrow direction="right" />

          <DiagramTooltip content="Текущий активный binlog файл. MySQL записывает новые события сюда. Debezium читает с текущей позиции 524288 bytes.">
            <FlowNode variant="database" tabIndex={0}>
              <div className="text-xs">
                mysql-bin.000003<br />
                <span className="text-gray-400">0-524288 bytes</span><br />
                <span className="text-emerald-400">Status: ACTIVE</span>
              </div>
            </FlowNode>
          </DiagramTooltip>
        </div>
      </DiagramContainer>

      {/* Debezium position */}
      <DiagramContainer title="Debezium Connector" color="purple">
        <div className="flex items-center justify-center">
          <DiagramTooltip content="Debezium отслеживает текущую позицию чтения: file + offset. При перезапуске продолжает с сохраненной позиции. При GTID mode позиция также включает gtid_set.">
            <FlowNode variant="connector" tabIndex={0}>
              <div className="text-sm">
                Current Position:<br />
                <span className="font-mono text-emerald-400">mysql-bin.000003</span><br />
                <span className="font-mono text-amber-400">Offset: 154</span>
              </div>
            </FlowNode>
          </DiagramTooltip>
        </div>

        <div className="flex justify-center mt-4">
          <Arrow direction="up" dashed label="Reading" />
        </div>
      </DiagramContainer>

      {/* Info box */}
      <div className="text-xs text-gray-400 text-center px-4 py-2 bg-gray-800/30 rounded-lg">
        <strong className="text-gray-300">Ротация происходит при:</strong><br />
        max_binlog_size достигнут | Перезапуск MySQL | FLUSH BINARY LOGS
      </div>
    </div>
  );
}
