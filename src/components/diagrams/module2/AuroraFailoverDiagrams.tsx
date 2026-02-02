/**
 * Aurora Failover Diagrams
 *
 * Exports:
 * - AuroraFailoverSequenceDiagram: Complex sequence showing slot loss during failover
 * - HeartbeatMonitoringDiagram: Heartbeat architecture for gap detection
 * - AuroraGlobalDatabaseDiagram: Multi-region CDC strategy
 */

import { FlowNode } from '../primitives/FlowNode';
import { Arrow } from '../primitives/Arrow';
import { DiagramContainer } from '../primitives/DiagramContainer';
import { DiagramTooltip } from '../primitives/Tooltip';
import { SequenceDiagram } from '../primitives/SequenceDiagram';
import type { SequenceActorDef, SequenceMessageDef } from '../primitives/types';

/**
 * AuroraFailoverSequenceDiagram - Complex sequence showing slot loss during failover
 */
export function AuroraFailoverSequenceDiagram() {
  const actors: SequenceActorDef[] = [
    {
      id: 'app',
      label: 'App',
      variant: 'service',
      tooltip:
        'Приложение продолжает записывать данные. INSERT INTO orders (id=100) успешно записан и отправлен в Kafka. Приложение не знает о failover до момента ошибки соединения.',
    },
    {
      id: 'writer',
      label: 'Writer',
      variant: 'database',
      tooltip:
        'Primary Aurora instance обрабатывает write операции. Внезапно падает между записью WAL и подтверждением Debezium. Данные записаны в WAL, но не подтверждены.',
    },
    {
      id: 'reader',
      label: 'Reader',
      variant: 'database',
      tooltip:
        'Read replica автоматически промотится в новый Writer при обнаружении failover. Занимает 1-2 минуты. Replication slot НЕ переносится с упавшего Writer.',
    },
    {
      id: 'slot',
      label: 'Slot',
      variant: 'service',
      tooltip:
        'КРИТИЧНО: Slot существовал только на Writer. При failover slot ПОТЕРЯН — PostgreSQL до версии 17 не синхронизирует slots между инстансами.',
    },
    {
      id: 'debezium',
      label: 'Debezium',
      variant: 'service',
      tooltip:
        'После failover пытается подключиться. Получает "slot not found". Пересоздает slot с ТЕКУЩЕЙ позиции — данные между crash и recovery потеряны.',
    },
    {
      id: 'kafka',
      label: 'Kafka',
      variant: 'queue',
      tooltip:
        'События до crash доставлены (id=100). События в failover window (id=101) ПОТЕРЯНЫ НАВСЕГДА. Kafka не может вернуть то, что никогда не получал.',
    },
  ];

  const messages: SequenceMessageDef[] = [
    {
      id: 'msg1',
      from: 'app',
      to: 'writer',
      label: 'INSERT id=100',
      variant: 'sync',
      tooltip:
        'Нормальная работа: приложение вставляет заказ id=100. PostgreSQL записывает в WAL и подтверждает транзакцию.',
    },
    {
      id: 'msg2',
      from: 'writer',
      to: 'slot',
      label: 'Write LSN',
      variant: 'sync',
      tooltip:
        'WAL запись создана на позиции LSN. Slot отслеживает эту позицию. Debezium еще не прочитал изменение.',
    },
    {
      id: 'msg3',
      from: 'debezium',
      to: 'slot',
      label: 'Read changes',
      variant: 'async',
      tooltip:
        'Debezium читает изменения из slot через streaming replication protocol. Получает событие id=100.',
    },
    {
      id: 'msg4',
      from: 'debezium',
      to: 'kafka',
      label: 'Event id=100',
      variant: 'async',
      tooltip:
        'Debezium отправляет CDC событие в Kafka. id=100 успешно доставлен. Это последнее гарантированное событие.',
    },
    {
      id: 'msg5',
      from: 'app',
      to: 'writer',
      label: 'INSERT id=101',
      variant: 'sync',
      tooltip:
        'ОПАСНАЯ ЗОНА: Приложение вставляет id=101. Writer записывает в WAL... и тут происходит CRASH!',
    },
    {
      id: 'msg6',
      from: 'reader',
      to: 'reader',
      label: 'Promotion',
      variant: 'sync',
      tooltip:
        'Reader обнаруживает недоступность Writer и начинает promotion. Становится новым Writer за 1-2 минуты.',
    },
    {
      id: 'msg7',
      from: 'debezium',
      to: 'reader',
      label: 'Reconnect',
      variant: 'async',
      tooltip:
        'Debezium пытается переподключиться к кластеру. Aurora endpoint перенаправляет на нового Writer (бывший Reader).',
    },
    {
      id: 'msg8',
      from: 'reader',
      to: 'debezium',
      label: 'Slot not found',
      variant: 'return',
      tooltip:
        'КРИТИЧЕСКАЯ ОШИБКА: Новый Writer не имеет replication slot. PostgreSQL до v17 не синхронизирует slots между инстансами.',
    },
    {
      id: 'msg9',
      from: 'debezium',
      to: 'reader',
      label: 'CREATE SLOT',
      variant: 'sync',
      tooltip:
        'Debezium вынужден создать новый slot. ПРОБЛЕМА: Slot создается с ТЕКУЩЕЙ позиции WAL, не с позиции crash.',
    },
  ];

  return (
    <div className="space-y-4">
      <SequenceDiagram actors={actors} messages={messages} messageSpacing={45} />

      {/* Danger zone indicator */}
      <DiagramContainer title="Потеря данных в Failover Window" color="rose">
        <div className="text-sm text-gray-300 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-rose-400 font-bold">id=101</span>
            <span>— ПОТЕРЯН. Был записан в WAL до crash, но Debezium не успел прочитать.</span>
          </div>
          <div className="text-xs text-gray-400">
            Новый slot начинает с текущей позиции (после recovery). Все транзакции в failover window невидимы для CDC.
          </div>
        </div>
      </DiagramContainer>
    </div>
  );
}

/**
 * HeartbeatMonitoringDiagram - Heartbeat architecture for gap detection
 */
export function HeartbeatMonitoringDiagram() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Debezium */}
        <DiagramContainer title="Debezium Connector" color="amber" className="flex-1">
          <div className="flex flex-col items-center gap-3">
            <DiagramTooltip content="Debezium периодически (каждые 10 сек) выполняет UPDATE heartbeat SET ts=NOW(). Создает 'маркеры времени' в потоке CDC. Позволяет обнаружить gaps в событиях.">
              <FlowNode variant="connector" tabIndex={0}>
                Heartbeat Generator
              </FlowNode>
            </DiagramTooltip>
            <div className="text-xs text-gray-400 text-center">
              heartbeat.interval.ms = 10000
            </div>
          </div>
        </DiagramContainer>

        {/* PostgreSQL */}
        <DiagramContainer title="PostgreSQL" color="purple" className="flex-1">
          <div className="flex flex-col items-center gap-3">
            <DiagramTooltip content="Специальная таблица public.heartbeat с полями id, ts, writer_instance. Хранит последний heartbeat и ID текущего writer. Изменения попадают в CDC поток.">
              <FlowNode variant="database" tabIndex={0}>
                heartbeat table
              </FlowNode>
            </DiagramTooltip>
            <div className="text-xs text-gray-400 text-center font-mono">
              id=1, ts=NOW(), writer_id
            </div>
          </div>
        </DiagramContainer>
      </div>

      {/* Kafka Topics */}
      <DiagramContainer title="Kafka Topics" color="blue">
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8">
          <DiagramTooltip content="Топик inventory.public.orders содержит бизнес-события. Heartbeat события помогают обнаружить gaps между событиями — если heartbeat есть, а бизнес-событий нет слишком долго.">
            <FlowNode variant="cluster" tabIndex={0}>
              inventory.public.orders
            </FlowNode>
          </DiagramTooltip>

          <DiagramTooltip content="__debezium-heartbeat.inventory — выделенный топик для heartbeat событий. Используется для мониторинга здоровья CDC pipeline. Если heartbeat отсутствует > 30 сек — проблема.">
            <FlowNode variant="cluster" tabIndex={0}>
              __debezium-heartbeat.*
            </FlowNode>
          </DiagramTooltip>
        </div>
      </DiagramContainer>

      {/* Monitoring */}
      <DiagramContainer title="Monitoring & Alerting" color="rose">
        <div className="flex flex-col items-center gap-3">
          <DiagramTooltip content="Алерт срабатывает при gap > 30 секунд между heartbeat событиями. Heartbeat не предотвращает потерю данных, но позволяет её ОБНАРУЖИТЬ и запустить recovery процедуру.">
            <FlowNode variant="app" tabIndex={0}>
              Alert: gap &gt; 30s
            </FlowNode>
          </DiagramTooltip>
          <div className="text-xs text-gray-400 text-center">
            Heartbeat обнаруживает, но НЕ предотвращает потерю данных
          </div>
        </div>
      </DiagramContainer>

      {/* Data flow arrows */}
      <div className="flex flex-col items-center gap-2 text-xs text-gray-500">
        <div className="flex items-center gap-2">
          <Arrow direction="right" label="UPDATE heartbeat" />
          <span>CDC событие</span>
          <Arrow direction="right" label="Kafka topics" />
          <span>Monitor</span>
          <Arrow direction="right" label="Alert" />
        </div>
      </div>
    </div>
  );
}

/**
 * AuroraGlobalDatabaseDiagram - Multi-region CDC strategy
 */
export function AuroraGlobalDatabaseDiagram() {
  return (
    <div className="space-y-6">
      {/* Two regions */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Primary Region */}
        <DiagramContainer
          title="Primary Region (us-east-1)"
          color="emerald"
          recommended
          className="flex-1"
        >
          <div className="flex flex-col items-center gap-4">
            <DiagramTooltip content="Основной регион us-east-1 с Writer Instance, Debezium #1 и Kafka Cluster #1. Обслуживает основной CDC-поток. При региональном сбое — secondary продолжает работу.">
              <FlowNode variant="database" tabIndex={0}>
                Writer Instance
              </FlowNode>
            </DiagramTooltip>

            <Arrow direction="down" />

            <DiagramTooltip content="Debezium коннектор #1 в primary регионе. Читает CDC события с Writer Instance и публикует в локальный Kafka Cluster #1.">
              <FlowNode variant="connector" tabIndex={0}>
                Debezium #1
              </FlowNode>
            </DiagramTooltip>

            <Arrow direction="down" />

            <DiagramTooltip content="Kafka Cluster #1 в primary регионе. Хранит CDC события от Debezium #1. Часть multi-region архитектуры для fault tolerance.">
              <FlowNode variant="cluster" tabIndex={0}>
                Kafka Cluster #1
              </FlowNode>
            </DiagramTooltip>
          </div>
        </DiagramContainer>

        {/* Aurora Replication arrow */}
        <div className="flex flex-col items-center justify-center gap-2 lg:py-8">
          <DiagramTooltip content="Aurora автоматически реплицирует данные между регионами с задержкой < 1 секунды. При failover primary — secondary становится новым primary. Storage layer синхронизирован.">
            <div className="flex flex-col items-center gap-1 cursor-help">
              <div className="hidden lg:flex items-center gap-1">
                <Arrow direction="right" dashed label="Aurora Replication" />
              </div>
              <div className="flex lg:hidden items-center gap-1">
                <Arrow direction="down" dashed label="Aurora Replication" />
              </div>
              <span className="text-xs text-gray-400">&lt; 1 sec lag</span>
            </div>
          </DiagramTooltip>
        </div>

        {/* Secondary Region */}
        <DiagramContainer
          title="Secondary Region (eu-west-1)"
          color="blue"
          className="flex-1"
        >
          <div className="flex flex-col items-center gap-4">
            <DiagramTooltip content="Дополнительный регион eu-west-1 с Writer Instance (read replica в нормальном режиме). При regional failover промотится в primary.">
              <FlowNode variant="database" tabIndex={0}>
                Writer Instance
              </FlowNode>
            </DiagramTooltip>

            <Arrow direction="down" />

            <DiagramTooltip content="Debezium коннектор #2 в secondary регионе. Независимо читает CDC события с локального Writer и публикует в Kafka Cluster #2.">
              <FlowNode variant="connector" tabIndex={0}>
                Debezium #2
              </FlowNode>
            </DiagramTooltip>

            <Arrow direction="down" />

            <DiagramTooltip content="Kafka Cluster #2 в secondary регионе. Независимый поток CDC событий. При сбое primary — consumer переключается на Kafka #2.">
              <FlowNode variant="cluster" tabIndex={0}>
                Kafka Cluster #2
              </FlowNode>
            </DiagramTooltip>
          </div>
        </DiagramContainer>
      </div>

      {/* Consumer Service */}
      <DiagramContainer title="Consumer Service (Multi-Region Merge)" color="amber">
        <div className="flex flex-col items-center gap-4">
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8">
            <div className="text-xs text-gray-400">Kafka #1</div>
            <Arrow direction="right" />
            <DiagramTooltip content="Потребитель мержит потоки из обоих регионов. Требуется дедупликация по event ID, так как одно событие может прийти из обоих источников при cross-region replication lag.">
              <FlowNode variant="app" tabIndex={0}>
                Consumer Service
              </FlowNode>
            </DiagramTooltip>
            <Arrow direction="left" />
            <div className="text-xs text-gray-400">Kafka #2</div>
          </div>

          <div className="text-xs text-gray-400 text-center">
            Требуется дедупликация по event ID при merge потоков
          </div>
        </div>
      </DiagramContainer>

      {/* Pros/Cons */}
      <div className="flex flex-col md:flex-row gap-4">
        <DiagramContainer title="Преимущества" color="emerald" className="flex-1">
          <ul className="text-xs text-gray-300 space-y-1">
            <li>+ CDC в двух регионах</li>
            <li>+ При failover в primary — secondary продолжает</li>
            <li>+ Можно мержить потоки с дедупликацией</li>
          </ul>
        </DiagramContainer>

        <DiagramContainer title="Недостатки" color="rose" className="flex-1">
          <ul className="text-xs text-gray-300 space-y-1">
            <li>- Увеличенная стоимость (2x инфраструктура)</li>
            <li>- Сложность инфраструктуры</li>
            <li>- Необходима дедупликация при merge</li>
          </ul>
        </DiagramContainer>
      </div>
    </div>
  );
}
