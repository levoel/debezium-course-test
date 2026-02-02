/**
 * Cloud SQL Diagrams for Module 7 Lesson 01
 *
 * Exports:
 * - CloudSqlCdcArchitectureDiagram: Cloud SQL → Debezium Server → Pub/Sub pipeline
 */

import { FlowNode } from '../primitives/FlowNode';
import { Arrow } from '../primitives/Arrow';
import { DiagramContainer } from '../primitives/DiagramContainer';
import { DiagramTooltip } from '../primitives/Tooltip';

/**
 * CloudSqlCdcArchitectureDiagram - Simple horizontal flow showing Kafka-less CDC
 */
export function CloudSqlCdcArchitectureDiagram() {
  return (
    <DiagramContainer
      title="Архитектура CDC на Cloud SQL"
      color="blue"
      description="Kafka-less CDC с использованием Google Cloud Pub/Sub"
    >
      <div className="flex flex-col md:flex-row items-center justify-center gap-3">
        <DiagramTooltip
          content={
            <div>
              <p className="font-semibold mb-1">Cloud SQL PostgreSQL</p>
              <p className="text-sm">Managed PostgreSQL с logical decoding.</p>
              <p className="text-sm mt-1">
                Logical Decoding преобразует WAL в структурированные события.
              </p>
            </div>
          }
        >
          <FlowNode variant="gcp-database" tabIndex={0}>
            Cloud SQL<br />PostgreSQL
          </FlowNode>
        </DiagramTooltip>

        <Arrow direction="right" label="WAL Events" />

        <DiagramTooltip
          content={
            <div>
              <p className="font-semibold mb-1">Debezium Server</p>
              <p className="text-sm">
                Standalone Quarkus приложение с source connector + sink adapter.
              </p>
              <p className="text-sm mt-1">
                Читает события из replication slot и публикует в Pub/Sub.
              </p>
            </div>
          }
        >
          <FlowNode variant="connector" tabIndex={0}>
            Debezium<br />Server
          </FlowNode>
        </DiagramTooltip>

        <Arrow direction="right" label="CDC Events" />

        <DiagramTooltip
          content={
            <div>
              <p className="font-semibold mb-1">Google Pub/Sub</p>
              <p className="text-sm">
                Managed message broker с автоматическим масштабированием.
              </p>
              <p className="text-sm mt-1">
                Заменяет Kafka в Kafka-less архитектуре.
              </p>
            </div>
          }
        >
          <FlowNode variant="gcp-messaging" tabIndex={0}>
            Pub/Sub<br />Topics
          </FlowNode>
        </DiagramTooltip>
      </div>

      <div className="mt-4 pt-3 border-t border-white/10 text-xs text-blue-200/70">
        <p>
          Replication Slot хранит позицию чтения и управляет удалением WAL файлов
        </p>
      </div>
    </DiagramContainer>
  );
}
