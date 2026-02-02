/**
 * EventStructureDiagram - Operation types and event structure diagrams
 *
 * Exports:
 * - OperationTypesDiagram: Four CDC operation types in a 2x2 grid
 * - EventStructureDiagram: Hierarchical event structure showing envelope format
 */

import { FlowNode } from '../primitives/FlowNode';
import { Arrow } from '../primitives/Arrow';
import { DiagramContainer } from '../primitives/DiagramContainer';
import { DiagramTooltip } from '../primitives/Tooltip';

/**
 * OperationTypesDiagram - Four operation types in a 2x2 grid
 */
export function OperationTypesDiagram() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* r - snapshot */}
      <DiagramContainer title="r (snapshot)" color="emerald" className="py-6">
        <DiagramTooltip content="Read операция при начальном snapshot. Debezium читает существующие записи при первом запуске. Поле source.snapshot='true'.">
          <div className="flex items-center justify-center gap-3" tabIndex={0}>
            <FlowNode variant="sink" size="sm">
              <span className="text-gray-400">null</span>
            </FlowNode>
            <Arrow direction="right" />
            <FlowNode variant="database" size="sm">
              данные
            </FlowNode>
          </div>
        </DiagramTooltip>
      </DiagramContainer>

      {/* c - create */}
      <DiagramContainer title="c (create)" color="blue" className="py-6">
        <DiagramTooltip content="INSERT операция. Новая запись добавлена в таблицу. Поле before=null, данные в after.">
          <div className="flex items-center justify-center gap-3" tabIndex={0}>
            <FlowNode variant="sink" size="sm">
              <span className="text-gray-400">null</span>
            </FlowNode>
            <Arrow direction="right" />
            <FlowNode variant="connector" size="sm">
              данные
            </FlowNode>
          </div>
        </DiagramTooltip>
      </DiagramContainer>

      {/* u - update */}
      <DiagramContainer title="u (update)" color="amber" className="py-6">
        <DiagramTooltip content="UPDATE операция. Изменение существующей записи. Оба поля before и after заполнены для сравнения.">
          <div className="flex items-center justify-center gap-3" tabIndex={0}>
            <FlowNode variant="cluster" size="sm">
              старое
            </FlowNode>
            <Arrow direction="right" />
            <FlowNode variant="cluster" size="sm">
              новое
            </FlowNode>
          </div>
        </DiagramTooltip>
      </DiagramContainer>

      {/* d - delete */}
      <DiagramContainer title="d (delete)" color="rose" className="py-6">
        <DiagramTooltip content="DELETE операция. Запись удалена. Поле after=null, удаленные данные в before для аудита.">
          <div className="flex items-center justify-center gap-3" tabIndex={0}>
            <FlowNode variant="app" size="sm">
              данные
            </FlowNode>
            <Arrow direction="right" />
            <FlowNode variant="sink" size="sm">
              <span className="text-gray-400">null</span>
            </FlowNode>
          </div>
        </DiagramTooltip>
      </DiagramContainer>
    </div>
  );
}

/**
 * TreeLine - SVG connector for tree branches
 */
function TreeLine({ isLast = false }: { isLast?: boolean }) {
  return (
    <div className="flex items-center justify-center w-6 mr-1">
      <svg width="24" height="24" viewBox="0 0 24 24" className="text-gray-500/70">
        {/* Vertical line (full height if not last, half if last) */}
        <line
          x1="12"
          y1="0"
          x2="12"
          y2={isLast ? '12' : '24'}
          stroke="currentColor"
          strokeWidth="1.5"
        />
        {/* Horizontal line to node */}
        <line x1="12" y1="12" x2="24" y2="12" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    </div>
  );
}

/**
 * TreeBranch - Renders tree structure with connecting lines
 */
function TreeBranch({
  children,
  isLast = false,
}: {
  children: React.ReactNode;
  isLast?: boolean;
}) {
  return (
    <div className="flex items-start">
      <TreeLine isLast={isLast} />
      <div className="flex-1 py-0.5">{children}</div>
    </div>
  );
}

/**
 * TreeChildren - Wrapper for nested tree items with vertical line
 */
function TreeChildren({ children }: { children: React.ReactNode }) {
  return (
    <div className="ml-3 pl-3 border-l border-gray-500/40 space-y-0.5 mt-1">
      {children}
    </div>
  );
}

/**
 * EventStructureDiagram - Hierarchical event structure as tree
 */
export function EventStructureDiagram() {
  return (
    <DiagramContainer title="Структура CDC Event" color="neutral" className="py-4">
      <div className="space-y-1">
        {/* Root node */}
        <DiagramTooltip content="Debezium envelope — стандартная обёртка для всех CDC-событий. Содержит schema (опционально) и payload с данными.">
          <FlowNode variant="cluster" size="sm" tabIndex={0}>
            CDC Event
          </FlowNode>
        </DiagramTooltip>

        <TreeChildren>
          {/* schema branch */}
          <TreeBranch>
            <div className="flex items-center gap-3">
              <DiagramTooltip content="JSON Schema описание структуры payload. Полезно для Schema Registry, но для базовой работы можно игнорировать.">
                <FlowNode variant="sink" size="sm" tabIndex={0}>
                  schema
                </FlowNode>
              </DiagramTooltip>
              <span className="text-gray-500 text-xs font-mono">{'{ type, fields }'}</span>
            </div>
          </TreeBranch>

          {/* payload branch */}
          <TreeBranch isLast>
            <div>
              <DiagramTooltip content="Основная часть события с данными. Содержит состояния строки до/после изменения и метаданные.">
                <FlowNode variant="connector" size="sm" tabIndex={0}>
                  payload
                </FlowNode>
              </DiagramTooltip>

              <TreeChildren>
                <TreeBranch>
                  <div className="flex items-center gap-3">
                    <DiagramTooltip content="Состояние строки ДО изменения. null для INSERT и snapshot, заполнен для UPDATE и DELETE.">
                      <FlowNode variant="database" size="sm" tabIndex={0}>
                        before
                      </FlowNode>
                    </DiagramTooltip>
                    <span className="text-gray-500 text-xs">состояние ДО</span>
                  </div>
                </TreeBranch>

                <TreeBranch>
                  <div className="flex items-center gap-3">
                    <DiagramTooltip content="Состояние строки ПОСЛЕ изменения. null для DELETE, заполнен для INSERT, UPDATE и snapshot.">
                      <FlowNode variant="database" size="sm" tabIndex={0}>
                        after
                      </FlowNode>
                    </DiagramTooltip>
                    <span className="text-gray-500 text-xs">состояние ПОСЛЕ</span>
                  </div>
                </TreeBranch>

                <TreeBranch>
                  <div className="flex items-center gap-3">
                    <DiagramTooltip content="Тип операции: r=snapshot, c=create, u=update, d=delete. Критично для правильной обработки события.">
                      <FlowNode variant="app" size="sm" tabIndex={0}>
                        op
                      </FlowNode>
                    </DiagramTooltip>
                    <span className="text-gray-500 text-xs font-mono">r | c | u | d</span>
                  </div>
                </TreeBranch>

                <TreeBranch>
                  <div className="flex items-center gap-3">
                    <DiagramTooltip content="Timestamp обработки события Debezium в миллисекундах. Для event time используйте source.ts_ms.">
                      <FlowNode variant="app" size="sm" tabIndex={0}>
                        ts_ms
                      </FlowNode>
                    </DiagramTooltip>
                    <span className="text-gray-500 text-xs">timestamp Debezium</span>
                  </div>
                </TreeBranch>

                <TreeBranch isLast>
                  <div>
                    <DiagramTooltip content="Метаданные об источнике: версия Debezium, имя базы, схемы, таблицы, позиция в WAL (lsn), ID транзакции.">
                      <FlowNode variant="connector" size="sm" tabIndex={0}>
                        source
                      </FlowNode>
                    </DiagramTooltip>

                    <TreeChildren>
                      <TreeBranch>
                        <DiagramTooltip content="Имя базы данных">
                          <FlowNode variant="sink" size="sm" tabIndex={0}>
                            db
                          </FlowNode>
                        </DiagramTooltip>
                      </TreeBranch>
                      <TreeBranch>
                        <DiagramTooltip content="Имя схемы (namespace)">
                          <FlowNode variant="sink" size="sm" tabIndex={0}>
                            schema
                          </FlowNode>
                        </DiagramTooltip>
                      </TreeBranch>
                      <TreeBranch>
                        <DiagramTooltip content="Имя таблицы">
                          <FlowNode variant="sink" size="sm" tabIndex={0}>
                            table
                          </FlowNode>
                        </DiagramTooltip>
                      </TreeBranch>
                      <TreeBranch>
                        <DiagramTooltip content="Log Sequence Number — позиция в WAL">
                          <FlowNode variant="sink" size="sm" tabIndex={0}>
                            lsn
                          </FlowNode>
                        </DiagramTooltip>
                      </TreeBranch>
                      <TreeBranch isLast>
                        <DiagramTooltip content="ID транзакции PostgreSQL">
                          <FlowNode variant="sink" size="sm" tabIndex={0}>
                            txId
                          </FlowNode>
                        </DiagramTooltip>
                      </TreeBranch>
                    </TreeChildren>
                  </div>
                </TreeBranch>
              </TreeChildren>
            </div>
          </TreeBranch>
        </TreeChildren>
      </div>
    </DiagramContainer>
  );
}
