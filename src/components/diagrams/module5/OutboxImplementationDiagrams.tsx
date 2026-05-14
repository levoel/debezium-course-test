/** @jsxImportSource solid-js */
/**
 * Outbox Implementation Diagrams
 *
 * Exports:
 * - OutboxEventRouterSmtDiagram: Field mapping from outbox CDC record to Kafka event
 */

import { FlowNode } from '@primitives/FlowNode';
import { Arrow } from '@primitives/Arrow';
import { DiagramContainer } from '@primitives/DiagramContainer';
import { DiagramTooltip } from '@primitives/Tooltip';

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
      <div class="flex flex-col lg:flex-row gap-6 items-center">
        {/* Input: Outbox CDC Record */}
        <DiagramContainer
          title="Input: Outbox CDC Record"
          color="rose"
          className="flex-1 bg-rose-500/10"
        >
          <div class="flex flex-col gap-3">
            <DiagramTooltip
              content={
                <div>
                  <strong>Outbox Record ID</strong>
                  <p class="mt-1">
                    UUID из outbox-таблицы. Используется для deduplication в
                    consumer (at-least-once delivery requires idempotency).
                  </p>
                </div>
              }
            >
              <div class="text-sm font-mono border-l-2 border-rose-400 pl-2" tabindex={0}>
                <span class="text-rose-700">id:</span>
                <span class="text-[var(--ink-default)] ml-2">'550e8400-...'</span>
              </div>
            </DiagramTooltip>

            <DiagramTooltip
              content={
                <div>
                  <strong>Aggregate Type</strong>
                  <p class="mt-1">
                    Тип агрегата (Order, Payment, User). Определяет имя топика
                    в Kafka: outbox.event.{'{aggregatetype}'}.
                  </p>
                  <p class="mt-2 text-rose-700">
                    КРИТИЧНО: Outbox Event Router использует это поле для routing
                  </p>
                </div>
              }
            >
              <div class="text-sm font-mono border-l-2 border-rose-400 pl-2" tabindex={0}>
                <span class="text-rose-700">aggregatetype:</span>
                <span class="text-[var(--ink-default)] ml-2">'Order'</span>
              </div>
            </DiagramTooltip>

            <DiagramTooltip
              content={
                <div>
                  <strong>Aggregate ID</strong>
                  <p class="mt-1">
                    Идентификатор конкретного агрегата (order-123, payment-456).
                    Становится Kafka key для partition affinity.
                  </p>
                  <p class="mt-2 text-rose-700">
                    Гарантия: Все события одного агрегата попадут в одну partition
                  </p>
                </div>
              }
            >
              <div class="text-sm font-mono border-l-2 border-rose-400 pl-2" tabindex={0}>
                <span class="text-rose-700">aggregateid:</span>
                <span class="text-[var(--ink-default)] ml-2">'order-123'</span>
              </div>
            </DiagramTooltip>

            <DiagramTooltip
              content={
                <div>
                  <strong>Event Type</strong>
                  <p class="mt-1">
                    Тип события (OrderApproved, PaymentProcessed). Добавляется в
                    Kafka message headers для фильтрации в consumer.
                  </p>
                </div>
              }
            >
              <div class="text-sm font-mono border-l-2 border-rose-400 pl-2" tabindex={0}>
                <span class="text-rose-700">type:</span>
                <span class="text-[var(--ink-default)] ml-2">'OrderApproved'</span>
              </div>
            </DiagramTooltip>

            <DiagramTooltip
              content={
                <div>
                  <strong>Payload (Domain Data)</strong>
                  <p class="mt-1">
                    JSONB с бизнес-данными события. Становится Kafka message value.
                    Содержит только релевантные поля (не CDC metadata).
                  </p>
                </div>
              }
            >
              <div class="text-sm font-mono border-l-2 border-rose-400 pl-2" tabindex={0}>
                <span class="text-rose-700">payload:</span>
                <div class="text-[var(--ink-default)] ml-2">
                  {'{'}
                  <div class="ml-4">orderId: '123',</div>
                  <div class="ml-4">amount: 299.99,</div>
                  <div class="ml-4">customer: 'Alice'</div>
                  {'}'}
                </div>
              </div>
            </DiagramTooltip>

            <div class="text-xs text-[var(--ink-subtle)] mt-2">
              + CDC metadata (before, after, op, source)
            </div>
          </div>
        </DiagramContainer>

        {/* Arrow with SMT label */}
        <div class="flex flex-col items-center gap-2">
          <Arrow direction="right" className="hidden lg:block" />
          <Arrow direction="down" className="lg:hidden" />
          <DiagramTooltip
            content={
              <div>
                <strong>Outbox Event Router SMT</strong>
                <p class="mt-1">
                  Single Message Transformation, которая извлекает поля из CDC
                  события и формирует clean domain event.
                </p>
                <ul class="mt-2 list-disc list-inside text-sm">
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
              class="text-xs text-purple-700 font-semibold text-center px-3 py-1 border border-purple-400 rounded bg-purple-500/20"
              tabindex={0}
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
          <div class="flex flex-col gap-3">
            <DiagramTooltip
              content={
                <div>
                  <strong>Kafka Topic Name</strong>
                  <p class="mt-1">
                    Формируется из aggregatetype с префиксом outbox.event.
                    Каждый aggregate type получает свой топик.
                  </p>
                  <p class="mt-2 text-emerald-700">
                    Пример: aggregatetype = 'Order' → topic = 'outbox.event.Order'
                  </p>
                </div>
              }
            >
              <div class="text-sm font-mono border-l-2 border-emerald-400 pl-2" tabindex={0}>
                <span class="text-emerald-700">Topic:</span>
                <span class="text-[var(--ink-default)] ml-2">outbox.event.Order</span>
              </div>
            </DiagramTooltip>

            <DiagramTooltip
              content={
                <div>
                  <strong>Kafka Message Key</strong>
                  <p class="mt-1">
                    Берется из aggregateid. Гарантирует, что все события одного
                    агрегата попадут в одну Kafka partition.
                  </p>
                  <p class="mt-2 text-emerald-700">
                    Partition affinity: order-123 всегда в partition N
                  </p>
                </div>
              }
            >
              <div class="text-sm font-mono border-l-2 border-emerald-400 pl-2" tabindex={0}>
                <span class="text-emerald-700">Key:</span>
                <span class="text-[var(--ink-default)] ml-2">'order-123'</span>
              </div>
            </DiagramTooltip>

            <DiagramTooltip
              content={
                <div>
                  <strong>Kafka Message Value</strong>
                  <p class="mt-1">
                    Чистый payload из outbox-таблицы. Никакого CDC metadata,
                    только бизнес-данные.
                  </p>
                  <p class="mt-2 text-emerald-700">
                    Consumer получает clean domain event
                  </p>
                </div>
              }
            >
              <div class="text-sm font-mono border-l-2 border-emerald-400 pl-2" tabindex={0}>
                <span class="text-emerald-700">Value:</span>
                <div class="text-[var(--ink-default)] ml-2">
                  {'{'}
                  <div class="ml-4">orderId: '123',</div>
                  <div class="ml-4">amount: 299.99,</div>
                  <div class="ml-4">customer: 'Alice'</div>
                  {'}'}
                </div>
              </div>
            </DiagramTooltip>

            <DiagramTooltip
              content={
                <div>
                  <strong>Message Headers</strong>
                  <p class="mt-1">
                    Outbox Event Router добавляет headers с метаданными события:
                  </p>
                  <ul class="mt-1 list-disc list-inside text-sm">
                    <li>id: UUID для deduplication</li>
                    <li>type: Event type для фильтрации</li>
                  </ul>
                  <p class="mt-2 text-emerald-700">
                    Consumer может фильтровать по type без десериализации value
                  </p>
                </div>
              }
            >
              <div class="text-sm font-mono border-l-2 border-emerald-400 pl-2" tabindex={0}>
                <span class="text-emerald-700">Headers:</span>
                <div class="text-[var(--ink-default)] ml-2">
                  <div>id: '550e8400-...'</div>
                  <div>type: 'OrderApproved'</div>
                </div>
              </div>
            </DiagramTooltip>
          </div>
        </DiagramContainer>
      </div>

      {/* Mapping Summary */}
      <div class="mt-6 text-sm border-t border-[var(--line-thin)] pt-4">
        <div class="font-semibold text-purple-700 mb-2">
          Mapping Summary:
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <div class="border-l-2 border-purple-400 pl-2">
            <div class="text-xs text-[var(--ink-subtle)]">aggregatetype</div>
            <div class="text-purple-700">→ Topic Name</div>
          </div>
          <div class="border-l-2 border-blue-400 pl-2">
            <div class="text-xs text-[var(--ink-subtle)]">aggregateid</div>
            <div class="text-blue-700">→ Kafka Key</div>
          </div>
          <div class="border-l-2 border-amber-400 pl-2">
            <div class="text-xs text-[var(--ink-subtle)]">type</div>
            <div class="text-amber-700">→ Message Header</div>
          </div>
          <div class="border-l-2 border-emerald-400 pl-2">
            <div class="text-xs text-[var(--ink-subtle)]">payload</div>
            <div class="text-emerald-700">→ Message Value</div>
          </div>
        </div>
      </div>

      {/* Key Benefits */}
      <div class="mt-4 text-sm text-purple-400 border-l-2 border-purple-400 pl-3">
        <strong>Преимущества трансформации:</strong>
        <ul class="mt-1 text-[var(--ink-default)] list-disc list-inside">
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
