/**
 * Logical Decoding Diagrams
 *
 * Exports:
 * - PhysicalVsLogicalDiagram: Comparison of physical and logical replication
 * - LogicalDecodingComponentsDiagram: Pipeline of logical decoding components
 * - PublicationsDiagram: Publication filtering concept
 * - LogicalDecodingSequenceDiagram: Complete flow sequence
 */

import { FlowNode } from '../primitives/FlowNode';
import { Arrow } from '../primitives/Arrow';
import { DiagramContainer } from '../primitives/DiagramContainer';
import { DiagramTooltip } from '../primitives/Tooltip';
import { SequenceDiagram } from '../primitives/SequenceDiagram';
import type { SequenceActorDef, SequenceMessageDef } from '../primitives/types';

/**
 * PhysicalVsLogicalDiagram - Two-column comparison of replication types
 */
export function PhysicalVsLogicalDiagram() {
  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Physical Replication */}
      <DiagramContainer
        title="Physical Replication"
        color="blue"
        className="flex-1"
      >
        <div className="flex flex-col items-center gap-4">
          <DiagramTooltip content="Мастер-узел PostgreSQL отправляет побайтовую копию WAL на реплику. Standby получает точную копию данных, включая все внутренние структуры. Используется для High Availability и failover.">
            <FlowNode variant="database" tabIndex={0}>
              PRIMARY
            </FlowNode>
          </DiagramTooltip>

          <Arrow direction="down" label="Бинарные WAL сегменты" />

          <DiagramTooltip content="Replica в режиме hot standby — принимает бинарные WAL сегменты и применяет их локально. Может обслуживать read-only запросы. Данные идентичны мастеру на уровне блоков.">
            <FlowNode variant="database" tabIndex={0}>
              STANDBY
            </FlowNode>
          </DiagramTooltip>

          <div className="text-xs text-gray-400 text-center mt-2 px-4">
            Побайтовая копия данных<br />
            Только PostgreSQL &rarr; PostgreSQL<br />
            Вся база целиком
          </div>
        </div>
      </DiagramContainer>

      {/* Logical Replication (CDC) */}
      <DiagramContainer
        title="Logical Replication (CDC)"
        color="emerald"
        recommended
        className="flex-1"
      >
        <div className="flex flex-col items-center gap-4">
          <DiagramTooltip content="Мастер-узел с включенным wal_level=logical. Изменения преобразуются в читаемый формат через output plugin. Поддерживает выборочную репликацию таблиц.">
            <FlowNode variant="database" tabIndex={0}>
              PRIMARY
            </FlowNode>
          </DiagramTooltip>

          <Arrow direction="down" label="pgoutput plugin" />

          <DiagramTooltip content="Компонент PostgreSQL, преобразующий бинарный WAL в структурированные операции INSERT/UPDATE/DELETE с данными строк. Интерпретирует записи в контексте транзакций.">
            <FlowNode variant="connector" tabIndex={0}>
              Logical Decoder
            </FlowNode>
          </DiagramTooltip>

          <Arrow direction="down" label="Структурированные изменения" />

          <DiagramTooltip content="Любая система-потребитель: Debezium, другая БД PostgreSQL, custom application. Получает понятные события изменений с данными строк и метаданными.">
            <FlowNode variant="app" tabIndex={0}>
              Consumer (Debezium)
            </FlowNode>
          </DiagramTooltip>

          <div className="text-xs text-gray-400 text-center mt-2 px-4">
            INSERT/UPDATE/DELETE события<br />
            Выборочные таблицы<br />
            Разные версии PostgreSQL
          </div>
        </div>
      </DiagramContainer>
    </div>
  );
}

/**
 * LogicalDecodingComponentsDiagram - Pipeline of logical decoding components
 */
export function LogicalDecodingComponentsDiagram() {
  return (
    <div className="flex flex-col md:flex-row items-center justify-center gap-2 md:gap-4 flex-wrap">
      <DiagramTooltip content="Write-Ahead Log — журнал транзакций PostgreSQL. При wal_level=logical содержит дополнительные данные для декодирования: OID таблиц, tuple data. Гарантирует durability всех изменений.">
        <FlowNode variant="sink" tabIndex={0}>
          WAL
        </FlowNode>
      </DiagramTooltip>

      <Arrow direction="right" />

      <DiagramTooltip content="Закладка в WAL, гарантирующая что изменения не будут удалены до прочтения. PostgreSQL хранит WAL сегменты пока slot их не обработает. Критический компонент для надежности CDC.">
        <FlowNode variant="connector" tabIndex={0}>
          Replication Slot
        </FlowNode>
      </DiagramTooltip>

      <Arrow direction="right" />

      <DiagramTooltip content="Ядро механизма — интерпретирует WAL записи в контексте транзакций. Группирует изменения по transaction ID, обеспечивает атомарность. Преобразует бинарные данные в логические операции.">
        <FlowNode variant="connector" tabIndex={0}>
          Logical Decoder
        </FlowNode>
      </DiagramTooltip>

      <Arrow direction="right" />

      <DiagramTooltip content="pgoutput — стандартный плагин PostgreSQL 10+. Не требует установки, работает на Aurora/RDS/Cloud SQL. Формирует структурированный вывод с relation OID и tuple data.">
        <FlowNode variant="connector" tabIndex={0}>
          pgoutput
        </FlowNode>
      </DiagramTooltip>

      <Arrow direction="right" />

      <DiagramTooltip content="CDC коннектор, читающий pgoutput через streaming replication protocol. Преобразует в универсальный envelope-формат с полями before/after/source/op. Обеспечивает exactly-once семантику.">
        <FlowNode variant="connector" tabIndex={0}>
          Debezium
        </FlowNode>
      </DiagramTooltip>

      <Arrow direction="right" />

      <DiagramTooltip content="Брокер сообщений, хранящий CDC-события в топиках. Обеспечивает durability и доставку потребителям. Поддерживает replay событий при необходимости.">
        <FlowNode variant="cluster" tabIndex={0}>
          Kafka
        </FlowNode>
      </DiagramTooltip>
    </div>
  );
}

/**
 * PublicationsDiagram - Publication filtering concept
 */
export function PublicationsDiagram() {
  return (
    <div className="space-y-6">
      {/* Database with tables */}
      <DiagramContainer title="База данных inventory" color="purple">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <DiagramTooltip content="Таблица клиентов — основная бизнес-сущность. Содержит персональные данные, контакты. Часто требует CDC для синхронизации с CRM и аналитикой.">
            <FlowNode variant="database" tabIndex={0} size="sm">
              customers
            </FlowNode>
          </DiagramTooltip>
          <DiagramTooltip content="Таблица заказов — ключевая транзакционная сущность. Высокая частота изменений. CDC критичен для order fulfillment и inventory management.">
            <FlowNode variant="database" tabIndex={0} size="sm">
              orders
            </FlowNode>
          </DiagramTooltip>
          <DiagramTooltip content="Справочник продуктов — относительно статичные данные. Изменения редки, но важны для синхронизации каталогов и цен.">
            <FlowNode variant="database" tabIndex={0} size="sm">
              products
            </FlowNode>
          </DiagramTooltip>
          <DiagramTooltip content="Таблица аудита — системные логи операций. Высокий объем INSERT. Часто исключается из CDC для экономии ресурсов.">
            <FlowNode variant="database" tabIndex={0} size="sm">
              audit_logs
            </FlowNode>
          </DiagramTooltip>
        </div>
      </DiagramContainer>

      {/* Publications */}
      <div className="flex flex-col lg:flex-row gap-6">
        <DiagramContainer
          title="FOR ALL TABLES"
          color="emerald"
          className="flex-1"
        >
          <div className="flex flex-col gap-3">
            <DiagramTooltip content="Publication dbz_publication с FOR ALL TABLES включает все таблицы автоматически, включая созданные в будущем. Удобно для полного CDC, когда нужен полный поток изменений базы.">
              <FlowNode variant="connector" tabIndex={0} size="sm">
                dbz_publication
              </FlowNode>
            </DiagramTooltip>
            <div className="text-xs text-gray-400 px-2">
              <div className="flex items-center gap-2">
                <span className="text-emerald-400">+</span> customers
              </div>
              <div className="flex items-center gap-2">
                <span className="text-emerald-400">+</span> orders
              </div>
              <div className="flex items-center gap-2">
                <span className="text-emerald-400">+</span> products
              </div>
              <div className="flex items-center gap-2">
                <span className="text-emerald-400">+</span> audit_logs
              </div>
              <div className="flex items-center gap-2">
                <span className="text-emerald-400">+</span> <em>future tables...</em>
              </div>
            </div>
          </div>
        </DiagramContainer>

        <DiagramContainer
          title="FOR TABLE (selective)"
          color="blue"
          className="flex-1"
        >
          <div className="flex flex-col gap-3">
            <DiagramTooltip content="Selective publication включает только указанные таблицы. Меньше нагрузка, меньше топиков в Kafka, проще управление. Рекомендуется для production с большим количеством таблиц.">
              <FlowNode variant="connector" tabIndex={0} size="sm">
                orders_publication
              </FlowNode>
            </DiagramTooltip>
            <div className="text-xs text-gray-400 px-2">
              <div className="flex items-center gap-2">
                <span className="text-blue-400">+</span> orders
              </div>
              <div className="flex items-center gap-2">
                <span className="text-blue-400">+</span> customers
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <span className="text-gray-600">-</span> products
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <span className="text-gray-600">-</span> audit_logs
              </div>
            </div>
          </div>
        </DiagramContainer>
      </div>
    </div>
  );
}

/**
 * LogicalDecodingSequenceDiagram - Complete flow sequence
 */
export function LogicalDecodingSequenceDiagram() {
  const actors: SequenceActorDef[] = [
    {
      id: 'app',
      label: 'App',
      variant: 'service',
      tooltip: 'Приложение выполняет UPDATE customers SET name=\'Bob\'. PostgreSQL обрабатывает в транзакции с учетом REPLICA IDENTITY. Приложение не знает о CDC.',
    },
    {
      id: 'pg',
      label: 'PostgreSQL',
      variant: 'database',
      tooltip: 'СУБД записывает изменение в WAL с полными before/after данными (при REPLICA IDENTITY FULL). Подтверждает транзакцию после записи в журнал.',
    },
    {
      id: 'wal',
      label: 'WAL',
      variant: 'queue',
      tooltip: 'Transaction log хранит запись с LSN (Log Sequence Number) — уникальным идентификатором позиции. При wal_level=logical содержит данные для декодирования.',
    },
    {
      id: 'slot',
      label: 'Slot',
      variant: 'service',
      tooltip: 'Replication slot гарантирует сохранность WAL до чтения Debezium. Отслеживает restart_lsn и confirmed_flush_lsn. Защищает от потери данных при рестартах.',
    },
    {
      id: 'pgoutput',
      label: 'pgoutput',
      variant: 'service',
      tooltip: 'Декодирует WAL записи в структурированный формат: relation OID, tuple data, operation type. Стандартный плагин PostgreSQL 10+.',
    },
    {
      id: 'debezium',
      label: 'Debezium',
      variant: 'service',
      tooltip: 'Читает через streaming replication protocol, преобразует в CDC envelope с before/after/source/op полями. Отправляет в Kafka с гарантией доставки.',
    },
    {
      id: 'kafka',
      label: 'Kafka',
      variant: 'queue',
      tooltip: 'Получает событие в топик inventory.public.customers, подтверждает запись (ACK). Хранит события для потребителей с настраиваемым retention.',
    },
  ];

  const messages: SequenceMessageDef[] = [
    {
      id: 'msg1',
      from: 'app',
      to: 'pg',
      label: 'UPDATE customers...',
      variant: 'sync',
      tooltip: 'SQL команда UPDATE с новыми значениями. PostgreSQL начинает транзакцию и проверяет REPLICA IDENTITY таблицы.',
    },
    {
      id: 'msg2',
      from: 'pg',
      to: 'wal',
      label: 'Write (FULL tuple)',
      variant: 'sync',
      tooltip: 'Запись в WAL с полными данными строки (при REPLICA IDENTITY FULL). Включает before/after значения всех колонок.',
    },
    {
      id: 'msg3',
      from: 'pg',
      to: 'app',
      label: 'COMMIT OK',
      variant: 'return',
      tooltip: 'Транзакция зафиксирована. Приложение получает подтверждение. Данные durably записаны в WAL.',
    },
    {
      id: 'msg4',
      from: 'debezium',
      to: 'slot',
      label: 'Request changes',
      variant: 'async',
      tooltip: 'Debezium запрашивает изменения с позиции confirmed_flush_lsn. Использует streaming replication protocol.',
    },
    {
      id: 'msg5',
      from: 'slot',
      to: 'pgoutput',
      label: 'Decode WAL',
      variant: 'sync',
      tooltip: 'Slot передает WAL записи на декодирование. pgoutput преобразует бинарные данные в логические операции.',
    },
    {
      id: 'msg6',
      from: 'pgoutput',
      to: 'debezium',
      label: 'Logical change',
      variant: 'return',
      tooltip: 'Декодированное изменение: тип операции (u), relation OID, before/after tuple data в структурированном формате.',
    },
    {
      id: 'msg7',
      from: 'debezium',
      to: 'kafka',
      label: 'CDC Event',
      variant: 'async',
      tooltip: 'Debezium envelope: {"before": {...}, "after": {...}, "source": {"lsn": "..."}, "op": "u"}. Отправляется в топик.',
    },
    {
      id: 'msg8',
      from: 'kafka',
      to: 'debezium',
      label: 'ACK',
      variant: 'return',
      tooltip: 'Kafka подтверждает запись в топик. Debezium может обновить confirmed_flush_lsn в slot.',
    },
    {
      id: 'msg9',
      from: 'debezium',
      to: 'slot',
      label: 'Confirm LSN',
      variant: 'async',
      tooltip: 'Debezium подтверждает обработку до определенного LSN. PostgreSQL может освободить WAL сегменты до этой позиции.',
    },
  ];

  return (
    <div className="w-full">
      <SequenceDiagram
        actors={actors}
        messages={messages}
        messageSpacing={45}
      />
    </div>
  );
}
