/**
 * Cloud Run Event-Driven Diagrams for Module 7 Lesson 05
 *
 * Exports:
 * - PubSubEventarcCloudRunDiagram: Serverless event routing (Pub/Sub → Eventarc → Cloud Run)
 * - AutoScalingBehaviorSequence: Dynamic scaling based on concurrency
 * - EndToEndEventProcessingSequence: Complete flow from Cloud SQL to external API
 */

import { FlowNode } from '../primitives/FlowNode';
import { Arrow } from '../primitives/Arrow';
import { DiagramContainer } from '../primitives/DiagramContainer';
import { DiagramTooltip } from '../primitives/Tooltip';
import { SequenceDiagram } from '../primitives/SequenceDiagram';

/**
 * PubSubEventarcCloudRunDiagram - Shows serverless event routing
 */
export function PubSubEventarcCloudRunDiagram() {
  return (
    <DiagramContainer
      title="Pub/Sub → Eventarc → Cloud Run"
      color="emerald"
      description="Serverless event-driven обработка CDC событий"
    >
      <div className="flex flex-col md:flex-row items-center justify-center gap-3">
        <DiagramTooltip content="Debezium Server публикует CDC события в Pub/Sub topics">
          <FlowNode variant="connector" tabIndex={0}>
            Debezium<br/>Server
          </FlowNode>
        </DiagramTooltip>

        <Arrow direction="right" label="CDC Events" />

        <DiagramTooltip content="Pub/Sub Topics с ordering enabled для сохранения порядка">
          <FlowNode variant="gcp-messaging" tabIndex={0}>
            Pub/Sub<br/>Topic
          </FlowNode>
        </DiagramTooltip>

        <Arrow direction="right" label="Push subscription" />

        <DiagramTooltip
          content={
            <div>
              <p className="font-semibold mb-1">Eventarc Trigger</p>
              <p className="text-sm">Связывает Pub/Sub топик с Cloud Run сервисом автоматически</p>
              <p className="text-sm mt-1">Filter: event type, source, attributes</p>
            </div>
          }
        >
          <FlowNode variant="gcp-compute" tabIndex={0}>
            Eventarc<br/>Trigger
          </FlowNode>
        </DiagramTooltip>

        <Arrow direction="right" label="HTTP POST" />

        <DiagramTooltip
          content={
            <div>
              <p className="font-semibold mb-1">Cloud Run Service</p>
              <p className="text-sm">Serverless контейнер с auto-scaling</p>
              <p className="text-sm mt-1">Scale to zero при отсутствии трафика</p>
              <p className="text-sm mt-1">Concurrency: 80 requests/container</p>
            </div>
          }
        >
          <FlowNode variant="gcp-compute" tabIndex={0}>
            Cloud Run<br/>Service
          </FlowNode>
        </DiagramTooltip>
      </div>

      <div className="mt-4 pt-3 border-t border-white/10 text-xs text-emerald-200/70">
        <p>Pub/Sub base64-кодирует данные в message.data — нужно декодировать → JSON</p>
        <p className="mt-1">min-instances=0 позволяет scale to zero (cost optimization)</p>
      </div>
    </DiagramContainer>
  );
}

/**
 * AutoScalingBehaviorSequence - Shows dynamic scaling based on concurrency
 */
export function AutoScalingBehaviorSequence() {
  return (
    <DiagramContainer
      title="Auto-Scaling Behavior"
      color="amber"
      description="Cloud Run масштабируется на основе concurrency"
    >
      <SequenceDiagram
        actors={[
          {
            id: 'pubsub',
            label: 'Pub/Sub Messages',
            variant: 'queue',
            tooltip: "Backlog of unprocessed messages"
          },
          {
            id: 'cr1',
            label: 'Cloud Run Instance 1',
            variant: 'service',
            tooltip: "First instance (always running if min-instances=1)"
          },
          {
            id: 'cr2',
            label: 'Cloud Run Instance 2',
            variant: 'service',
            tooltip: "Auto-scaled instance when concurrency > 80"
          },
          {
            id: 'cr3',
            label: 'Cloud Run Instance 3',
            variant: 'service',
            tooltip: "Additional instance for high load"
          }
        ]}
        messages={[
          {
            id: '1',
            from: 'pubsub',
            to: 'cr1',
            label: '50 messages',
            variant: 'async',
            tooltip: "Concurrency < 80 → один instance достаточно"
          },
          {
            id: '2',
            from: 'pubsub',
            to: 'cr1',
            label: '100 messages (overload)',
            variant: 'async',
            tooltip: "Concurrency > 80 → Cloud Run создает новый instance"
          },
          {
            id: '3',
            from: 'pubsub',
            to: 'cr2',
            label: 'Scale up (new instance)',
            variant: 'async',
            tooltip: "Instance 2 появляется через ~10 секунд"
          },
          {
            id: '4',
            from: 'pubsub',
            to: 'cr1',
            label: '200 messages',
            variant: 'async'
          },
          {
            id: '5',
            from: 'pubsub',
            to: 'cr2',
            label: '200 messages',
            variant: 'async'
          },
          {
            id: '6',
            from: 'pubsub',
            to: 'cr3',
            label: 'Scale up (3rd instance)',
            variant: 'async',
            tooltip: "Max instances ограничен в конфигурации (default: 100)"
          }
        ]}
        messageSpacing={45}
      />

      <div className="mt-4 pt-3 border-t border-white/10 text-xs text-amber-200/70">
        <p>Cloud Run масштабируется автоматически на основе:</p>
        <ul className="mt-1 space-y-1">
          <li>• Concurrency: requests на контейнер (default: 80)</li>
          <li>• CPU/Memory utilization (если указаны в конфигурации)</li>
        </ul>
      </div>
    </DiagramContainer>
  );
}

/**
 * EndToEndEventProcessingSequence - Complete flow from Cloud SQL to external API
 */
export function EndToEndEventProcessingSequence() {
  return (
    <DiagramContainer
      title="End-to-End Event Processing"
      color="purple"
      description="Полный цикл от INSERT в Cloud SQL до вызова external API"
    >
      <SequenceDiagram
        actors={[
          {
            id: 'cloudsql',
            label: 'Cloud SQL',
            variant: 'database',
            tooltip: "PostgreSQL с logical decoding"
          },
          {
            id: 'debezium',
            label: 'Debezium Server',
            variant: 'service',
            tooltip: "CDC engine reading WAL"
          },
          {
            id: 'pubsub',
            label: 'Pub/Sub',
            variant: 'queue',
            tooltip: "Message broker"
          },
          {
            id: 'eventarc',
            label: 'Eventarc',
            variant: 'service',
            tooltip: "Event routing"
          },
          {
            id: 'cloudrun',
            label: 'Cloud Run',
            variant: 'service',
            tooltip: "Event handler"
          },
          {
            id: 'api',
            label: 'External API',
            variant: 'external',
            tooltip: "CRM, Email, Analytics"
          }
        ]}
        messages={[
          {
            id: '1',
            from: 'cloudsql',
            to: 'cloudsql',
            label: 'INSERT order',
            variant: 'sync',
            tooltip: "Приложение создает новый заказ"
          },
          {
            id: '2',
            from: 'cloudsql',
            to: 'debezium',
            label: 'WAL event',
            variant: 'async',
            tooltip: "Debezium читает через replication slot"
          },
          {
            id: '3',
            from: 'debezium',
            to: 'pubsub',
            label: 'CDC event (JSON)',
            variant: 'async',
            tooltip: "Debezium публикует в cdc.public.orders topic"
          },
          {
            id: '4',
            from: 'pubsub',
            to: 'eventarc',
            label: 'Push message',
            variant: 'async',
            tooltip: "Pub/Sub push subscription → Eventarc"
          },
          {
            id: '5',
            from: 'eventarc',
            to: 'cloudrun',
            label: 'HTTP POST (base64 data)',
            variant: 'sync',
            tooltip: "Eventarc вызывает Cloud Run endpoint"
          },
          {
            id: '6',
            from: 'cloudrun',
            to: 'cloudrun',
            label: 'Decode & Process',
            variant: 'sync',
            tooltip: "Декодирование base64, parse JSON, business logic"
          },
          {
            id: '7',
            from: 'cloudrun',
            to: 'api',
            label: 'API call (customer notification)',
            variant: 'sync',
            tooltip: "Отправка уведомления через external API"
          },
          {
            id: '8',
            from: 'api',
            to: 'cloudrun',
            label: 'Success response',
            variant: 'response'
          },
          {
            id: '9',
            from: 'cloudrun',
            to: 'eventarc',
            label: 'HTTP 200 OK',
            variant: 'response',
            tooltip: "Cloud Run возвращает успех → Pub/Sub acks message"
          }
        ]}
        messageSpacing={50}
      />

      <div className="mt-4 pt-3 border-t border-white/10 text-xs text-purple-200/70">
        <p className="font-semibold mb-1">Latency breakdown (typical):</p>
        <ul className="space-y-1">
          <li>• Cloud SQL → Debezium: 100-500ms (WAL polling interval)</li>
          <li>• Debezium → Pub/Sub: 10-50ms (network latency)</li>
          <li>• Pub/Sub → Cloud Run: 50-200ms (cold start если scale from zero)</li>
          <li>• Cloud Run → External API: depends on API (50-500ms)</li>
          <li>• <span className="font-semibold">Total: ~500-2000ms end-to-end</span></li>
        </ul>
      </div>
    </DiagramContainer>
  );
}
