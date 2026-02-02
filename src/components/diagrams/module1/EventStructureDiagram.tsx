/**
 * EventStructureDiagram - Operation types and event structure diagrams
 *
 * Exports:
 * - OperationTypesDiagram: Four CDC operation types in a 2x2 grid
 * - EventStructureDiagram: Hierarchical event structure showing envelope format
 */

import { FlowNode } from '../primitives/FlowNode';
import { DiagramContainer } from '../primitives/DiagramContainer';
import { DiagramTooltip } from '../primitives/Tooltip';

/**
 * OperationTypesDiagram - Four operation types in a 2x2 grid
 */
export function OperationTypesDiagram() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* r - snapshot */}
      <DiagramContainer title="r (snapshot)" color="emerald" className="flex justify-center items-center py-8">
        <DiagramTooltip content="Read операция при начальном snapshot. Debezium читает существующие записи при первом запуске. Поле source.snapshot='true'.">
          <FlowNode variant="database" tabIndex={0} size="md">
            <div className="text-center">
              <div className="font-semibold">before: null</div>
              <div className="font-semibold">after: данные</div>
            </div>
          </FlowNode>
        </DiagramTooltip>
      </DiagramContainer>

      {/* c - create */}
      <DiagramContainer title="c (create)" color="blue" className="flex justify-center items-center py-8">
        <DiagramTooltip content="INSERT операция. Новая запись добавлена в таблицу. Поле before=null, данные в after.">
          <FlowNode variant="connector" tabIndex={0} size="md">
            <div className="text-center">
              <div className="font-semibold">before: null</div>
              <div className="font-semibold">after: данные</div>
            </div>
          </FlowNode>
        </DiagramTooltip>
      </DiagramContainer>

      {/* u - update */}
      <DiagramContainer title="u (update)" color="amber" className="flex justify-center items-center py-8">
        <DiagramTooltip content="UPDATE операция. Изменение существующей записи. Оба поля before и after заполнены для сравнения.">
          <FlowNode variant="cluster" tabIndex={0} size="md">
            <div className="text-center">
              <div className="font-semibold">before: старое</div>
              <div className="font-semibold">after: новое</div>
            </div>
          </FlowNode>
        </DiagramTooltip>
      </DiagramContainer>

      {/* d - delete */}
      <DiagramContainer title="d (delete)" color="rose" className="flex justify-center items-center py-8">
        <DiagramTooltip content="DELETE операция. Запись удалена. Поле after=null, удаленные данные в before для аудита.">
          <FlowNode variant="sink" tabIndex={0} size="md">
            <div className="text-center">
              <div className="font-semibold">before: данные</div>
              <div className="font-semibold">after: null</div>
            </div>
          </FlowNode>
        </DiagramTooltip>
      </DiagramContainer>
    </div>
  );
}

/**
 * EventStructureDiagram - Hierarchical event structure
 */
export function EventStructureDiagram() {
  return (
    <div className="w-full">
      <DiagramContainer title="CDC Event" color="neutral" className="space-y-4">
        {/* Schema section */}
        <DiagramContainer title="schema" color="neutral" className="py-4">
          <DiagramTooltip content="JSON Schema описание структуры payload. Полезно для Schema Registry, но для базовой работы можно игнорировать.">
            <div className="text-center text-sm text-gray-400 cursor-pointer" tabIndex={0}>
              type: "struct", fields: [...]
            </div>
          </DiagramTooltip>
        </DiagramContainer>

        {/* Payload section */}
        <DiagramContainer title="payload" color="blue" className="space-y-3 py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {/* before */}
            <DiagramTooltip content="Состояние строки ДО изменения. null для INSERT и snapshot, заполнен для UPDATE и DELETE.">
              <FlowNode variant="database" tabIndex={0} size="sm">
                before
              </FlowNode>
            </DiagramTooltip>

            {/* after */}
            <DiagramTooltip content="Состояние строки ПОСЛЕ изменения. null для DELETE, заполнен для INSERT, UPDATE и snapshot.">
              <FlowNode variant="database" tabIndex={0} size="sm">
                after
              </FlowNode>
            </DiagramTooltip>

            {/* op */}
            <DiagramTooltip content="Тип операции: r=snapshot, c=create, u=update, d=delete. Критично для правильной обработки события.">
              <FlowNode variant="connector" tabIndex={0} size="sm">
                op
              </FlowNode>
            </DiagramTooltip>

            {/* ts_ms */}
            <DiagramTooltip content="Timestamp обработки события Debezium в миллисекундах. Для event time используйте source.ts_ms.">
              <FlowNode variant="app" tabIndex={0} size="sm">
                ts_ms
              </FlowNode>
            </DiagramTooltip>

            {/* source */}
            <div className="md:col-span-2">
              <DiagramTooltip content="Метаданные об источнике: версия Debezium, имя базы, схемы, таблицы, позиция в WAL (lsn), ID транзакции.">
                <DiagramContainer title="source" color="amber" className="py-3">
                  <div className="flex flex-wrap gap-2 justify-center text-xs">
                    <span className="px-2 py-1 bg-gray-800 rounded">db</span>
                    <span className="px-2 py-1 bg-gray-800 rounded">schema</span>
                    <span className="px-2 py-1 bg-gray-800 rounded">table</span>
                    <span className="px-2 py-1 bg-gray-800 rounded">lsn</span>
                    <span className="px-2 py-1 bg-gray-800 rounded">txId</span>
                  </div>
                </DiagramContainer>
              </DiagramTooltip>
            </div>
          </div>
        </DiagramContainer>
      </DiagramContainer>
    </div>
  );
}
