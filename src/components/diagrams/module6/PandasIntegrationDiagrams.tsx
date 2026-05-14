/** @jsxImportSource solid-js */
/**
 * Pandas Integration Diagrams
 *
 * Exports:
 * - CdcEventStructureDiagram: Hierarchical tree showing Debezium CDC event envelope structure
 */

import { FlowNode } from '@primitives/FlowNode';
import { Arrow } from '@primitives/Arrow';
import { DiagramContainer } from '@primitives/DiagramContainer';
import { DiagramTooltip } from '@primitives/Tooltip';

/**
 * CdcEventStructureDiagram - Hierarchical tree structure of CDC event envelope
 */
export function CdcEventStructureDiagram() {
  return (
    <DiagramContainer
      title="Структура Debezium CDC события"
      color="blue"
      description="Hierarchical envelope формат с полями before, after, op, ts_ms, source"
    >
      <div class="flex flex-col items-center gap-4">
        {/* Top level: CDC Event */}
        <DiagramTooltip
          content={
            <div>
              <strong>CDC Event JSON</strong>
              <p class="mt-1">
                Корневой объект CDC события от Debezium. Содержит два основных поля:
                schema (описание структуры) и payload (данные события).
              </p>
            </div>
          }
        >
          <FlowNode variant="app" tabIndex={0}>
            CDC Event JSON
          </FlowNode>
        </DiagramTooltip>

        <Arrow direction="down" />

        {/* Level 1: schema and payload */}
        <div class="flex gap-6">
          <div class="flex flex-col items-center gap-2">
            <DiagramTooltip
              content={
                <div>
                  <strong>schema</strong>
                  <p class="mt-1">
                    Описание структуры данных в Avro формате. Содержит типы полей,
                    required/optional статус, defaults. Используется Schema Registry.
                  </p>
                </div>
              }
            >
              <FlowNode
                variant="app"
                size="sm"
                className="bg-[var(--bg-deep)] border-[var(--line-medium)] text-[var(--ink-default)]"
                tabIndex={0}
              >
                schema
                <span class="block text-xs text-[var(--ink-muted)] mt-1">
                  (описание структуры)
                </span>
              </FlowNode>
            </DiagramTooltip>
          </div>

          <div class="flex flex-col items-center gap-2">
            <DiagramTooltip
              content={
                <div>
                  <strong>payload</strong>
                  <p class="mt-1">
                    Основное содержимое CDC события. Включает состояния строки до/после изменения,
                    тип операции, timestamp и метаданные источника.
                  </p>
                </div>
              }
            >
              <FlowNode
                variant="app"
                className="bg-blue-500/20 border-blue-400/30 text-blue-700"
                tabIndex={0}
              >
                payload
                <span class="block text-xs text-[var(--ink-muted)] mt-1">(данные события)</span>
              </FlowNode>
            </DiagramTooltip>

            <Arrow direction="down" />

            {/* Level 2: payload fields */}
            <DiagramContainer
              title="Поля payload"
              color="purple"
              className="inline-block"
            >
              <div class="flex flex-col gap-3">
                {/* before field */}
                <div class="flex items-center gap-3">
                  <DiagramTooltip
                    content={
                      <div>
                        <strong>before: &#123;...&#125;</strong>
                        <p class="mt-1">
                          Состояние строки <strong>ДО</strong> изменения.
                        </p>
                        <p class="mt-2">
                          <strong>Null для INSERT операций</strong> (строки не существовало).
                        </p>
                        <p class="mt-2">
                          <strong>Не null для UPDATE и DELETE</strong> — содержит старые значения полей.
                        </p>
                      </div>
                    }
                  >
                    <FlowNode
                      variant="app"
                      size="sm"
                      className="bg-emerald-500/20 border-emerald-400/30 text-emerald-700"
                      tabIndex={0}
                    >
                      before: &#123;...&#125;
                    </FlowNode>
                  </DiagramTooltip>

                  <Arrow direction="right" />

                  <div class="text-xs text-[var(--ink-muted)]">
                    <DiagramTooltip
                      content={
                        <div>
                          <strong>Поля before state</strong>
                          <p class="mt-1">
                            Старые значения: id, customer_id, product_id, quantity, total, status, created_at, updated_at.
                          </p>
                          <p class="mt-2">
                            Для UPDATE: сравните before и after для вычисления изменений.
                          </p>
                          <p class="mt-2">
                            Для DELETE: before содержит последние известные данные.
                          </p>
                        </div>
                      }
                    >
                      <span class="cursor-pointer hover:text-emerald-700" tabindex={0}>
                        id, customer_id, total, ...
                      </span>
                    </DiagramTooltip>
                  </div>
                </div>

                {/* after field */}
                <div class="flex items-center gap-3">
                  <DiagramTooltip
                    content={
                      <div>
                        <strong>after: &#123;...&#125;</strong>
                        <p class="mt-1">
                          Состояние строки <strong>ПОСЛЕ</strong> изменения.
                        </p>
                        <p class="mt-2">
                          <strong>Null для DELETE операций</strong> (строка удалена).
                        </p>
                        <p class="mt-2">
                          <strong>Не null для INSERT, UPDATE, READ</strong> — содержит новые значения полей.
                        </p>
                      </div>
                    }
                  >
                    <FlowNode
                      variant="app"
                      size="sm"
                      className="bg-emerald-500/20 border-emerald-400/30 text-emerald-700"
                      tabIndex={0}
                    >
                      after: &#123;...&#125;
                    </FlowNode>
                  </DiagramTooltip>

                  <Arrow direction="right" />

                  <div class="text-xs text-[var(--ink-muted)]">
                    <DiagramTooltip
                      content={
                        <div>
                          <strong>Поля after state</strong>
                          <p class="mt-1">
                            Новые значения: id, customer_id, product_id, quantity, total, status, created_at, updated_at.
                          </p>
                          <p class="mt-2">
                            Для INSERT/UPDATE/READ используйте after для получения актуальных данных.
                          </p>
                          <p class="mt-2">
                            Для DELETE after=null — используйте before вместо этого!
                          </p>
                        </div>
                      }
                    >
                      <span class="cursor-pointer hover:text-emerald-700" tabindex={0}>
                        id, customer_id, total, ...
                      </span>
                    </DiagramTooltip>
                  </div>
                </div>

                {/* op field */}
                <div class="flex items-center gap-3">
                  <DiagramTooltip
                    content={
                      <div>
                        <strong>op: 'c' | 'u' | 'd' | 'r'</strong>
                        <p class="mt-1">Тип операции:</p>
                        <ul class="mt-2 list-disc list-inside space-y-1">
                          <li>
                            <strong>'c'</strong> (create) — INSERT операция
                          </li>
                          <li>
                            <strong>'u'</strong> (update) — UPDATE операция
                          </li>
                          <li>
                            <strong>'d'</strong> (delete) — DELETE операция
                          </li>
                          <li>
                            <strong>'r'</strong> (read) — Snapshot read (initial sync)
                          </li>
                        </ul>
                      </div>
                    }
                  >
                    <FlowNode
                      variant="app"
                      size="sm"
                      className="bg-rose-500/20 border-rose-400/30 text-rose-700"
                      tabIndex={0}
                    >
                      op: 'c'|'u'|'d'|'r'
                    </FlowNode>
                  </DiagramTooltip>

                  <div class="text-xs text-[var(--ink-muted)] flex gap-2">
                    <span class="text-rose-700">c=INSERT</span>
                    <span class="text-blue-700">u=UPDATE</span>
                    <span class="text-amber-700">d=DELETE</span>
                    <span class="text-emerald-700">r=READ</span>
                  </div>
                </div>

                {/* ts_ms field */}
                <div class="flex items-center gap-3">
                  <DiagramTooltip
                    content={
                      <div>
                        <strong>ts_ms: 1738425600000</strong>
                        <p class="mt-1">
                          Timestamp события в миллисекундах с начала Unix epoch (1 января 1970).
                        </p>
                        <p class="mt-2">
                          Это <strong>время транзакции в базе данных</strong>, а не время обработки Debezium.
                        </p>
                        <p class="mt-2">
                          Используйте для:
                          <br />- Сортировки событий по времени
                          <br />- Window aggregations
                          <br />- Late data detection
                        </p>
                      </div>
                    }
                  >
                    <FlowNode
                      variant="app"
                      size="sm"
                      className="bg-amber-500/20 border-amber-400/30 text-amber-700"
                      tabIndex={0}
                    >
                      ts_ms: 1738425600000
                    </FlowNode>
                  </DiagramTooltip>

                  <div class="text-xs text-[var(--ink-muted)]">
                    (epoch millis)
                  </div>
                </div>

                {/* source field */}
                <div class="flex items-center gap-3">
                  <DiagramTooltip
                    content={
                      <div>
                        <strong>source: &#123;...&#125;</strong>
                        <p class="mt-1">
                          Метаданные источника CDC события. Включает информацию о базе данных,
                          таблице, LSN/binlog position, connector name.
                        </p>
                        <p class="mt-2">
                          Используется для:
                          <br />- Фильтрации по таблице/БД
                          <br />- Отслеживания прогресса репликации
                          <br />- Debugging (откуда пришло событие)
                        </p>
                      </div>
                    }
                  >
                    <FlowNode
                      variant="app"
                      size="sm"
                      className="bg-purple-500/20 border-purple-400/30 text-purple-700"
                      tabIndex={0}
                    >
                      source: &#123;...&#125;
                    </FlowNode>
                  </DiagramTooltip>

                  <Arrow direction="right" />

                  <div class="text-xs text-[var(--ink-muted)]">
                    <DiagramTooltip
                      content={
                        <div>
                          <strong>Поля source metadata</strong>
                          <p class="mt-1">
                            <strong>db</strong> — имя базы данных (inventory)
                          </p>
                          <p class="mt-1">
                            <strong>table</strong> — имя таблицы (orders)
                          </p>
                          <p class="mt-1">
                            <strong>lsn</strong> (PostgreSQL) или <strong>pos</strong> (MySQL) —
                            позиция в логе репликации
                          </p>
                          <p class="mt-1">
                            <strong>connector</strong> — имя Debezium connector (dbserver1)
                          </p>
                          <p class="mt-1">
                            <strong>ts_ms</strong> — timestamp захвата события Debezium
                          </p>
                        </div>
                      }
                    >
                      <span class="cursor-pointer hover:text-purple-700" tabindex={0}>
                        db, table, lsn, connector, ...
                      </span>
                    </DiagramTooltip>
                  </div>
                </div>
              </div>
            </DiagramContainer>
          </div>
        </div>

        {/* Summary note */}
        <div class="mt-4 text-xs text-[var(--ink-muted)] max-w-2xl">
          <div class="font-semibold text-blue-700 mb-2">
            Критически важно для Pandas обработки:
          </div>
          <ul class="list-disc list-inside space-y-1">
            <li>
              <strong>INSERT (op='c'):</strong> before=null, используйте after для данных
            </li>
            <li>
              <strong>UPDATE (op='u'):</strong> оба поля заполнены, сравните для diff
            </li>
            <li>
              <strong>DELETE (op='d'):</strong> after=null, используйте before для данных!
            </li>
            <li>
              <strong>READ (op='r'):</strong> snapshot data, before=null, используйте after
            </li>
          </ul>
        </div>
      </div>
    </DiagramContainer>
  );
}
