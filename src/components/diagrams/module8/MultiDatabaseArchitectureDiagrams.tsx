/** @jsxImportSource solid-js */
/**
 * Multi-Database Architecture Diagrams for Module 8 Lesson 04
 *
 * Exports:
 * - SeparateTopicsArchitectureDiagram: PostgreSQL + MySQL → separate topics → PyFlink UNION
 * - UnifiedTopicsArchitectureDiagram: ByLogicalTableRouter SMT → unified topic
 */

import { FlowNode } from '@primitives/FlowNode';
import { Arrow } from '@primitives/Arrow';
import { DiagramContainer } from '@primitives/DiagramContainer';
import { DiagramTooltip } from '@primitives/Tooltip';

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
      <div class="space-y-4">
        {/* Sources layer */}
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* PostgreSQL path */}
          <div class="flex flex-col gap-2">
            <h3 class="text-sm font-semibold text-blue-700 text-center">PostgreSQL Path</h3>
            <DiagramTooltip content={
              <div>
                <p class="font-semibold mb-1">PostgreSQL Database</p>
                <p class="text-sm">WAL-based CDC с logical decoding</p>
                <p class="text-sm mt-1">wal_level=logical, replication slot</p>
              </div>
            }>
              <FlowNode variant="database" className="bg-blue-500/20 border-blue-400/30 text-blue-700">
                PostgreSQL
              </FlowNode>
            </DiagramTooltip>
            <Arrow direction="down" label="WAL stream" />
            <DiagramTooltip content={
              <div>
                <p class="font-semibold mb-1">PostgreSQL Connector</p>
                <p class="text-sm">Debezium PostgreSQL connector</p>
                <p class="text-sm mt-1">database.server.name=postgres_prod</p>
              </div>
            }>
              <FlowNode variant="connector" className="bg-blue-500/20 border-blue-400/30 text-blue-700">
                PG Connector
              </FlowNode>
            </DiagramTooltip>
            <Arrow direction="down" />
            <DiagramTooltip content={
              <div>
                <p class="font-semibold mb-1">PostgreSQL Topic</p>
                <p class="text-sm">postgres_prod.public.orders</p>
                <p class="text-sm mt-1">Clear source attribution в topic name</p>
              </div>
            }>
              <FlowNode variant="cluster" className="bg-blue-500/20 border-blue-400/30 text-blue-700">
                <div>postgres_prod</div>
                <div class="text-xs text-[var(--ink-muted)]">.public.orders</div>
              </FlowNode>
            </DiagramTooltip>
          </div>

          {/* MySQL path */}
          <div class="flex flex-col gap-2">
            <h3 class="text-sm font-semibold text-red-700 text-center">MySQL Path</h3>
            <DiagramTooltip content={
              <div>
                <p class="font-semibold mb-1">MySQL Database</p>
                <p class="text-sm">Binlog-based CDC с GTID mode</p>
                <p class="text-sm mt-1">binlog_format=ROW, gtid_mode=ON</p>
              </div>
            }>
              <FlowNode variant="database" className="bg-red-500/20 border-red-400/30 text-red-700">
                MySQL
              </FlowNode>
            </DiagramTooltip>
            <Arrow direction="down" label="Binlog stream" />
            <DiagramTooltip content={
              <div>
                <p class="font-semibold mb-1">MySQL Connector</p>
                <p class="text-sm">Debezium MySQL connector</p>
                <p class="text-sm mt-1">database.server.name=mysql_prod</p>
              </div>
            }>
              <FlowNode variant="connector" className="bg-red-500/20 border-red-400/30 text-red-700">
                MySQL Connector
              </FlowNode>
            </DiagramTooltip>
            <Arrow direction="down" />
            <DiagramTooltip content={
              <div>
                <p class="font-semibold mb-1">MySQL Topic</p>
                <p class="text-sm">mysql_prod.inventory.stock</p>
                <p class="text-sm mt-1">Отдельная schema evolution path</p>
              </div>
            }>
              <FlowNode variant="cluster" className="bg-red-500/20 border-red-400/30 text-red-700">
                <div>mysql_prod</div>
                <div class="text-xs text-[var(--ink-muted)]">.inventory.stock</div>
              </FlowNode>
            </DiagramTooltip>
          </div>
        </div>

        {/* Consumer layer */}
        <div class="flex flex-col items-center gap-2 pt-3 border-t border-[var(--line-thin)]">
          <div class="text-xs text-[var(--ink-muted)]">Both topics consumed by single job</div>
          <Arrow direction="down" />
          <DiagramTooltip content={
            <div>
              <p class="font-semibold mb-1">PyFlink UNION ALL</p>
              <p class="text-sm">Объединяет события из PostgreSQL и MySQL</p>
              <p class="text-sm mt-1">Добавляет source_database column для traceability</p>
            </div>
          }>
            <FlowNode variant="connector" className="bg-purple-500/20 border-purple-400/30 text-purple-700 w-full max-w-md">
              PyFlink UNION ALL Consumer
            </FlowNode>
          </DiagramTooltip>
        </div>
      </div>

      <div class="mt-4 pt-3 border-t border-[var(--line-thin)] text-xs text-[var(--ink-muted)]">
        <p class="font-semibold mb-1">Separate Topics Pattern:</p>
        <ul class="space-y-1">
          <li>• <span class="text-emerald-700">Pros:</span> Независимая schema evolution, clear source attribution</li>
          <li>• <span class="text-emerald-700">Pros:</span> Разные retention policies per database</li>
          <li>• <span class="text-amber-700">Cons:</span> Consumer должен объединять топики вручную (UNION ALL)</li>
          <li>• <span class="text-blue-700">database.server.name</span> MUST be unique per connector</li>
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
      <div class="space-y-4">
        {/* Sources layer */}
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* PostgreSQL path */}
          <div class="flex flex-col gap-2">
            <h3 class="text-sm font-semibold text-blue-700 text-center">PostgreSQL</h3>
            <DiagramTooltip content={
              <div>
                <p class="font-semibold mb-1">PostgreSQL Connector</p>
                <p class="text-sm">С ByLogicalTableRouter SMT</p>
                <p class="text-sm mt-1">Роутирует по topic.regex → unified.orders</p>
              </div>
            }>
              <FlowNode variant="connector" className="bg-blue-500/20 border-blue-400/30 text-blue-700">
                <div>PG Connector</div>
                <div class="text-xs text-[var(--ink-muted)]">(ByLogicalTableRouter SMT)</div>
              </FlowNode>
            </DiagramTooltip>
          </div>

          {/* MySQL path */}
          <div class="flex flex-col gap-2">
            <h3 class="text-sm font-semibold text-red-700 text-center">MySQL</h3>
            <DiagramTooltip content={
              <div>
                <p class="font-semibold mb-1">MySQL Connector</p>
                <p class="text-sm">С ByLogicalTableRouter SMT</p>
                <p class="text-sm mt-1">Роутирует по topic.regex → unified.orders</p>
              </div>
            }>
              <FlowNode variant="connector" className="bg-red-500/20 border-red-400/30 text-red-700">
                <div>MySQL Connector</div>
                <div class="text-xs text-[var(--ink-muted)]">(ByLogicalTableRouter SMT)</div>
              </FlowNode>
            </DiagramTooltip>
          </div>
        </div>

        {/* Unified topic */}
        <div class="flex flex-col items-center gap-2 pt-3 border-t border-[var(--line-thin)]">
          <div class="flex items-center gap-3">
            <Arrow direction="down" label="Route to" />
          </div>
          <DiagramTooltip content={
            <div>
              <p class="font-semibold mb-1">Unified Topic</p>
              <p class="text-sm">unified.orders - события из обеих БД</p>
              <p class="text-sm mt-1">Требует identical schemas (или schema union)</p>
            </div>
          }>
            <FlowNode variant="cluster" className="w-full max-w-md">
              unified.orders
            </FlowNode>
          </DiagramTooltip>
        </div>

        {/* Consumer layer */}
        <div class="flex flex-col items-center gap-2">
          <Arrow direction="down" />
          <DiagramTooltip content={
            <div>
              <p class="font-semibold mb-1">PyFlink Consumer</p>
              <p class="text-sm">Упрощенный consumer - один топик вместо двух</p>
              <p class="text-sm mt-1">source.db field в CDC envelope для differentiation</p>
            </div>
          }>
            <FlowNode variant="connector" className="bg-purple-500/20 border-purple-400/30 text-purple-700 w-full max-w-md">
              <div>PyFlink Consumer</div>
              <div class="text-xs text-[var(--ink-muted)]">(single topic)</div>
            </FlowNode>
          </DiagramTooltip>
        </div>
      </div>

      <div class="mt-4 pt-3 border-t border-[var(--line-thin)] text-xs text-[var(--ink-muted)]">
        <p class="font-semibold mb-1">Unified Topics Pattern:</p>
        <ul class="space-y-1">
          <li>• <span class="text-emerald-700">Pros:</span> Упрощенный consumer (один топик, не UNION ALL)</li>
          <li>• <span class="text-emerald-700">Pros:</span> Единый retention policy</li>
          <li>• <span class="text-amber-700">Cons:</span> Требует identical schemas или schema union</li>
          <li>• <span class="text-amber-700">Cons:</span> Careful key design (могут коллидировать IDs из разных БД)</li>
          <li>• <span class="text-purple-700">ByLogicalTableRouter SMT</span> routing logic: topic.regex</li>
        </ul>
      </div>
    </DiagramContainer>
  );
}
