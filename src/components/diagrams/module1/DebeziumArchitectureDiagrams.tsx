/**
 * Debezium Architecture Diagrams
 *
 * Exports:
 * - DeploymentModesDiagram: Three deployment modes comparison
 * - KafkaConnectClusterDiagram: Kafka Connect internal architecture
 * - CdcEventFlowDiagram: Complete CDC event flow sequence
 */

import { FlowNode } from '../primitives/FlowNode';
import { Arrow } from '../primitives/Arrow';
import { DiagramContainer } from '../primitives/DiagramContainer';
import { DiagramTooltip } from '../primitives/Tooltip';
import { SequenceDiagram } from '../primitives/SequenceDiagram';
import type { SequenceActorDef, SequenceMessageDef } from '../primitives/types';

/**
 * DeploymentModesDiagram - Three Debezium deployment modes
 */
export function DeploymentModesDiagram() {
  return (
    <div className="flex flex-col xl:flex-row gap-6">
      {/* Mode 1: Kafka Connect (recommended) */}
      <DiagramContainer
        title="Kafka Connect"
        color="emerald"
        recommended={true}
        className="flex-1"
      >
        <div className="flex flex-col items-center gap-4">
          <DiagramTooltip content="Исходная база данных с включенной logical replication. Debezium подключается через replication slot.">
            <FlowNode variant="database" tabIndex={0}>
              PostgreSQL
            </FlowNode>
          </DiagramTooltip>

          <Arrow direction="down" label="WAL" />

          <DiagramTooltip content="Рекомендуемый режим для 90% случаев. Debezium работает как коннектор внутри Kafka Connect, который обеспечивает масштабирование, отказоустойчивость и управление offsets автоматически.">
            <FlowNode variant="connector" tabIndex={0}>
              Debezium Connector
            </FlowNode>
          </DiagramTooltip>

          <Arrow direction="down" label="CDC Events" />

          <DiagramTooltip content="Кластер workers, распределяющих нагрузку. REST API на порту 8083 для управления коннекторами.">
            <FlowNode variant="cluster" tabIndex={0} size="sm">
              KC Cluster
            </FlowNode>
          </DiagramTooltip>

          <Arrow direction="down" />

          <DiagramTooltip content="Apache Kafka хранит поток CDC-событий и доставляет их потребителям. События сохраняются и могут быть перечитаны при необходимости.">
            <FlowNode variant="cluster" tabIndex={0}>
              Kafka
            </FlowNode>
          </DiagramTooltip>
        </div>
      </DiagramContainer>

      {/* Mode 2: Debezium Server */}
      <DiagramContainer
        title="Debezium Server"
        color="blue"
        className="flex-1"
      >
        <div className="flex flex-col items-center gap-4">
          <DiagramTooltip content="Исходная база данных с включенной logical replication. Debezium подключается через replication slot.">
            <FlowNode variant="database" tabIndex={0}>
              PostgreSQL
            </FlowNode>
          </DiagramTooltip>

          <Arrow direction="down" label="WAL" />

          <DiagramTooltip content="Standalone приложение для сценариев без Kafka. Читает WAL и отправляет события напрямую в облачные сервисы: Google Pub/Sub, AWS Kinesis, Azure Event Hubs.">
            <FlowNode variant="connector" tabIndex={0}>
              Debezium Server
            </FlowNode>
          </DiagramTooltip>

          <Arrow direction="down" label="CDC Events" />

          <DiagramTooltip content="Адаптер для отправки событий в облачные сервисы без промежуточного Kafka.">
            <FlowNode variant="sink" tabIndex={0}>
              Cloud Sink
            </FlowNode>
          </DiagramTooltip>

          <Arrow direction="down" />

          <div className="text-xs text-gray-400 text-center px-4">
            Pub/Sub, Kinesis, Event Hubs
          </div>
        </div>
      </DiagramContainer>

      {/* Mode 3: Embedded Engine */}
      <DiagramContainer
        title="Embedded Engine"
        color="rose"
        className="flex-1"
      >
        <div className="flex flex-col items-center gap-4">
          <DiagramTooltip content="Исходная база данных с включенной logical replication. Debezium подключается через replication slot.">
            <FlowNode variant="database" tabIndex={0}>
              PostgreSQL
            </FlowNode>
          </DiagramTooltip>

          <Arrow direction="down" label="WAL" />

          <DiagramTooltip content="Максимальный контроль — Debezium встраивается как библиотека в Java-приложение. Минимальная latency, но вы сами отвечаете за offset management и отказоустойчивость.">
            <FlowNode variant="app" tabIndex={0}>
              Java Application
              <br />
              <span className="text-xs opacity-75">(embedded Debezium)</span>
            </FlowNode>
          </DiagramTooltip>

          <Arrow direction="down" label="CDC Events" />

          <DiagramTooltip content="Любой целевой источник данных: база данных, файловое хранилище, API, очередь сообщений. Полная свобода в выборе назначения.">
            <FlowNode variant="target" tabIndex={0}>
              Any Target
            </FlowNode>
          </DiagramTooltip>
        </div>
      </DiagramContainer>
    </div>
  );
}

/**
 * KafkaConnectClusterDiagram - Internal architecture of Kafka Connect
 */
export function KafkaConnectClusterDiagram() {
  return (
    <div className="flex flex-col gap-6">
      {/* Top: REST API */}
      <div className="flex flex-col items-center gap-4">
        <DiagramTooltip content="HTTP API на порту 8083 для создания, настройки и управления коннекторами. Основной интерфейс администрирования.">
          <FlowNode variant="app" tabIndex={0} size="sm">
            REST API :8083
          </FlowNode>
        </DiagramTooltip>

        <Arrow direction="down" label="Управление" />
      </div>

      {/* Middle: Cluster and Topics */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Cluster */}
        <DiagramContainer
          title="CLUSTER"
          color="emerald"
          className="flex-1"
        >
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap justify-center gap-3">
              <DiagramTooltip content="JVM процессы, выполняющие коннекторы. В distributed mode образуют кластер и автоматически распределяют tasks между собой.">
                <FlowNode variant="connector" tabIndex={0} size="sm">
                  Worker 1
                </FlowNode>
              </DiagramTooltip>

              <DiagramTooltip content="JVM процессы, выполняющие коннекторы. В distributed mode образуют кластер и автоматически распределяют tasks между собой.">
                <FlowNode variant="connector" tabIndex={0} size="sm">
                  Worker 2
                </FlowNode>
              </DiagramTooltip>

              <DiagramTooltip content="JVM процессы, выполняющие коннекторы. В distributed mode образуют кластер и автоматически распределяют tasks между собой.">
                <FlowNode variant="connector" tabIndex={0} size="sm">
                  Worker 3
                </FlowNode>
              </DiagramTooltip>
            </div>

            <div className="text-xs text-gray-400 text-center">
              ↔ Координация между workers
            </div>
          </div>
        </DiagramContainer>

        {/* Internal Topics */}
        <DiagramContainer
          title="INTERNAL TOPICS"
          color="purple"
          className="flex-1"
        >
          <div className="flex flex-col items-center gap-3">
            <DiagramTooltip content="Kafka топик хранящий конфигурации всех коннекторов. Реплицируется между workers.">
              <FlowNode variant="database" tabIndex={0} size="sm">
                connect-configs
              </FlowNode>
            </DiagramTooltip>

            <DiagramTooltip content="Топик с позициями чтения (где остановились в WAL). Критичен для exactly-once семантики.">
              <FlowNode variant="database" tabIndex={0} size="sm">
                connect-offsets
              </FlowNode>
            </DiagramTooltip>

            <DiagramTooltip content="Статусы коннекторов и tasks. Используется для мониторинга и health checks.">
              <FlowNode variant="database" tabIndex={0} size="sm">
                connect-status
              </FlowNode>
            </DiagramTooltip>
          </div>
        </DiagramContainer>
      </div>

      {/* Bottom: Output */}
      <div className="flex flex-col items-center gap-4">
        <Arrow direction="down" label="Публикация" />

        <DiagramTooltip content="Топики с CDC-событиями. Именование: {topic.prefix}.{schema}.{table}">
          <FlowNode variant="cluster" tabIndex={0}>
            Data Topics
          </FlowNode>
        </DiagramTooltip>
      </div>
    </div>
  );
}

/**
 * CdcEventFlowDiagram - Complete CDC event flow with Kafka Connect
 */
export function CdcEventFlowDiagram() {
  const actors: SequenceActorDef[] = [
    {
      id: 'app',
      label: 'App',
      variant: 'service',
      tooltip: 'Приложение выполняет операции с базой данных. Не знает о CDC.',
    },
    {
      id: 'pg',
      label: 'PostgreSQL',
      variant: 'database',
      tooltip: 'СУБД принимает SQL-команды и записывает изменения в WAL.',
    },
    {
      id: 'wal',
      label: 'WAL',
      variant: 'queue',
      tooltip: 'Transaction Log хранит последовательность всех изменений.',
    },
    {
      id: 'debezium',
      label: 'Debezium',
      variant: 'service',
      tooltip: 'CDC-коннектор читает WAL через replication slot.',
    },
    {
      id: 'kc',
      label: 'KC',
      variant: 'service',
      tooltip: 'Kafka Connect управляет коннектором и сохраняет offsets.',
    },
    {
      id: 'kafka',
      label: 'Kafka',
      variant: 'queue',
      tooltip: 'Брокер сообщений хранит события в топиках.',
    },
    {
      id: 'consumer',
      label: 'Consumer',
      variant: 'external',
      tooltip: 'Потребитель получает CDC-события.',
    },
  ];

  const messages: SequenceMessageDef[] = [
    {
      id: 'msg1',
      from: 'app',
      to: 'pg',
      label: 'UPDATE',
      variant: 'sync',
      tooltip: 'SQL команда изменения данных. PostgreSQL выполняет её в рамках транзакции.',
    },
    {
      id: 'msg2',
      from: 'pg',
      to: 'wal',
      label: 'Write to WAL',
      variant: 'sync',
      tooltip: 'PostgreSQL записывает изменение в transaction log перед подтверждением. Гарантирует durability.',
    },
    {
      id: 'msg3',
      from: 'pg',
      to: 'app',
      label: 'OK',
      variant: 'return',
    },
    {
      id: 'msg4',
      from: 'debezium',
      to: 'wal',
      label: 'Replication slot',
      variant: 'async',
      tooltip: 'Debezium читает WAL через replication slot — механизм, гарантирующий что изменения не будут удалены до прочтения.',
    },
    {
      id: 'msg5',
      from: 'wal',
      to: 'debezium',
      label: 'pgoutput',
      variant: 'return',
      tooltip: 'Встроенный плагин PostgreSQL для logical decoding. Преобразует WAL в читаемый формат без установки дополнительного ПО.',
    },
    {
      id: 'msg6',
      from: 'debezium',
      to: 'kc',
      label: 'CDC format',
      variant: 'sync',
      tooltip: 'Debezium преобразует pgoutput в универсальный envelope-формат с полями before/after/op/source.',
    },
    {
      id: 'msg7',
      from: 'kc',
      to: 'kafka',
      label: 'Publish to topic',
      variant: 'async',
      tooltip: 'Событие публикуется в Kafka топик inventory.public.customers. Kafka подтверждает запись.',
    },
    {
      id: 'msg8',
      from: 'kafka',
      to: 'kc',
      label: 'ACK',
      variant: 'return',
    },
    {
      id: 'msg9',
      from: 'kc',
      to: 'kc',
      label: 'Save offset',
      variant: 'sync',
      tooltip: 'Kafka Connect сохраняет позицию в connect-offsets. При перезапуске продолжит с этого места.',
    },
    {
      id: 'msg10',
      from: 'consumer',
      to: 'kafka',
      label: 'poll()',
      variant: 'async',
    },
    {
      id: 'msg11',
      from: 'kafka',
      to: 'consumer',
      label: 'CDC Event',
      variant: 'return',
    },
  ];

  return (
    <div className="w-full">
      <div className="mb-4 p-3 rounded-lg bg-blue-500/10 border border-blue-400/30">
        <p className="text-xs text-blue-200">
          <strong>Logical Replication Protocol:</strong> PostgreSQL встроенный механизм для чтения WAL
        </p>
      </div>
      <SequenceDiagram
        actors={actors}
        messages={messages}
        messageSpacing={50}
      />
    </div>
  );
}
