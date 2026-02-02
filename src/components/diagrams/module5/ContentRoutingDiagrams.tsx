/**
 * Content-Based Routing Diagrams
 *
 * Exports:
 * - ContentBasedRouterDiagram: Vertical flow showing content-based router with Groovy expression
 * - MultiTenantRoutingDiagram: Multi-tenant topic splitting by tenant_id
 * - RegionBasedRoutingDiagram: Regional routing (EU/US/APAC) with color-coded paths
 */

import { FlowNode } from '../primitives/FlowNode';
import { Arrow } from '../primitives/Arrow';
import { DiagramContainer } from '../primitives/DiagramContainer';
import { DiagramTooltip } from '../primitives/Tooltip';

/**
 * ContentBasedRouterDiagram - Shows content-based routing with Groovy expression
 */
export function ContentBasedRouterDiagram() {
  return (
    <DiagramContainer
      title="Content-Based Router: Принцип работы"
      color="purple"
      description="Маршрутизация событий на основе содержимого полей"
    >
      <div className="flex flex-col items-center gap-4">
        <DiagramTooltip
          content={
            <div>
              <strong>Source Table</strong>
              <p className="mt-1">
                PostgreSQL таблица с полем region. Каждое изменение захватывается
                Debezium как CDC событие.
              </p>
            </div>
          }
        >
          <FlowNode variant="database" tabIndex={0}>
            customers
            <span className="block text-xs text-gray-400 mt-1">
              region: 'EU' | 'US'
            </span>
          </FlowNode>
        </DiagramTooltip>

        <Arrow direction="down" label="CDC events" />

        <DiagramTooltip
          content={
            <div>
              <strong>Debezium Connector</strong>
              <p className="mt-1">
                Захватывает изменения из WAL и отправляет их в SMT pipeline
                для трансформации.
              </p>
            </div>
          }
        >
          <FlowNode variant="connector" tabIndex={0}>
            Debezium CDC
          </FlowNode>
        </DiagramTooltip>

        <Arrow direction="down" label="CDC envelope" />

        <DiagramTooltip
          content={
            <div>
              <strong>ContentBasedRouter SMT</strong>
              <p className="mt-1">
                Использует Groovy expression для вычисления имени топика на основе
                значения поля. Имеет доступ к value.after.* для чтения полей.
              </p>
              <p className="mt-2 text-purple-300">
                topic.expression: value.after.region == 'EU' ? 'events-eu' : 'events-us'
              </p>
            </div>
          }
        >
          <FlowNode
            variant="connector"
            className="bg-purple-500/20 border-purple-400/30 text-purple-200"
            tabIndex={0}
          >
            ContentBasedRouter
            <span className="block text-xs text-gray-400 mt-2 font-mono">
              if (region == 'EU')
              <br />
              → events-eu
            </span>
          </FlowNode>
        </DiagramTooltip>

        <div className="flex gap-8 mt-2">
          <div className="flex flex-col items-center gap-2">
            <Arrow direction="down" label="region='EU'" />
            <DiagramTooltip
              content={
                <div>
                  <strong>EU Topic</strong>
                  <p className="mt-1">
                    Топик для событий с region = 'EU'. Consumers в EU region
                    подписываются только на этот топик.
                  </p>
                </div>
              }
            >
              <FlowNode
                variant="app"
                className="bg-blue-500/20 border-blue-400/30 text-blue-200"
                tabIndex={0}
              >
                events-eu
              </FlowNode>
            </DiagramTooltip>
          </div>

          <div className="flex flex-col items-center gap-2">
            <Arrow direction="down" label="region='US'" />
            <DiagramTooltip
              content={
                <div>
                  <strong>US Topic</strong>
                  <p className="mt-1">
                    Топик для событий с region = 'US'. Consumers в US region
                    подписываются только на этот топик.
                  </p>
                </div>
              }
            >
              <FlowNode
                variant="app"
                className="bg-purple-500/20 border-purple-400/30 text-purple-200"
                tabIndex={0}
              >
                events-us
              </FlowNode>
            </DiagramTooltip>
          </div>
        </div>
      </div>
    </DiagramContainer>
  );
}

/**
 * MultiTenantRoutingDiagram - Multi-tenant routing by tenant_id
 */
export function MultiTenantRoutingDiagram() {
  return (
    <DiagramContainer
      title="Multi-Tenant Routing: Изоляция данных"
      color="blue"
      description="Каждый tenant получает свой топик"
    >
      <div className="flex flex-col items-center gap-4">
        <DiagramTooltip
          content={
            <div>
              <strong>Multi-Tenant Database</strong>
              <p className="mt-1">
                PostgreSQL база с колонкой tenant_id. Все tenants используют
                одну БД, но данные логически изолированы через tenant_id.
              </p>
            </div>
          }
        >
          <FlowNode variant="database" tabIndex={0}>
            orders (multi-tenant)
            <span className="block text-xs text-gray-400 mt-1">
              tenant_id: 'acme' | 'globex'
            </span>
          </FlowNode>
        </DiagramTooltip>

        <Arrow direction="down" label="CDC capture" />

        <DiagramTooltip
          content={
            <div>
              <strong>ContentBasedRouter SMT</strong>
              <p className="mt-1">
                Маршрутизирует события в разные топики на основе tenant_id.
                Каждый tenant получает изолированный топик для безопасности
                и compliance.
              </p>
              <p className="mt-2 text-blue-300">
                topic.expression: 'orders-' + value.after.tenant_id
              </p>
            </div>
          }
        >
          <FlowNode
            variant="connector"
            className="bg-purple-500/20 border-purple-400/30 text-purple-200"
            tabIndex={0}
          >
            ContentBasedRouter
            <span className="block text-xs text-gray-400 mt-2">
              Route by tenant_id
            </span>
          </FlowNode>
        </DiagramTooltip>

        <div className="flex gap-8 mt-2">
          <div className="flex flex-col items-center gap-2">
            <Arrow direction="down" label="tenant_id='acme'" />
            <DiagramTooltip
              content={
                <div>
                  <strong>Acme Topic</strong>
                  <p className="mt-1">
                    Топик для tenant Acme. Consumer подписывается только на
                    этот топик и видит только события своего tenant.
                  </p>
                  <p className="mt-2 text-blue-300">
                    Преимущество: Изоляция данных без фильтрации в consumer
                  </p>
                </div>
              }
            >
              <FlowNode
                variant="app"
                className="bg-blue-500/20 border-blue-400/30 text-blue-200"
                tabIndex={0}
              >
                orders-acme
              </FlowNode>
            </DiagramTooltip>
          </div>

          <div className="flex flex-col items-center gap-2">
            <Arrow direction="down" label="tenant_id='globex'" />
            <DiagramTooltip
              content={
                <div>
                  <strong>Globex Topic</strong>
                  <p className="mt-1">
                    Топик для tenant Globex. Физическая изоляция на уровне Kafka
                    гарантирует безопасность данных.
                  </p>
                  <p className="mt-2 text-purple-300">
                    Альтернатива: Один топик + фильтрация в consumer (неэффективно)
                  </p>
                </div>
              }
            >
              <FlowNode
                variant="app"
                className="bg-purple-500/20 border-purple-400/30 text-purple-200"
                tabIndex={0}
              >
                orders-globex
              </FlowNode>
            </DiagramTooltip>
          </div>
        </div>
      </div>
    </DiagramContainer>
  );
}

/**
 * RegionBasedRoutingDiagram - Regional routing (EU/US/APAC)
 */
export function RegionBasedRoutingDiagram() {
  return (
    <DiagramContainer
      title="Region-Based Routing: GDPR Compliance"
      color="emerald"
      description="Маршрутизация по регионам для compliance"
    >
      <div className="flex flex-col items-center gap-4">
        <DiagramTooltip
          content={
            <div>
              <strong>Multi-Region Source</strong>
              <p className="mt-1">
                База данных с полем region. GDPR требует, чтобы EU данные
                не покидали EU region.
              </p>
            </div>
          }
        >
          <FlowNode variant="database" tabIndex={0}>
            users
            <span className="block text-xs text-gray-400 mt-1">
              region: 'EU' | 'US' | 'APAC'
            </span>
          </FlowNode>
        </DiagramTooltip>

        <Arrow direction="down" label="CDC events" />

        <DiagramTooltip
          content={
            <div>
              <strong>Region Router</strong>
              <p className="mt-1">
                ContentBasedRouter SMT с Groovy expression для определения
                региона. События маршрутизируются в региональные топики.
              </p>
              <p className="mt-2 text-emerald-300">
                Критично для GDPR: EU данные остаются в EU Kafka cluster
              </p>
            </div>
          }
        >
          <FlowNode
            variant="connector"
            className="bg-purple-500/20 border-purple-400/30 text-purple-200"
            tabIndex={0}
          >
            RegionRouter
            <span className="block text-xs text-gray-400 mt-2">
              Route by region field
            </span>
          </FlowNode>
        </DiagramTooltip>

        <div className="flex gap-4 mt-2 flex-wrap justify-center">
          <div className="flex flex-col items-center gap-2">
            <Arrow direction="down" label="EU" />
            <DiagramTooltip
              content={
                <div>
                  <strong>EU Topic (GDPR-compliant)</strong>
                  <p className="mt-1">
                    Топик для EU данных. Может находиться в EU Kafka cluster
                    для полного compliance с GDPR.
                  </p>
                  <p className="mt-2 text-blue-300">
                    Персональные данные EU граждан не покидают EU
                  </p>
                </div>
              }
            >
              <FlowNode
                variant="app"
                className="bg-blue-500/20 border-blue-400/30 text-blue-200"
                tabIndex={0}
              >
                users-eu
              </FlowNode>
            </DiagramTooltip>
          </div>

          <div className="flex flex-col items-center gap-2">
            <Arrow direction="down" label="US" />
            <DiagramTooltip
              content={
                <div>
                  <strong>US Topic</strong>
                  <p className="mt-1">
                    Топик для US данных. Может находиться в US Kafka cluster
                    для минимизации latency.
                  </p>
                </div>
              }
            >
              <FlowNode
                variant="app"
                className="bg-purple-500/20 border-purple-400/30 text-purple-200"
                tabIndex={0}
              >
                users-us
              </FlowNode>
            </DiagramTooltip>
          </div>

          <div className="flex flex-col items-center gap-2">
            <Arrow direction="down" label="APAC" />
            <DiagramTooltip
              content={
                <div>
                  <strong>APAC Topic</strong>
                  <p className="mt-1">
                    Топик для APAC данных. Региональная изоляция снижает latency
                    и обеспечивает data residency compliance.
                  </p>
                </div>
              }
            >
              <FlowNode
                variant="app"
                className="bg-amber-500/20 border-amber-400/30 text-amber-200"
                tabIndex={0}
              >
                users-apac
              </FlowNode>
            </DiagramTooltip>
          </div>
        </div>

        <div className="mt-4 text-sm text-gray-400 border-l-2 border-emerald-400 pl-3">
          <strong className="text-emerald-300">Когда использовать?</strong>
          <ul className="mt-1 list-disc list-inside">
            <li>GDPR compliance (EU data residency)</li>
            <li>Региональная изоляция для latency optimization</li>
            <li>Multi-region Kafka clusters</li>
          </ul>
        </div>
      </div>
    </DiagramContainer>
  );
}
