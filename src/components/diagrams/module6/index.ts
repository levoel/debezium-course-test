/**
 * Module 6 Diagram Barrel Export
 *
 * All diagrams for Module 6 (Python Data Engineering)
 * 26 total diagrams across 7 lessons
 */

// Lesson 01: Advanced Python Consumer
export {
  AtLeastOnceVsExactlyOnceDiagram,
  RebalancingSequenceDiagram
} from './AdvancedConsumerDiagrams';

// Lesson 02: Pandas Integration
export { CdcEventStructureDiagram } from './PandasIntegrationDiagrams';

// Lesson 03: PyFlink CDC Connector
export {
  PandasVsPyflinkComparisonDiagram,
  PyflinkCdcArchitectureDiagram
} from './PyflinkConnectorDiagrams';

// Lesson 04: PyFlink Stateful Processing
export {
  StatefulOperationsDiagram,
  OutOfOrderEventsSequenceDiagram,
  WatermarkProgressDiagram,
  TumblingWindowsDiagram,
  SlidingWindowsDiagram,
  SessionWindowsDiagram,
  TemporalJoinSequenceDiagram,
  StateGrowthDiagram
} from './PyflinkStatefulDiagrams';

// Lesson 05: PySpark Structured Streaming
export {
  PyflinkVsPysparkComparisonDiagram,
  StructuredStreamingConceptDiagram,
  PysparkWatermarkDiagram,
  MicroBatchVsContinuousDiagram
} from './PysparkStreamingDiagrams';

// Lesson 06: ETL/ELT Patterns
export {
  TraditionalEtlDiagram,
  ModernEltDiagram,
  CdcToDataLakeDiagram,
  AppendOnlyHistoryDiagram,
  OperationSeparationDiagram
} from './EtlEltPatternDiagrams';

// Lesson 07: Feature Engineering
export {
  BatchFeaturesProblemDiagram,
  RealTimeFeaturesPipelineDiagram,
  CustomerBehaviorFeaturesDiagram,
  FeatureStoreArchitectureDiagram
} from './FeatureEngineeringDiagrams';
