/**
 * Connector Scaling Diagrams
 *
 * Exports:
 * - TasksMaxMythDiagram: Side-by-side comparison of tasks.max myth vs reality
 * - WalSequentialDiagram: Why parallelization is impossible in WAL
 * - SingleTaskArchitectureDiagram: Internal Debezium architecture with bottleneck
 * - MultipleConnectorsDiagram: Horizontal scaling via multiple connectors
 * - DownstreamParallelizationDiagram: Scaling via Kafka partitions
 * - ScalingDecisionFrameworkDiagram: Decision tree for scaling strategy selection
 */

import { FlowNode } from '../primitives/FlowNode';
import { Arrow } from '../primitives/Arrow';
import { DiagramContainer } from '../primitives/DiagramContainer';
import { DiagramTooltip } from '../primitives/Tooltip';

/**
 * TasksMaxMythDiagram - Myth vs Reality of tasks.max setting
 */
export function TasksMaxMythDiagram() {
  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Myth side */}
      <DiagramContainer
        title="МИФ: tasks.max=4"
        color="rose"
        className="flex-1"
      >
        <div className="flex flex-col gap-4">
          <DiagramTooltip content="Распространенное заблуждение: tasks.max=4 создаст 4 параллельных потока чтения WAL. На самом деле параметр полностью игнорируется для PostgreSQL коннектора.">
            <FlowNode variant="database" tabIndex={0}>
              PostgreSQL
            </FlowNode>
          </DiagramTooltip>

          <div className="flex flex-col md:flex-row gap-2 justify-center items-center">
            <Arrow direction="down" />
            <Arrow direction="down" />
            <Arrow direction="down" />
            <Arrow direction="down" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <DiagramTooltip content="Ожидание: Task 1 читает часть событий параллельно. Реальность: не существует.">
              <FlowNode variant="app" tabIndex={0} size="sm">
                Task 1
              </FlowNode>
            </DiagramTooltip>
            <DiagramTooltip content="Ожидание: Task 2 читает другую часть. Реальность: не существует.">
              <FlowNode variant="app" tabIndex={0} size="sm">
                Task 2
              </FlowNode>
            </DiagramTooltip>
            <DiagramTooltip content="Ожидание: Task 3 читает третью часть. Реальность: не существует.">
              <FlowNode variant="app" tabIndex={0} size="sm">
                Task 3
              </FlowNode>
            </DiagramTooltip>
            <DiagramTooltip content="Ожидание: Task 4 читает последнюю часть. Реальность: не существует.">
              <FlowNode variant="app" tabIndex={0} size="sm">
                Task 4
              </FlowNode>
            </DiagramTooltip>
          </div>

          <div className="text-center text-rose-400 text-xs">
            Ожидание: 4x throughput
          </div>
        </div>
      </DiagramContainer>

      {/* Reality side */}
      <DiagramContainer
        title="РЕАЛЬНОСТЬ"
        color="emerald"
        className="flex-1"
      >
        <div className="flex flex-col gap-4 items-center">
          <DiagramTooltip content="PostgreSQL WAL читается последовательно через один replication slot. Параллелизация невозможна из-за требований к порядку событий.">
            <FlowNode variant="database" tabIndex={0}>
              PostgreSQL WAL
            </FlowNode>
          </DiagramTooltip>

          <Arrow direction="down" />

          <DiagramTooltip content="Единственный task читает WAL последовательно. tasks.max игнорируется для PostgreSQL, MySQL и Oracle коннекторов.">
            <FlowNode variant="connector" tabIndex={0} size="lg">
              <div className="text-center">
                <div>Task 1</div>
                <div className="text-xs text-gray-400">(ЕДИНСТВЕННЫЙ)</div>
              </div>
            </FlowNode>
          </DiagramTooltip>

          <Arrow direction="down" />

          <FlowNode variant="cluster" tabIndex={0}>
            Kafka
          </FlowNode>

          <div className="bg-amber-500/20 border border-amber-400/30 rounded-lg px-3 py-2 text-center">
            <DiagramTooltip content="Параметр tasks.max полностью игнорируется. Можно установить 100, результат будет 1 task. Это не баг - это архитектурное ограничение.">
              <span className="text-amber-300 text-sm font-mono cursor-help">
                tasks.max = 4 ИГНОРИРУЕТСЯ
              </span>
            </DiagramTooltip>
          </div>
        </div>
      </DiagramContainer>
    </div>
  );
}

/**
 * WalSequentialDiagram - Why WAL must be read sequentially
 */
export function WalSequentialDiagram() {
  return (
    <DiagramContainer
      title="PostgreSQL WAL - последовательный журнал"
      color="blue"
    >
      <div className="flex flex-col gap-6">
        {/* WAL events sequence */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-2 overflow-x-auto pb-2">
          <DiagramTooltip content="LSN (Log Sequence Number) - уникальная позиция в WAL. События должны обрабатываться строго по порядку LSN для транзакционной целостности.">
            <FlowNode variant="sink" tabIndex={0} size="sm">
              <div className="text-center">
                <span className="block text-xs text-gray-400">Event 1</span>
                <span className="font-mono text-xs">LSN: 0/1000</span>
              </div>
            </FlowNode>
          </DiagramTooltip>

          <Arrow direction="right" />

          <DiagramTooltip content="Каждое событие имеет уникальный LSN. Пропуск или изменение порядка нарушит целостность данных.">
            <FlowNode variant="sink" tabIndex={0} size="sm">
              <div className="text-center">
                <span className="block text-xs text-gray-400">Event 2</span>
                <span className="font-mono text-xs">LSN: 0/1001</span>
              </div>
            </FlowNode>
          </DiagramTooltip>

          <Arrow direction="right" />

          <DiagramTooltip content="Все изменения одной транзакции должны обрабатываться атомарно. Parallel processing нарушит это требование.">
            <FlowNode variant="sink" tabIndex={0} size="sm">
              <div className="text-center">
                <span className="block text-xs text-gray-400">Event 3</span>
                <span className="font-mono text-xs">LSN: 0/1002</span>
              </div>
            </FlowNode>
          </DiagramTooltip>

          <Arrow direction="right" />

          <FlowNode variant="sink" tabIndex={0} size="sm">
            <div className="text-center">
              <span className="block text-xs text-gray-400">Event 4</span>
              <span className="font-mono text-xs">LSN: 0/1003</span>
            </div>
          </FlowNode>

          <Arrow direction="right" />

          <FlowNode variant="sink" tabIndex={0} size="sm">
            <div className="text-center">
              <span className="block text-xs text-gray-400">Event 5</span>
              <span className="font-mono text-xs">LSN: 0/1004</span>
            </div>
          </FlowNode>
        </div>

        {/* Replication slot */}
        <div className="flex flex-col items-center gap-3">
          <DiagramTooltip content="Replication slot отслеживает одну позицию (restart_lsn). Невозможно иметь несколько позиций для параллельного чтения.">
            <div className="bg-amber-500/20 border border-amber-400/30 rounded-xl px-4 py-3 text-center">
              <div className="text-amber-300 font-semibold">Replication Slot</div>
              <div className="text-xs text-gray-400 font-mono mt-1">position: 0/1002</div>
            </div>
          </DiagramTooltip>

          <div className="text-center text-sm text-gray-400 max-w-md">
            Читает последовательно от restart_lsn. Одна позиция = один reader.
          </div>
        </div>

        {/* Reasons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
          <div className="bg-gray-800/30 p-3 rounded-lg text-center">
            <div className="text-blue-400 font-semibold text-sm mb-1">Порядок имеет значение</div>
            <div className="text-xs text-gray-400">События обрабатываются строго по LSN</div>
          </div>
          <div className="bg-gray-800/30 p-3 rounded-lg text-center">
            <div className="text-purple-400 font-semibold text-sm mb-1">Одна позиция</div>
            <div className="text-xs text-gray-400">Slot отслеживает один restart_lsn</div>
          </div>
          <div className="bg-gray-800/30 p-3 rounded-lg text-center">
            <div className="text-emerald-400 font-semibold text-sm mb-1">Транзакционность</div>
            <div className="text-xs text-gray-400">Атомарная обработка транзакций</div>
          </div>
        </div>
      </div>
    </DiagramContainer>
  );
}

/**
 * SingleTaskArchitectureDiagram - Internal architecture showing bottleneck
 */
export function SingleTaskArchitectureDiagram() {
  return (
    <DiagramContainer
      title="Архитектура Debezium PostgreSQL Connector"
      color="neutral"
    >
      <div className="flex flex-col items-center gap-4">
        {/* PostgreSQL */}
        <DiagramTooltip content="PostgreSQL отдает WAL через logical decoding. Один replication slot = один поток данных.">
          <FlowNode variant="database" tabIndex={0} size="lg">
            <div className="text-center">
              <div>PostgreSQL</div>
              <div className="text-xs text-gray-400">WAL Stream</div>
            </div>
          </FlowNode>
        </DiagramTooltip>

        <Arrow direction="down" label="Logical Decoding" />

        {/* Debezium internal structure */}
        <div className="bg-gray-800/40 border border-gray-600/30 rounded-2xl p-4 w-full max-w-md">
          <div className="text-center text-sm text-gray-300 mb-4 font-semibold">
            Debezium Connector (Single Task)
          </div>

          <div className="flex flex-col gap-3">
            <DiagramTooltip content="WAL Reader - BOTTLENECK! Один поток читает WAL последовательно. Это физическое ограничение, которое нельзя обойти через конфигурацию.">
              <FlowNode
                variant="app"
                tabIndex={0}
                className="border-2 border-rose-400"
              >
                <div className="text-center">
                  <div>WAL Reader</div>
                  <div className="text-xs text-rose-300">(1 поток - BOTTLENECK)</div>
                </div>
              </FlowNode>
            </DiagramTooltip>

            <Arrow direction="down" label="Events" />

            <DiagramTooltip content="Internal Queue буферизует события перед отправкой в Kafka. По умолчанию 8192 события, можно увеличить до 16384+.">
              <FlowNode variant="connector" tabIndex={0}>
                <div className="text-center">
                  <div>Internal Queue</div>
                  <div className="text-xs text-gray-400">(8192 events)</div>
                </div>
              </FlowNode>
            </DiagramTooltip>

            <Arrow direction="down" label="Batch" />

            <DiagramTooltip content="Kafka Writer отправляет батчи событий в Kafka. Можно оптимизировать через producer.override.* параметры.">
              <FlowNode variant="sink" tabIndex={0}>
                <div className="text-center">
                  <div>Kafka Writer</div>
                  <div className="text-xs text-gray-400">(1 поток)</div>
                </div>
              </FlowNode>
            </DiagramTooltip>
          </div>
        </div>

        <Arrow direction="down" label="ProducerRecord" />

        {/* Kafka */}
        <DiagramTooltip content="Kafka получает события от одного producer. Throughput ограничен скоростью WAL Reader.">
          <FlowNode variant="cluster" tabIndex={0} size="lg">
            <div className="text-center">
              <div>Kafka</div>
              <div className="text-xs text-gray-400">Topic Partitions</div>
            </div>
          </FlowNode>
        </DiagramTooltip>

        {/* Note */}
        <div className="bg-rose-500/10 border border-rose-400/30 rounded-lg px-4 py-2 text-center mt-2">
          <span className="text-rose-300 text-sm">
            WAL Reader - единственный bottleneck. Все остальное масштабируется.
          </span>
        </div>
      </div>
    </DiagramContainer>
  );
}

/**
 * MultipleConnectorsDiagram - Horizontal scaling via separate connectors
 */
export function MultipleConnectorsDiagram() {
  return (
    <DiagramContainer
      title="Стратегия 1: Множественные коннекторы"
      color="purple"
      description="Разделение таблиц по доменам с независимыми коннекторами"
    >
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* PostgreSQL tables */}
        <div className="flex flex-col gap-3">
          <div className="text-center text-sm text-gray-400 mb-2">PostgreSQL</div>
          <DiagramTooltip content="Таблицы orders и order_items - домен заказов. Отдельный коннектор и slot для изоляции.">
            <FlowNode variant="sink" tabIndex={0} size="sm">
              <div className="text-center">
                <div className="text-blue-300">orders</div>
                <div className="text-xs text-gray-400">order_items</div>
              </div>
            </FlowNode>
          </DiagramTooltip>

          <DiagramTooltip content="Таблицы products и inventory - домен инвентаря. Независимый от заказов.">
            <FlowNode variant="database" tabIndex={0} size="sm">
              <div className="text-center">
                <div className="text-purple-300">products</div>
                <div className="text-xs text-gray-400">inventory</div>
              </div>
            </FlowNode>
          </DiagramTooltip>

          <DiagramTooltip content="Таблицы customers и addresses - домен клиентов. Отдельные потребители.">
            <FlowNode variant="connector" tabIndex={0} size="sm">
              <div className="text-center">
                <div className="text-emerald-300">customers</div>
                <div className="text-xs text-gray-400">addresses</div>
              </div>
            </FlowNode>
          </DiagramTooltip>
        </div>

        {/* Arrows */}
        <div className="flex flex-col gap-6 justify-center">
          <Arrow direction="right" />
          <Arrow direction="right" />
          <Arrow direction="right" />
        </div>

        {/* Connectors */}
        <div className="flex flex-col gap-3">
          <div className="text-center text-sm text-gray-400 mb-2">Connectors</div>
          <DiagramTooltip content="orders-connector с отдельным slot. Failure не влияет на другие домены.">
            <FlowNode variant="sink" tabIndex={0} size="sm">
              <div className="text-center">
                <div className="text-blue-300">orders-connector</div>
                <div className="text-xs text-gray-400">task=1</div>
              </div>
            </FlowNode>
          </DiagramTooltip>

          <DiagramTooltip content="inventory-connector с отдельным slot. Независимый offset tracking.">
            <FlowNode variant="database" tabIndex={0} size="sm">
              <div className="text-center">
                <div className="text-purple-300">inventory-connector</div>
                <div className="text-xs text-gray-400">task=1</div>
              </div>
            </FlowNode>
          </DiagramTooltip>

          <DiagramTooltip content="customers-connector с отдельным slot. Можно мониторить lag per-domain.">
            <FlowNode variant="connector" tabIndex={0} size="sm">
              <div className="text-center">
                <div className="text-emerald-300">customers-connector</div>
                <div className="text-xs text-gray-400">task=1</div>
              </div>
            </FlowNode>
          </DiagramTooltip>
        </div>

        {/* Arrows */}
        <div className="flex flex-col gap-6 justify-center">
          <Arrow direction="right" />
          <Arrow direction="right" />
          <Arrow direction="right" />
        </div>

        {/* Kafka topics */}
        <div className="flex flex-col gap-3">
          <div className="text-center text-sm text-gray-400 mb-2">Kafka Topics</div>
          <DiagramTooltip content="orders.public.orders и orders.public.order_items - отдельные топики для домена заказов.">
            <FlowNode variant="sink" tabIndex={0} size="sm">
              <div className="text-center text-xs">
                <div className="text-blue-300">orders.public.*</div>
              </div>
            </FlowNode>
          </DiagramTooltip>

          <DiagramTooltip content="inventory.public.* - топики для инвентаря. Независимые retention и partitioning.">
            <FlowNode variant="database" tabIndex={0} size="sm">
              <div className="text-center text-xs">
                <div className="text-purple-300">inventory.public.*</div>
              </div>
            </FlowNode>
          </DiagramTooltip>

          <DiagramTooltip content="customers.public.* - топики для клиентов. Можно настроить разные SLO.">
            <FlowNode variant="connector" tabIndex={0} size="sm">
              <div className="text-center text-xs">
                <div className="text-emerald-300">customers.public.*</div>
              </div>
            </FlowNode>
          </DiagramTooltip>
        </div>
      </div>

      {/* Pros/Cons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <div className="bg-emerald-500/10 border border-emerald-400/30 rounded-lg p-3">
          <div className="text-emerald-300 font-semibold text-sm mb-2">Преимущества</div>
          <ul className="text-xs text-gray-300 space-y-1">
            <li>Независимые replication slots</li>
            <li>Изоляция failures</li>
            <li>Per-domain monitoring</li>
          </ul>
        </div>
        <div className="bg-rose-500/10 border border-rose-400/30 rounded-lg p-3">
          <div className="text-rose-300 font-semibold text-sm mb-2">Недостатки</div>
          <ul className="text-xs text-gray-300 space-y-1">
            <li>Больше WAL retention (N slots)</li>
            <li>Больше ресурсов Connect</li>
            <li>Сложнее управлять</li>
          </ul>
        </div>
      </div>
    </DiagramContainer>
  );
}

/**
 * DownstreamParallelizationDiagram - Scaling via Kafka partitions
 */
export function DownstreamParallelizationDiagram() {
  return (
    <DiagramContainer
      title="Стратегия 2: Downstream параллелизация"
      color="emerald"
      description="Параллелизм на стороне consumer через Kafka partitions"
    >
      <div className="flex flex-col gap-6">
        {/* Flow diagram */}
        <div className="flex flex-col lg:flex-row items-center justify-center gap-4">
          {/* PostgreSQL */}
          <DiagramTooltip content="Таблица orders - все данные из одного источника.">
            <FlowNode variant="database" tabIndex={0}>
              <div className="text-center">
                <div>PostgreSQL</div>
                <div className="text-xs text-gray-400">orders table</div>
              </div>
            </FlowNode>
          </DiagramTooltip>

          <Arrow direction="right" />

          {/* Single connector */}
          <DiagramTooltip content="Один коннектор, один slot. Bottleneck на уровне WAL reader, но downstream масштабируется.">
            <FlowNode variant="connector" tabIndex={0}>
              <div className="text-center">
                <div>Single Connector</div>
                <div className="text-xs text-gray-400">task=1</div>
              </div>
            </FlowNode>
          </DiagramTooltip>

          <Arrow direction="right" />

          {/* Kafka topic with partitions */}
          <DiagramTooltip content="Топик с 8 партициями. Key = primary key таблицы. События одного ключа всегда в одной партиции (ordering гарантирован).">
            <div className="bg-amber-500/20 border border-amber-400/30 rounded-xl px-4 py-3">
              <div className="text-center">
                <div className="text-amber-300 font-semibold">orders topic</div>
                <div className="text-xs text-gray-400">8 partitions</div>
              </div>
            </div>
          </DiagramTooltip>

          <Arrow direction="right" />

          {/* Consumers */}
          <div className="flex flex-col gap-2">
            <DiagramTooltip content="Consumer 1 обрабатывает партиции 0-1. Параллельно с другими consumers.">
              <FlowNode variant="app" tabIndex={0} size="sm">
                <div className="text-center text-xs">
                  <div>Consumer 1</div>
                  <div className="text-gray-400">p: 0-1</div>
                </div>
              </FlowNode>
            </DiagramTooltip>
            <DiagramTooltip content="Consumer 2 обрабатывает партиции 2-3.">
              <FlowNode variant="app" tabIndex={0} size="sm">
                <div className="text-center text-xs">
                  <div>Consumer 2</div>
                  <div className="text-gray-400">p: 2-3</div>
                </div>
              </FlowNode>
            </DiagramTooltip>
            <DiagramTooltip content="Consumer 3 обрабатывает партиции 4-5.">
              <FlowNode variant="app" tabIndex={0} size="sm">
                <div className="text-center text-xs">
                  <div>Consumer 3</div>
                  <div className="text-gray-400">p: 4-5</div>
                </div>
              </FlowNode>
            </DiagramTooltip>
            <DiagramTooltip content="Consumer 4 обрабатывает партиции 6-7.">
              <FlowNode variant="app" tabIndex={0} size="sm">
                <div className="text-center text-xs">
                  <div>Consumer 4</div>
                  <div className="text-gray-400">p: 6-7</div>
                </div>
              </FlowNode>
            </DiagramTooltip>
          </div>
        </div>

        {/* How it works */}
        <div className="bg-gray-800/30 rounded-lg p-4">
          <div className="text-sm text-gray-300 font-semibold mb-3">Как это работает:</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-gray-400">
            <div className="flex items-start gap-2">
              <span className="text-blue-400 font-semibold">1.</span>
              <span>Debezium пишет события в Kafka topic</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-400 font-semibold">2.</span>
              <span>Topic имеет N партиций (key = primary key)</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-emerald-400 font-semibold">3.</span>
              <span>N consumer instances читают параллельно</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-emerald-400 font-semibold">4.</span>
              <span>Ordering гарантирован per-key в партиции</span>
            </div>
          </div>
        </div>

        {/* Pros/Cons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-emerald-500/10 border border-emerald-400/30 rounded-lg p-3">
            <div className="text-emerald-300 font-semibold text-sm mb-2">Преимущества</div>
            <ul className="text-xs text-gray-300 space-y-1">
              <li>Один коннектор, один slot</li>
              <li>Параллелизм на consumer</li>
              <li>Ordering per-key гарантирован</li>
            </ul>
          </div>
          <div className="bg-rose-500/10 border border-rose-400/30 rounded-lg p-3">
            <div className="text-rose-300 font-semibold text-sm mb-2">Недостатки</div>
            <ul className="text-xs text-gray-300 space-y-1">
              <li>Debezium остается single-threaded</li>
              <li>Bottleneck в WAL reader</li>
              <li>Требует partition-aware consumers</li>
            </ul>
          </div>
        </div>
      </div>
    </DiagramContainer>
  );
}

/**
 * ScalingDecisionFrameworkDiagram - Decision tree for strategy selection
 */
export function ScalingDecisionFrameworkDiagram() {
  return (
    <DiagramContainer
      title="Decision Framework: Выбор стратегии масштабирования"
      color="amber"
    >
      <div className="flex flex-col gap-6">
        {/* Decision tree */}
        <div className="flex flex-col items-center gap-4">
          {/* Root question */}
          <DiagramTooltip content="Первый шаг - оценить текущий throughput. Performance ceiling одного коннектора ~7,000 events/sec.">
            <FlowNode variant="connector" tabIndex={0} size="lg">
              <div className="text-center">
                <div>Нужно больше throughput?</div>
                <div className="text-xs text-gray-400">Текущий vs целевой</div>
              </div>
            </FlowNode>
          </DiagramTooltip>

          {/* First branch */}
          <div className="flex flex-col md:flex-row gap-6 items-start">
            {/* Left: Under ceiling */}
            <div className="flex flex-col items-center gap-3">
              <div className="text-sm text-gray-400">Меньше 7K/sec</div>
              <Arrow direction="down" />
              <DiagramTooltip content="Performance Tuning: max.queue.size=16384, max.batch.size=4096, producer.override.compression.type=lz4. Максимизирует throughput одного коннектора.">
                <FlowNode variant="sink" tabIndex={0}>
                  <div className="text-center">
                    <div className="text-blue-300">Стратегия 3:</div>
                    <div className="text-sm">Performance Tuning</div>
                  </div>
                </FlowNode>
              </DiagramTooltip>

              <Arrow direction="down" label="Достаточно?" />

              <div className="flex flex-row gap-4">
                <div className="flex flex-col items-center gap-2">
                  <div className="text-xs text-emerald-400">Да</div>
                  <DiagramTooltip content="Оптимизация параметров достаточна. Мониторьте throughput и queue utilization.">
                    <FlowNode variant="connector" tabIndex={0} size="sm">
                      Done
                    </FlowNode>
                  </DiagramTooltip>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="text-xs text-rose-400">Нет</div>
                  <Arrow direction="right" />
                </div>
              </div>
            </div>

            {/* Right: At or above ceiling */}
            <div className="flex flex-col items-center gap-3">
              <div className="text-sm text-gray-400">~7K/sec или больше</div>
              <Arrow direction="down" />
              <DiagramTooltip content="Ключевой вопрос: можно ли разделить таблицы на независимые группы по доменам?">
                <FlowNode variant="connector" tabIndex={0}>
                  <div className="text-center">
                    <div>Таблицы независимы?</div>
                  </div>
                </FlowNode>
              </DiagramTooltip>

              <div className="flex flex-row gap-6 mt-3">
                {/* Yes - Multiple connectors */}
                <div className="flex flex-col items-center gap-2">
                  <div className="text-xs text-emerald-400">Да</div>
                  <Arrow direction="down" />
                  <DiagramTooltip content="Multiple Connectors: разделить таблицы по доменам, отдельные slots и offsets. Горизонтальное масштабирование.">
                    <FlowNode variant="database" tabIndex={0}>
                      <div className="text-center">
                        <div className="text-purple-300">Стратегия 1:</div>
                        <div className="text-sm">Multiple Connectors</div>
                      </div>
                    </FlowNode>
                  </DiagramTooltip>
                </div>

                {/* No - Check ordering */}
                <div className="flex flex-col items-center gap-2">
                  <div className="text-xs text-rose-400">Нет</div>
                  <Arrow direction="down" />
                  <DiagramTooltip content="Если таблицы связаны, проверьте требования к ordering. Per-key ordering обычно достаточен.">
                    <FlowNode variant="connector" tabIndex={0} size="sm">
                      <div className="text-center">
                        <div className="text-xs">Нужен ordering</div>
                        <div className="text-xs">per-key?</div>
                      </div>
                    </FlowNode>
                  </DiagramTooltip>

                  <div className="flex flex-row gap-4 mt-2">
                    <div className="flex flex-col items-center gap-2">
                      <div className="text-xs text-emerald-400">Да</div>
                      <DiagramTooltip content="Downstream Parallelization: один коннектор, много партиций Kafka, параллельные consumers. Ordering per-key гарантирован.">
                        <FlowNode variant="app" tabIndex={0} size="sm">
                          <div className="text-center text-xs">
                            <div className="text-emerald-300">Стратегия 2:</div>
                            <div>Downstream</div>
                          </div>
                        </FlowNode>
                      </DiagramTooltip>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <div className="text-xs text-amber-400">Нет</div>
                      <DiagramTooltip content="Комбинация стратегий: Multiple Connectors + Downstream Parallelization для максимального throughput.">
                        <FlowNode variant="target" tabIndex={0} size="sm">
                          <div className="text-center text-xs">
                            <div className="text-amber-300">Комбинация:</div>
                            <div>Multiple + DS</div>
                          </div>
                        </FlowNode>
                      </DiagramTooltip>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Performance note */}
        <div className="bg-amber-500/10 border border-amber-400/30 rounded-lg px-4 py-3 text-center">
          <DiagramTooltip content="Это эмпирическое значение, зависящее от размера events, network latency, disk I/O и сложности transforms.">
            <span className="text-amber-300 text-sm cursor-help">
              Performance ceiling: ~7,000 events/sec per PostgreSQL connector
            </span>
          </DiagramTooltip>
        </div>
      </div>
    </DiagramContainer>
  );
}
