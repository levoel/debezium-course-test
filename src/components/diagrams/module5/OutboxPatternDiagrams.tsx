/**
 * Outbox Pattern Diagrams
 *
 * Exports:
 * - DualWriteProblemDiagram: Dual-write antipattern with failure path visualization
 * - OutboxSolutionDiagram: Outbox pattern architecture with 4 subsystems
 * - OutboxTransactionFlowDiagram: Atomic transaction flow from app to Kafka
 * - MicroservicesOutboxDiagram: Multi-service architecture with CDC per service
 */

import { FlowNode } from '../primitives/FlowNode';
import { Arrow } from '../primitives/Arrow';
import { DiagramContainer } from '../primitives/DiagramContainer';
import { DiagramTooltip } from '../primitives/Tooltip';

/**
 * DualWriteProblemDiagram - Shows the dual-write problem with failure scenarios
 */
export function DualWriteProblemDiagram() {
  return (
    <DiagramContainer
      title="Dual-Write Problem: Почему нельзя просто UPDATE + SEND"
      color="rose"
      description="Классический antipattern distributed систем"
    >
      <div className="flex flex-col items-center gap-4">
        <DiagramTooltip
          content={
            <div>
              <strong>Business Operation</strong>
              <p className="mt-1">
                Функция approve_order(123) должна обновить БД и отправить событие
                в Kafka. Два независимых write operations.
              </p>
            </div>
          }
        >
          <FlowNode variant="app" tabIndex={0}>
            approve_order(123)
          </FlowNode>
        </DiagramTooltip>

        <Arrow direction="down" />

        <DiagramTooltip
          content={
            <div>
              <strong>Database Update</strong>
              <p className="mt-1">
                UPDATE orders SET status = 'APPROVED'. Транзакция фиксируется
                в БД с помощью COMMIT.
              </p>
            </div>
          }
        >
          <FlowNode variant="database" tabIndex={0}>
            UPDATE orders
            <span className="block text-xs text-gray-400 mt-1">COMMIT</span>
          </FlowNode>
        </DiagramTooltip>

        <Arrow direction="down" label="Transaction committed" />

        <DiagramTooltip
          content={
            <div>
              <strong>Kafka Send - КРИТИЧЕСКАЯ ТОЧКА ОТКАЗА</strong>
              <p className="mt-1">
                kafka_producer.send(...) может failнуть из-за:
              </p>
              <ul className="mt-1 list-disc list-inside text-sm">
                <li>Network failure между app и Kafka</li>
                <li>Kafka broker unavailable</li>
                <li>Application crash после COMMIT</li>
                <li>Timeout при отправке</li>
              </ul>
              <p className="mt-2 text-amber-300">
                Проблема: БД уже обновлена, откатить нельзя!
              </p>
            </div>
          }
        >
          <FlowNode
            variant="connector"
            className="bg-amber-500/20 border-amber-400/30 text-amber-200"
            tabIndex={0}
          >
            kafka_producer.send(...)
            <span className="block text-xs text-rose-400 mt-1">
              Risk point!
            </span>
          </FlowNode>
        </DiagramTooltip>

        <div className="flex gap-8 mt-2">
          {/* Success path */}
          <div className="flex flex-col items-center gap-2">
            <Arrow direction="down" label="SUCCESS" />
            <DiagramTooltip
              content={
                <div>
                  <strong>Happy Path</strong>
                  <p className="mt-1">
                    Kafka успешно получил событие. БД и Kafka синхронизированы.
                    Consistency OK.
                  </p>
                </div>
              }
            >
              <FlowNode
                variant="app"
                className="bg-emerald-500/20 border-emerald-400/30 text-emerald-200"
                size="sm"
                tabIndex={0}
              >
                <div className="text-center text-xs">
                  <div>✅ БД обновлена</div>
                  <div>✅ Событие отправлено</div>
                  <div className="text-emerald-300 mt-1">Consistency OK</div>
                </div>
              </FlowNode>
            </DiagramTooltip>
          </div>

          {/* Failure path */}
          <div className="flex flex-col items-center gap-2">
            <Arrow direction="down" label="FAILURE" />
            <DiagramTooltip
              content={
                <div>
                  <strong>Failure Scenario - DATA LOSS</strong>
                  <p className="mt-1">
                    Kafka не получил событие, но БД уже обновлена. Откатить
                    транзакцию нельзя - она уже зафиксирована.
                  </p>
                  <p className="mt-2 text-rose-300">
                    Результат: Downstream системы не узнают об изменении.
                    Data inconsistency в distributed системе.
                  </p>
                </div>
              }
            >
              <FlowNode
                variant="app"
                className="bg-rose-500/20 border-rose-400/30 text-rose-200"
                size="sm"
                tabIndex={0}
              >
                <div className="text-center text-xs">
                  <div>✅ БД обновлена</div>
                  <div>❌ Событие НЕ отправлено</div>
                  <div className="text-rose-300 mt-1 font-bold">
                    💥 Data loss!
                  </div>
                </div>
              </FlowNode>
            </DiagramTooltip>
          </div>
        </div>

        <div className="mt-4 text-sm text-rose-400 border-l-2 border-rose-400 pl-3">
          <strong>Почему dual-write не работает:</strong>
          <p className="mt-1 text-gray-300">
            Два независимых write operations (БД и message broker) не могут быть
            атомарными без distributed transactions (2PC). Один может failнуть
            после успеха другого.
          </p>
        </div>
      </div>
    </DiagramContainer>
  );
}

/**
 * OutboxSolutionDiagram - Shows the Outbox Pattern architecture with 4 subsystems
 */
export function OutboxSolutionDiagram() {
  return (
    <DiagramContainer
      title="Outbox Pattern: Решение через CDC"
      color="purple"
      description="Один атомарный write вместо двух независимых"
    >
      <div className="flex flex-col gap-6">
        {/* Application Layer */}
        <DiagramContainer
          title="Application"
          color="purple"
          className="bg-purple-500/10"
        >
          <div className="flex items-center gap-3 justify-center flex-wrap">
            <DiagramTooltip
              content={
                <div>
                  <strong>Business Logic</strong>
                  <p className="mt-1">
                    approve_order(123) начинает транзакцию и выполняет два write
                    operations в одной транзакции.
                  </p>
                </div>
              }
            >
              <FlowNode variant="app" size="sm" tabIndex={0}>
                Business Logic
              </FlowNode>
            </DiagramTooltip>

            <Arrow direction="right" label="BEGIN TX" />

            <DiagramTooltip
              content={
                <div>
                  <strong>UPDATE orders</strong>
                  <p className="mt-1">
                    Обновление основной бизнес-таблицы. Это part of transaction.
                  </p>
                </div>
              }
            >
              <FlowNode variant="database" size="sm" tabIndex={0}>
                UPDATE orders
              </FlowNode>
            </DiagramTooltip>

            <Arrow direction="right" label="+" />

            <DiagramTooltip
              content={
                <div>
                  <strong>INSERT outbox</strong>
                  <p className="mt-1">
                    Вставка события в outbox-таблицу в той же транзакции.
                    Ключевая идея Outbox Pattern.
                  </p>
                </div>
              }
            >
              <FlowNode variant="database" size="sm" tabIndex={0}>
                INSERT outbox
              </FlowNode>
            </DiagramTooltip>

            <Arrow direction="right" label="COMMIT" />

            <DiagramTooltip
              content={
                <div>
                  <strong>Atomic Commit</strong>
                  <p className="mt-1">
                    Оба write зафиксированы атомарно. Либо оба успешны, либо
                    оба откачены. Никакого dual-write!
                  </p>
                </div>
              }
            >
              <FlowNode
                variant="connector"
                size="sm"
                className="bg-emerald-500/20 border-emerald-400/30 text-emerald-200"
                tabIndex={0}
              >
                COMMIT
              </FlowNode>
            </DiagramTooltip>
          </div>
        </DiagramContainer>

        {/* PostgreSQL Layer */}
        <DiagramContainer
          title="PostgreSQL"
          color="blue"
          className="bg-blue-500/10"
        >
          <div className="flex items-center gap-4 justify-center">
            <DiagramTooltip
              content={
                <div>
                  <strong>Orders Table</strong>
                  <p className="mt-1">
                    Основная бизнес-таблица с данными заказов.
                  </p>
                </div>
              }
            >
              <FlowNode variant="database" size="sm" tabIndex={0}>
                orders table
              </FlowNode>
            </DiagramTooltip>

            <DiagramTooltip
              content={
                <div>
                  <strong>Outbox Table</strong>
                  <p className="mt-1">
                    Таблица для transactional outbox. Колонки: id, aggregatetype,
                    aggregateid, type, payload.
                  </p>
                </div>
              }
            >
              <FlowNode variant="database" size="sm" tabIndex={0}>
                outbox table
              </FlowNode>
            </DiagramTooltip>

            <Arrow direction="right" label="Atomic write" />

            <DiagramTooltip
              content={
                <div>
                  <strong>Write-Ahead Log</strong>
                  <p className="mt-1">
                    PostgreSQL WAL содержит оба изменения атомарно. Если COMMIT
                    успешен - оба write зафиксированы в WAL.
                  </p>
                  <p className="mt-2 text-blue-300">
                    WAL - single source of truth для Debezium CDC
                  </p>
                </div>
              }
            >
              <FlowNode
                variant="sink"
                size="sm"
                className="bg-emerald-500/20 border-emerald-400/30 text-emerald-200"
                tabIndex={0}
              >
                WAL
                <span className="block text-xs text-emerald-400 mt-1">
                  Atomic!
                </span>
              </FlowNode>
            </DiagramTooltip>
          </div>
        </DiagramContainer>

        {/* CDC Layer */}
        <DiagramContainer
          title="CDC (Debezium)"
          color="amber"
          className="bg-amber-500/10"
        >
          <div className="flex items-center gap-4 justify-center">
            <DiagramTooltip
              content={
                <div>
                  <strong>Debezium Connector</strong>
                  <p className="mt-1">
                    Читает WAL через replication slot, захватывает изменения
                    outbox-таблицы. Конфигурация: table.include.list = public.outbox
                  </p>
                </div>
              }
            >
              <FlowNode variant="connector" size="sm" tabIndex={0}>
                Debezium
              </FlowNode>
            </DiagramTooltip>

            <Arrow direction="right" label="CDC capture" />

            <DiagramTooltip
              content={
                <div>
                  <strong>Outbox Event Router SMT</strong>
                  <p className="mt-1">
                    Single Message Transformation, которая трансформирует CDC
                    событие из outbox в clean domain event.
                  </p>
                  <ul className="mt-1 list-disc list-inside text-sm">
                    <li>aggregatetype → topic name</li>
                    <li>aggregateid → Kafka key</li>
                    <li>payload → message value</li>
                    <li>type → message header</li>
                  </ul>
                </div>
              }
            >
              <FlowNode
                variant="connector"
                size="sm"
                className="bg-purple-500/20 border-purple-400/30 text-purple-200"
                tabIndex={0}
              >
                Outbox Event Router SMT
              </FlowNode>
            </DiagramTooltip>
          </div>
        </DiagramContainer>

        {/* Kafka Layer */}
        <DiagramContainer
          title="Apache Kafka"
          color="emerald"
          className="bg-emerald-500/10"
        >
          <div className="flex items-center gap-4 justify-center">
            <DiagramTooltip
              content={
                <div>
                  <strong>Domain Event Topic</strong>
                  <p className="mt-1">
                    Kafka топик с clean domain events. Downstream consumers
                    получают события без CDC metadata.
                  </p>
                  <p className="mt-2 text-emerald-300">
                    Topic name: outbox.event.Order (из aggregatetype)
                  </p>
                </div>
              }
            >
              <FlowNode
                variant="app"
                className="bg-emerald-500/20 border-emerald-400/30 text-emerald-200"
                tabIndex={0}
              >
                order-events topic
              </FlowNode>
            </DiagramTooltip>

            <Arrow direction="right" />

            <DiagramTooltip
              content={
                <div>
                  <strong>Downstream Consumers</strong>
                  <p className="mt-1">
                    Microservices подписываются на топик и обрабатывают события.
                    Consumers ДОЛЖНЫ быть idempotent (at-least-once delivery).
                  </p>
                </div>
              }
            >
              <FlowNode variant="app" size="sm" tabIndex={0}>
                Consumers
              </FlowNode>
            </DiagramTooltip>
          </div>
        </DiagramContainer>

        <div className="mt-2 text-sm text-purple-400 border-l-2 border-purple-400 pl-3">
          <strong>Ключевое преимущество:</strong>
          <p className="mt-1 text-gray-300">
            UPDATE + INSERT outbox выполняются в одной транзакции. Если
            транзакция зафиксирована - событие ГАРАНТИРОВАННО попадет в Kafka
            (at-least-once).
          </p>
        </div>
      </div>
    </DiagramContainer>
  );
}

/**
 * OutboxTransactionFlowDiagram - Shows atomic transaction flow
 */
export function OutboxTransactionFlowDiagram() {
  return (
    <DiagramContainer
      title="Outbox Pattern: Транзакционный поток"
      color="emerald"
      description="От application до Kafka с атомарностью"
    >
      <div className="flex flex-col items-center gap-4">
        <DiagramTooltip
          content={
            <div>
              <strong>Application Layer</strong>
              <p className="mt-1">
                Business logic вызывает approve_order(123). Начинается
                транзакция PostgreSQL.
              </p>
            </div>
          }
        >
          <FlowNode variant="app" tabIndex={0}>
            Application
            <span className="block text-xs text-gray-400 mt-1">
              approve_order(123)
            </span>
          </FlowNode>
        </DiagramTooltip>

        <Arrow direction="down" label="BEGIN TRANSACTION" />

        <div className="flex gap-4">
          <DiagramTooltip
            content={
              <div>
                <strong>Business Table Update</strong>
                <p className="mt-1">
                  UPDATE orders SET status = 'APPROVED' WHERE id = 123.
                  Это часть транзакции.
                </p>
              </div>
            }
          >
            <FlowNode variant="database" size="sm" tabIndex={0}>
              UPDATE orders
            </FlowNode>
          </DiagramTooltip>

          <DiagramTooltip
            content={
              <div>
                <strong>Outbox Event Insert</strong>
                <p className="mt-1">
                  INSERT INTO outbox (aggregatetype, aggregateid, type, payload)
                  VALUES ('Order', 'order-123', 'OrderApproved', '&#123;...&#125;').
                </p>
                <p className="mt-2 text-blue-300">
                  В той же транзакции! Ключевая идея Outbox Pattern.
                </p>
              </div>
            }
          >
            <FlowNode variant="database" size="sm" tabIndex={0}>
              INSERT outbox
            </FlowNode>
          </DiagramTooltip>
        </div>

        <Arrow direction="down" label="COMMIT (atomic)" />

        <DiagramTooltip
          content={
            <div>
              <strong>PostgreSQL WAL</strong>
              <p className="mt-1">
                Write-Ahead Log содержит оба изменения атомарно. Если COMMIT
                успешен - оба write зафиксированы. Если ROLLBACK - ни один
                write не зафиксирован.
              </p>
              <p className="mt-2 text-emerald-300">
                Atomic commit гарантия на уровне PostgreSQL
              </p>
            </div>
          }
        >
          <FlowNode
            variant="sink"
            className="bg-emerald-500/20 border-emerald-400/30 text-emerald-200"
            tabIndex={0}
          >
            PostgreSQL WAL
            <span className="block text-xs text-emerald-400 mt-1">
              Atomic commit ✅
            </span>
          </FlowNode>
        </DiagramTooltip>

        <Arrow direction="down" label="CDC capture" />

        <DiagramTooltip
          content={
            <div>
              <strong>Debezium CDC</strong>
              <p className="mt-1">
                Debezium читает WAL через logical replication, захватывает
                изменения outbox-таблицы. Outbox Event Router SMT трансформирует
                CDC событие в domain event.
              </p>
            </div>
          }
        >
          <FlowNode variant="connector" tabIndex={0}>
            Debezium + Outbox SMT
          </FlowNode>
        </DiagramTooltip>

        <Arrow direction="down" label="Publish event" />

        <DiagramTooltip
          content={
            <div>
              <strong>Kafka Topic</strong>
              <p className="mt-1">
                Финальное domain событие публикуется в Kafka. Topic name из
                aggregatetype, Kafka key из aggregateid.
              </p>
              <p className="mt-2 text-emerald-300">
                At-least-once delivery гарантия
              </p>
            </div>
          }
        >
          <FlowNode
            variant="app"
            className="bg-emerald-500/20 border-emerald-400/30 text-emerald-200"
            tabIndex={0}
          >
            Kafka Topic
            <span className="block text-xs text-gray-400 mt-1">
              order-events
            </span>
          </FlowNode>
        </DiagramTooltip>

        <div className="mt-4 text-sm text-gray-400 border-l-2 border-emerald-400 pl-3">
          <strong className="text-emerald-300">Почему атомарность важна?</strong>
          <p className="mt-1">
            Если приложение crashит между UPDATE и INSERT - транзакция откачена,
            оба write отменены. Если crashит после COMMIT - событие в WAL,
            Debezium доставит его в Kafka после restart.
          </p>
        </div>
      </div>
    </DiagramContainer>
  );
}

/**
 * MicroservicesOutboxDiagram - Multi-service architecture with CDC per service
 */
export function MicroservicesOutboxDiagram() {
  return (
    <DiagramContainer
      title="Microservices Architecture с Outbox Pattern"
      color="blue"
      description="Каждый сервис имеет свою outbox-таблицу"
    >
      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Order Service */}
          <DiagramContainer
            title="Order Service"
            color="purple"
            className="bg-purple-500/10"
          >
            <div className="flex flex-col items-center gap-2">
              <DiagramTooltip
                content={
                  <div>
                    <strong>Order Service API</strong>
                    <p className="mt-1">
                      REST API для управления заказами. При approve_order()
                      обновляет orders table и вставляет событие в outbox.
                    </p>
                  </div>
                }
              >
                <FlowNode variant="app" size="sm" tabIndex={0}>
                  REST API
                </FlowNode>
              </DiagramTooltip>

              <Arrow direction="down" />

              <DiagramTooltip
                content={
                  <div>
                    <strong>Order Database</strong>
                    <p className="mt-1">
                      PostgreSQL с таблицами orders и outbox. Каждый сервис
                      владеет своей БД (database-per-service pattern).
                    </p>
                  </div>
                }
              >
                <FlowNode variant="database" size="sm" tabIndex={0}>
                  PostgreSQL
                  <span className="block text-xs text-gray-400 mt-1">
                    orders + outbox
                  </span>
                </FlowNode>
              </DiagramTooltip>
            </div>
          </DiagramContainer>

          {/* Payment Service */}
          <DiagramContainer
            title="Payment Service"
            color="emerald"
            className="bg-emerald-500/10"
          >
            <div className="flex flex-col items-center gap-2">
              <DiagramTooltip
                content={
                  <div>
                    <strong>Payment Service API</strong>
                    <p className="mt-1">
                      REST API для обработки платежей. При process_payment()
                      обновляет payments table и вставляет событие в outbox.
                    </p>
                  </div>
                }
              >
                <FlowNode variant="app" size="sm" tabIndex={0}>
                  REST API
                </FlowNode>
              </DiagramTooltip>

              <Arrow direction="down" />

              <DiagramTooltip
                content={
                  <div>
                    <strong>Payment Database</strong>
                    <p className="mt-1">
                      Отдельная PostgreSQL БД для Payment Service. Независимая
                      от Order Service БД.
                    </p>
                  </div>
                }
              >
                <FlowNode variant="database" size="sm" tabIndex={0}>
                  PostgreSQL
                  <span className="block text-xs text-gray-400 mt-1">
                    payments + outbox
                  </span>
                </FlowNode>
              </DiagramTooltip>
            </div>
          </DiagramContainer>
        </div>

        {/* CDC Infrastructure */}
        <DiagramContainer
          title="CDC Infrastructure"
          color="amber"
          className="bg-amber-500/10"
        >
          <div className="flex items-center gap-4 justify-center flex-wrap">
            <DiagramTooltip
              content={
                <div>
                  <strong>Debezium Connector - Order Service</strong>
                  <p className="mt-1">
                    Отдельный коннектор для Order Service PostgreSQL. Читает
                    только outbox-таблицу Order Service.
                  </p>
                </div>
              }
            >
              <FlowNode
                variant="connector"
                size="sm"
                className="bg-purple-500/20 border-purple-400/30 text-purple-200"
                tabIndex={0}
              >
                Debezium
                <span className="block text-xs text-gray-400 mt-1">
                  Order Service
                </span>
              </FlowNode>
            </DiagramTooltip>

            <DiagramTooltip
              content={
                <div>
                  <strong>Debezium Connector - Payment Service</strong>
                  <p className="mt-1">
                    Отдельный коннектор для Payment Service PostgreSQL. Каждый
                    сервис имеет свой коннектор.
                  </p>
                </div>
              }
            >
              <FlowNode
                variant="connector"
                size="sm"
                className="bg-emerald-500/20 border-emerald-400/30 text-emerald-200"
                tabIndex={0}
              >
                Debezium
                <span className="block text-xs text-gray-400 mt-1">
                  Payment Service
                </span>
              </FlowNode>
            </DiagramTooltip>
          </div>
        </DiagramContainer>

        {/* Kafka Topics */}
        <DiagramContainer
          title="Apache Kafka"
          color="blue"
          className="bg-blue-500/10"
        >
          <div className="flex items-center gap-4 justify-center flex-wrap">
            <DiagramTooltip
              content={
                <div>
                  <strong>Order Events Topic</strong>
                  <p className="mt-1">
                    Топик с событиями Order Service. Topic name из aggregatetype
                    в outbox-таблице.
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
                outbox.event.Order
              </FlowNode>
            </DiagramTooltip>

            <DiagramTooltip
              content={
                <div>
                  <strong>Payment Events Topic</strong>
                  <p className="mt-1">
                    Топик с событиями Payment Service. Отдельный топик для
                    каждого сервиса.
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
                outbox.event.Payment
              </FlowNode>
            </DiagramTooltip>
          </div>
        </DiagramContainer>

        {/* Notification Service */}
        <DiagramContainer
          title="Notification Service (Consumer)"
          color="rose"
          className="bg-rose-500/10"
        >
          <div className="flex flex-col items-center gap-2">
            <DiagramTooltip
              content={
                <div>
                  <strong>Kafka Consumer</strong>
                  <p className="mt-1">
                    Подписывается на оба топика (outbox.event.Order и
                    outbox.event.Payment). При получении события отправляет
                    notification.
                  </p>
                  <p className="mt-2 text-rose-300">
                    КРИТИЧНО: Consumer ДОЛЖЕН быть idempotent (at-least-once delivery)
                  </p>
                </div>
              }
            >
              <FlowNode variant="app" size="sm" tabIndex={0}>
                Kafka Consumer
                <span className="block text-xs text-gray-400 mt-1">
                  Subscribes to both topics
                </span>
              </FlowNode>
            </DiagramTooltip>

            <Arrow direction="down" />

            <DiagramTooltip
              content={
                <div>
                  <strong>Notification Database</strong>
                  <p className="mt-1">
                    PostgreSQL для хранения notifications. Consumer записывает
                    event_id для deduplication.
                  </p>
                </div>
              }
            >
              <FlowNode variant="database" size="sm" tabIndex={0}>
                PostgreSQL
                <span className="block text-xs text-gray-400 mt-1">
                  notifications
                </span>
              </FlowNode>
            </DiagramTooltip>
          </div>
        </DiagramContainer>

        <div className="mt-2 text-sm text-blue-400 border-l-2 border-blue-400 pl-3">
          <strong>Database-per-Service Pattern:</strong>
          <p className="mt-1 text-gray-300">
            Каждый микросервис владеет своей БД и своей outbox-таблицей.
            Debezium коннектор per service публикует события в отдельные топики.
            Downstream сервисы подписываются на нужные топики.
          </p>
        </div>
      </div>
    </DiagramContainer>
  );
}
