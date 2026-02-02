/**
 * Predicate and Filter Diagrams
 *
 * Exports:
 * - PredicateEvaluationDiagram: Predicate decision flow (TRUE/FALSE paths)
 * - PredicateCombinationDiagram: Multiple predicates for different SMTs
 * - FilterDecisionTreeDiagram: Decision tree for Predicate vs Filter SMT
 */

import { FlowNode } from '../primitives/FlowNode';
import { Arrow } from '../primitives/Arrow';
import { DiagramContainer } from '../primitives/DiagramContainer';
import { DiagramTooltip } from '../primitives/Tooltip';

/**
 * PredicateEvaluationDiagram - Predicate conditional SMT application
 */
export function PredicateEvaluationDiagram() {
  return (
    <DiagramContainer
      title="Predicate условное применение"
      color="purple"
      description="SMT применяется только если predicate вернул true"
    >
      <div className="flex flex-col items-center gap-4">
        <DiagramTooltip
          content={
            <div>
              <strong>Incoming Message</strong>
              <p className="mt-1">
                Сообщение с топика dbserver1.inventory.customers.
                Debezium envelope с полями before, after, op, source.
              </p>
            </div>
          }
        >
          <FlowNode variant="app" tabIndex={0}>
            <div>Incoming Message</div>
            <span className="block text-xs text-gray-400 mt-1">
              topic: dbserver1.inventory.customers
            </span>
          </FlowNode>
        </DiagramTooltip>

        <Arrow direction="down" />

        <DiagramTooltip
          content={
            <div>
              <strong>Predicate: IsDataEvent</strong>
              <p className="mt-1">
                TopicNameMatches проверяет regex pattern. Если топик соответствует
                dbserver1\.inventory\..* — возвращает true, иначе false.
              </p>
              <p className="mt-2 text-xs text-purple-300">
                Heartbeat публикуется в топик __debezium-heartbeat.dbserver1 (не соответствует pattern) → predicate вернет false.
              </p>
            </div>
          }
        >
          <FlowNode
            variant="connector"
            className="bg-purple-500/20 border-purple-400/30 text-purple-200"
            tabIndex={0}
          >
            <div>Predicate: IsDataEvent</div>
            <span className="block text-xs text-gray-400 mt-1">
              pattern: dbserver1\.inventory\..*
            </span>
          </FlowNode>
        </DiagramTooltip>

        <div className="flex gap-8 mt-4">
          {/* TRUE path */}
          <div className="flex flex-col items-center gap-2">
            <div className="text-sm font-semibold text-emerald-400">TRUE</div>
            <Arrow direction="down" />
            <DiagramTooltip
              content={
                <div>
                  <strong>Apply SMT</strong>
                  <p className="mt-1">
                    Применяется ExtractNewRecordState, событие разворачивается в flat JSON.
                    Метаданные добавляются как __op, __table, __source.ts_ms.
                  </p>
                </div>
              }
            >
              <FlowNode
                variant="connector"
                className="bg-emerald-500/20 border-emerald-400/30 text-emerald-200"
                tabIndex={0}
              >
                <div>Apply SMT</div>
                <span className="block text-xs text-gray-400 mt-1">
                  Unwrap envelope
                </span>
              </FlowNode>
            </DiagramTooltip>
          </div>

          {/* FALSE path */}
          <div className="flex flex-col items-center gap-2">
            <div className="text-sm font-semibold text-gray-400">FALSE</div>
            <Arrow direction="down" />
            <DiagramTooltip
              content={
                <div>
                  <strong>Skip SMT</strong>
                  <p className="mt-1">
                    Heartbeat сообщения не соответствуют pattern, проходят без изменений.
                    Не имеют поля after, но SMT не применяется — нет ошибки.
                  </p>
                </div>
              }
            >
              <FlowNode
                variant="app"
                className="bg-gray-700/20 border-gray-600/30 text-gray-300"
                tabIndex={0}
              >
                <div>Skip SMT</div>
                <span className="block text-xs text-gray-400 mt-1">
                  Pass through
                </span>
              </FlowNode>
            </DiagramTooltip>
          </div>
        </div>

        <Arrow direction="down" />

        <DiagramTooltip
          content={
            <div>
              <strong>To Kafka</strong>
              <p className="mt-1">
                TRUE path: flat JSON в топик. FALSE path: envelope в топик.
                Оба типа сообщений опубликованы успешно.
              </p>
            </div>
          }
        >
          <FlowNode variant="sink" tabIndex={0}>
            To Kafka
          </FlowNode>
        </DiagramTooltip>
      </div>
    </DiagramContainer>
  );
}

/**
 * PredicateCombinationDiagram - Multiple predicates for different SMTs
 */
export function PredicateCombinationDiagram() {
  return (
    <DiagramContainer
      title="Комбинирование нескольких предикатов"
      color="blue"
      description="Разные предикаты для разных SMT в одном коннекторе"
    >
      <div className="flex flex-col items-center gap-4">
        <DiagramTooltip
          content={
            <div>
              <strong>Message</strong>
              <p className="mt-1">
                Входящее сообщение с топика dbserver1.inventory.customers.
                Проходит через два SMT stage с разными предикатами.
              </p>
            </div>
          }
        >
          <FlowNode variant="app" tabIndex={0}>
            <div>Message</div>
            <span className="block text-xs text-gray-400 mt-1">
              topic: dbserver1.inventory.customers
            </span>
          </FlowNode>
        </DiagramTooltip>

        <Arrow direction="down" />

        {/* SMT 1: unwrap with IsDataEvent predicate */}
        <DiagramContainer
          title="SMT 1: unwrap"
          color="blue"
          className="inline-block"
        >
          <div className="flex flex-col items-center gap-3">
            <DiagramTooltip
              content={
                <div>
                  <strong>Predicate: IsDataEvent</strong>
                  <p className="mt-1">
                    Проверяет топик по pattern dbserver1\.inventory\..*
                  </p>
                  <p className="mt-2 text-xs text-blue-300">
                    TRUE для customers/orders топиков, FALSE для heartbeat.
                  </p>
                </div>
              }
            >
              <FlowNode variant="connector" size="sm" tabIndex={0}>
                <div>Predicate: IsDataEvent</div>
                <span className="block text-xs text-gray-400 mt-1">
                  pattern: dbserver1.inventory.*
                </span>
              </FlowNode>
            </DiagramTooltip>

            <div className="flex items-center gap-2">
              <div className="text-xs text-emerald-400 font-semibold">TRUE →</div>
              <DiagramTooltip
                content={
                  <div>
                    <strong>ExtractNewRecordState</strong>
                    <p className="mt-1">
                      Разворачивает envelope в flat JSON. Добавляет __op, __table.
                    </p>
                  </div>
                }
              >
                <FlowNode
                  variant="connector"
                  size="sm"
                  className="bg-blue-500/20 border-blue-400/30 text-blue-200"
                  tabIndex={0}
                >
                  ExtractNewRecordState
                </FlowNode>
              </DiagramTooltip>
            </div>
          </div>
        </DiagramContainer>

        <Arrow direction="down" label="flat JSON" />

        {/* SMT 2: mask with IsCustomerTable predicate */}
        <DiagramContainer
          title="SMT 2: mask"
          color="amber"
          className="inline-block"
        >
          <div className="flex flex-col items-center gap-3">
            <DiagramTooltip
              content={
                <div>
                  <strong>Predicate: IsCustomerTable</strong>
                  <p className="mt-1">
                    Проверяет топик по pattern .*customers
                  </p>
                  <p className="mt-2 text-xs text-amber-300">
                    TRUE для customers топика, FALSE для orders топика.
                  </p>
                </div>
              }
            >
              <FlowNode variant="connector" size="sm" tabIndex={0}>
                <div>Predicate: IsCustomerTable</div>
                <span className="block text-xs text-gray-400 mt-1">
                  pattern: .*customers
                </span>
              </FlowNode>
            </DiagramTooltip>

            <div className="flex items-center gap-2">
              <div className="text-xs text-emerald-400 font-semibold">TRUE →</div>
              <DiagramTooltip
                content={
                  <div>
                    <strong>MaskField</strong>
                    <p className="mt-1">
                      Маскирует email и phone поля только в customers топике.
                      Orders топик проходит без маскировки.
                    </p>
                  </div>
                }
              >
                <FlowNode
                  variant="connector"
                  size="sm"
                  className="bg-amber-500/20 border-amber-400/30 text-amber-200"
                  tabIndex={0}
                >
                  MaskField
                </FlowNode>
              </DiagramTooltip>
            </div>
          </div>
        </DiagramContainer>

        <Arrow direction="down" />

        <DiagramTooltip
          content={
            <div>
              <strong>To Kafka</strong>
              <p className="mt-1">
                Customers: flat JSON с замаскированными email/phone.
                <br />
                Orders: flat JSON без маскировки.
                <br />
                Heartbeat: оригинальный envelope.
              </p>
            </div>
          }
        >
          <FlowNode variant="sink" tabIndex={0}>
            <div>To Kafka</div>
            <span className="block text-xs text-gray-400 mt-1">
              Разные форматы по предикатам
            </span>
          </FlowNode>
        </DiagramTooltip>
      </div>
    </DiagramContainer>
  );
}

/**
 * FilterDecisionTreeDiagram - Decision tree for Predicate vs Filter SMT
 */
export function FilterDecisionTreeDiagram() {
  return (
    <DiagramContainer
      title="Decision Tree: Predicate vs Filter SMT"
      color="purple"
      description="Когда использовать предикаты, а когда Filter SMT"
    >
      <div className="flex flex-col items-center gap-4">
        <FlowNode variant="app">
          Нужна фильтрация?
        </FlowNode>

        <Arrow direction="down" />

        <DiagramTooltip
          content={
            <div>
              <strong>Условие зависит от содержимого message?</strong>
              <p className="mt-1">
                Предикаты проверяют metadata (topic, tombstone, headers).
                Filter SMT проверяет value.op, value.after полей.
              </p>
            </div>
          }
        >
          <FlowNode variant="connector" tabIndex={0}>
            Условие зависит от содержимого message?
          </FlowNode>
        </DiagramTooltip>

        <div className="flex gap-8 mt-4">
          {/* NO path - Predicates */}
          <div className="flex flex-col items-center gap-2">
            <div className="text-sm font-semibold text-emerald-400">НЕТ</div>
            <div className="text-xs text-gray-400">(только topic/tombstone/header)</div>
            <Arrow direction="down" />

            <DiagramTooltip
              content={
                <div>
                  <strong>Используйте Predicate</strong>
                  <p className="mt-1">
                    Предикаты проверяют метаданные без доступа к value:
                  </p>
                  <ul className="mt-2 text-xs space-y-1">
                    <li>• TopicNameMatches - по имени топика</li>
                    <li>• RecordIsTombstone - проверка tombstone</li>
                    <li>• HasHeaderKey - наличие header</li>
                  </ul>
                  <p className="mt-2 text-xs text-emerald-300">
                    Overhead минимальный, не требует Groovy.
                  </p>
                </div>
              }
            >
              <FlowNode
                variant="app"
                className="bg-emerald-500/20 border-emerald-400/30 text-emerald-200"
                tabIndex={0}
              >
                <div>Используйте Predicate</div>
                <div className="text-xs text-gray-400 mt-2">Примеры:</div>
                <div className="text-xs text-gray-400">- TopicNameMatches</div>
                <div className="text-xs text-gray-400">- RecordIsTombstone</div>
                <div className="text-xs text-gray-400">- HasHeaderKey</div>
              </FlowNode>
            </DiagramTooltip>
          </div>

          {/* YES path - Filter SMT or Kafka Streams */}
          <div className="flex flex-col items-center gap-2">
            <div className="text-sm font-semibold text-blue-400">ДА</div>
            <div className="text-xs text-gray-400">(нужен доступ к value.after)</div>
            <Arrow direction="down" />

            <DiagramTooltip
              content={
                <div>
                  <strong>Простое условие (1-2 поля)?</strong>
                  <p className="mt-1">
                    Filter SMT хорошо работает для простых условий.
                    Сложная логика должна быть в Kafka Streams.
                  </p>
                </div>
              }
            >
              <FlowNode variant="connector" size="sm" tabIndex={0}>
                Простое условие (1-2 поля)?
              </FlowNode>
            </DiagramTooltip>

            <div className="flex gap-6 mt-3">
              {/* YES - Filter SMT */}
              <div className="flex flex-col items-center gap-2">
                <div className="text-xs font-semibold text-blue-400">ДА</div>
                <Arrow direction="down" />

                <DiagramTooltip
                  content={
                    <div>
                      <strong>Filter SMT + Groovy condition</strong>
                      <p className="mt-1">
                        Используйте Filter SMT с Groovy для простых условий:
                      </p>
                      <ul className="mt-2 text-xs space-y-1">
                        <li>• Фильтрация по op: value.op == 'c' || value.op == 'u'</li>
                        <li>• Фильтрация по полю: value.after.status == 'ACTIVE'</li>
                        <li>• Простые AND/OR условия</li>
                      </ul>
                      <p className="mt-2 text-xs text-blue-300">
                        Overhead 1-2ms на сообщение для простых условий.
                      </p>
                    </div>
                  }
                >
                  <FlowNode
                    variant="connector"
                    className="bg-blue-500/20 border-blue-400/30 text-blue-200"
                    tabIndex={0}
                  >
                    <div>Filter SMT</div>
                    <div className="text-xs text-gray-400 mt-2">+ Groovy condition</div>
                    <div className="text-xs text-gray-400 mt-2">Примеры:</div>
                    <div className="text-xs text-gray-400">- value.op == 'c'</div>
                    <div className="text-xs text-gray-400">- value.after.status == 'ACTIVE'</div>
                  </FlowNode>
                </DiagramTooltip>
              </div>

              {/* NO - Kafka Streams */}
              <div className="flex flex-col items-center gap-2">
                <div className="text-xs font-semibold text-purple-400">НЕТ</div>
                <div className="text-xs text-gray-400">(сложная логика)</div>
                <Arrow direction="down" />

                <DiagramTooltip
                  content={
                    <div>
                      <strong>Kafka Streams или ksqlDB</strong>
                      <p className="mt-1">
                        Сложная логика фильтрации:
                      </p>
                      <ul className="mt-2 text-xs space-y-1">
                        <li>• Множественные AND/OR условия</li>
                        <li>• Regex на полях</li>
                        <li>• Агрегации и joins</li>
                        <li>• Stateful filtering</li>
                      </ul>
                      <p className="mt-2 text-xs text-purple-300">
                        Kafka Streams не блокирует CDC поток.
                      </p>
                    </div>
                  }
                >
                  <FlowNode
                    variant="app"
                    className="bg-purple-500/20 border-purple-400/30 text-purple-200"
                    tabIndex={0}
                  >
                    <div>Kafka Streams</div>
                    <div className="text-xs text-gray-400 mt-2">или ksqlDB</div>
                    <div className="text-xs text-gray-400 mt-2">Для:</div>
                    <div className="text-xs text-gray-400">- Сложная логика</div>
                    <div className="text-xs text-gray-400">- Агрегации</div>
                    <div className="text-xs text-gray-400">- Joins</div>
                  </FlowNode>
                </DiagramTooltip>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DiagramContainer>
  );
}
