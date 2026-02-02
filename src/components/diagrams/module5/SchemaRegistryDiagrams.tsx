/**
 * Schema Registry Diagrams
 *
 * Exports:
 * - SchemaRegistryIntegrationDiagram: Architecture showing producer/consumer schema flow
 */

import { FlowNode } from '../primitives/FlowNode';
import { Arrow } from '../primitives/Arrow';
import { DiagramContainer } from '../primitives/DiagramContainer';
import { DiagramTooltip } from '../primitives/Tooltip';

/**
 * SchemaRegistryIntegrationDiagram - Shows Schema Registry architecture with Debezium
 */
export function SchemaRegistryIntegrationDiagram() {
  return (
    <DiagramContainer
      title="Schema Registry Architecture с Debezium"
      color="purple"
      description="Centralized schema management для producer и consumer"
    >
      <div className="flex flex-col items-center gap-4">
        {/* PostgreSQL source */}
        <DiagramTooltip
          content={
            <div>
              <strong>PostgreSQL Database</strong>
              <p className="mt-1">
                Источник CDC событий. Изменения фиксируются в WAL и читаются
                Debezium connector.
              </p>
            </div>
          }
        >
          <FlowNode variant="database" tabIndex={0}>
            PostgreSQL
          </FlowNode>
        </DiagramTooltip>

        <Arrow direction="down" label="WAL capture" />

        {/* Debezium with Avro Serializer */}
        <DiagramTooltip
          content={
            <div>
              <strong>Debezium + Avro Serializer</strong>
              <p className="mt-1">
                Debezium connector конвертирует CDC события в Avro формат.
                Avro Converter использует Schema Registry для регистрации схем.
              </p>
              <p className="mt-2 text-purple-300">
                value.converter=io.confluent.connect.avro.AvroConverter
              </p>
            </div>
          }
        >
          <FlowNode variant="connector" tabIndex={0}>
            Debezium + Avro Serializer
          </FlowNode>
        </DiagramTooltip>

        <Arrow direction="down" label="Register schema" />

        {/* Schema Registry - central component */}
        <DiagramTooltip
          content={
            <div>
              <strong>Schema Registry</strong>
              <p className="mt-1">
                Centralized schema storage. Хранит все версии схем с
                compatibility проверками. Выдает schema ID для каждой схемы.
              </p>
              <p className="mt-2 text-sm">
                <strong>Producer регистрирует схему:</strong>
                <br />POST /subjects/&lt;topic&gt;-value/versions
              </p>
              <p className="mt-2 text-sm">
                <strong>Consumer запрашивает схему:</strong>
                <br />GET /schemas/ids/&lt;schema-id&gt;
              </p>
              <p className="mt-2 text-purple-300">
                Schema Registry предотвращает несовместимые изменения
              </p>
            </div>
          }
        >
          <FlowNode
            variant="sink"
            className="bg-purple-500/20 border-purple-400/30 text-purple-200"
            tabIndex={0}
          >
            Schema Registry
            <span className="block text-xs text-gray-400 mt-1">
              Confluent / Apicurio
            </span>
          </FlowNode>
        </DiagramTooltip>

        <div className="flex items-center gap-8 mt-2">
          {/* Producer flow (left) */}
          <div className="flex flex-col items-center gap-2">
            <Arrow direction="down" label="Schema ID: 123" />

            <DiagramTooltip
              content={
                <div>
                  <strong>Avro Message Format</strong>
                  <p className="mt-1">
                    Сообщение содержит только schema ID (4 bytes) + binary data.
                    Полная схема НЕ включается в каждое сообщение — это экономит
                    ~300 bytes на сообщение.
                  </p>
                  <p className="mt-2 text-sm font-mono text-purple-300">
                    [magic_byte] [schema_id] [binary_data]
                  </p>
                  <p className="mt-1 text-xs">
                    magic_byte = 0x00, schema_id = 4 bytes (BigEndian)
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
                <div className="text-xs font-mono">
                  [0x00][123][binary data]
                </div>
              </FlowNode>
            </DiagramTooltip>
          </div>
        </div>

        <Arrow direction="down" />

        {/* Kafka Topic */}
        <DiagramTooltip
          content={
            <div>
              <strong>Kafka Topic</strong>
              <p className="mt-1">
                Хранит Avro-encoded сообщения. Размер сообщений на ~50% меньше
                по сравнению с JSON.
              </p>
            </div>
          }
        >
          <FlowNode variant="app" tabIndex={0}>
            Kafka Topic
          </FlowNode>
        </DiagramTooltip>

        <Arrow direction="down" />

        {/* Consumer flow */}
        <DiagramTooltip
          content={
            <div>
              <strong>Consumer + Avro Deserializer</strong>
              <p className="mt-1">
                Consumer читает сообщение, извлекает schema ID из первых 5 bytes.
                Запрашивает схему из Schema Registry по ID.
              </p>
              <p className="mt-2 text-emerald-300">
                Schema caching: после первого запроса schema кэшируется локально
              </p>
            </div>
          }
        >
          <FlowNode variant="app" tabIndex={0}>
            Consumer + Avro Deserializer
          </FlowNode>
        </DiagramTooltip>

        <Arrow direction="down" label="GET schema by ID" />

        {/* Schema Registry lookup */}
        <DiagramTooltip
          content={
            <div>
              <strong>Schema Registry Lookup</strong>
              <p className="mt-1">
                Consumer запрашивает схему по ID: GET /schemas/ids/123.
                Schema Registry возвращает полную Avro schema.
              </p>
              <p className="mt-2 text-xs text-gray-400">
                Если schema уже в кэше — запрос не выполняется (caching)
              </p>
            </div>
          }
        >
          <FlowNode
            variant="sink"
            size="sm"
            className="bg-purple-500/20 border-purple-400/30 text-purple-200"
            tabIndex={0}
          >
            Schema Registry
          </FlowNode>
        </DiagramTooltip>

        <Arrow direction="down" label="Return schema" />

        {/* Deserialized data */}
        <DiagramTooltip
          content={
            <div>
              <strong>Deserialized Data</strong>
              <p className="mt-1">
                Consumer десериализует binary data в Java/Python объект
                используя полученную схему. Compatibility mode гарантирует
                безопасность десериализации.
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
            Deserialized Object
          </FlowNode>
        </DiagramTooltip>

        <div className="mt-4 text-sm text-purple-400 border-l-2 border-purple-400 pl-3">
          <strong>Ключевое преимущество:</strong>
          <p className="mt-1 text-gray-300">
            Schema хранится один раз в Schema Registry. Сообщения содержат только
            4-byte schema ID. Экономия: ~300 bytes на сообщение, что критично для
            CDC pipeline с миллионами событий.
          </p>
        </div>
      </div>
    </DiagramContainer>
  );
}
