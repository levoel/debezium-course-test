/**
 * Multi-Connector Deployment Diagrams for Module 3
 *
 * Exports:
 * - MultiConnectorArchitectureDiagram: Multi-connector deployment architecture
 * - ServerIdRegistryDiagram: Server ID registry concept and conflict detection
 */

import { FlowNode } from '../primitives/FlowNode';
import { Arrow } from '../primitives/Arrow';
import { DiagramContainer } from '../primitives/DiagramContainer';
import { DiagramTooltip } from '../primitives/Tooltip';
import { SequenceDiagram } from '../primitives/SequenceDiagram';
import type { SequenceActorDef, SequenceMessageDef } from '../primitives/types';

/**
 * MultiConnectorArchitectureDiagram - Multi-connector deployment architecture
 */
export function MultiConnectorArchitectureDiagram() {
  return (
    <div className="space-y-6">
      <DiagramContainer title="Multi-Connector Architecture" color="blue">
        <div className="flex flex-col items-center gap-6">
          {/* MySQL cluster */}
          <DiagramTooltip content="Один MySQL кластер обслуживает несколько независимых Debezium connectors. Каждый connector требует уникальный server_id.">
            <FlowNode variant="database" tabIndex={0} size="lg">
              MySQL Cluster
              <br />
              <span className="text-xs text-gray-400">ecommerce database</span>
            </FlowNode>
          </DiagramTooltip>

          <div className="flex flex-col md:flex-row items-center gap-2">
            <Arrow direction="down" label="binlog" />
            <Arrow direction="down" label="binlog" />
            <Arrow direction="down" label="binlog" />
          </div>

          {/* Three connectors */}
          <div className="flex flex-col md:flex-row items-start gap-4 md:gap-6">
            {/* Connector A */}
            <div className="flex flex-col items-center gap-3">
              <DiagramTooltip content="Connector A: Orders team. server_id=184001. Захватывает orders, order_items таблицы.">
                <FlowNode variant="connector" tabIndex={0}>
                  Connector A
                  <br />
                  <span className="text-xs text-emerald-400">server_id: 184001</span>
                </FlowNode>
              </DiagramTooltip>

              <Arrow direction="down" />

              <DiagramTooltip content="Топики с уникальным префиксом mysql_orders. Изолированы от других connectors.">
                <FlowNode variant="cluster" tabIndex={0} size="sm">
                  mysql_orders.*
                  <br />
                  <span className="text-xs text-gray-400">orders, order_items</span>
                </FlowNode>
              </DiagramTooltip>

              <div className="text-xs text-gray-400 text-center">
                Team Orders
                <br />
                table.include.list:
                <br />
                orders, order_items
              </div>
            </div>

            {/* Connector B */}
            <div className="flex flex-col items-center gap-3">
              <DiagramTooltip content="Connector B: Users team. server_id=184002. Захватывает users, profiles таблицы.">
                <FlowNode variant="connector" tabIndex={0}>
                  Connector B
                  <br />
                  <span className="text-xs text-blue-400">server_id: 184002</span>
                </FlowNode>
              </DiagramTooltip>

              <Arrow direction="down" />

              <DiagramTooltip content="Топики с уникальным префиксом mysql_users. Полная изоляция от других connectors.">
                <FlowNode variant="sink" tabIndex={0} size="sm">
                  mysql_users.*
                  <br />
                  <span className="text-xs text-gray-400">users, profiles</span>
                </FlowNode>
              </DiagramTooltip>

              <div className="text-xs text-gray-400 text-center">
                Team Users
                <br />
                table.include.list:
                <br />
                users, profiles
              </div>
            </div>

            {/* Connector C */}
            <div className="flex flex-col items-center gap-3">
              <DiagramTooltip content="Connector C: Payment team. server_id=184003. Захватывает payments, transactions таблицы.">
                <FlowNode variant="connector" tabIndex={0}>
                  Connector C
                  <br />
                  <span className="text-xs text-purple-400">server_id: 184003</span>
                </FlowNode>
              </DiagramTooltip>

              <Arrow direction="down" />

              <DiagramTooltip content="Топики с уникальным префиксом mysql_payment. Независимое управление и deployment.">
                <FlowNode variant="database" tabIndex={0} size="sm">
                  mysql_payment.*
                  <br />
                  <span className="text-xs text-gray-400">payments, txns</span>
                </FlowNode>
              </DiagramTooltip>

              <div className="text-xs text-gray-400 text-center">
                Team Payment
                <br />
                table.include.list:
                <br />
                payments, transactions
              </div>
            </div>
          </div>
        </div>
      </DiagramContainer>

      {/* Unique properties requirement */}
      <DiagramContainer title="Required Unique Properties" color="amber">
        <div className="overflow-x-auto">
          <table className="text-xs text-gray-300 w-full">
            <thead>
              <tr className="border-b border-gray-600">
                <th className="text-left py-2 pr-4">Property</th>
                <th className="text-left py-2 pr-4">Connector A</th>
                <th className="text-left py-2 pr-4">Connector B</th>
                <th className="text-left py-2">Must Be Unique?</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-700">
                <td className="py-2 pr-4 text-amber-400">database.server.id</td>
                <td className="py-2 pr-4 font-mono">184001</td>
                <td className="py-2 pr-4 font-mono">184002</td>
                <td className="py-2 text-emerald-400 font-bold">YES</td>
              </tr>
              <tr className="border-b border-gray-700">
                <td className="py-2 pr-4 text-blue-400">database.server.name</td>
                <td className="py-2 pr-4 font-mono">mysql_orders</td>
                <td className="py-2 pr-4 font-mono">mysql_users</td>
                <td className="py-2 text-emerald-400 font-bold">YES</td>
              </tr>
              <tr className="border-b border-gray-700">
                <td className="py-2 pr-4 text-purple-400">schema.history.kafka.topic</td>
                <td className="py-2 pr-4 font-mono">schema-history.orders</td>
                <td className="py-2 pr-4 font-mono">schema-history.users</td>
                <td className="py-2 text-emerald-400 font-bold">YES</td>
              </tr>
              <tr>
                <td className="py-2 pr-4 text-gray-400">database.hostname</td>
                <td className="py-2 pr-4 font-mono">mysql</td>
                <td className="py-2 pr-4 font-mono">mysql</td>
                <td className="py-2 text-gray-400">Can be same</td>
              </tr>
            </tbody>
          </table>
        </div>
      </DiagramContainer>

      {/* Warning about server_id */}
      <DiagramContainer title="server_id Requirement" color="rose">
        <div className="text-sm text-gray-300 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-rose-400 font-bold">CRITICAL:</span>
            <span>Каждый connector требует уникальный server_id.</span>
          </div>
          <div className="text-xs text-gray-400">
            MySQL использует server_id для идентификации replication clients.
            Дубликат server_id приводит к:
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>ERROR 1236: Duplicate server_id</li>
              <li>Connector не может подключиться</li>
              <li>Блокировка startup второго connector</li>
            </ul>
          </div>
        </div>
      </DiagramContainer>
    </div>
  );
}

/**
 * ServerIdRegistryDiagram - Server ID registry concept and conflict detection
 */
export function ServerIdRegistryDiagram() {
  // Sequence diagram showing server_id conflict
  const actors: SequenceActorDef[] = [
    {
      id: 'connA',
      label: 'Connector A',
      variant: 'service',
      tooltip:
        'Connector A уже подключён к MySQL с server_id=184001. Активно читает binlog.',
    },
    {
      id: 'mysql',
      label: 'MySQL',
      variant: 'database',
      tooltip:
        'MySQL Master сервер. Отслеживает все replication connections по server_id.',
    },
    {
      id: 'connB',
      label: 'Connector B',
      variant: 'service',
      tooltip:
        'Connector B пытается подключиться с тем же server_id=184001. Получит ошибку.',
    },
  ];

  const messages: SequenceMessageDef[] = [
    {
      id: 'msg1',
      from: 'connA',
      to: 'mysql',
      label: 'Register server_id=184001',
      variant: 'sync',
      tooltip:
        'Connector A регистрируется как replica с server_id=184001. MySQL принимает подключение.',
    },
    {
      id: 'msg2',
      from: 'mysql',
      to: 'connA',
      label: 'Connected OK',
      variant: 'return',
      tooltip:
        'Успешное подключение. Connector A начинает читать binlog.',
    },
    {
      id: 'msg3',
      from: 'connB',
      to: 'mysql',
      label: 'Register server_id=184001',
      variant: 'sync',
      tooltip:
        'Connector B пытается зарегистрироваться с ТЕМ ЖЕ server_id=184001.',
    },
    {
      id: 'msg4',
      from: 'mysql',
      to: 'connB',
      label: 'ERROR 1236: Duplicate!',
      variant: 'return',
      tooltip:
        'КРИТИЧЕСКАЯ ОШИБКА: MySQL отклоняет подключение. Duplicate server_id detected.',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Conflict visualization */}
      <DiagramContainer title="Server ID Conflict Scenario" color="rose">
        <SequenceDiagram actors={actors} messages={messages} messageSpacing={50} />
      </DiagramContainer>

      {/* Registry pattern */}
      <DiagramContainer title="Server ID Registry Pattern" color="emerald">
        <div className="flex flex-col items-center gap-4">
          <DiagramTooltip content="Централизованный registry для отслеживания server_id allocations. Предотвращает конфликты при deployment.">
            <FlowNode variant="app" tabIndex={0} size="lg">
              server-id-registry.md
              <br />
              <span className="text-xs text-gray-400">Version Control</span>
            </FlowNode>
          </DiagramTooltip>

          <div className="w-full max-w-lg">
            <div className="font-mono text-xs bg-gray-800/50 p-4 rounded space-y-2">
              <div className="text-emerald-400 mb-2"># Server ID Allocations</div>
              <div className="border-b border-gray-600 pb-2 text-gray-400">
                Range: 184000-184999 (Debezium connectors)
              </div>
              <div className="grid grid-cols-3 gap-2 text-gray-300 pt-2">
                <span className="text-amber-400">Connector</span>
                <span className="text-amber-400">server_id</span>
                <span className="text-amber-400">Status</span>

                <span>orders-cdc</span>
                <span className="text-emerald-400">184001</span>
                <span className="text-emerald-400">Active</span>

                <span>users-cdc</span>
                <span className="text-blue-400">184002</span>
                <span className="text-emerald-400">Active</span>

                <span>payment-cdc</span>
                <span className="text-purple-400">184003</span>
                <span className="text-emerald-400">Active</span>

                <span>old-connector</span>
                <span className="text-gray-500">184000</span>
                <span className="text-rose-400">Retired</span>
              </div>
            </div>
          </div>
        </div>
      </DiagramContainer>

      {/* Best practices */}
      <div className="flex flex-col md:flex-row gap-4">
        <DiagramContainer title="Allocation Rules" color="blue" className="flex-1">
          <ul className="text-xs text-gray-300 space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-blue-400 font-bold">1.</span>
              <span>Range 184000-184999 для Debezium</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400 font-bold">2.</span>
              <span>Sequential allocation (increment)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400 font-bold">3.</span>
              <span>Document BEFORE deployment</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400 font-bold">4.</span>
              <span>30-day reuse embargo</span>
            </li>
          </ul>
        </DiagramContainer>

        <DiagramContainer title="Verification" color="emerald" className="flex-1">
          <div className="font-mono text-xs bg-gray-800/50 p-3 rounded space-y-2">
            <div className="text-gray-400">-- Check active connections</div>
            <div className="text-emerald-400">SHOW SLAVE HOSTS;</div>
            <div className="text-gray-400 mt-2">-- Expected output:</div>
            <div className="text-gray-300">
              | Server_id | Host |
              <br />
              | 184001 | ... |
              <br />
              | 184002 | ... |
              <br />| 184003 | ... |
            </div>
          </div>
        </DiagramContainer>
      </div>

      {/* 30-day embargo explanation */}
      <DiagramContainer title="30-Day Reuse Embargo" color="amber">
        <div className="text-sm text-gray-300 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-amber-400 font-bold">ПРАВИЛО:</span>
            <span>Не используйте server_id повторно 30 дней после удаления connector.</span>
          </div>
          <div className="text-xs text-gray-400">
            MySQL replication sessions не убиваются мгновенно. Stale connections,
            timeout delays, и failover scenarios могут сохранять старый server_id
            зарегистрированным. 30-дневный embargo предотвращает конфликты.
          </div>
        </div>
      </DiagramContainer>
    </div>
  );
}
