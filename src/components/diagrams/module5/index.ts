/**
 * Module 5 diagram exports
 * SMT (Single Message Transformations) diagrams
 * Total: 21 diagrams across 8 component files
 */

// Lesson 01: SMT Overview (5 diagrams)
export {
  ConsumerComplexityDiagram,
  SmtSolutionDiagram,
  SmtExecutionModelDiagram,
  SmtChainOrderDiagram,
  SmtDecisionFrameworkDiagram,
} from './SmtOverviewDiagrams';

// Lesson 02: Predicates & Filtering (3 diagrams)
export {
  PredicateEvaluationDiagram,
  PredicateCombinationDiagram,
  FilterDecisionTreeDiagram,
} from './PredicateFilterDiagrams';

// Lesson 03: PII Masking (2 diagrams)
export {
  MaskFieldTransformDiagram,
  UnwrapComparisonDiagram,
} from './PiiMaskingDiagrams';

// Lesson 04: Content-Based Routing (3 diagrams)
export {
  ContentBasedRouterDiagram,
  MultiTenantRoutingDiagram,
  RegionBasedRoutingDiagram,
} from './ContentRoutingDiagrams';

// Lesson 05: Outbox Pattern Theory (4 diagrams)
export {
  DualWriteProblemDiagram,
  OutboxSolutionDiagram,
  OutboxTransactionFlowDiagram,
  MicroservicesOutboxDiagram,
} from './OutboxPatternDiagrams';

// Lesson 06: Outbox Implementation (1 diagram)
export {
  OutboxEventRouterSmtDiagram,
} from './OutboxImplementationDiagrams';

// Lesson 07: Schema Registry (1 diagram)
export {
  SchemaRegistryIntegrationDiagram,
} from './SchemaRegistryDiagrams';

// Lesson 08: Schema Evolution (2 diagrams)
export {
  SchemaCompatibilityDiagram,
  EvolutionDecisionTreeDiagram,
} from './SchemaEvolutionDiagrams';
