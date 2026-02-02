/**
 * Replication Slots Diagrams
 *
 * Exports:
 * - WalRetentionDiagram: WAL segments and slot retention visualization
 * - SlotLifecycleDiagram: Replication slot state diagram as flowchart
 */

import { FlowNode } from '../primitives/FlowNode';
import { Arrow } from '../primitives/Arrow';
import { DiagramContainer } from '../primitives/DiagramContainer';
import { DiagramTooltip } from '../primitives/Tooltip';

/**
 * WalRetentionDiagram - WAL segments and slot retention
 */
export function WalRetentionDiagram() {
  return (
    <div className="space-y-6">
      {/* WAL Segments */}
      <DiagramContainer title="WAL (Transaction Log)" color="blue">
        <div className="flex flex-col md:flex-row items-center justify-center gap-3 md:gap-2">
          {/* Deletable segments */}
          <DiagramTooltip content="WAL сегмент уже прочитан слотом. PostgreSQL может удалить его при необходимости для освобождения места. Данные успешно переданы в Debezium.">
            <FlowNode variant="app" tabIndex={0} size="sm">
              SEG1<br />
              <span className="text-[10px] opacity-70">0/1000000</span>
            </FlowNode>
          </DiagramTooltip>

          <Arrow direction="right" />

          <DiagramTooltip content="WAL сегмент уже прочитан слотом. PostgreSQL может удалить его при необходимости для освобождения места. Данные успешно переданы в Debezium.">
            <FlowNode variant="app" tabIndex={0} size="sm">
              SEG2<br />
              <span className="text-[10px] opacity-70">0/2000000</span>
            </FlowNode>
          </DiagramTooltip>

          <Arrow direction="right" />

          {/* Slot position marker */}
          <div className="relative">
            <DiagramTooltip content="Слот debezium_inventory с restart_lsn=0/3000000. Все сегменты после этой позиции гарантированно сохранены для CDC. PostgreSQL не удалит их до подтверждения чтения.">
              <FlowNode variant="connector" tabIndex={0} size="sm" className="border-2 border-amber-400">
                SEG3<br />
                <span className="text-[10px] opacity-70">0/3000000</span>
              </FlowNode>
            </DiagramTooltip>
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] text-amber-400 whitespace-nowrap">
              restart_lsn
            </div>
          </div>

          <Arrow direction="right" />

          {/* Retained segments */}
          <DiagramTooltip content="WAL сегмент сохраняется для слота. Не будет удален пока slot не подтвердит чтение через confirmed_flush_lsn. Содержит изменения, ожидающие обработки Debezium.">
            <FlowNode variant="cluster" tabIndex={0} size="sm">
              SEG4<br />
              <span className="text-[10px] opacity-70">0/4000000</span>
            </FlowNode>
          </DiagramTooltip>

          <Arrow direction="right" />

          <DiagramTooltip content="WAL сегмент сохраняется для слота. Не будет удален пока slot не подтвердит чтение через confirmed_flush_lsn. Содержит изменения, ожидающие обработки Debezium.">
            <FlowNode variant="cluster" tabIndex={0} size="sm">
              SEG5<br />
              <span className="text-[10px] opacity-70">0/5000000</span>
            </FlowNode>
          </DiagramTooltip>
        </div>
      </DiagramContainer>

      {/* Legend */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <DiagramContainer title="Можно удалить" color="rose" className="flex-1 max-w-xs">
          <div className="text-xs text-gray-400 text-center">
            Сегменты до restart_lsn<br />
            Уже прочитаны слотом
          </div>
        </DiagramContainer>

        <DiagramContainer title="Сохранено для слота" color="emerald" className="flex-1 max-w-xs">
          <div className="text-xs text-gray-400 text-center">
            Сегменты после restart_lsn<br />
            Ожидают чтения Debezium
          </div>
        </DiagramContainer>
      </div>

      {/* Slot info */}
      <div className="flex justify-center">
        <DiagramTooltip content="Replication slot отслеживает позицию потребителя в WAL. restart_lsn — точка, с которой начнется чтение при переподключении. confirmed_flush_lsn — последняя подтвержденная позиция.">
          <FlowNode variant="connector" tabIndex={0}>
            Replication Slot: debezium_inventory<br />
            <span className="text-xs opacity-70">restart_lsn: 0/3000000</span>
          </FlowNode>
        </DiagramTooltip>
      </div>
    </div>
  );
}

/**
 * SlotLifecycleDiagram - State diagram as flowchart with status colors
 */
export function SlotLifecycleDiagram() {
  return (
    <div className="space-y-6">
      {/* Main flow */}
      <div className="flex flex-col items-center gap-4">
        {/* Created */}
        <DiagramTooltip content="Debezium создает слот при первом запуске коннектора. PostgreSQL резервирует позицию в WAL и начинает отслеживать изменения с этого момента.">
          <FlowNode variant="sink" tabIndex={0}>
            Created
          </FlowNode>
        </DiagramTooltip>

        <Arrow direction="down" label="Connector подключается" />

        {/* Active */}
        <DiagramTooltip content="Коннектор подключен (active=true), читает изменения. Нормальное рабочее состояние CDC. WAL читается в реальном времени, confirmed_flush_lsn обновляется.">
          <FlowNode variant="cluster" tabIndex={0} className="border-2 border-emerald-400">
            Active
          </FlowNode>
        </DiagramTooltip>

        {/* Bidirectional arrows with labels on sides */}
        <div className="flex items-center justify-center gap-6 my-2">
          <div className="flex flex-col items-center">
            <Arrow direction="down" />
            <span className="text-xs text-gray-400">Отключение</span>
          </div>
          <div className="flex flex-col items-center">
            <Arrow direction="up" />
            <span className="text-xs text-gray-400">Переподключение</span>
          </div>
        </div>

        {/* Inactive */}
        <DiagramTooltip content="Нет активного соединения (active=false). Может быть временным (rebalance, restart) или постоянным (коннектор удален). WAL продолжает накапливаться!">
          <FlowNode variant="connector" tabIndex={0} className="border-2 border-amber-400">
            Inactive
          </FlowNode>
        </DiagramTooltip>
      </div>

      {/* Danger path */}
      <div className="flex flex-col lg:flex-row gap-6 justify-center">
        {/* Abandoned path */}
        <DiagramContainer title="Опасный путь" color="rose" className="flex-1 max-w-md">
          <div className="flex flex-col items-center gap-4">
            <div className="text-xs text-gray-400 text-center mb-2">
              Если коннектор удален, а слот остался...
            </div>

            <DiagramTooltip content="ОПАСНО: Inactive слот, чей коннектор удален. WAL накапливается бесконечно без присмотра. Требуется срочное внимание и cleanup.">
              <FlowNode variant="app" tabIndex={0} className="border-2 border-rose-400">
                Abandoned
              </FlowNode>
            </DiagramTooltip>

            <Arrow direction="down" label="WAL растет..." />

            <DiagramTooltip content="КРИТИЧНО: Abandoned slot заполнил диск WAL сегментами. PostgreSQL переходит в read-only или падает. Требуется emergency cleanup и возможно восстановление из бэкапа.">
              <FlowNode variant="target" tabIndex={0} className="border-2 border-rose-400">
                Disk Full
              </FlowNode>
            </DiagramTooltip>
          </div>
        </DiagramContainer>

        {/* Safe path */}
        <DiagramContainer title="Безопасный путь" color="emerald" className="flex-1 max-w-md">
          <div className="flex flex-col items-center gap-4">
            <div className="text-xs text-gray-400 text-center mb-2">
              Корректное удаление слота
            </div>

            <div className="text-xs text-gray-400 text-center">
              1. Удалить коннектор в Kafka Connect<br />
              2. Проверить что коннектор не нужен<br />
              3. pg_drop_replication_slot()
            </div>

            <Arrow direction="down" />

            <DiagramTooltip content="Слот безопасно удален через pg_drop_replication_slot(). WAL сегменты освобождены. Ресурсы PostgreSQL высвобождены. Можно создать новый коннектор при необходимости.">
              <FlowNode variant="cluster" tabIndex={0}>
                Dropped
              </FlowNode>
            </DiagramTooltip>
          </div>
        </DiagramContainer>
      </div>
    </div>
  );
}
