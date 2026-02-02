/**
 * SMT Overview Diagrams
 *
 * Exports:
 * - ConsumerComplexityDiagram: Shows complexity without SMT (consumers duplicate logic)
 * - SmtSolutionDiagram: Centralized transformation with SMT chain
 * - SmtExecutionModelDiagram: SMT execution inside Kafka Connect Worker
 * - SmtChainOrderDiagram: Standard SMT chain order with color-coded types
 * - SmtDecisionFrameworkDiagram: Decision tree for SMT vs Kafka Streams
 */

import { FlowNode } from '../primitives/FlowNode';
import { Arrow } from '../primitives/Arrow';
import { DiagramContainer } from '../primitives/DiagramContainer';
import { DiagramTooltip } from '../primitives/Tooltip';

/**
 * ConsumerComplexityDiagram - Problem: complexity on consumer side
 */
export function ConsumerComplexityDiagram() {
  return (
    <DiagramContainer
      title="Проблема: Сложность на стороне консьюмеров"
      color="amber"
      description="Каждый консьюмер дублирует логику парсинга envelope"
    >
      <div className="flex items-center justify-center gap-3 flex-wrap">
        <DiagramTooltip
          content={
            <div>
              <strong>PostgreSQL</strong>
              <p className="mt-1">
                Источник CDC событий. Генерирует изменения данных через WAL.
              </p>
            </div>
          }
        >
          <FlowNode variant="database" tabIndex={0}>
            PostgreSQL
          </FlowNode>
        </DiagramTooltip>

        <Arrow direction="right" />

        <DiagramTooltip
          content={
            <div>
              <strong>Debezium Connector</strong>
              <p className="mt-1">
                Читает WAL и конвертирует в Debezium envelope формат
                с полями before, after, op, source, ts_ms.
              </p>
            </div>
          }
        >
          <FlowNode variant="connector" tabIndex={0}>
            Debezium
          </FlowNode>
        </DiagramTooltip>

        <Arrow direction="right" label="Envelope format" />

        <DiagramTooltip
          content={
            <div>
              <strong>Kafka Topic</strong>
              <p className="mt-1">
                Хранит события в Debezium envelope формате.
                Сложный формат с before, after, op, source.
              </p>
            </div>
          }
        >
          <FlowNode variant="app" tabIndex={0}>
            Kafka Topic
          </FlowNode>
        </DiagramTooltip>

        <Arrow direction="right" />

        <div className="flex flex-col gap-2">
          <DiagramTooltip
            content={
              <div>
                <strong>Consumer 1</strong>
                <p className="mt-1">
                  Должен сам парсить envelope, извлекать after field,
                  обрабатывать разные типы операций (c/u/d).
                  Дублирование логики обработки.
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
              Consumer 1
              <span className="block text-xs text-gray-400 mt-1">
                Extract after field
              </span>
            </FlowNode>
          </DiagramTooltip>

          <DiagramTooltip
            content={
              <div>
                <strong>Consumer 2</strong>
                <p className="mt-1">
                  Дублирует ту же логику парсинга.
                  Изменение формата требует обновления всех консьюмеров.
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
              Consumer 2
              <span className="block text-xs text-gray-400 mt-1">
                Extract after field
              </span>
            </FlowNode>
          </DiagramTooltip>

          <DiagramTooltip
            content={
              <div>
                <strong>Consumer 3</strong>
                <p className="mt-1">
                  Еще один консьюмер с дублированной логикой.
                  Scaling означает больше дублирования кода.
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
              Consumer 3
              <span className="block text-xs text-gray-400 mt-1">
                Extract after field
              </span>
            </FlowNode>
          </DiagramTooltip>
        </div>
      </div>
    </DiagramContainer>
  );
}

/**
 * SmtSolutionDiagram - Solution: centralized transformation with SMT
 */
export function SmtSolutionDiagram() {
  return (
    <DiagramContainer
      title="Решение: Трансформации на уровне Kafka Connect"
      color="purple"
      recommended
      description="SMT централизует логику обработки"
    >
      <div className="flex items-center justify-center gap-3 flex-wrap">
        <DiagramTooltip
          content={
            <div>
              <strong>PostgreSQL</strong>
              <p className="mt-1">
                Источник CDC событий.
              </p>
            </div>
          }
        >
          <FlowNode variant="database" tabIndex={0}>
            PostgreSQL
          </FlowNode>
        </DiagramTooltip>

        <Arrow direction="right" />

        <DiagramTooltip
          content={
            <div>
              <strong>Debezium Connector</strong>
              <p className="mt-1">
                Читает WAL и передает события в SMT chain для обработки.
              </p>
            </div>
          }
        >
          <FlowNode variant="connector" tabIndex={0}>
            Debezium
          </FlowNode>
        </DiagramTooltip>

        <Arrow direction="right" label="Envelope" />

        <DiagramTooltip
          content={
            <div>
              <strong>SMT Chain</strong>
              <p className="mt-1">
                Трансформации выполняются централизованно до публикации в Kafka:
                <br />1. Filter - отбрасывает ненужные события
                <br />2. Unwrap - разворачивает envelope в flat JSON
                <br />3. Mask - маскирует PII поля
              </p>
              <p className="mt-2 text-xs text-purple-300">
                Централизованная логика обработки — изменение в одном месте.
              </p>
            </div>
          }
        >
          <FlowNode
            variant="connector"
            className="bg-purple-500/20 border-purple-400/30 text-purple-200"
            tabIndex={0}
          >
            <div>SMT Chain</div>
            <div className="text-xs text-gray-400 mt-1">1. Filter</div>
            <div className="text-xs text-gray-400">2. Unwrap</div>
            <div className="text-xs text-gray-400">3. Mask</div>
          </FlowNode>
        </DiagramTooltip>

        <Arrow direction="right" label="Flat JSON" />

        <DiagramTooltip
          content={
            <div>
              <strong>Kafka Topic</strong>
              <p className="mt-1">
                Хранит уже обработанные события в простом формате.
                Flat JSON с замаскированными PII полями.
              </p>
            </div>
          }
        >
          <FlowNode variant="app" tabIndex={0}>
            Kafka Topic
          </FlowNode>
        </DiagramTooltip>

        <Arrow direction="right" />

        <div className="flex flex-col gap-2">
          <DiagramTooltip
            content={
              <div>
                <strong>Consumer 1</strong>
                <p className="mt-1">
                  Получает готовый flat JSON. Не нужно парсить envelope.
                  Простой парсинг стандартного JSON.
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
              Consumer 1
              <span className="block text-xs text-gray-400 mt-1">
                Simple parsing
              </span>
            </FlowNode>
          </DiagramTooltip>

          <DiagramTooltip
            content={
              <div>
                <strong>Consumer 2</strong>
                <p className="mt-1">
                  Также получает готовый формат. Минимальная логика обработки.
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
              Consumer 2
              <span className="block text-xs text-gray-400 mt-1">
                Simple parsing
              </span>
            </FlowNode>
          </DiagramTooltip>

          <DiagramTooltip
            content={
              <div>
                <strong>Consumer 3</strong>
                <p className="mt-1">
                  Еще один консьюмер с простой логикой. Scaling проще.
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
              Consumer 3
              <span className="block text-xs text-gray-400 mt-1">
                Simple parsing
              </span>
            </FlowNode>
          </DiagramTooltip>
        </div>
      </div>
    </DiagramContainer>
  );
}

/**
 * SmtExecutionModelDiagram - SMT execution inside Kafka Connect Worker
 */
export function SmtExecutionModelDiagram() {
  return (
    <DiagramContainer
      title="Execution Model: SMT внутри Kafka Connect"
      color="blue"
      description="SMT выполняется синхронно в том же потоке"
    >
      <div className="flex flex-col items-center gap-4">
        {/* Kafka Connect Worker container */}
        <DiagramContainer
          title="Kafka Connect Worker"
          color="gray"
        >
        <div className="flex flex-col items-center gap-3">
          <DiagramTooltip
            content={
              <div>
                <strong>Source Connector (Debezium)</strong>
                <p className="mt-1">
                  Читает WAL и создает SourceRecord с Debezium envelope.
                  Передает record в SMT chain.
                </p>
              </div>
            }
          >
            <FlowNode variant="connector" tabIndex={0}>
              Source Connector
              <span className="block text-xs text-gray-400 mt-1">
                (Debezium)
              </span>
            </FlowNode>
          </DiagramTooltip>

          <Arrow direction="down" label="SourceRecord" />

          <DiagramTooltip
            content={
              <div>
                <strong>SMT 1: Filter</strong>
                <p className="mt-1">
                  Отбрасывает события по условию (Groovy).
                  Работает с envelope — имеет доступ к value.op, value.after.
                </p>
              </div>
            }
          >
            <FlowNode
              variant="connector"
              className="bg-blue-500/20 border-blue-400/30 text-blue-200"
              tabIndex={0}
            >
              SMT 1: Filter
            </FlowNode>
          </DiagramTooltip>

          <Arrow direction="down" label="Filtered record" />

          <DiagramTooltip
            content={
              <div>
                <strong>SMT 2: ExtractNewRecordState</strong>
                <p className="mt-1">
                  Разворачивает Debezium envelope, извлекая поле after.
                  Добавляет metadata как __op, __table.
                </p>
              </div>
            }
          >
            <FlowNode
              variant="connector"
              className="bg-blue-500/20 border-blue-400/30 text-blue-200"
              tabIndex={0}
            >
              SMT 2: ExtractNewRecordState
            </FlowNode>
          </DiagramTooltip>

          <Arrow direction="down" label="Flattened record" />

          <DiagramTooltip
            content={
              <div>
                <strong>SMT 3: MaskField</strong>
                <p className="mt-1">
                  Заменяет чувствительные поля (email, ssn) на null или ***MASKED***.
                  Работает с flat data после unwrap.
                </p>
              </div>
            }
          >
            <FlowNode
              variant="connector"
              className="bg-blue-500/20 border-blue-400/30 text-blue-200"
              tabIndex={0}
            >
              SMT 3: MaskField
            </FlowNode>
          </DiagramTooltip>

          <Arrow direction="down" label="Masked record" />

          <DiagramTooltip
            content={
              <div>
                <strong>Kafka Producer</strong>
                <p className="mt-1">
                  Конвертирует record в ProducerRecord и публикует в Kafka broker.
                  Синхронная операция в том же потоке.
                </p>
              </div>
            }
          >
            <FlowNode variant="sink" tabIndex={0}>
              Kafka Producer
            </FlowNode>
          </DiagramTooltip>
        </div>
        </DiagramContainer>

        <div className="flex flex-col items-center gap-2">
          <Arrow direction="down" />

          <DiagramTooltip
            content={
              <div>
                <strong>Kafka Broker</strong>
                <p className="mt-1">
                  Принимает ProducerRecord и сохраняет в топик.
                  События уже обработаны всеми SMT.
                </p>
              </div>
            }
          >
            <FlowNode variant="app" tabIndex={0}>
              Kafka Broker
            </FlowNode>
          </DiagramTooltip>
        </div>
      </div>
    </DiagramContainer>
  );
}

/**
 * SmtChainOrderDiagram - Standard SMT chain order with color coding
 */
export function SmtChainOrderDiagram() {
  return (
    <DiagramContainer
      title="Стандартный порядок SMT Chain"
      color="purple"
      description="Порядок SMT имеет значение — каждый получает output предыдущего"
    >
      <div className="flex items-center justify-center gap-3 flex-wrap">
        <DiagramTooltip
          content={
            <div>
              <strong>1. Filter SMT</strong>
              <p className="mt-1">
                Отбрасывает события по условию (Groovy). Работает с Debezium envelope —
                имеет доступ к value.op, value.after. Применяется раньше всего
                для уменьшения объема данных.
              </p>
              <p className="mt-2 text-xs text-rose-300">
                Цвет: rose (фильтрация на входе)
              </p>
            </div>
          }
        >
          <FlowNode
            variant="connector"
            className="bg-rose-500/20 border-rose-400/30 text-rose-200"
            tabIndex={0}
          >
            <div>1. Filter</div>
            <span className="block text-xs text-gray-400 mt-1">
              Работает с envelope
            </span>
          </FlowNode>
        </DiagramTooltip>

        <Arrow direction="right" label="отфильтрованные события" />

        <DiagramTooltip
          content={
            <div>
              <strong>2. ExtractNewRecordState (Unwrap)</strong>
              <p className="mt-1">
                Разворачивает Debezium envelope, извлекая поле after.
                Добавляет metadata как __op, __table. После этого
                SMT downstream работают с flat JSON.
              </p>
              <p className="mt-2 text-xs text-blue-300">
                Цвет: blue (разворачивание структуры)
              </p>
            </div>
          }
        >
          <FlowNode
            variant="connector"
            className="bg-blue-500/20 border-blue-400/30 text-blue-200"
            tabIndex={0}
          >
            <div>2. Unwrap</div>
            <span className="block text-xs text-gray-400 mt-1">
              Flatten payload
            </span>
          </FlowNode>
        </DiagramTooltip>

        <Arrow direction="right" label="flat JSON" />

        <DiagramTooltip
          content={
            <div>
              <strong>3. Route (ByLogicalTableRouter)</strong>
              <p className="mt-1">
                ByLogicalTableRouter или ContentBasedRouter изменяет имя топика
                по regex или значению поля. Работает с flat data после unwrap.
              </p>
              <p className="mt-2 text-xs text-purple-300">
                Цвет: purple (маршрутизация)
              </p>
            </div>
          }
        >
          <FlowNode
            variant="connector"
            className="bg-purple-500/20 border-purple-400/30 text-purple-200"
            tabIndex={0}
          >
            <div>3. Route</div>
            <span className="block text-xs text-gray-400 mt-1">
              Работает с flat data
            </span>
          </FlowNode>
        </DiagramTooltip>

        <Arrow direction="right" label="переименованный топик" />

        <DiagramTooltip
          content={
            <div>
              <strong>4. MaskField</strong>
              <p className="mt-1">
                Заменяет чувствительные поля (email, ssn) на ***MASKED***
                для GDPR compliance. Применяется в конце pipeline.
              </p>
              <p className="mt-2 text-xs text-amber-300">
                Цвет: amber (маскировка данных)
              </p>
            </div>
          }
        >
          <FlowNode
            variant="connector"
            className="bg-amber-500/20 border-amber-400/30 text-amber-200"
            tabIndex={0}
          >
            <div>4. Mask</div>
            <span className="block text-xs text-gray-400 mt-1">
              Работает с flat data
            </span>
          </FlowNode>
        </DiagramTooltip>
      </div>
    </DiagramContainer>
  );
}

/**
 * SmtDecisionFrameworkDiagram - Decision tree for choosing SMT vs Kafka Streams
 */
export function SmtDecisionFrameworkDiagram() {
  return (
    <DiagramContainer
      title="Decision Framework: SMT vs Kafka Streams"
      color="purple"
      description="Когда использовать SMT, а когда Kafka Streams"
    >
      <div className="flex flex-col items-center gap-4">
        <FlowNode variant="app">
          Нужна трансформация?
        </FlowNode>

        <Arrow direction="down" />

        <div className="flex flex-col items-center gap-3">
          <DiagramTooltip
            content={
              <div>
                <strong>Работает с одним сообщением?</strong>
                <p className="mt-1">
                  SMT обрабатывает каждое сообщение независимо.
                  Если нужен join или агрегация — SMT не подходит.
                </p>
              </div>
            }
          >
            <FlowNode variant="connector" tabIndex={0}>
              Работает с одним сообщением?
            </FlowNode>
          </DiagramTooltip>

          <div className="flex gap-8">
            {/* YES path - continue checking */}
            <div className="flex flex-col items-center gap-2">
              <div className="text-sm font-semibold text-emerald-400">ДА</div>
              <Arrow direction="down" />

              <DiagramTooltip
                content={
                  <div>
                    <strong>Требует состояния?</strong>
                    <p className="mt-1">
                      SMT stateless. Если нужен счетчик или хранение данных между сообщениями — используйте Kafka Streams.
                    </p>
                  </div>
                }
              >
                <FlowNode variant="connector" size="sm" tabIndex={0}>
                  Требует состояния?
                </FlowNode>
              </DiagramTooltip>

              <div className="flex gap-6">
                {/* NO path - continue */}
                <div className="flex flex-col items-center gap-2">
                  <div className="text-xs font-semibold text-emerald-400">НЕТ</div>
                  <Arrow direction="down" />

                  <DiagramTooltip
                    content={
                      <div>
                        <strong>Требует external call?</strong>
                        <p className="mt-1">
                          SMT синхронные. External call блокирует поток — throughput падает. Используйте Kafka Streams с async lookup.
                        </p>
                      </div>
                    }
                  >
                    <FlowNode variant="connector" size="sm" tabIndex={0}>
                      Требует external call?
                    </FlowNode>
                  </DiagramTooltip>

                  <div className="flex gap-4">
                    {/* NO path - final check */}
                    <div className="flex flex-col items-center gap-2">
                      <div className="text-xs font-semibold text-emerald-400">НЕТ</div>
                      <Arrow direction="down" />

                      <DiagramTooltip
                        content={
                          <div>
                            <strong>Overhead менее 10ms?</strong>
                            <p className="mt-1">
                              SMT выполняются синхронно. Если обработка занимает более 10ms на сообщение — lag вырастет. Используйте Kafka Streams.
                            </p>
                          </div>
                        }
                      >
                        <FlowNode variant="connector" size="sm" tabIndex={0}>
                          Overhead менее 10ms?
                        </FlowNode>
                      </DiagramTooltip>

                      <div className="flex gap-4">
                        <div className="flex flex-col items-center gap-2">
                          <div className="text-xs font-semibold text-emerald-400">ДА</div>
                          <Arrow direction="down" />
                          <DiagramTooltip
                            content={
                              <div>
                                <strong>SMT подходит</strong>
                                <p className="mt-1">
                                  Трансформация простая, быстрая, stateless, без external calls.
                                  Используйте SMT для inline обработки.
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
                              SMT подходит
                            </FlowNode>
                          </DiagramTooltip>
                        </div>

                        <div className="flex flex-col items-center gap-2">
                          <div className="text-xs font-semibold text-purple-400">НЕТ</div>
                          <Arrow direction="down" />
                          <DiagramTooltip
                            content={
                              <div>
                                <strong>Kafka Streams</strong>
                                <p className="mt-1">
                                  Overhead более 10ms — используйте Kafka Streams для асинхронной обработки без блокировки CDC потока.
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
                              Kafka Streams
                            </FlowNode>
                          </DiagramTooltip>
                        </div>
                      </div>
                    </div>

                    {/* YES path - external call */}
                    <div className="flex flex-col items-center gap-2">
                      <div className="text-xs font-semibold text-purple-400">ДА</div>
                      <Arrow direction="down" />
                      <DiagramTooltip
                        content={
                          <div>
                            <strong>Kafka Streams</strong>
                            <p className="mt-1">
                              External service calls блокируют SMT. Используйте Kafka Streams с async lookup или downstream service.
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
                          Kafka Streams
                        </FlowNode>
                      </DiagramTooltip>
                    </div>
                  </div>
                </div>

                {/* YES path - requires state */}
                <div className="flex flex-col items-center gap-2">
                  <div className="text-xs font-semibold text-purple-400">ДА</div>
                  <Arrow direction="down" />
                  <DiagramTooltip
                    content={
                      <div>
                        <strong>Kafka Streams</strong>
                        <p className="mt-1">
                          Требуется состояние между сообщениями. Используйте Kafka Streams с KTable или state store.
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
                      Kafka Streams
                    </FlowNode>
                  </DiagramTooltip>
                </div>
              </div>
            </div>

            {/* NO path - single message */}
            <div className="flex flex-col items-center gap-2">
              <div className="text-sm font-semibold text-purple-400">НЕТ</div>
              <Arrow direction="down" />
              <DiagramTooltip
                content={
                  <div>
                    <strong>Kafka Streams</strong>
                    <p className="mt-1">
                      Требуется обработка нескольких сообщений (join, агрегация). Используйте Kafka Streams или ksqlDB.
                    </p>
                  </div>
                }
              >
                <FlowNode
                  variant="app"
                  className="bg-purple-500/20 border-purple-400/30 text-purple-200"
                  tabIndex={0}
                >
                  Kafka Streams
                </FlowNode>
              </DiagramTooltip>
            </div>
          </div>
        </div>
      </div>
    </DiagramContainer>
  );
}
