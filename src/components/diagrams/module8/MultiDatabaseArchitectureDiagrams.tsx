/**
 * Multi-Database Architecture Diagrams for Module 8 Lesson 04
 *
 * Exports:
 * - SeparateTopicsArchitectureDiagram: PostgreSQL + MySQL → separate topics → PyFlink UNION
 * - UnifiedTopicsArchitectureDiagram: ByLogicalTableRouter SMT → unified topic
 */

import { FlowNode } from '../primitives/FlowNode';
import { Arrow } from '../primitives/Arrow';
import { DiagramContainer } from '../primitives/DiagramContainer';
import { DiagramTooltip } from '../primitives/Tooltip';

/**
 * SeparateTopicsArchitectureDiagram - Two independent CDC paths converging at PyFlink
 * Shows: PostgreSQL (blue) + MySQL (red) → separate topic naming → PyFlink UNION ALL consumer
 */
export function SeparateTopicsArchitectureDiagram() {
  return (
    <DiagramContainer
      title="Separate Topics Architecture"
      color="emerald"
      description="PostgreSQL + MySQL → Отдельные топики → PyFlink UNION ALL consumer"
    >
      <div className="space-y-4">
        {/* Sources layer */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* PostgreSQL path */}
          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-semibold text-blue-200 text-center">PostgreSQL Path</h3>
            <DiagramTooltip content={
              <div>
                <p className="font-semibold mb-1">PostgreSQL Database</p>
                <p className="text-sm">WAL-based CDC с logical decoding</p>
                <p className="text-sm mt-1">wal_level=logical, replication slot</p>
              </div>
            }>
              <FlowNode variant="database" className="bg-blue-500/20 border-blue-400/30 text-blue-200">
                PostgreSQL
              </FlowNode>
            </DiagramTooltip>
            <Arrow direction="down" label="WAL stream" />
            <DiagramTooltip content={
              <div>
                <p className="font-semibold mb-1">PostgreSQL Connector</p>
                <p className="text-sm">Debezium PostgreSQL connector</p>
                <p className="text-sm mt-1">database.server.name=postgres_prod</p>
              </div>
            }>
              <FlowNode variant="connector" className="bg-blue-500/20 border-blue-400/30 text-blue-200">
                PG Connector
              </FlowNode>
            </DiagramTooltip>
            <Arrow direction="down" />
            <DiagramTooltip content={
              <div>
                <p className="font-semibold mb-1">PostgreSQL Topic</p>
                <p className="text-sm">postgres_prod.public.orders</p>
                <p className="text-sm mt-1">Clear source attribution в topic name</p>
              </div>
            }>
              <FlowNode variant="cluster" className="bg-blue-500/20 border-blue-400/30 text-blue-200">
                <div>postgres_prod</div>
                <div className="text-xs text-gray-400">.public.orders</div>
              </FlowNode>
            </DiagramTooltip>
          </div>

          {/* MySQL path */}
          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-semibold text-red-200 text-center">MySQL Path</h3>
            <DiagramTooltip content={
              <div>
                <p className="font-semibold mb-1">MySQL Database</p>
                <p className="text-sm">Binlog-based CDC с GTID mode</p>
                <p className="text-sm mt-1">binlog_format=ROW, gtid_mode=ON</p>
              </div>
            }>
              <FlowNode variant="database" className="bg-red-500/20 border-red-400/30 text-red-200">
                MySQL
              </FlowNode>
            </DiagramTooltip>
            <Arrow direction="down" label="Binlog stream" />
            <DiagramTooltip content={
              <div>
                <p className="font-semibold mb-1">MySQL Connector</p>
                <p className="text-sm">Debezium MySQL connector</p>
                <p className="text-sm mt-1">database.server.name=mysql_prod</p>
              </div>
            }>
              <FlowNode variant="connector" className="bg-red-500/20 border-red-400/30 text-red-200">
                MySQL Connector
              </FlowNode>
            </DiagramTooltip>
            <Arrow direction="down" />
            <DiagramTooltip content={
              <div>
                <p className="font-semibold mb-1">MySQL Topic</p>
                <p className="text-sm">mysql_prod.inventory.stock</p>
                <p className="text-sm mt-1">Отдельная schema evolution path</p>
              </div>
            }>
              <FlowNode variant="cluster" className="bg-red-500/20 border-red-400/30 text-red-200">
                <div>mysql_prod</div>
                <div className="text-xs text-gray-400">.inventory.stock</div>
              </FlowNode>
            </DiagramTooltip>
          </div>
        </div>

        {/* Consumer layer */}
        <div className="flex flex-col items-center gap-2 pt-3 border-t border-white/10">
          <div className="text-xs text-gray-400">Both topics consumed by single job</div>
          <Arrow direction="down" />
          <DiagramTooltip content={
            <div>
              <p className="font-semibold mb-1">PyFlink UNION ALL</p>
              <p className="text-sm">Объединяет события из PostgreSQL и MySQL</p>
              <p className="text-sm mt-1">Добавляет source_database column для traceability</p>
            </div>
          }>
            <FlowNode variant="connector" className="bg-purple-500/20 border-purple-400/30 text-purple-200 w-full max-w-md">
              PyFlink UNION ALL Consumer
            </FlowNode>
          </DiagramTooltip>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-white/10 text-xs text-gray-400">
        <p className="font-semibold mb-1">Separate Topics Pattern:</p>
        <ul className="space-y-1">
          <li>• <span className="text-emerald-300">Pros:</span> Независимая schema evolution, clear source attribution</li>
          <li>• <span className="text-emerald-300">Pros:</span> Разные retention policies per database</li>
          <li>• <span className="text-amber-300">Cons:</span> Consumer должен объединять топики вручную (UNION ALL)</li>
          <li>• <span className="text-blue-300">database.server.name</span> MUST be unique per connector</li>
        </ul>
      </div>
    </DiagramContainer>
  );
}

/**
 * UnifiedTopicsArchitectureDiagram - ByLogicalTableRouter SMT routing to unified topic
 * Shows: PostgreSQL + MySQL → SMT routing → single unified topic → simplified consumer
 */
export function UnifiedTopicsArchitectureDiagram() {
  return (
    <DiagramContainer
      title="Unified Topics Architecture"
      color="purple"
      description="PostgreSQL + MySQL → Единый топик → Упрощенный consumer"
    >
      <div className="space-y-4">
        {/* Sources layer */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* PostgreSQL path */}
          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-semibold text-blue-200 text-center">PostgreSQL</h3>
            <DiagramTooltip content={
              <div>
                <p className="font-semibold mb-1">PostgreSQL Connector</p>
                <p className="text-sm">С ByLogicalTableRouter SMT</p>
                <p className="text-sm mt-1">Роутирует по topic.regex → unified.orders</p>
              </div>
            }>
              <FlowNode variant="connector" className="bg-blue-500/20 border-blue-400/30 text-blue-200">
                <div>PG Connector</div>
                <div className="text-xs text-gray-400">(ByLogicalTableRouter SMT)</div>
              </FlowNode>
            </DiagramTooltip>
          </div>

          {/* MySQL path */}
          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-semibold text-red-200 text-center">MySQL</h3>
            <DiagramTooltip content={
              <div>
                <p className="font-semibold mb-1">MySQL Connector</p>
                <p className="text-sm">С ByLogicalTableRouter SMT</p>
                <p className="text-sm mt-1">Роутирует по topic.regex → unified.orders</p>
              </div>
            }>
              <FlowNode variant="connector" className="bg-red-500/20 border-red-400/30 text-red-200">
                <div>MySQL Connector</div>
                <div className="text-xs text-gray-400">(ByLogicalTableRouter SMT)</div>
              </FlowNode>
            </DiagramTooltip>
          </div>
        </div>

        {/* Unified topic */}
        <div className="flex flex-col items-center gap-2 pt-3 border-t border-white/10">
          <div className="flex items-center gap-3">
            <Arrow direction="down" label="Route to" />
          </div>
          <DiagramTooltip content={
            <div>
              <p className="font-semibold mb-1">Unified Topic</p>
              <p className="text-sm">unified.orders - события из обеих БД</p>
              <p className="text-sm mt-1">Требует identical schemas (или schema union)</p>
            </div>
          }>
            <FlowNode variant="cluster" className="w-full max-w-md">
              unified.orders
            </FlowNode>
          </DiagramTooltip>
        </div>

        {/* Consumer layer */}
        <div className="flex flex-col items-center gap-2">
          <Arrow direction="down" />
          <DiagramTooltip content={
            <div>
              <p className="font-semibold mb-1">PyFlink Consumer</p>
              <p className="text-sm">Упрощенный consumer - один топик вместо двух</p>
              <p className="text-sm mt-1">source.db field в CDC envelope для differentiation</p>
            </div>
          }>
            <FlowNode variant="connector" className="bg-purple-500/20 border-purple-400/30 text-purple-200 w-full max-w-md">
              <div>PyFlink Consumer</div>
              <div className="text-xs text-gray-400">(single topic)</div>
            </FlowNode>
          </DiagramTooltip>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-white/10 text-xs text-gray-400">
        <p className="font-semibold mb-1">Unified Topics Pattern:</p>
        <ul className="space-y-1">
          <li>• <span className="text-emerald-300">Pros:</span> Упрощенный consumer (один топик, не UNION ALL)</li>
          <li>• <span className="text-emerald-300">Pros:</span> Единый retention policy</li>
          <li>• <span className="text-amber-300">Cons:</span> Требует identical schemas или schema union</li>
          <li>• <span className="text-amber-300">Cons:</span> Careful key design (могут коллидировать IDs из разных БД)</li>
          <li>• <span className="text-purple-300">ByLogicalTableRouter SMT</span> routing logic: topic.regex</li>
        </ul>
      </div>
    </DiagramContainer>
  );
}
