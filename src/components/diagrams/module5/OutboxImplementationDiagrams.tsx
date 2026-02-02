/**
 * Outbox Implementation Diagrams
 *
 * Exports:
 * - OutboxEventRouterSmtDiagram: Field mapping from outbox CDC record to Kafka event
 */

import { FlowNode } from '../primitives/FlowNode';
import { Arrow } from '../primitives/Arrow';
import { DiagramContainer } from '../primitives/DiagramContainer';
import { DiagramTooltip } from '../primitives/Tooltip';

/**
 * OutboxEventRouterSmtDiagram - Shows transformation from outbox table to domain event
 */
export function OutboxEventRouterSmtDiagram() {
  return (
    <DiagramContainer
      title="Outbox Event Router SMT: Трансформация полей"
      color="purple"
      description="Как CDC событие превращается в clean domain event"
    >
      <div className="flex flex-col lg:flex-row gap-6 items-center">
        {/* Input: Outbox CDC Record */}
        <DiagramContainer
          title="Input: Outbox CDC Record"
          color="rose"
          className="flex-1 bg-rose-500/10"
        >
          <div className="flex flex-col gap-3">
            <DiagramTooltip
              content={
                <div>
                  <strong>Outbox Record ID</strong>
                  <p className="mt-1">
                    UUID из outbox-таблицы. Используется для deduplication в
                    consumer (at-least-once delivery requires idempotency).
                  </p>
                </div>
              }
            >
              <div className="text-sm font-mono border-l-2 border-rose-400 pl-2" tabIndex={0}>
                <span className="text-rose-300">id:</span>
                <span className="text-gray-300 ml-2">'550e8400-...'</span>
              </div>
            </DiagramTooltip>

            <DiagramTooltip
              content={
                <div>
                  <strong>Aggregate Type</strong>
                  <p className="mt-1">
                    Тип агрегата (Order, Payment, User). Определяет имя топика
                    в Kafka: outbox.event.{'{aggregatetype}'}.
                  </p>
                  <p className="mt-2 text-rose-300">
                    КРИТИЧНО: Outbox Event Router использует это поле для routing
                  </p>
                </div>
              }
            >
              <div className="text-sm font-mono border-l-2 border-rose-400 pl-2" tabIndex={0}>
                <span className="text-rose-300">aggregatetype:</span>
                <span className="text-gray-300 ml-2">'Order'</span>
              </div>
            </DiagramTooltip>

            <DiagramTooltip
              content={
                <div>
                  <strong>Aggregate ID</strong>
                  <p className="mt-1">
                    Идентификатор конкретного агрегата (order-123, payment-456).
                    Становится Kafka key для partition affinity.
                  </p>
                  <p className="mt-2 text-rose-300">
                    Гарантия: Все события одного агрегата попадут в одну partition
                  </p>
                </div>
              }
            >
              <div className="text-sm font-mono border-l-2 border-rose-400 pl-2" tabIndex={0}>
                <span className="text-rose-300">aggregateid:</span>
                <span className="text-gray-300 ml-2">'order-123'</span>
              </div>
            </DiagramTooltip>

            <DiagramTooltip
              content={
                <div>
                  <strong>Event Type</strong>
                  <p className="mt-1">
                    Тип события (OrderApproved, PaymentProcessed). Добавляется в
                    Kafka message headers для фильтрации в consumer.
                  </p>
                </div>
              }
            >
              <div className="text-sm font-mono border-l-2 border-rose-400 pl-2" tabIndex={0}>
                <span className="text-rose-300">type:</span>
                <span className="text-gray-300 ml-2">'OrderApproved'</span>
              </div>
            </DiagramTooltip>

            <DiagramTooltip
              content={
                <div>
                  <strong>Payload (Domain Data)</strong>
                  <p className="mt-1">
                    JSONB с бизнес-данными события. Становится Kafka message value.
                    Содержит только релевантные поля (не CDC metadata).
                  </p>
                </div>
              }
            >
              <div className="text-sm font-mono border-l-2 border-rose-400 pl-2" tabIndex={0}>
                <span className="text-rose-300">payload:</span>
                <div className="text-gray-300 ml-2">
                  {'{'}
                  <div className="ml-4">orderId: '123',</div>
                  <div className="ml-4">amount: 299.99,</div>
                  <div className="ml-4">customer: 'Alice'</div>
                  {'}'}
                </div>
              </div>
            </DiagramTooltip>

            <div className="text-xs text-gray-500 mt-2">
              + CDC metadata (before, after, op, source)
            </div>
          </div>
        </DiagramContainer>

        {/* Arrow with SMT label */}
        <div className="flex flex-col items-center gap-2">
          <Arrow direction="right" className="hidden lg:block" />
          <Arrow direction="down" className="lg:hidden" />
          <DiagramTooltip
            content={
              <div>
                <strong>Outbox Event Router SMT</strong>
                <p className="mt-1">
                  Single Message Transformation, которая извлекает поля из CDC
                  события и формирует clean domain event.
                </p>
                <ul className="mt-2 list-disc list-inside text-sm">
                  <li>aggregatetype → topic name</li>
                  <li>aggregateid → Kafka key</li>
                  <li>type → message header</li>
                  <li>payload → message value</li>
                  <li>id → header (для deduplication)</li>
                </ul>
              </div>
            }
          >
            <div
              className="text-xs text-purple-300 font-semibold text-center px-3 py-1 border border-purple-400 rounded bg-purple-500/20"
              tabIndex={0}
            >
              Outbox Event
              <br />
              Router SMT
            </div>
          </DiagramTooltip>
        </div>

        {/* Output: Kafka Event */}
        <DiagramContainer
          title="Output: Kafka Domain Event"
          color="emerald"
          className="flex-1 bg-emerald-500/10"
        >
          <div className="flex flex-col gap-3">
            <DiagramTooltip
              content={
                <div>
                  <strong>Kafka Topic Name</strong>
                  <p className="mt-1">
                    Формируется из aggregatetype с префиксом outbox.event.
                    Каждый aggregate type получает свой топик.
                  </p>
                  <p className="mt-2 text-emerald-300">
                    Пример: aggregatetype = 'Order' → topic = 'outbox.event.Order'
                  </p>
                </div>
              }
            >
              <div className="text-sm font-mono border-l-2 border-emerald-400 pl-2" tabIndex={0}>
                <span className="text-emerald-300">Topic:</span>
                <span className="text-gray-300 ml-2">outbox.event.Order</span>
              </div>
            </DiagramTooltip>

            <DiagramTooltip
              content={
                <div>
                  <strong>Kafka Message Key</strong>
                  <p className="mt-1">
                    Берется из aggregateid. Гарантирует, что все события одного
                    агрегата попадут в одну Kafka partition.
                  </p>
                  <p className="mt-2 text-emerald-300">
                    Partition affinity: order-123 всегда в partition N
                  </p>
                </div>
              }
            >
              <div className="text-sm font-mono border-l-2 border-emerald-400 pl-2" tabIndex={0}>
                <span className="text-emerald-300">Key:</span>
                <span className="text-gray-300 ml-2">'order-123'</span>
              </div>
            </DiagramTooltip>

            <DiagramTooltip
              content={
                <div>
                  <strong>Kafka Message Value</strong>
                  <p className="mt-1">
                    Чистый payload из outbox-таблицы. Никакого CDC metadata,
                    только бизнес-данные.
                  </p>
                  <p className="mt-2 text-emerald-300">
                    Consumer получает clean domain event
                  </p>
                </div>
              }
            >
              <div className="text-sm font-mono border-l-2 border-emerald-400 pl-2" tabIndex={0}>
                <span className="text-emerald-300">Value:</span>
                <div className="text-gray-300 ml-2">
                  {'{'}
                  <div className="ml-4">orderId: '123',</div>
                  <div className="ml-4">amount: 299.99,</div>
                  <div className="ml-4">customer: 'Alice'</div>
                  {'}'}
                </div>
              </div>
            </DiagramTooltip>

            <DiagramTooltip
              content={
                <div>
                  <strong>Message Headers</strong>
                  <p className="mt-1">
                    Outbox Event Router добавляет headers с метаданными события:
                  </p>
                  <ul className="mt-1 list-disc list-inside text-sm">
                    <li>id: UUID для deduplication</li>
                    <li>type: Event type для фильтрации</li>
                  </ul>
                  <p className="mt-2 text-emerald-300">
                    Consumer может фильтровать по type без десериализации value
                  </p>
                </div>
              }
            >
              <div className="text-sm font-mono border-l-2 border-emerald-400 pl-2" tabIndex={0}>
                <span className="text-emerald-300">Headers:</span>
                <div className="text-gray-300 ml-2">
                  <div>id: '550e8400-...'</div>
                  <div>type: 'OrderApproved'</div>
                </div>
              </div>
            </DiagramTooltip>
          </div>
        </DiagramContainer>
      </div>

      {/* Mapping Summary */}
      <div className="mt-6 text-sm border-t border-gray-700 pt-4">
        <div className="font-semibold text-purple-300 mb-2">
          Mapping Summary:
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="border-l-2 border-purple-400 pl-2">
            <div className="text-xs text-gray-500">aggregatetype</div>
            <div className="text-purple-300">→ Topic Name</div>
          </div>
          <div className="border-l-2 border-blue-400 pl-2">
            <div className="text-xs text-gray-500">aggregateid</div>
            <div className="text-blue-300">→ Kafka Key</div>
          </div>
          <div className="border-l-2 border-amber-400 pl-2">
            <div className="text-xs text-gray-500">type</div>
            <div className="text-amber-300">→ Message Header</div>
          </div>
          <div className="border-l-2 border-emerald-400 pl-2">
            <div className="text-xs text-gray-500">payload</div>
            <div className="text-emerald-300">→ Message Value</div>
          </div>
        </div>
      </div>

      {/* Key Benefits */}
      <div className="mt-4 text-sm text-purple-400 border-l-2 border-purple-400 pl-3">
        <strong>Преимущества трансформации:</strong>
        <ul className="mt-1 text-gray-300 list-disc list-inside">
          <li>
            <strong>Clean events:</strong> Consumer получает domain события без
            CDC metadata
          </li>
          <li>
            <strong>Partition affinity:</strong> aggregateid как key гарантирует
            ordering per aggregate
          </li>
          <li>
            <strong>Type-based filtering:</strong> Consumer может фильтровать по
            headers['type']
          </li>
          <li>
            <strong>Deduplication:</strong> headers['id'] позволяет consumer
            реализовать idempotency
          </li>
        </ul>
      </div>
    </DiagramContainer>
  );
}
