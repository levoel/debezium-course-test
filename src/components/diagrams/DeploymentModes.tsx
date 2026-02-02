/**
 * Glass-styled diagram: Debezium Deployment Modes
 * Reference implementation using diagram primitives
 */

import { FlowNode, Arrow, DiagramContainer, DiagramTooltip } from './primitives';

export function DeploymentModesDiagram() {
  return (
    <div className="my-8 space-y-4">
      {/* Mode 1: Kafka Connect */}
      <DiagramContainer title="Kafka Connect" color="emerald" recommended>
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <DiagramTooltip content="Исходная база данных с WAL/binlog для захвата изменений">
            <FlowNode variant="database" tabIndex={0}>Database</FlowNode>
          </DiagramTooltip>
          <Arrow />
          <DiagramTooltip content="Считывает transaction log и преобразует изменения в события">
            <FlowNode variant="connector" tabIndex={0}>Debezium Connector</FlowNode>
          </DiagramTooltip>
          <Arrow />
          <DiagramTooltip content="Распределённый кластер для масштабируемой обработки коннекторов">
            <FlowNode variant="cluster" tabIndex={0}>Kafka Connect Cluster</FlowNode>
          </DiagramTooltip>
          <Arrow />
          <DiagramTooltip content="Message broker для хранения и передачи CDC событий">
            <FlowNode variant="connector" tabIndex={0}>Kafka</FlowNode>
          </DiagramTooltip>
        </div>
      </DiagramContainer>

      {/* Mode 2: Debezium Server */}
      <DiagramContainer title="Debezium Server" color="blue">
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <DiagramTooltip content="Исходная база данных с WAL/binlog для захвата изменений">
            <FlowNode variant="database" tabIndex={0}>Database</FlowNode>
          </DiagramTooltip>
          <Arrow />
          <DiagramTooltip content="Standalone сервер без зависимости от Kafka">
            <FlowNode variant="sink" tabIndex={0}>Debezium Server</FlowNode>
          </DiagramTooltip>
          <Arrow />
          <DiagramTooltip content="Облачные сервисы для получения событий">
            <FlowNode variant="sink" tabIndex={0}>Cloud Sink</FlowNode>
          </DiagramTooltip>
          <Arrow />
          <div className="flex flex-col gap-1">
            <DiagramTooltip content="Google Cloud Pub/Sub">
              <FlowNode variant="sink" size="sm" tabIndex={0}>Pub/Sub</FlowNode>
            </DiagramTooltip>
            <DiagramTooltip content="Amazon Kinesis">
              <FlowNode variant="sink" size="sm" tabIndex={0}>Kinesis</FlowNode>
            </DiagramTooltip>
            <DiagramTooltip content="Azure Event Hubs">
              <FlowNode variant="sink" size="sm" tabIndex={0}>EventHub</FlowNode>
            </DiagramTooltip>
          </div>
        </div>
      </DiagramContainer>

      {/* Mode 3: Embedded Engine */}
      <DiagramContainer title="Embedded Engine" color="rose">
        <div className="flex items-center justify-center gap-2 flex-wrap pb-6">
          <DiagramTooltip content="Исходная база данных с WAL/binlog для захвата изменений">
            <FlowNode variant="database" tabIndex={0}>Database</FlowNode>
          </DiagramTooltip>
          <Arrow />
          <DiagramTooltip content="Встроенный движок для кастомной обработки событий">
            <FlowNode variant="app" tabIndex={0}>Your Java App</FlowNode>
          </DiagramTooltip>
          <Arrow />
          <div className="relative">
            <DiagramTooltip content="Произвольная система-получатель событий">
              <FlowNode variant="target" tabIndex={0}>Any Target</FlowNode>
            </DiagramTooltip>
            <p className="absolute left-1/2 -translate-x-1/2 top-full mt-1.5 text-xs text-gray-400 whitespace-nowrap">Custom Processing</p>
          </div>
        </div>
      </DiagramContainer>
    </div>
  );
}

export default DeploymentModesDiagram;
