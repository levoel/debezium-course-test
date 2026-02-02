/**
 * Advanced Consumer Diagrams
 *
 * Exports:
 * - AtLeastOnceVsExactlyOnceDiagram: Side-by-side comparison of delivery semantics
 * - RebalancingSequenceDiagram: Consumer rebalancing flow when max.poll.interval.ms exceeded
 */

import { FlowNode } from '../primitives/FlowNode';
import { Arrow } from '../primitives/Arrow';
import { DiagramContainer } from '../primitives/DiagramContainer';
import { DiagramTooltip } from '../primitives/Tooltip';
import { SequenceDiagram } from '../primitives/SequenceDiagram';

/**
 * AtLeastOnceVsExactlyOnceDiagram - Side-by-side comparison of delivery semantics
 */
export function AtLeastOnceVsExactlyOnceDiagram() {
  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* At-Least-Once flow */}
      <DiagramContainer
        title="At-Least-Once"
        color="amber"
        className="flex-1"
        description="Commit offset после обработки"
      >
        <div className="flex flex-col items-center gap-3">
          <DiagramTooltip
            content={
              <div>
                <strong>Получить сообщение</strong>
                <p className="mt-1">
                  Consumer вызывает poll() и получает сообщение из Kafka.
                </p>
              </div>
            }
          >
            <FlowNode variant="app" size="sm" tabIndex={0}>
              Получить сообщение
            </FlowNode>
          </DiagramTooltip>

          <Arrow direction="down" />

          <DiagramTooltip
            content={
              <div>
                <strong>Обработать</strong>
                <p className="mt-1">
                  Приложение обрабатывает сообщение (запись в БД, вызов API, трансформация).
                </p>
              </div>
            }
          >
            <FlowNode variant="app" size="sm" tabIndex={0}>
              Обработать
            </FlowNode>
          </DiagramTooltip>

          <Arrow direction="down" />

          <DiagramTooltip
            content={
              <div>
                <strong>Commit offset</strong>
                <p className="mt-1">
                  После успешной обработки сохраняется offset через store_offsets().
                  Автоматический commit происходит в фоне.
                </p>
              </div>
            }
          >
            <FlowNode variant="app" size="sm" tabIndex={0}>
              Commit offset
            </FlowNode>
          </DiagramTooltip>

          <Arrow direction="down" />

          <DiagramTooltip
            content={
              <div>
                <strong>Точка сбоя</strong>
                <p className="mt-1">
                  Если crash происходит до commit offset, сообщение будет обработано повторно.
                  Если crash после commit, сообщение не будет потеряно.
                </p>
              </div>
            }
          >
            <FlowNode variant="app" size="sm" tabIndex={0}>
              Crash?
            </FlowNode>
          </DiagramTooltip>

          <div className="flex gap-6 mt-2">
            <div className="flex flex-col items-center gap-2">
              <div className="text-xs font-semibold text-rose-400">До commit</div>
              <Arrow direction="down" />
              <DiagramTooltip
                content={
                  <div>
                    <strong>Повторная обработка</strong>
                    <p className="mt-1">
                      При перезапуске consumer повторит обработку сообщения с последнего
                      сохраненного offset. Требуется идемпотентная обработка на стороне приложения.
                    </p>
                  </div>
                }
              >
                <FlowNode
                  variant="app"
                  size="sm"
                  className="bg-rose-500/20 border-rose-400/30 text-rose-200"
                  tabIndex={0}
                >
                  Повторная обработка
                </FlowNode>
              </DiagramTooltip>
            </div>

            <div className="flex flex-col items-center gap-2">
              <div className="text-xs font-semibold text-emerald-400">После commit</div>
              <Arrow direction="down" />
              <DiagramTooltip
                content={
                  <div>
                    <strong>OK</strong>
                    <p className="mt-1">
                      Offset сохранен. При перезапуске consumer продолжит со следующего сообщения.
                      Данные не потеряны.
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
                  OK
                </FlowNode>
              </DiagramTooltip>
            </div>
          </div>
        </div>
      </DiagramContainer>

      {/* Exactly-Once flow */}
      <DiagramContainer
        title="Exactly-Once"
        color="emerald"
        recommended
        className="flex-1"
        description="Транзакционный API для атомарности"
      >
        <div className="flex flex-col items-center gap-3">
          <DiagramTooltip
            content={
              <div>
                <strong>Получить сообщение</strong>
                <p className="mt-1">
                  Consumer читает сообщение с isolation.level=read_committed.
                  Видны только committed транзакции.
                </p>
              </div>
            }
          >
            <FlowNode variant="app" size="sm" tabIndex={0}>
              Получить сообщение
            </FlowNode>
          </DiagramTooltip>

          <Arrow direction="down" />

          <DiagramTooltip
            content={
              <div>
                <strong>Begin Transaction</strong>
                <p className="mt-1">
                  Producer вызывает begin_transaction(). Все дальнейшие операции
                  выполняются в рамках одной транзакции.
                </p>
              </div>
            }
          >
            <FlowNode variant="app" size="sm" tabIndex={0}>
              Begin Transaction
            </FlowNode>
          </DiagramTooltip>

          <Arrow direction="down" />

          <DiagramTooltip
            content={
              <div>
                <strong>Обработать</strong>
                <p className="mt-1">
                  Трансформация данных внутри транзакционного контекста.
                  При ошибке вся транзакция будет отменена.
                </p>
              </div>
            }
          >
            <FlowNode variant="app" size="sm" tabIndex={0}>
              Обработать
            </FlowNode>
          </DiagramTooltip>

          <Arrow direction="down" />

          <DiagramTooltip
            content={
              <div>
                <strong>Produce результат</strong>
                <p className="mt-1">
                  Producer.produce() записывает результат в output topic.
                  Запись не видна другим consumer до commit транзакции.
                </p>
              </div>
            }
          >
            <FlowNode variant="app" size="sm" tabIndex={0}>
              Produce результат
            </FlowNode>
          </DiagramTooltip>

          <Arrow direction="down" />

          <DiagramTooltip
            content={
              <div>
                <strong>Commit offset в транзакции</strong>
                <p className="mt-1">
                  send_offsets_to_transaction() добавляет offset commit в текущую транзакцию.
                  Offset будет сохранен только при успешном commit транзакции.
                </p>
              </div>
            }
          >
            <FlowNode variant="app" size="sm" tabIndex={0}>
              Commit offset в транзакции
            </FlowNode>
          </DiagramTooltip>

          <Arrow direction="down" />

          <DiagramTooltip
            content={
              <div>
                <strong>Commit Transaction</strong>
                <p className="mt-1">
                  commit_transaction() атомарно применяет все операции: обработка + produce + offset commit.
                  Либо всё выполнилось, либо ничего.
                </p>
              </div>
            }
          >
            <FlowNode variant="app" size="sm" tabIndex={0}>
              Commit Transaction
            </FlowNode>
          </DiagramTooltip>

          <Arrow direction="down" />

          <DiagramTooltip
            content={
              <div>
                <strong>Точка сбоя</strong>
                <p className="mt-1">
                  При crash до commit транзакции вся транзакция будет отменена.
                  После commit гарантируется exactly-once семантика.
                </p>
              </div>
            }
          >
            <FlowNode variant="app" size="sm" tabIndex={0}>
              Crash?
            </FlowNode>
          </DiagramTooltip>

          <div className="flex gap-6 mt-2">
            <div className="flex flex-col items-center gap-2">
              <div className="text-xs font-semibold text-rose-400">До commit</div>
              <Arrow direction="down" />
              <DiagramTooltip
                content={
                  <div>
                    <strong>Rollback всей транзакции</strong>
                    <p className="mt-1">
                      Kafka автоматически отменяет незавершенную транзакцию (abort_transaction).
                      Produce и offset commit отменены. При перезапуске сообщение обработается заново.
                    </p>
                  </div>
                }
              >
                <FlowNode
                  variant="app"
                  size="sm"
                  className="bg-rose-500/20 border-rose-400/30 text-rose-200"
                  tabIndex={0}
                >
                  Rollback всей транзакции
                </FlowNode>
              </DiagramTooltip>
            </div>

            <div className="flex flex-col items-center gap-2">
              <div className="text-xs font-semibold text-emerald-400">После commit</div>
              <Arrow direction="down" />
              <DiagramTooltip
                content={
                  <div>
                    <strong>OK атомарно</strong>
                    <p className="mt-1">
                      Транзакция успешно завершена. Результат записан в output topic,
                      offset сохранен. Гарантируется exactly-once: нет дубликатов, нет потери данных.
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
                  OK атомарно
                </FlowNode>
              </DiagramTooltip>
            </div>
          </div>
        </div>
      </DiagramContainer>
    </div>
  );
}

/**
 * RebalancingSequenceDiagram - Consumer rebalancing when max.poll.interval.ms exceeded
 */
export function RebalancingSequenceDiagram() {
  return (
    <DiagramContainer
      title="Rebalancing: max.poll.interval.ms exceeded"
      color="amber"
      description="Consumer выгоняется из группы при превышении max.poll.interval.ms"
    >
      <SequenceDiagram
        actors={[
          {
            id: 'consumer',
            label: 'Consumer',
            variant: 'service',
            tooltip: 'Python consumer с confluent-kafka библиотекой',
          },
          {
            id: 'coordinator',
            label: 'Group Coordinator',
            variant: 'service',
            tooltip: 'Kafka broker, управляющий consumer group координацией',
          },
          {
            id: 'kafka',
            label: 'Kafka',
            variant: 'queue',
            tooltip: 'Kafka broker с топиками и партициями',
          },
        ]}
        messages={[
          {
            id: '1',
            from: 'consumer',
            to: 'kafka',
            label: 'poll() - получить сообщение',
            tooltip: 'Consumer вызывает poll() для получения сообщений из Kafka. Возвращает batch сообщений.',
          },
          {
            id: '2',
            from: 'kafka',
            to: 'consumer',
            label: 'Batch сообщений',
            variant: 'return',
            tooltip: 'Kafka возвращает сообщения из назначенных партиций.',
          },
          {
            id: '3',
            from: 'consumer',
            to: 'consumer',
            label: 'Обработка (3 минуты)',
            tooltip: 'Consumer обрабатывает полученные сообщения. Если обработка занимает слишком долго, не вызывается poll().',
          },
          {
            id: '4',
            from: 'consumer',
            to: 'kafka',
            label: 'poll() - следующее сообщение',
            tooltip: 'Consumer вызывает poll() снова для получения следующего batch. Это сигнал для Group Coordinator, что consumer жив.',
          },
          {
            id: '5',
            from: 'coordinator',
            to: 'coordinator',
            label: 'Проверка: max.poll.interval.ms = 5 минут',
            tooltip: 'Group Coordinator отслеживает время между poll() вызовами. Если poll() не вызван в течение max.poll.interval.ms, consumer считается мертвым.',
          },
          {
            id: '6',
            from: 'consumer',
            to: 'kafka',
            label: 'poll() после 6 минут (превышен таймаут)',
            tooltip: 'Consumer вызывает poll() через 6 минут, но max.poll.interval.ms = 5 минут. Слишком поздно!',
          },
          {
            id: '7',
            from: 'coordinator',
            to: 'consumer',
            label: '❌ Rebalancing triggered',
            variant: 'return',
            tooltip: 'Group Coordinator запускает rebalancing, так как consumer превысил max.poll.interval.ms. Consumer выгоняется из группы.',
          },
          {
            id: '8',
            from: 'coordinator',
            to: 'coordinator',
            label: 'Партиции переназначены другим consumers',
            tooltip: 'Партиции, которые обрабатывал "мертвый" consumer, переназначаются другим живым consumers в группе.',
          },
        ]}
        messageSpacing={55}
      />
      <div className="mt-4 text-xs text-gray-400">
        <div className="font-semibold text-amber-400 mb-2">Решение проблемы:</div>
        <ul className="list-disc list-inside space-y-1">
          <li>Уменьшите max.poll.records (меньше сообщений за один poll)</li>
          <li>Увеличьте max.poll.interval.ms (больше времени на обработку)</li>
          <li>Оптимизируйте обработку (уменьшите время на сообщение)</li>
          <li>Offload тяжелой работы в асинхронные задачи (Celery, RQ)</li>
        </ul>
      </div>
    </DiagramContainer>
  );
}
