/**
 * Aurora Snapshot Mode Diagrams
 *
 * Exports:
 * - SnapshotDecisionTreeDiagram: Snapshot mode decision tree for Aurora MySQL
 * - InitialSnapshotDiagram: Initial snapshot flow with blocking period
 * - SchemaOnlySnapshotDiagram: Schema-only snapshot fast path
 * - NeverSnapshotDiagram: No snapshot streaming-only mode
 */

import { FlowNode } from '../primitives/FlowNode';
import { Arrow } from '../primitives/Arrow';
import { DiagramContainer } from '../primitives/DiagramContainer';
import { DiagramTooltip } from '../primitives/Tooltip';

/**
 * SnapshotDecisionTreeDiagram - Snapshot mode decision tree for Aurora MySQL
 */
export function SnapshotDecisionTreeDiagram() {
  return (
    <div className="space-y-6">
      {/* Decision tree */}
      <div className="flex flex-col items-center gap-4">
        {/* Root question */}
        <DiagramTooltip content="Первый вопрос: это новое развертывание коннектора или возобновление существующего? Определяет, нужен ли initial snapshot или можно продолжить streaming.">
          <FlowNode variant="connector" tabIndex={0} className="border-2 border-amber-400">
            Новый коннектор?
          </FlowNode>
        </DiagramTooltip>

        <div className="flex flex-col md:flex-row items-start gap-8 md:gap-12">
          {/* Yes branch */}
          <div className="flex flex-col items-center gap-3">
            <div className="text-xs text-emerald-400 font-medium">Да</div>
            <Arrow direction="down" />

            <DiagramTooltip content="Для нового коннектора выбор зависит от размера таблиц и толерантности к блокировкам. Определяем snapshot.locking.mode.">
              <FlowNode variant="connector" tabIndex={0} className="border-2 border-blue-400">
                Размер таблиц?
              </FlowNode>
            </DiagramTooltip>

            <div className="flex flex-col md:flex-row items-start gap-6">
              {/* Small tables */}
              <div className="flex flex-col items-center gap-3">
                <div className="text-xs text-gray-400">&lt; 100 GB</div>
                <Arrow direction="down" />
                <DiagramTooltip content="Для таблиц < 100 GB используем snapshot.mode=initial с snapshot.locking.mode=minimal. Блокировки держатся секунды-минуты только во время чтения схемы.">
                  <FlowNode variant="cluster" tabIndex={0} size="sm" className="border-2 border-emerald-400">
                    initial + minimal
                  </FlowNode>
                </DiagramTooltip>
                <div className="text-xs text-emerald-400 text-center">Рекомендуется</div>
              </div>

              {/* Large tables */}
              <div className="flex flex-col items-center gap-3">
                <div className="text-xs text-gray-400">&gt;= 100 GB</div>
                <Arrow direction="down" />

                <DiagramTooltip content="Для больших таблиц критичен вопрос: можно ли заморозить DDL операции во время snapshot?">
                  <FlowNode variant="sink" tabIndex={0} size="sm" className="border-2 border-amber-400">
                    Schema freeze OK?
                  </FlowNode>
                </DiagramTooltip>

                <div className="flex flex-row items-start gap-4">
                  <div className="flex flex-col items-center gap-2">
                    <div className="text-xs text-emerald-400">Да</div>
                    <DiagramTooltip content="Если можно гарантировать отсутствие ALTER TABLE во время snapshot, используем snapshot.locking.mode=none для zero locks.">
                      <FlowNode variant="cluster" tabIndex={0} size="sm" className="border-2 border-emerald-400">
                        initial + none
                      </FlowNode>
                    </DiagramTooltip>
                  </div>

                  <div className="flex flex-col items-center gap-2">
                    <div className="text-xs text-rose-400">Нет</div>
                    <DiagramTooltip content="Если DDL изменения возможны, используем backup-based подход: Aurora snapshot + JDBC bulk load + streaming from saved position.">
                      <FlowNode variant="cluster" tabIndex={0} size="sm" className="border-2 border-purple-400">
                        Backup-based
                      </FlowNode>
                    </DiagramTooltip>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* No branch */}
          <div className="flex flex-col items-center gap-3">
            <div className="text-xs text-gray-400">Нет (возобновление)</div>
            <Arrow direction="down" />

            <DiagramTooltip content="Для существующего коннектора с сохраненным offset используем snapshot.mode=when_needed. Snapshot будет выполнен только если offset невалиден.">
              <FlowNode variant="cluster" tabIndex={0} size="sm" className="border-2 border-blue-400">
                when_needed
              </FlowNode>
            </DiagramTooltip>
            <div className="text-xs text-gray-400 text-center">Продолжает с offset</div>
          </div>
        </div>
      </div>

      {/* Mode summary */}
      <div className="flex flex-col md:flex-row gap-4">
        <DiagramContainer title="Рекомендуемые режимы" color="emerald" className="flex-1">
          <div className="text-xs text-gray-300 space-y-2">
            <div>
              <span className="text-emerald-400 font-bold">initial + minimal</span>
              <br />
              Новое развертывание, таблицы &lt; 100 GB
            </div>
            <div>
              <span className="text-emerald-400 font-bold">when_needed</span>
              <br />
              Production, возобновление после restart
            </div>
          </div>
        </DiagramContainer>

        <DiagramContainer title="Не использовать на Aurora" color="rose" className="flex-1">
          <div className="text-xs text-gray-300 space-y-2">
            <div>
              <span className="text-rose-400 font-bold">snapshot.locking.mode=extended</span>
              <br />
              Требует FLUSH TABLES WITH READ LOCK
              <br />
              Aurora не разрешает (Access denied)
            </div>
          </div>
        </DiagramContainer>
      </div>
    </div>
  );
}

/**
 * InitialSnapshotDiagram - Initial snapshot flow with blocking period
 */
export function InitialSnapshotDiagram() {
  return (
    <div className="space-y-6">
      {/* Main flow */}
      <DiagramContainer title="Initial Snapshot Flow (Aurora MySQL)" color="amber">
        <div className="flex flex-col items-center gap-4">
          {/* Phase 1: Locking */}
          <div className="flex flex-col md:flex-row items-center gap-4 w-full justify-center">
            <DiagramTooltip content="Phase 1: LOCK TABLES READ для каждой таблицы. Aurora не разрешает FLUSH TABLES WITH READ LOCK, поэтому Debezium использует table-level locks. Блокирует записи в таблицу.">
              <FlowNode variant="database" tabIndex={0} className="border-2 border-rose-400 animate-pulse">
                LOCK TABLES READ
              </FlowNode>
            </DiagramTooltip>

            <Arrow direction="right" label="на время чтения схемы" />

            <DiagramTooltip content="Читаем метаданные: columns, indexes, primary key, constraints. Для простых таблиц занимает секунды, для сложных (200+ columns) - минуты.">
              <FlowNode variant="connector" tabIndex={0}>
                Read Schema
              </FlowNode>
            </DiagramTooltip>
          </div>

          {/* Phase 2: Unlock + Position */}
          <div className="flex flex-col md:flex-row items-center gap-4 w-full justify-center">
            <DiagramTooltip content="Phase 2: UNLOCK TABLES снимает блокировки. Записи в таблицу снова разрешены. Это происходит ДО чтения данных.">
              <FlowNode variant="database" tabIndex={0} className="border-2 border-emerald-400">
                UNLOCK TABLES
              </FlowNode>
            </DiagramTooltip>

            <Arrow direction="right" />

            <DiagramTooltip content="START TRANSACTION WITH CONSISTENT SNAPSHOT создает REPEATABLE READ транзакцию. Все последующие SELECT видят данные на момент создания транзакции.">
              <FlowNode variant="database" tabIndex={0}>
                SHOW MASTER STATUS
              </FlowNode>
            </DiagramTooltip>
          </div>

          {/* Phase 3: Data reading */}
          <div className="flex flex-col md:flex-row items-center gap-4 w-full justify-center">
            <DiagramTooltip content="Phase 3: SELECT * FROM table читает все данные. REPEATABLE READ гарантирует консистентность. Записи НЕ блокируются — используется MVCC (snapshot isolation).">
              <FlowNode variant="connector" tabIndex={0} className="border-2 border-blue-400">
                SELECT * FROM table
              </FlowNode>
            </DiagramTooltip>

            <Arrow direction="right" label="op='r' события" />

            <DiagramTooltip content="Каждая строка отправляется в Kafka как event с op='r' (read). Binlog streaming заблокирован до завершения всех SELECT.">
              <FlowNode variant="cluster" tabIndex={0}>
                Kafka Topics
              </FlowNode>
            </DiagramTooltip>
          </div>

          {/* Phase 4: Resume streaming */}
          <div className="flex flex-col md:flex-row items-center gap-4 w-full justify-center">
            <DiagramTooltip content="Phase 4: После завершения snapshot Debezium начинает streaming с сохраненной binlog position. Все изменения во время snapshot будут доставлены.">
              <FlowNode variant="connector" tabIndex={0}>
                Resume Binlog
              </FlowNode>
            </DiagramTooltip>

            <Arrow direction="right" label="from saved position" />

            <DiagramTooltip content="Streaming события (op='c/u/d') дополняют snapshot данные. Consumer видит полную картину: существующие данные + изменения.">
              <FlowNode variant="cluster" tabIndex={0} className="border-2 border-emerald-400">
                Stream Events
              </FlowNode>
            </DiagramTooltip>
          </div>
        </div>
      </DiagramContainer>

      {/* Blocking period indicator */}
      <DiagramContainer title="Период блокировки записи" color="rose">
        <div className="text-sm text-gray-300 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-rose-400 font-bold">LOCK период:</span>
            <span>Только во время чтения schema (секунды-минуты)</span>
          </div>
          <div className="text-xs text-gray-400">
            Чтение данных (SELECT) не блокирует записи — MVCC позволяет concurrent reads и writes.
            <br />
            Initial snapshot блокирует binlog streaming до завершения всех SELECT.
          </div>
        </div>
      </DiagramContainer>
    </div>
  );
}

/**
 * SchemaOnlySnapshotDiagram - Schema-only snapshot fast path
 */
export function SchemaOnlySnapshotDiagram() {
  return (
    <div className="space-y-6">
      <DiagramContainer title="Schema-Only Snapshot (snapshot.mode=schema_only)" color="blue">
        <div className="flex flex-col items-center gap-4">
          {/* Fast path visualization */}
          <div className="flex flex-col md:flex-row items-center gap-4 w-full justify-center">
            <DiagramTooltip content="Schema-only snapshot пропускает чтение данных. Читает только metadata (columns, types, keys) через LOCK TABLES и INFORMATION_SCHEMA.">
              <FlowNode variant="database" tabIndex={0}>
                Read Schema Only
              </FlowNode>
            </DiagramTooltip>

            <Arrow direction="right" label="skip data" />

            <DiagramTooltip content="Данные НЕ читаются. Это означает, что существующие записи не попадут в Kafka. Используется когда начальное состояние известно или не нужно.">
              <FlowNode variant="app" tabIndex={0} className="opacity-50 line-through">
                <span className="text-gray-500">SELECT * (skipped)</span>
              </FlowNode>
            </DiagramTooltip>
          </div>

          <Arrow direction="down" />

          <div className="flex flex-col md:flex-row items-center gap-4 w-full justify-center">
            <DiagramTooltip content="Сразу после чтения schema Debezium сохраняет текущую binlog position и начинает streaming. Весь процесс занимает секунды.">
              <FlowNode variant="connector" tabIndex={0} className="border-2 border-emerald-400">
                Start Streaming Immediately
              </FlowNode>
            </DiagramTooltip>

            <Arrow direction="right" />

            <DiagramTooltip content="Только новые изменения (op='c/u/d') попадают в Kafka. Существующие данные пропущены — consumer не видит историю.">
              <FlowNode variant="cluster" tabIndex={0}>
                Only New Events
              </FlowNode>
            </DiagramTooltip>
          </div>
        </div>
      </DiagramContainer>

      {/* Use cases */}
      <div className="flex flex-col md:flex-row gap-4">
        <DiagramContainer title="Когда использовать" color="emerald" className="flex-1">
          <ul className="text-xs text-gray-300 space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-emerald-400">+</span>
              <span>Восстановление с известной binlog позиции</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400">+</span>
              <span>Bulk load выполнен отдельно (ETL)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400">+</span>
              <span>Только real-time события нужны</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400">+</span>
              <span>Подготовка schema history для incremental snapshot</span>
            </li>
          </ul>
        </DiagramContainer>

        <DiagramContainer title="Ограничения" color="rose" className="flex-1">
          <ul className="text-xs text-gray-300 space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-rose-400">-</span>
              <span>Существующие данные потеряны для CDC</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-rose-400">-</span>
              <span>Consumer видит только delta, не full state</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-rose-400">-</span>
              <span>Требует дополнительный bulk load для полных данных</span>
            </li>
          </ul>
        </DiagramContainer>
      </div>

      {/* Tooltip summary */}
      <DiagramContainer title="Типичный workflow" color="neutral">
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-xs text-gray-300">
          <span className="bg-purple-500/20 px-2 py-1 rounded">1. schema_only</span>
          <Arrow direction="right" />
          <span className="bg-blue-500/20 px-2 py-1 rounded">2. Schema history populated</span>
          <Arrow direction="right" />
          <span className="bg-emerald-500/20 px-2 py-1 rounded">3. Recreate с snapshot.mode=never</span>
        </div>
      </DiagramContainer>
    </div>
  );
}

/**
 * NeverSnapshotDiagram - No snapshot streaming-only mode
 */
export function NeverSnapshotDiagram() {
  return (
    <div className="space-y-6">
      <DiagramContainer title="Never Snapshot (snapshot.mode=never)" color="purple">
        <div className="flex flex-col items-center gap-4">
          {/* Direct streaming visualization */}
          <div className="flex flex-col md:flex-row items-center gap-4 w-full justify-center">
            <DiagramTooltip content="snapshot.mode=never полностью пропускает snapshot фазу. Требует сохраненный offset (из Kafka Connect offsets topic) или pre-populated schema history.">
              <FlowNode variant="database" tabIndex={0}>
                MySQL Binlog
              </FlowNode>
            </DiagramTooltip>

            <Arrow direction="right" label="from saved offset" />

            <DiagramTooltip content="Connector сразу начинает чтение binlog с сохраненной позиции. Нет table locks, нет SELECT, нет блокировки streaming.">
              <FlowNode variant="connector" tabIndex={0} className="border-2 border-emerald-400">
                Direct Streaming
              </FlowNode>
            </DiagramTooltip>

            <Arrow direction="right" />

            <DiagramTooltip content="Только события изменений попадают в Kafka. Существующие данные НЕ будут отправлены — consumer должен иметь baseline data из другого источника.">
              <FlowNode variant="cluster" tabIndex={0}>
                CDC Events Only
              </FlowNode>
            </DiagramTooltip>
          </div>
        </div>
      </DiagramContainer>

      {/* Warning */}
      <DiagramContainer title="Критические требования" color="rose">
        <div className="text-sm text-gray-300 space-y-3">
          <div className="flex items-start gap-2">
            <span className="text-rose-400 font-bold">1.</span>
            <div>
              <span className="font-medium">Schema history topic должен быть populated</span>
              <br />
              <span className="text-xs text-gray-400">
                Без schema history connector не знает структуру таблиц и падает с ошибкой
              </span>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-rose-400 font-bold">2.</span>
            <div>
              <span className="font-medium">Offset должен указывать на существующий binlog файл</span>
              <br />
              <span className="text-xs text-gray-400">
                Если binlog purged — ошибка "Cannot replicate because master purged required binary logs"
              </span>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-rose-400 font-bold">3.</span>
            <div>
              <span className="font-medium">Данные должны быть загружены отдельно</span>
              <br />
              <span className="text-xs text-gray-400">
                Используйте JDBC connector, Aurora snapshot + restore, или ETL для initial load
              </span>
            </div>
          </div>
        </div>
      </DiagramContainer>

      {/* Use case */}
      <DiagramContainer title="Backup-Based Initial Load Workflow" color="neutral">
        <div className="flex flex-col items-center gap-3">
          <div className="flex flex-col md:flex-row items-center justify-center gap-3 text-xs text-gray-300 flex-wrap">
            <span className="bg-purple-500/20 px-2 py-1 rounded whitespace-nowrap">1. SHOW MASTER STATUS</span>
            <Arrow direction="right" />
            <span className="bg-purple-500/20 px-2 py-1 rounded whitespace-nowrap">2. Aurora Snapshot</span>
            <Arrow direction="right" />
            <span className="bg-blue-500/20 px-2 py-1 rounded whitespace-nowrap">3. Restore + JDBC Load</span>
            <Arrow direction="right" />
            <span className="bg-emerald-500/20 px-2 py-1 rounded whitespace-nowrap">4. Debezium never</span>
          </div>
          <div className="text-xs text-gray-400 text-center">
            Позволяет загрузить данные без блокировок и с maximum throughput
          </div>
        </div>
      </DiagramContainer>
    </div>
  );
}
