/**
 * DDL Tools Integration Diagrams for Module 3
 *
 * Exports:
 * - GhOstFlowDiagram: gh-ost online schema change flow
 * - PtOscFlowDiagram: pt-online-schema-change flow
 * - DdlToolComparisonDiagram: Side-by-side comparison of gh-ost vs pt-osc
 * - GhostTableLifecycleDiagram: Ghost table lifecycle during DDL migration
 */

import { FlowNode } from '../primitives/FlowNode';
import { Arrow } from '../primitives/Arrow';
import { DiagramContainer } from '../primitives/DiagramContainer';
import { DiagramTooltip } from '../primitives/Tooltip';

/**
 * GhOstFlowDiagram - gh-ost online schema change flow
 */
export function GhOstFlowDiagram() {
  return (
    <div className="space-y-6">
      <DiagramContainer title="gh-ost: Binlog-based Schema Change" color="emerald">
        <div className="flex flex-col items-center gap-4">
          {/* Row 1: Original table and ghost table */}
          <div className="flex flex-col md:flex-row items-center gap-6 w-full justify-center">
            <div className="flex flex-col items-center gap-2">
              <DiagramTooltip content="Оригинальная таблица orders. Приложение продолжает писать/читать во время миграции.">
                <FlowNode variant="database" tabIndex={0}>
                  orders
                  <br />
                  <span className="text-xs text-gray-400">(original)</span>
                </FlowNode>
              </DiagramTooltip>
              <div className="text-xs text-emerald-400">Application writes</div>
            </div>

            <div className="flex flex-col items-center gap-2">
              <DiagramTooltip content="Ghost таблица с новой схемой. gh-ost копирует данные порциями и синхронизирует через binlog.">
                <FlowNode variant="database" tabIndex={0} className="border-2 border-purple-400">
                  _orders_gho
                  <br />
                  <span className="text-xs text-purple-400">(new schema)</span>
                </FlowNode>
              </DiagramTooltip>
              <div className="text-xs text-purple-400">+ status column</div>
            </div>

            <div className="flex flex-col items-center gap-2">
              <DiagramTooltip content="Changelog таблица для отслеживания прогресса миграции. Содержит метаданные о процессе.">
                <FlowNode variant="app" tabIndex={0} size="sm">
                  _orders_ghc
                  <br />
                  <span className="text-xs text-gray-400">(metadata)</span>
                </FlowNode>
              </DiagramTooltip>
            </div>
          </div>

          {/* Row 2: gh-ost process */}
          <div className="flex flex-col md:flex-row items-center gap-4 w-full justify-center">
            <DiagramTooltip content="gh-ost процесс: копирует данные chunk-by-chunk из orders в _orders_gho. Параллельно читает binlog.">
              <FlowNode variant="connector" tabIndex={0} className="border-2 border-emerald-400">
                gh-ost process
              </FlowNode>
            </DiagramTooltip>
          </div>

          {/* Row 3: Process steps */}
          <div className="flex flex-col md:flex-row items-center gap-4 w-full justify-center">
            <div className="flex flex-col items-center gap-2">
              <div className="text-xs text-emerald-400 font-bold">1. Copy Rows</div>
              <DiagramTooltip content="Chunked copy: SELECT * WHERE id >= N AND id < N+1000. Не блокирует таблицу.">
                <FlowNode variant="app" tabIndex={0} size="sm">
                  chunk copy
                  <br />
                  <span className="text-xs text-gray-400">1000 rows</span>
                </FlowNode>
              </DiagramTooltip>
            </div>

            <Arrow direction="right" />

            <div className="flex flex-col items-center gap-2">
              <div className="text-xs text-blue-400 font-bold">2. Read Binlog</div>
              <DiagramTooltip content="Параллельно: gh-ost читает binlog для обнаружения изменений в orders. Применяет к ghost table.">
                <FlowNode variant="cluster" tabIndex={0} size="sm">
                  binlog events
                  <br />
                  <span className="text-xs text-gray-400">INS/UPD/DEL</span>
                </FlowNode>
              </DiagramTooltip>
            </div>

            <Arrow direction="right" />

            <div className="flex flex-col items-center gap-2">
              <div className="text-xs text-purple-400 font-bold">3. Apply Changes</div>
              <DiagramTooltip content="Binlog events применяются к _orders_gho. Синхронизация в реальном времени.">
                <FlowNode variant="database" tabIndex={0} size="sm">
                  sync to ghost
                </FlowNode>
              </DiagramTooltip>
            </div>

            <Arrow direction="right" />

            <div className="flex flex-col items-center gap-2">
              <div className="text-xs text-amber-400 font-bold">4. Cutover</div>
              <DiagramTooltip content="Atomic rename: orders ↔ _orders_gho. Блокировка на миллисекунды. Zero downtime.">
                <FlowNode variant="connector" tabIndex={0} size="sm" className="border-2 border-amber-400">
                  atomic rename
                </FlowNode>
              </DiagramTooltip>
            </div>
          </div>
        </div>
      </DiagramContainer>

      {/* Debezium interaction */}
      <DiagramContainer title="Debezium: Filter gh-ost Tables" color="amber">
        <div className="text-sm text-gray-300 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-amber-400 font-bold">ВАЖНО:</span>
            <span>gh-ost создает временные таблицы, которые Debezium видит в binlog.</span>
          </div>
          <div className="font-mono text-xs bg-gray-800/50 p-3 rounded mt-2">
            <div className="text-gray-400">// Filter SMT для исключения helper tables</div>
            <div className="text-emerald-400">"transforms.Filter.condition":</div>
            <div className="text-amber-400 ml-2">"!value.source.table.matches('.*_(gho|ghc)$')"</div>
          </div>
          <div className="text-xs text-gray-400 mt-2">
            Без фильтра consumers получат дублирующие события от orders и _orders_gho.
          </div>
        </div>
      </DiagramContainer>
    </div>
  );
}

/**
 * PtOscFlowDiagram - pt-online-schema-change flow
 */
export function PtOscFlowDiagram() {
  return (
    <div className="space-y-6">
      <DiagramContainer title="pt-osc: Trigger-based Schema Change" color="blue">
        <div className="flex flex-col items-center gap-4">
          {/* Row 1: Original table and new table */}
          <div className="flex flex-col md:flex-row items-center gap-6 w-full justify-center">
            <div className="flex flex-col items-center gap-2">
              <DiagramTooltip content="Оригинальная таблица orders. pt-osc создает триггеры для синхронизации изменений.">
                <FlowNode variant="database" tabIndex={0}>
                  orders
                  <br />
                  <span className="text-xs text-gray-400">(original)</span>
                </FlowNode>
              </DiagramTooltip>
              <div className="text-xs text-blue-400">+ TRIGGERS</div>
            </div>

            <Arrow direction="right" dashed label="triggers" />

            <div className="flex flex-col items-center gap-2">
              <DiagramTooltip content="Новая таблица с измененной схемой. Триггеры автоматически копируют изменения из orders.">
                <FlowNode variant="database" tabIndex={0} className="border-2 border-purple-400">
                  _orders_new
                  <br />
                  <span className="text-xs text-purple-400">(new schema)</span>
                </FlowNode>
              </DiagramTooltip>
            </div>
          </div>

          {/* Row 2: Triggers */}
          <div className="flex flex-col md:flex-row items-center gap-4 w-full justify-center">
            <DiagramTooltip content="AFTER INSERT trigger: копирует новые строки в _orders_new.">
              <FlowNode variant="connector" tabIndex={0} size="sm">
                AFTER INSERT
                <br />
                <span className="text-xs text-gray-400">→ INSERT _orders_new</span>
              </FlowNode>
            </DiagramTooltip>

            <DiagramTooltip content="AFTER UPDATE trigger: обновляет строки в _orders_new.">
              <FlowNode variant="connector" tabIndex={0} size="sm">
                AFTER UPDATE
                <br />
                <span className="text-xs text-gray-400">→ REPLACE _orders_new</span>
              </FlowNode>
            </DiagramTooltip>

            <DiagramTooltip content="AFTER DELETE trigger: удаляет строки из _orders_new.">
              <FlowNode variant="connector" tabIndex={0} size="sm">
                AFTER DELETE
                <br />
                <span className="text-xs text-gray-400">→ DELETE _orders_new</span>
              </FlowNode>
            </DiagramTooltip>
          </div>

          {/* Row 3: Process steps */}
          <div className="flex flex-col md:flex-row items-center gap-4 w-full justify-center">
            <div className="flex flex-col items-center gap-2">
              <div className="text-xs text-blue-400 font-bold">1. Create + Triggers</div>
              <DiagramTooltip content="Создается _orders_new и триггеры на оригинальной таблице.">
                <FlowNode variant="app" tabIndex={0} size="sm">
                  setup
                </FlowNode>
              </DiagramTooltip>
            </div>

            <Arrow direction="right" />

            <div className="flex flex-col items-center gap-2">
              <div className="text-xs text-emerald-400 font-bold">2. Copy Chunks</div>
              <DiagramTooltip content="Chunked copy из orders в _orders_new. Параллельно триггеры синхронизируют изменения.">
                <FlowNode variant="cluster" tabIndex={0} size="sm">
                  chunk copy
                </FlowNode>
              </DiagramTooltip>
            </div>

            <Arrow direction="right" />

            <div className="flex flex-col items-center gap-2">
              <div className="text-xs text-amber-400 font-bold">3. Rename</div>
              <DiagramTooltip content="Atomic rename: orders → _orders_old, _orders_new → orders. Milliseconds lock.">
                <FlowNode variant="connector" tabIndex={0} size="sm" className="border-2 border-amber-400">
                  atomic swap
                </FlowNode>
              </DiagramTooltip>
            </div>

            <Arrow direction="right" />

            <div className="flex flex-col items-center gap-2">
              <div className="text-xs text-rose-400 font-bold">4. Cleanup</div>
              <DiagramTooltip content="Удаление _orders_old и триггеров. Миграция завершена.">
                <FlowNode variant="sink" tabIndex={0} size="sm">
                  drop old
                </FlowNode>
              </DiagramTooltip>
            </div>
          </div>
        </div>
      </DiagramContainer>

      {/* pt-osc advantage */}
      <DiagramContainer title="pt-osc Advantage: Foreign Keys" color="emerald">
        <div className="text-sm text-gray-300 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-emerald-400 font-bold">ПОДДЕРЖКА FK:</span>
            <span>pt-osc корректно обрабатывает таблицы с foreign keys.</span>
          </div>
          <div className="text-xs text-gray-400 mt-2">
            gh-ost НЕ поддерживает foreign keys — нужно временно удалять FK constraints.
            pt-osc использует триггеры, которые соблюдают FK при копировании данных.
          </div>
        </div>
      </DiagramContainer>

      {/* Debezium filter */}
      <DiagramContainer title="Debezium: Filter pt-osc Tables" color="amber">
        <div className="font-mono text-xs bg-gray-800/50 p-3 rounded">
          <div className="text-gray-400">// Filter SMT для pt-osc helper tables</div>
          <div className="text-emerald-400">"transforms.Filter.condition":</div>
          <div className="text-amber-400 ml-2">"!value.source.table.matches('.*_(new|old)$')"</div>
        </div>
      </DiagramContainer>
    </div>
  );
}

/**
 * DdlToolComparisonDiagram - Side-by-side comparison of gh-ost vs pt-osc
 */
export function DdlToolComparisonDiagram() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* gh-ost */}
        <DiagramContainer title="gh-ost" color="emerald" className="flex-1" recommended>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <DiagramTooltip content="gh-ost не использует триггеры. Синхронизация через чтение binlog — меньше overhead на каждую запись.">
                <FlowNode variant="connector" tabIndex={0} size="sm">
                  Binlog-based
                </FlowNode>
              </DiagramTooltip>
            </div>

            <div className="text-xs text-gray-300 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-emerald-400">+</span>
                <span>Triggerless — нет overhead на записи</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-emerald-400">+</span>
                <span>Автоматический throttling</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-emerald-400">+</span>
                <span>Pausable/resumable</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-rose-400">−</span>
                <span>НЕ поддерживает Foreign Keys</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-rose-400">−</span>
                <span>Удваивает binlog read нагрузку</span>
              </div>
            </div>

            <div className="text-xs text-emerald-400 font-medium mt-2">
              Рекомендуется для CDC
              <br />
              <span className="text-gray-400">(если нет FK)</span>
            </div>
          </div>
        </DiagramContainer>

        {/* pt-osc */}
        <DiagramContainer title="pt-online-schema-change" color="blue" className="flex-1">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <DiagramTooltip content="pt-osc использует триггеры для синхронизации. Каждая запись вызывает trigger → overhead.">
                <FlowNode variant="connector" tabIndex={0} size="sm">
                  Trigger-based
                </FlowNode>
              </DiagramTooltip>
            </div>

            <div className="text-xs text-gray-300 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-emerald-400">+</span>
                <span>Поддерживает Foreign Keys</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-emerald-400">+</span>
                <span>Не читает binlog (меньше I/O)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-emerald-400">+</span>
                <span>Проще отладка (triggers видны)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-rose-400">−</span>
                <span>Trigger overhead на каждую запись</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-rose-400">−</span>
                <span>Сложно приостановить</span>
              </div>
            </div>

            <div className="text-xs text-blue-400 font-medium mt-2">
              Используйте если есть FK
            </div>
          </div>
        </DiagramContainer>
      </div>

      {/* Comparison table */}
      <DiagramContainer title="Feature Comparison" color="neutral">
        <div className="overflow-x-auto">
          <table className="text-xs text-gray-300 w-full">
            <thead>
              <tr className="border-b border-gray-600">
                <th className="text-left py-2 pr-4">Feature</th>
                <th className="text-left py-2 pr-4">gh-ost</th>
                <th className="text-left py-2">pt-osc</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-700">
                <td className="py-2 pr-4">Mechanism</td>
                <td className="py-2 pr-4 text-emerald-400">Binlog reading</td>
                <td className="py-2 text-blue-400">Triggers</td>
              </tr>
              <tr className="border-b border-gray-700">
                <td className="py-2 pr-4">Helper tables</td>
                <td className="py-2 pr-4 font-mono">_gho, _ghc</td>
                <td className="py-2 font-mono">_new, _old</td>
              </tr>
              <tr className="border-b border-gray-700">
                <td className="py-2 pr-4">Foreign Keys</td>
                <td className="py-2 pr-4 text-rose-400">Not supported</td>
                <td className="py-2 text-emerald-400">Supported</td>
              </tr>
              <tr className="border-b border-gray-700">
                <td className="py-2 pr-4">Binlog impact</td>
                <td className="py-2 pr-4 text-amber-400">2x read load</td>
                <td className="py-2 text-emerald-400">Normal</td>
              </tr>
              <tr>
                <td className="py-2 pr-4">Pausable</td>
                <td className="py-2 pr-4 text-emerald-400">Yes</td>
                <td className="py-2 text-amber-400">Requires cleanup</td>
              </tr>
            </tbody>
          </table>
        </div>
      </DiagramContainer>
    </div>
  );
}

/**
 * GhostTableLifecycleDiagram - Ghost table lifecycle during DDL migration
 */
export function GhostTableLifecycleDiagram() {
  return (
    <div className="space-y-6">
      <DiagramContainer title="Ghost Table Lifecycle (gh-ost)" color="purple">
        <div className="flex flex-col items-center gap-4">
          {/* Timeline */}
          <div className="relative w-full">
            {/* Timeline line */}
            <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-gray-600 transform -translate-y-1/2" />

            {/* Timeline events */}
            <div className="flex justify-between items-center relative">
              {/* Step 1: Create */}
              <div className="flex flex-col items-center gap-2 z-10">
                <div className="w-4 h-4 bg-emerald-400 rounded-full" />
                <DiagramTooltip content="Step 1: gh-ost создает _orders_gho с новой схемой и _orders_ghc для метаданных.">
                  <FlowNode variant="connector" tabIndex={0} size="sm">
                    CREATE
                    <br />
                    <span className="text-xs text-emerald-400">_orders_gho</span>
                  </FlowNode>
                </DiagramTooltip>
                <div className="text-xs text-gray-400">T0</div>
              </div>

              {/* Step 2: Copy */}
              <div className="flex flex-col items-center gap-2 z-10">
                <div className="w-4 h-4 bg-blue-400 rounded-full" />
                <DiagramTooltip content="Step 2: Chunked copy данных из orders в _orders_gho. Параллельно binlog sync.">
                  <FlowNode variant="cluster" tabIndex={0} size="sm">
                    COPY
                    <br />
                    <span className="text-xs text-blue-400">data migration</span>
                  </FlowNode>
                </DiagramTooltip>
                <div className="text-xs text-gray-400">T1-Tn</div>
              </div>

              {/* Step 3: Cutover */}
              <div className="flex flex-col items-center gap-2 z-10">
                <div className="w-4 h-4 bg-amber-400 rounded-full" />
                <DiagramTooltip content="Step 3: Atomic rename. orders → _orders_del (temp), _orders_gho → orders. Milliseconds lock.">
                  <FlowNode variant="app" tabIndex={0} size="sm" className="border-2 border-amber-400">
                    RENAME
                    <br />
                    <span className="text-xs text-amber-400">cutover</span>
                  </FlowNode>
                </DiagramTooltip>
                <div className="text-xs text-gray-400">Tn+1</div>
              </div>

              {/* Step 4: Cleanup */}
              <div className="flex flex-col items-center gap-2 z-10">
                <div className="w-4 h-4 bg-rose-400 rounded-full" />
                <DiagramTooltip content="Step 4: Удаление старой таблицы и _orders_ghc. Cleanup завершён.">
                  <FlowNode variant="sink" tabIndex={0} size="sm">
                    DROP
                    <br />
                    <span className="text-xs text-rose-400">cleanup</span>
                  </FlowNode>
                </DiagramTooltip>
                <div className="text-xs text-gray-400">Tn+2</div>
              </div>
            </div>
          </div>
        </div>
      </DiagramContainer>

      {/* What Debezium sees */}
      <DiagramContainer title="Debezium Perspective" color="amber">
        <div className="flex flex-col gap-4">
          <div className="text-sm text-gray-300">
            <span className="text-amber-400 font-bold">Debezium видит в binlog:</span>
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 bg-gray-800/50 p-3 rounded">
              <div className="text-xs text-emerald-400 font-bold mb-2">T0: CREATE</div>
              <div className="text-xs text-gray-300 space-y-1">
                <div>CREATE TABLE _orders_gho (...)</div>
                <div>CREATE TABLE _orders_ghc (...)</div>
              </div>
              <div className="text-xs text-amber-400 mt-2">→ Schema history updated</div>
            </div>

            <div className="flex-1 bg-gray-800/50 p-3 rounded">
              <div className="text-xs text-blue-400 font-bold mb-2">T1-Tn: DATA</div>
              <div className="text-xs text-gray-300 space-y-1">
                <div>INSERT _orders_gho (copy)</div>
                <div>INSERT/UPDATE/DELETE orders</div>
                <div>INSERT _orders_gho (sync)</div>
              </div>
              <div className="text-xs text-emerald-400 mt-2">→ Filter SMT excludes _gho</div>
            </div>

            <div className="flex-1 bg-gray-800/50 p-3 rounded">
              <div className="text-xs text-amber-400 font-bold mb-2">Tn+1: RENAME</div>
              <div className="text-xs text-gray-300 space-y-1">
                <div>RENAME orders → _orders_old</div>
                <div>RENAME _orders_gho → orders</div>
              </div>
              <div className="text-xs text-purple-400 mt-2">→ New schema active</div>
            </div>

            <div className="flex-1 bg-gray-800/50 p-3 rounded">
              <div className="text-xs text-rose-400 font-bold mb-2">Tn+2: DROP</div>
              <div className="text-xs text-gray-300 space-y-1">
                <div>DROP _orders_old</div>
                <div>DROP _orders_ghc</div>
              </div>
              <div className="text-xs text-gray-400 mt-2">→ Schema history updated</div>
            </div>
          </div>
        </div>
      </DiagramContainer>

      {/* Consumer impact */}
      <DiagramContainer title="Consumer Impact" color="emerald">
        <div className="text-sm text-gray-300 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-emerald-400 font-bold">РЕЗУЛЬТАТ:</span>
            <span>Consumers видят новую колонку автоматически после cutover.</span>
          </div>
          <div className="text-xs text-gray-400">
            С Filter SMT consumers получают только события от оригинальной таблицы orders.
            После cutover новая схема (с добавленной колонкой) применяется автоматически.
            <br />
            <br />
            <span className="text-amber-400">Важно:</span> Consumers должны быть готовы к schema evolution
            (новые optional поля).
          </div>
        </div>
      </DiagramContainer>
    </div>
  );
}
