/**
 * Pandas Integration Diagrams
 *
 * Exports:
 * - CdcEventStructureDiagram: Hierarchical tree showing Debezium CDC event envelope structure
 */

import { FlowNode } from '../primitives/FlowNode';
import { Arrow } from '../primitives/Arrow';
import { DiagramContainer } from '../primitives/DiagramContainer';
import { DiagramTooltip } from '../primitives/Tooltip';

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
      <div className="flex flex-col items-center gap-4">
        {/* Top level: CDC Event */}
        <DiagramTooltip
          content={
            <div>
              <strong>CDC Event JSON</strong>
              <p className="mt-1">
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
        <div className="flex gap-6">
          <div className="flex flex-col items-center gap-2">
            <DiagramTooltip
              content={
                <div>
                  <strong>schema</strong>
                  <p className="mt-1">
                    Описание структуры данных в Avro формате. Содержит типы полей,
                    required/optional статус, defaults. Используется Schema Registry.
                  </p>
                </div>
              }
            >
              <FlowNode
                variant="app"
                size="sm"
                className="bg-gray-500/20 border-gray-400/30 text-gray-200"
                tabIndex={0}
              >
                schema
                <span className="block text-xs text-gray-400 mt-1">
                  (описание структуры)
                </span>
              </FlowNode>
            </DiagramTooltip>
          </div>

          <div className="flex flex-col items-center gap-2">
            <DiagramTooltip
              content={
                <div>
                  <strong>payload</strong>
                  <p className="mt-1">
                    Основное содержимое CDC события. Включает состояния строки до/после изменения,
                    тип операции, timestamp и метаданные источника.
                  </p>
                </div>
              }
            >
              <FlowNode
                variant="app"
                className="bg-blue-500/20 border-blue-400/30 text-blue-200"
                tabIndex={0}
              >
                payload
                <span className="block text-xs text-gray-400 mt-1">(данные события)</span>
              </FlowNode>
            </DiagramTooltip>

            <Arrow direction="down" />

            {/* Level 2: payload fields */}
            <DiagramContainer
              title="Поля payload"
              color="purple"
              className="inline-block"
            >
              <div className="flex flex-col gap-3">
                {/* before field */}
                <div className="flex items-center gap-3">
                  <DiagramTooltip
                    content={
                      <div>
                        <strong>before: &#123;...&#125;</strong>
                        <p className="mt-1">
                          Состояние строки <strong>ДО</strong> изменения.
                        </p>
                        <p className="mt-2">
                          <strong>Null для INSERT операций</strong> (строки не существовало).
                        </p>
                        <p className="mt-2">
                          <strong>Не null для UPDATE и DELETE</strong> — содержит старые значения полей.
                        </p>
                      </div>
                    }
                  >
                    <FlowNode
                      variant="app"
                      size="sm"
                      className="bg-emerald-500/20 border-emerald-400/30 text-emerald-200"
                      tabIndex={0}
                    >
                      before: &#123;...&#125;
                    </FlowNode>
                  </DiagramTooltip>

                  <Arrow direction="right" />

                  <div className="text-xs text-gray-400">
                    <DiagramTooltip
                      content={
                        <div>
                          <strong>Поля before state</strong>
                          <p className="mt-1">
                            Старые значения: id, customer_id, product_id, quantity, total, status, created_at, updated_at.
                          </p>
                          <p className="mt-2">
                            Для UPDATE: сравните before и after для вычисления изменений.
                          </p>
                          <p className="mt-2">
                            Для DELETE: before содержит последние известные данные.
                          </p>
                        </div>
                      }
                    >
                      <span className="cursor-pointer hover:text-emerald-300" tabIndex={0}>
                        id, customer_id, total, ...
                      </span>
                    </DiagramTooltip>
                  </div>
                </div>

                {/* after field */}
                <div className="flex items-center gap-3">
                  <DiagramTooltip
                    content={
                      <div>
                        <strong>after: &#123;...&#125;</strong>
                        <p className="mt-1">
                          Состояние строки <strong>ПОСЛЕ</strong> изменения.
                        </p>
                        <p className="mt-2">
                          <strong>Null для DELETE операций</strong> (строка удалена).
                        </p>
                        <p className="mt-2">
                          <strong>Не null для INSERT, UPDATE, READ</strong> — содержит новые значения полей.
                        </p>
                      </div>
                    }
                  >
                    <FlowNode
                      variant="app"
                      size="sm"
                      className="bg-emerald-500/20 border-emerald-400/30 text-emerald-200"
                      tabIndex={0}
                    >
                      after: &#123;...&#125;
                    </FlowNode>
                  </DiagramTooltip>

                  <Arrow direction="right" />

                  <div className="text-xs text-gray-400">
                    <DiagramTooltip
                      content={
                        <div>
                          <strong>Поля after state</strong>
                          <p className="mt-1">
                            Новые значения: id, customer_id, product_id, quantity, total, status, created_at, updated_at.
                          </p>
                          <p className="mt-2">
                            Для INSERT/UPDATE/READ используйте after для получения актуальных данных.
                          </p>
                          <p className="mt-2">
                            Для DELETE after=null — используйте before вместо этого!
                          </p>
                        </div>
                      }
                    >
                      <span className="cursor-pointer hover:text-emerald-300" tabIndex={0}>
                        id, customer_id, total, ...
                      </span>
                    </DiagramTooltip>
                  </div>
                </div>

                {/* op field */}
                <div className="flex items-center gap-3">
                  <DiagramTooltip
                    content={
                      <div>
                        <strong>op: 'c' | 'u' | 'd' | 'r'</strong>
                        <p className="mt-1">Тип операции:</p>
                        <ul className="mt-2 list-disc list-inside space-y-1">
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
                      className="bg-rose-500/20 border-rose-400/30 text-rose-200"
                      tabIndex={0}
                    >
                      op: 'c'|'u'|'d'|'r'
                    </FlowNode>
                  </DiagramTooltip>

                  <div className="text-xs text-gray-400 flex gap-2">
                    <span className="text-rose-300">c=INSERT</span>
                    <span className="text-blue-300">u=UPDATE</span>
                    <span className="text-amber-300">d=DELETE</span>
                    <span className="text-emerald-300">r=READ</span>
                  </div>
                </div>

                {/* ts_ms field */}
                <div className="flex items-center gap-3">
                  <DiagramTooltip
                    content={
                      <div>
                        <strong>ts_ms: 1738425600000</strong>
                        <p className="mt-1">
                          Timestamp события в миллисекундах с начала Unix epoch (1 января 1970).
                        </p>
                        <p className="mt-2">
                          Это <strong>время транзакции в базе данных</strong>, а не время обработки Debezium.
                        </p>
                        <p className="mt-2">
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
                      className="bg-amber-500/20 border-amber-400/30 text-amber-200"
                      tabIndex={0}
                    >
                      ts_ms: 1738425600000
                    </FlowNode>
                  </DiagramTooltip>

                  <div className="text-xs text-gray-400">
                    (epoch millis)
                  </div>
                </div>

                {/* source field */}
                <div className="flex items-center gap-3">
                  <DiagramTooltip
                    content={
                      <div>
                        <strong>source: &#123;...&#125;</strong>
                        <p className="mt-1">
                          Метаданные источника CDC события. Включает информацию о базе данных,
                          таблице, LSN/binlog position, connector name.
                        </p>
                        <p className="mt-2">
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
                      className="bg-purple-500/20 border-purple-400/30 text-purple-200"
                      tabIndex={0}
                    >
                      source: &#123;...&#125;
                    </FlowNode>
                  </DiagramTooltip>

                  <Arrow direction="right" />

                  <div className="text-xs text-gray-400">
                    <DiagramTooltip
                      content={
                        <div>
                          <strong>Поля source metadata</strong>
                          <p className="mt-1">
                            <strong>db</strong> — имя базы данных (inventory)
                          </p>
                          <p className="mt-1">
                            <strong>table</strong> — имя таблицы (orders)
                          </p>
                          <p className="mt-1">
                            <strong>lsn</strong> (PostgreSQL) или <strong>pos</strong> (MySQL) —
                            позиция в логе репликации
                          </p>
                          <p className="mt-1">
                            <strong>connector</strong> — имя Debezium connector (dbserver1)
                          </p>
                          <p className="mt-1">
                            <strong>ts_ms</strong> — timestamp захвата события Debezium
                          </p>
                        </div>
                      }
                    >
                      <span className="cursor-pointer hover:text-purple-300" tabIndex={0}>
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
        <div className="mt-4 text-xs text-gray-400 max-w-2xl">
          <div className="font-semibold text-blue-300 mb-2">
            Критически важно для Pandas обработки:
          </div>
          <ul className="list-disc list-inside space-y-1">
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
