// Lesson 01 - Cloud SQL Setup
export { CloudSqlCdcArchitectureDiagram } from './CloudSqlDiagrams';

// Lesson 02 - Debezium Server with Pub/Sub
export {
  TraditionalKafkaArchitectureDiagram,
  KafkalessArchitectureDiagram,
  DebeziumServerInternalDiagram
} from './DebeziumServerDiagrams';

// Lesson 03 - IAM and Workload Identity
export { WorkloadIdentityFlowDiagram } from './IamWorkloadDiagrams';

// Lesson 04 - Dataflow to BigQuery
export {
  CdcToBigQueryDiagram,
  DataflowEndToEndWorkflowDiagram
} from './DataflowBigQueryDiagrams';

// Lesson 05 - Cloud Run Event-Driven
export {
  PubSubEventarcCloudRunDiagram,
  AutoScalingBehaviorSequence,
  EndToEndEventProcessingSequence
} from './CloudRunEventDiagrams';

// Lesson 06 - End-to-End Monitoring
export {
  MonitoringComponentsDiagram,
  MonitoringPointsHierarchyDiagram,
  AlertFlowDiagram
} from './MonitoringDiagrams';
