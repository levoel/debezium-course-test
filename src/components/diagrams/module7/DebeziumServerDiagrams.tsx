/**
 * Debezium Server Diagrams for Module 7 Lesson 02
 *
 * Exports:
 * - TraditionalKafkaArchitectureDiagram: Traditional Kafka Connect architecture
 * - KafkalessArchitectureDiagram: Debezium Server + Pub/Sub (simplified)
 * - DebeziumServerInternalDiagram: Internal structure of Debezium Server
 */

import { FlowNode } from '../primitives/FlowNode';
import { Arrow } from '../primitives/Arrow';
import { DiagramContainer } from '../primitives/DiagramContainer';
import { DiagramTooltip } from '../primitives/Tooltip';

/**
 * TraditionalKafkaArchitectureDiagram - Shows traditional Kafka Connect complexity
 */
export function TraditionalKafkaArchitectureDiagram() {
  return (
    <DiagramContainer
      title="Традиционная архитектура"
      color="amber"
      description="Kafka Connect с Kafka кластером"
    >
      <div className="flex flex-col items-center gap-3">
        <DiagramTooltip
          content={
            <div>
              <p className="font-semibold mb-1">PostgreSQL Source</p>
              <p className="text-sm">
                Source database с transactional data. Logical decoding захватывает изменения.
              </p>
            </div>
          }
        >
          <FlowNode variant="database" tabIndex={0}>
            PostgreSQL
          </FlowNode>
        </DiagramTooltip>

        <Arrow direction="down" label="WAL" />

        <DiagramTooltip
          content={
            <div>
              <p className="font-semibold mb-1">Debezium Connector</p>
              <p className="text-sm">
                PostgreSQL connector плагин для Kafka Connect. Читает WAL через logical replication.
              </p>
            </div>
          }
        >
          <FlowNode variant="connector" tabIndex={0}>
            Debezium Connector
          </FlowNode>
        </DiagramTooltip>

        <Arrow direction="down" />

        <DiagramTooltip
          content={
            <div>
              <p className="font-semibold mb-1">Kafka Connect</p>
              <p className="text-sm">
                Distributed runtime для коннекторов. Требует развертывания Connect workers.
              </p>
            </div>
          }
        >
          <FlowNode variant="connector" tabIndex={0}>
            Kafka Connect
          </FlowNode>
        </DiagramTooltip>

        <Arrow direction="down" />

        <DiagramTooltip
          content={
            <div>
              <p className="font-semibold mb-1">Kafka Cluster</p>
              <p className="text-sm text-rose-300">
                Требует развертывания и поддержки Zookeeper + brokers + Connect workers.
              </p>
              <p className="text-sm mt-2">
                Высокая операционная сложность для простых CDC пайплайнов.
              </p>
            </div>
          }
        >
          <FlowNode variant="cluster" className="border-rose-400/50" tabIndex={0}>
            Kafka Cluster
          </FlowNode>
        </DiagramTooltip>

        <Arrow direction="down" />

        <div className="flex gap-2">
          <DiagramTooltip
            content={
              <div>
                <p className="font-semibold mb-1">Consumer 1</p>
                <p className="text-sm">Application consumer читает CDC события из Kafka.</p>
              </div>
            }
          >
            <FlowNode variant="app" size="sm" tabIndex={0}>
              Consumer 1
            </FlowNode>
          </DiagramTooltip>

          <DiagramTooltip
            content={
              <div>
                <p className="font-semibold mb-1">Consumer 2</p>
                <p className="text-sm">Application consumer читает CDC события из Kafka.</p>
              </div>
            }
          >
            <FlowNode variant="app" size="sm" tabIndex={0}>
              Consumer 2
            </FlowNode>
          </DiagramTooltip>

          <DiagramTooltip
            content={
              <div>
                <p className="font-semibold mb-1">Kafka Streams</p>
                <p className="text-sm">Stream processing приложение для real-time обработки.</p>
              </div>
            }
          >
            <FlowNode variant="app" size="sm" tabIndex={0}>
              Streams
            </FlowNode>
          </DiagramTooltip>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-white/10 text-xs text-amber-200/70">
        <p>Высокая операционная сложность: Kafka + Zookeeper/KRaft + Connect</p>
      </div>
    </DiagramContainer>
  );
}

/**
 * KafkalessArchitectureDiagram - Shows Debezium Server simplicity
 */
export function KafkalessArchitectureDiagram() {
  return (
    <DiagramContainer
      title="Kafka-less архитектура"
      color="emerald"
      description="Debezium Server + Pub/Sub (упрощенная инфраструктура)"
    >
      <div className="flex flex-col items-center gap-3">
        <DiagramTooltip
          content={
            <div>
              <p className="font-semibold mb-1">Cloud SQL PostgreSQL</p>
              <p className="text-sm">
                Managed PostgreSQL с logical decoding. Автоматические бэкапы и HA.
              </p>
            </div>
          }
        >
          <FlowNode variant="gcp-database" tabIndex={0}>
            Cloud SQL PostgreSQL
          </FlowNode>
        </DiagramTooltip>

        <Arrow direction="down" label="WAL" />

        <DiagramTooltip
          content={
            <div>
              <p className="font-semibold mb-1">Debezium Server</p>
              <p className="text-sm text-emerald-300">
                Standalone Quarkus приложение — один контейнер вместо Kafka cluster.
              </p>
              <p className="text-sm mt-2">
                Source connector + sink adapter в одном процессе. Простота развертывания.
              </p>
            </div>
          }
        >
          <FlowNode variant="connector" tabIndex={0}>
            Debezium Server
          </FlowNode>
        </DiagramTooltip>

        <Arrow direction="down" label="CDC Events" />

        <DiagramTooltip
          content={
            <div>
              <p className="font-semibold mb-1">Google Pub/Sub</p>
              <p className="text-sm text-emerald-300">
                Pub/Sub автоматическое масштабирование заменяет Kafka партиции.
              </p>
              <p className="text-sm mt-2">
                Managed service — нет операционных затрат на поддержку брокеров.
              </p>
            </div>
          }
        >
          <FlowNode variant="gcp-messaging" tabIndex={0}>
            Google Pub/Sub
          </FlowNode>
        </DiagramTooltip>

        <Arrow direction="down" />

        <div className="flex gap-2">
          <DiagramTooltip
            content={
              <div>
                <p className="font-semibold mb-1">Cloud Run</p>
                <p className="text-sm">
                  Serverless container platform. Автоматическое масштабирование от 0 до N.
                </p>
              </div>
            }
          >
            <FlowNode variant="gcp-compute" size="sm" tabIndex={0}>
              Cloud Run
            </FlowNode>
          </DiagramTooltip>

          <DiagramTooltip
            content={
              <div>
                <p className="font-semibold mb-1">Dataflow</p>
                <p className="text-sm">
                  Managed Apache Beam для stream и batch processing.
                </p>
              </div>
            }
          >
            <FlowNode variant="gcp-compute" size="sm" tabIndex={0}>
              Dataflow
            </FlowNode>
          </DiagramTooltip>

          <DiagramTooltip
            content={
              <div>
                <p className="font-semibold mb-1">BigQuery</p>
                <p className="text-sm">
                  Data warehouse с Pub/Sub subscription для real-time ingestion.
                </p>
              </div>
            }
          >
            <FlowNode variant="gcp-storage" size="sm" tabIndex={0}>
              BigQuery
            </FlowNode>
          </DiagramTooltip>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-white/10 text-xs text-emerald-200/70">
        <p>Простая инфраструктура, serverless, низкие операционные затраты</p>
      </div>
    </DiagramContainer>
  );
}

/**
 * DebeziumServerInternalDiagram - Shows internal structure of Debezium Server
 */
export function DebeziumServerInternalDiagram() {
  return (
    <DiagramContainer
      title="Debezium Server внутренняя архитектура"
      color="purple"
      description="Standalone Quarkus приложение с source connector + sink adapter"
    >
      <div className="flex flex-col items-center gap-4">
        {/* External source */}
        <DiagramTooltip
          content={
            <div>
              <p className="font-semibold mb-1">Cloud SQL PostgreSQL</p>
              <p className="text-sm">
                External source database. Logical replication захватывает изменения в real-time.
              </p>
            </div>
          }
        >
          <FlowNode variant="gcp-database" tabIndex={0}>
            Cloud SQL PostgreSQL
          </FlowNode>
        </DiagramTooltip>

        <Arrow direction="down" label="WAL Stream" />

        {/* Debezium Server internals */}
        <DiagramContainer
          title="Debezium Server (Quarkus App)"
          color="blue"
          className="w-full"
        >
          <div className="flex flex-col items-center gap-3">
            <DiagramTooltip
              content={
                <div>
                  <p className="font-semibold mb-1">PostgreSQL Connector</p>
                  <p className="text-sm">
                    Source connector читает WAL через logical decoding. Создает replication slot.
                  </p>
                  <p className="text-sm mt-2">
                    Преобразует WAL events в Debezium CDC события.
                  </p>
                </div>
              }
            >
              <FlowNode variant="connector" size="sm" tabIndex={0}>
                PostgreSQL Connector
              </FlowNode>
            </DiagramTooltip>

            <Arrow direction="down" />

            <DiagramTooltip
              content={
                <div>
                  <p className="font-semibold mb-1">Event Buffer</p>
                  <p className="text-sm">
                    Внутренний буфер для batch обработки событий. Снижает количество API calls к Pub/Sub.
                  </p>
                  <p className="text-sm mt-2">
                    Настраивается через max.batch.size и poll.interval.ms.
                  </p>
                </div>
              }
            >
              <FlowNode variant="app" size="sm" tabIndex={0}>
                Event Buffer
              </FlowNode>
            </DiagramTooltip>

            <Arrow direction="down" />

            <DiagramTooltip
              content={
                <div>
                  <p className="font-semibold mb-1">Pub/Sub Sink Adapter</p>
                  <p className="text-sm">
                    Sink adapter публикует события в Pub/Sub topics. Ordering key для сохранения порядка.
                  </p>
                  <p className="text-sm mt-2">
                    Retry logic для устойчивости к сбоям Pub/Sub API.
                  </p>
                </div>
              }
            >
              <FlowNode variant="gcp-messaging" size="sm" tabIndex={0}>
                Pub/Sub Sink Adapter
              </FlowNode>
            </DiagramTooltip>
          </div>
        </DiagramContainer>

        <Arrow direction="down" />

        <DiagramTooltip
          content={
            <div>
              <p className="font-semibold mb-1">Google Pub/Sub</p>
              <p className="text-sm">
                External message broker. Автоматическое масштабирование и HA out-of-the-box.
              </p>
            </div>
          }
        >
          <FlowNode variant="gcp-messaging" tabIndex={0}>
            Google Pub/Sub
          </FlowNode>
        </DiagramTooltip>

        {/* Offset storage options */}
        <div className="mt-4 pt-4 border-t border-white/10 w-full">
          <h3 className="text-sm font-semibold text-purple-200 mb-2 text-center">
            Offset Storage
          </h3>
          <div className="flex justify-center gap-3">
            <DiagramTooltip
              content={
                <div>
                  <p className="font-semibold mb-1">File Storage</p>
                  <p className="text-sm">
                    Offset хранится в файле offsets.dat. Подходит для single instance deployment.
                  </p>
                  <p className="text-sm mt-2 text-amber-300">
                    Требует PersistentVolume в Kubernetes для сохранения при restart.
                  </p>
                </div>
              }
            >
              <FlowNode
                variant="app"
                size="sm"
                className="border-amber-400/50"
                tabIndex={0}
              >
                File Storage
              </FlowNode>
            </DiagramTooltip>

            <DiagramTooltip
              content={
                <div>
                  <p className="font-semibold mb-1">Redis Storage</p>
                  <p className="text-sm">
                    Offset хранится в Redis. Подходит для HA deployment с несколькими репликами.
                  </p>
                  <p className="text-sm mt-2 text-emerald-300">
                    Автоматическая репликация offset через Redis — быстрое восстановление при failover.
                  </p>
                </div>
              }
            >
              <FlowNode
                variant="sink"
                size="sm"
                className="border-emerald-400/50"
                tabIndex={0}
              >
                Redis Storage
              </FlowNode>
            </DiagramTooltip>
          </div>
          <p className="text-xs text-purple-200/70 mt-3 text-center">
            Offset storage критичен: без persistent storage при перезапуске pod потеряет позицию
          </p>
        </div>
      </div>
    </DiagramContainer>
  );
}
