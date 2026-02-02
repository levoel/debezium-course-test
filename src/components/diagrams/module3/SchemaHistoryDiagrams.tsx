/**
 * Schema History Diagrams
 *
 * Exports:
 * - SchemaHistoryFlowDiagram: Schema history topic flow (DDL -> Connector -> Topic)
 * - SchemaRecoveryPathsDiagram: Recovery decision tree with color-coded paths
 * - SchemaHistoryCorruptionDiagram: Corruption recovery flow with warning indicators
 */

import { FlowNode } from '../primitives/FlowNode';
import { Arrow } from '../primitives/Arrow';
import { DiagramContainer } from '../primitives/DiagramContainer';
import { DiagramTooltip } from '../primitives/Tooltip';

/**
 * SchemaHistoryFlowDiagram - Schema history topic flow
 * DDL event -> Connector -> Schema history topic -> Stored schema
 */
export function SchemaHistoryFlowDiagram() {
  return (
    <div className="space-y-6">
      {/* Main Flow */}
      <DiagramContainer title="Schema History Topic Flow" color="emerald">
        <div className="flex flex-col md:flex-row items-center justify-center gap-2 md:gap-4 flex-wrap">
          <DiagramTooltip content="Приложение или DBA выполняет DDL операцию: CREATE TABLE, ALTER TABLE, DROP COLUMN. MySQL записывает DDL в binlog как QUERY_EVENT.">
            <FlowNode variant="database" tabIndex={0} size="sm">
              DDL Event
            </FlowNode>
          </DiagramTooltip>

          <Arrow direction="right" label="binlog" />

          <DiagramTooltip content="Debezium MySQL connector читает binlog и детектирует DDL события. Парсит SQL, извлекает структуру таблицы, генерирует tableChanges метаданные.">
            <FlowNode variant="connector" tabIndex={0} size="sm">
              Debezium Connector
            </FlowNode>
          </DiagramTooltip>

          <Arrow direction="right" label="records" />

          <DiagramTooltip content="Schema history topic хранит ВСЕ DDL изменения с привязкой к binlog позиции. КРИТИЧНО: retention MUST be infinite (-1), иначе recovery fails через 7 дней.">
            <FlowNode variant="cluster" tabIndex={0} size="sm" className="border-2 border-amber-400">
              Schema History Topic
            </FlowNode>
          </DiagramTooltip>

          <Arrow direction="right" label="stores" />

          <DiagramTooltip content="Сохранённая схема используется при restart connector для восстановления mapping: table_id -> структура колонок. Без этого binlog события не могут быть декодированы.">
            <FlowNode variant="sink" tabIndex={0} size="sm">
              Stored Schema
            </FlowNode>
          </DiagramTooltip>
        </div>
      </DiagramContainer>

      {/* What's Stored */}
      <DiagramContainer title="Содержимое Schema History Topic" color="blue">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DiagramTooltip content="Позиция в binlog на момент DDL операции. Используется для определения, какую схему применять к событиям с определённым GTID/file:offset.">
            <FlowNode variant="sink" tabIndex={0} size="sm">
              <div className="flex flex-col items-center">
                <span className="text-[10px] text-gray-400">position</span>
                <span className="font-mono text-xs">file:pos, gtid</span>
              </div>
            </FlowNode>
          </DiagramTooltip>

          <DiagramTooltip content="Полный SQL текст DDL операции. Используется для логирования и debugging. Пример: ALTER TABLE customers ADD COLUMN phone VARCHAR(20).">
            <FlowNode variant="sink" tabIndex={0} size="sm">
              <div className="flex flex-col items-center">
                <span className="text-[10px] text-gray-400">ddl</span>
                <span className="font-mono text-xs">SQL statement</span>
              </div>
            </FlowNode>
          </DiagramTooltip>

          <DiagramTooltip content="Структурированное описание схемы: имена колонок, JDBC типы, длина, nullable. Debezium использует для декодирования row events.">
            <FlowNode variant="sink" tabIndex={0} size="sm">
              <div className="flex flex-col items-center">
                <span className="text-[10px] text-gray-400">tableChanges</span>
                <span className="font-mono text-xs">columns, types</span>
              </div>
            </FlowNode>
          </DiagramTooltip>

          <DiagramTooltip content="Timestamp и source метаданные: версия Debezium, имя connector, database, table. Полезно для аудита и troubleshooting.">
            <FlowNode variant="sink" tabIndex={0} size="sm">
              <div className="flex flex-col items-center">
                <span className="text-[10px] text-gray-400">source</span>
                <span className="font-mono text-xs">metadata</span>
              </div>
            </FlowNode>
          </DiagramTooltip>
        </div>
      </DiagramContainer>

      {/* Key Warning */}
      <DiagramContainer title="Критическое требование" color="rose" className="max-w-2xl mx-auto">
        <div className="text-sm text-gray-300 text-center space-y-2">
          <DiagramTooltip content="По умолчанию Kafka использует retention 7 дней. После 7 дней старые DDL записи удаляются, и connector не сможет восстановить схему при restart!">
            <div className="font-semibold text-rose-300 cursor-help underline decoration-dotted">
              retention.ms = -1 (бесконечный)
            </div>
          </DiagramTooltip>
          <div className="text-xs text-gray-400">
            Без infinite retention через 7 дней recovery fails.<br />
            Единственное решение — полный resnapshot базы данных.
          </div>
        </div>
      </DiagramContainer>
    </div>
  );
}

/**
 * SchemaRecoveryPathsDiagram - Recovery decision tree
 * Schema mismatch detected -> Check schema history -> Paths: found/not found
 * Color-coded paths (emerald for success, rose for failure)
 */
export function SchemaRecoveryPathsDiagram() {
  return (
    <div className="space-y-6">
      <DiagramContainer title="Schema Recovery Decision Tree" color="neutral">
        <div className="flex flex-col items-center gap-4">
          {/* Start */}
          <DiagramTooltip content="Debezium connector перезапускается после deploy, crash или config change. Необходимо восстановить схему таблиц для декодирования binlog событий.">
            <FlowNode variant="connector" tabIndex={0}>
              Connector Restart
            </FlowNode>
          </DiagramTooltip>

          <Arrow direction="down" />

          <DiagramTooltip content="Debezium читает Kafka Connect offsets topic для определения последней обработанной позиции в binlog (GTID или file:offset).">
            <FlowNode variant="sink" tabIndex={0}>
              Read Saved Offset
            </FlowNode>
          </DiagramTooltip>

          <Arrow direction="down" />

          <DiagramTooltip content="Connector читает schema history topic от начала до конца, применяя DDL последовательно до сохранённого offset.">
            <FlowNode variant="cluster" tabIndex={0} className="border-2 border-amber-400">
              Read Schema History Topic
            </FlowNode>
          </DiagramTooltip>

          <Arrow direction="down" />

          {/* Decision Point */}
          <DiagramTooltip content="Критическая проверка: все ли DDL записи присутствуют? Если retention удалил старые записи — схема не может быть восстановлена полностью.">
            <FlowNode variant="app" tabIndex={0} className="border-2 border-white/30">
              DDL History Complete?
            </FlowNode>
          </DiagramTooltip>

          {/* Branches */}
          <div className="flex flex-col md:flex-row gap-6 w-full justify-center">
            {/* Success Path */}
            <div className="flex flex-col items-center gap-3">
              <Arrow direction="down" label="YES" />
              <DiagramTooltip content="Все DDL записи найдены. Debezium применяет их последовательно и восстанавливает точную схему на момент offset. Recovery занимает секунды.">
                <FlowNode variant="cluster" tabIndex={0} size="sm" className="border-2 border-emerald-400">
                  Apply DDL Sequentially
                </FlowNode>
              </DiagramTooltip>
              <Arrow direction="down" />
              <DiagramTooltip content="Схема восстановлена. Connector возобновляет чтение binlog с сохранённого offset. Ни одно событие не потеряно.">
                <FlowNode variant="connector" tabIndex={0} size="sm" className="bg-emerald-500/30 border-emerald-400">
                  Resume CDC
                </FlowNode>
              </DiagramTooltip>
            </div>

            {/* Failure Path */}
            <div className="flex flex-col items-center gap-3">
              <Arrow direction="down" label="NO" />
              <DiagramTooltip content="Retention policy удалил старые DDL записи. Connector не может восстановить схему с initial snapshot — критическая ошибка.">
                <FlowNode variant="app" tabIndex={0} size="sm" className="border-2 border-rose-400">
                  Schema History Missing
                </FlowNode>
              </DiagramTooltip>
              <Arrow direction="down" />
              <DiagramTooltip content="Единственное решение — полный resnapshot базы данных. Для больших таблиц это часы downtime. Альтернатива: restore из backup schema history topic.">
                <FlowNode variant="target" tabIndex={0} size="sm" className="bg-rose-500/30 border-rose-400">
                  Resnapshot Required
                </FlowNode>
              </DiagramTooltip>
            </div>
          </div>
        </div>
      </DiagramContainer>

      {/* Time Comparison */}
      <div className="flex flex-col md:flex-row gap-4">
        <DiagramContainer title="Normal Recovery" color="emerald" className="flex-1">
          <div className="text-center space-y-2">
            <div className="text-2xl font-bold text-emerald-300">1-5 мин</div>
            <div className="text-xs text-gray-400">
              Чтение schema history + resume CDC
            </div>
          </div>
        </DiagramContainer>

        <DiagramContainer title="Resnapshot Recovery" color="rose" className="flex-1">
          <div className="text-center space-y-2">
            <div className="text-2xl font-bold text-rose-300">2-4 часа</div>
            <div className="text-xs text-gray-400">
              Для 100GB таблицы (зависит от размера)
            </div>
          </div>
        </DiagramContainer>
      </div>
    </div>
  );
}

/**
 * SchemaHistoryCorruptionDiagram - Corruption recovery flow
 * Corrupted topic -> Stop connector -> Recreate from snapshot
 * Warning indicators for dangerous operations
 */
export function SchemaHistoryCorruptionDiagram() {
  return (
    <div className="space-y-6">
      {/* Corruption Causes */}
      <DiagramContainer title="Причины повреждения Schema History" color="rose">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <DiagramTooltip content="Кто-то вручную отредактировал или удалил сообщения из schema history topic. НИКОГДА не делайте этого в production!">
            <FlowNode variant="target" tabIndex={0} size="sm">
              <div className="flex flex-col items-center">
                <span className="text-rose-400 text-lg">!</span>
                <span>Manual Editing</span>
              </div>
            </FlowNode>
          </DiagramTooltip>

          <DiagramTooltip content="Сетевой сбой во время записи DDL в topic. Сообщение записалось частично или с ошибкой.">
            <FlowNode variant="target" tabIndex={0} size="sm">
              <div className="flex flex-col items-center">
                <span className="text-rose-400 text-lg">!</span>
                <span>Network Failure</span>
              </div>
            </FlowNode>
          </DiagramTooltip>

          <DiagramTooltip content="Два коннектора используют один schema history topic. DDL от разных баз смешиваются, схемы становятся несогласованными.">
            <FlowNode variant="target" tabIndex={0} size="sm">
              <div className="flex flex-col items-center">
                <span className="text-rose-400 text-lg">!</span>
                <span>Shared Topic</span>
              </div>
            </FlowNode>
          </DiagramTooltip>
        </div>
      </DiagramContainer>

      {/* Recovery Flow */}
      <DiagramContainer title="Recovery Flow при Corruption" color="amber">
        <div className="flex flex-col items-center gap-4">
          <DiagramTooltip content="Симптомы: events содержат неправильные колонки, schema parsing errors в логах, Column count doesn't match value count.">
            <FlowNode variant="app" tabIndex={0} className="border-2 border-rose-400">
              Corruption Detected
            </FlowNode>
          </DiagramTooltip>

          <Arrow direction="down" label="Step 1" />

          <DiagramTooltip content="ОБЯЗАТЕЛЬНО: Остановить connector через Kafka Connect REST API. Не пытайтесь исправить на лету — это усугубит проблему.">
            <FlowNode variant="target" tabIndex={0}>
              Stop Connector
            </FlowNode>
          </DiagramTooltip>

          <Arrow direction="down" label="Step 2" />

          <DiagramTooltip content="Удалить повреждённый schema history topic через kafka-topics --delete. Данные потеряны безвозвратно.">
            <FlowNode variant="sink" tabIndex={0} className="border-2 border-rose-400">
              Delete Corrupted Topic
            </FlowNode>
          </DiagramTooltip>

          <Arrow direction="down" label="Step 3" />

          <DiagramTooltip content="Создать новый topic с ПРАВИЛЬНЫМИ настройками: partitions=1, retention.ms=-1, cleanup.policy=delete. НИКОГДА не используйте compaction!">
            <FlowNode variant="cluster" tabIndex={0}>
              Create New Topic
            </FlowNode>
          </DiagramTooltip>

          <Arrow direction="down" label="Step 4" />

          <DiagramTooltip content="Пересоздать connector с snapshot.mode=initial. Debezium выполнит полный snapshot базы и начнёт CDC с новой позиции.">
            <FlowNode variant="connector" tabIndex={0} className="border-2 border-emerald-400">
              Recreate Connector
            </FlowNode>
          </DiagramTooltip>
        </div>
      </DiagramContainer>

      {/* Prevention */}
      <DiagramContainer title="Предотвращение Corruption" color="emerald" className="max-w-2xl mx-auto">
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-sm text-gray-300">
            <DiagramTooltip content="Каждый connector должен иметь свой уникальный schema history topic. Naming convention: schema-changes.{connector-name}.">
              <FlowNode variant="sink" tabIndex={0} size="sm" className="whitespace-nowrap">
                Unique topic per connector
              </FlowNode>
            </DiagramTooltip>
          </div>

          <div className="flex items-center gap-3 text-sm text-gray-300">
            <DiagramTooltip content="retention.ms=-1 и retention.bytes=-1 ОБЯЗАТЕЛЬНЫ. Без infinite retention старые DDL записи удаляются через 7 дней.">
              <FlowNode variant="sink" tabIndex={0} size="sm" className="whitespace-nowrap">
                Infinite retention (-1)
              </FlowNode>
            </DiagramTooltip>
          </div>

          <div className="flex items-center gap-3 text-sm text-gray-300">
            <DiagramTooltip content="Регулярный backup schema history topic через kafka-console-consumer --from-beginning. Restore за минуты vs resnapshot за часы.">
              <FlowNode variant="sink" tabIndex={0} size="sm" className="whitespace-nowrap">
                Regular backups
              </FlowNode>
            </DiagramTooltip>
          </div>
        </div>
      </DiagramContainer>
    </div>
  );
}
