/**
 * WAL Configuration Diagrams
 *
 * Exports:
 * - WalLevelHierarchyDiagram: Three wal_level tiers
 * - WorkloadWalImpactDiagram: Workload types impact on WAL
 */

import { FlowNode } from '../primitives/FlowNode';
import { Arrow } from '../primitives/Arrow';
import { DiagramContainer } from '../primitives/DiagramContainer';
import { DiagramTooltip } from '../primitives/Tooltip';

/**
 * WalLevelHierarchyDiagram - Three wal_level tiers
 */
export function WalLevelHierarchyDiagram() {
  return (
    <div className="space-y-4">
      {/* Hierarchy stack */}
      <div className="flex flex-col items-center gap-4">
        {/* minimal */}
        <DiagramContainer title="wal_level = minimal" color="rose" className="w-full max-w-md">
          <div className="flex flex-col items-center gap-2">
            <DiagramTooltip content="Минимальный уровень — только для crash recovery. Не поддерживает репликацию. Наименьший объем WAL. Используется редко, в основном для standalone баз без репликации.">
              <FlowNode variant="app" tabIndex={0}>
                minimal
              </FlowNode>
            </DiagramTooltip>
            <div className="text-xs text-gray-400 text-center">
              Только crash recovery<br />
              Нет репликации
            </div>
          </div>
        </DiagramContainer>

        <Arrow direction="down" label="+10-20% WAL" />

        {/* replica */}
        <DiagramContainer title="wal_level = replica" color="blue" className="w-full max-w-md">
          <div className="flex flex-col items-center gap-2">
            <DiagramTooltip content="Стандартный уровень для physical replication и PITR (point-in-time recovery). Добавляет информацию для воспроизведения на standby. По умолчанию в большинстве PostgreSQL установок.">
              <FlowNode variant="sink" tabIndex={0}>
                replica
              </FlowNode>
            </DiagramTooltip>
            <div className="text-xs text-gray-400 text-center">
              + Physical replication<br />
              + Point-in-time recovery
            </div>
          </div>
        </DiagramContainer>

        <Arrow direction="down" label="+5-15% WAL" />

        {/* logical */}
        <DiagramContainer title="wal_level = logical" color="emerald" recommended className="w-full max-w-md">
          <div className="flex flex-col items-center gap-2">
            <DiagramTooltip content="Требуется для Debezium CDC. Добавляет данные для logical decoding: tuple data, relation OIDs. Позволяет преобразовать бинарный WAL в структурированные изменения.">
              <FlowNode variant="cluster" tabIndex={0}>
                logical
              </FlowNode>
            </DiagramTooltip>
            <div className="text-xs text-gray-400 text-center">
              + Logical decoding<br />
              + CDC (Debezium)
            </div>
          </div>
        </DiagramContainer>
      </div>

      {/* Debezium ready indicator */}
      <div className="flex justify-center mt-6">
        <DiagramTooltip content="При wal_level=logical PostgreSQL готов к CDC. Изменение требует перезапуска сервера. После перезапуска проверьте: SHOW wal_level; должен вернуть 'logical'.">
          <FlowNode variant="cluster" tabIndex={0} className="border-2 border-emerald-400">
            Debezium Ready
          </FlowNode>
        </DiagramTooltip>
      </div>
    </div>
  );
}

/**
 * WorkloadWalImpactDiagram - Three workload types impact
 */
export function WorkloadWalImpactDiagram() {
  return (
    <div className="space-y-6">
      {/* Workload types */}
      <div className="flex flex-col md:flex-row items-stretch justify-center gap-6">
        {/* INSERT-heavy */}
        <DiagramContainer title="INSERT-heavy" color="emerald" className="flex-1 max-w-xs">
          <div className="flex flex-col items-center gap-4">
            <DiagramTooltip content="Нагрузка с преобладанием INSERT. Минимальный overhead от logical decoding — логируется только новая строка. Идеально для event sourcing и append-only паттернов.">
              <FlowNode variant="cluster" tabIndex={0}>
                INSERT
              </FlowNode>
            </DiagramTooltip>

            <Arrow direction="down" />

            <DiagramTooltip content="Увеличение объема WAL при переходе с replica на logical. Для INSERT операций overhead минимален — добавляются только метаданные для декодирования.">
              <FlowNode variant="cluster" tabIndex={0} size="sm">
                +5%
              </FlowNode>
            </DiagramTooltip>

            <div className="text-xs text-gray-400 text-center">
              Минимальный overhead<br />
              Логируется только новая строка
            </div>
          </div>
        </DiagramContainer>

        {/* Mixed workload */}
        <DiagramContainer title="Mixed" color="blue" className="flex-1 max-w-xs">
          <div className="flex flex-col items-center gap-4">
            <DiagramTooltip content="Сбалансированная нагрузка INSERT + UPDATE + DELETE. Умеренное увеличение WAL при wal_level=logical. Типичный профиль для большинства OLTP приложений.">
              <FlowNode variant="sink" tabIndex={0}>
                INSERT + UPDATE
              </FlowNode>
            </DiagramTooltip>

            <Arrow direction="down" />

            <DiagramTooltip content="Умеренное увеличение объема WAL. UPDATE операции добавляют ключ для идентификации строки в дополнение к новым значениям.">
              <FlowNode variant="sink" tabIndex={0} size="sm">
                +10%
              </FlowNode>
            </DiagramTooltip>

            <div className="text-xs text-gray-400 text-center">
              Умеренный overhead<br />
              Типичный OLTP профиль
            </div>
          </div>
        </DiagramContainer>

        {/* UPDATE-heavy */}
        <DiagramContainer title="UPDATE-heavy" color="rose" className="flex-1 max-w-xs">
          <div className="flex flex-col items-center gap-4">
            <DiagramTooltip content="Нагрузка с преобладанием UPDATE. Максимальный overhead — особенно при REPLICA IDENTITY FULL (логируется полная строка до и после). Требует тщательного планирования емкости.">
              <FlowNode variant="app" tabIndex={0}>
                UPDATE + DELETE
              </FlowNode>
            </DiagramTooltip>

            <Arrow direction="down" />

            <DiagramTooltip content="Значительное увеличение объема WAL. При REPLICA IDENTITY FULL каждый UPDATE записывает полную строку до и после изменения. Может достигать 30-50% overhead.">
              <FlowNode variant="app" tabIndex={0} size="sm">
                +15-30%
              </FlowNode>
            </DiagramTooltip>

            <div className="text-xs text-gray-400 text-center">
              Максимальный overhead<br />
              Особенно при REPLICA IDENTITY FULL
            </div>
          </div>
        </DiagramContainer>
      </div>

      {/* Note about REPLICA IDENTITY */}
      <div className="flex justify-center">
        <DiagramContainer title="Влияние REPLICA IDENTITY" color="amber" className="max-w-lg">
          <div className="text-xs text-gray-400 text-center space-y-2">
            <div>
              <strong className="text-amber-300">DEFAULT:</strong> UPDATE/DELETE логирует только PK
            </div>
            <div>
              <strong className="text-amber-300">FULL:</strong> UPDATE/DELETE логирует полную строку до и после
            </div>
            <div className="text-rose-400">
              FULL может увеличить WAL на 30-50% для UPDATE-heavy таблиц!
            </div>
          </div>
        </DiagramContainer>
      </div>
    </div>
  );
}
