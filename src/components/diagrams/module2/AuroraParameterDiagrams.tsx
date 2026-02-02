/**
 * Aurora Parameter Diagrams
 *
 * Exports:
 * - AuroraParameterGroupDiagram: Cluster vs Instance parameter groups
 * - AuroraSetupProcessDiagram: 5-step setup process
 */

import { FlowNode } from '../primitives/FlowNode';
import { Arrow } from '../primitives/Arrow';
import { DiagramContainer } from '../primitives/DiagramContainer';
import { DiagramTooltip } from '../primitives/Tooltip';

/**
 * AuroraParameterGroupDiagram - Cluster vs Instance parameter groups
 */
export function AuroraParameterGroupDiagram() {
  return (
    <div className="space-y-6">
      {/* Parameter Groups */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Cluster Parameter Group */}
        <DiagramContainer
          title="DB Cluster Parameter Group"
          color="emerald"
          recommended
          className="flex-1"
        >
          <div className="space-y-3">
            <DiagramTooltip content="DB Cluster Parameter Group применяется ко ВСЕМУ кластеру Aurora. Здесь настраивается rds.logical_replication=1 для CDC. Это критически важный тип группы для Debezium!">
              <div className="text-xs text-gray-400 text-center mb-3 cursor-help underline decoration-dotted">
                Применяется ко ВСЕМ инстансам кластера
              </div>
            </DiagramTooltip>

            <div className="flex flex-col gap-2">
              <DiagramTooltip content="Ключевой параметр для CDC в Aurora. Значение 1 включает logical replication (устанавливает wal_level=logical). Без этого параметра Debezium не сможет подключиться.">
                <FlowNode variant="cluster" tabIndex={0} size="sm">
                  rds.logical_replication = 1
                </FlowNode>
              </DiagramTooltip>

              <DiagramTooltip content="Максимум слотов репликации. Минимум 1 на коннектор + 2-3 запаса. Рекомендуется 10 для production. Каждый Debezium коннектор требует один слот.">
                <FlowNode variant="cluster" tabIndex={0} size="sm">
                  max_replication_slots = 10
                </FlowNode>
              </DiagramTooltip>

              <DiagramTooltip content="Максимум соединений для чтения WAL. Должен быть >= max_replication_slots. Каждый активный слот использует одно соединение.">
                <FlowNode variant="cluster" tabIndex={0} size="sm">
                  max_wal_senders = 10
                </FlowNode>
              </DiagramTooltip>
            </div>
          </div>
        </DiagramContainer>

        {/* Instance Parameter Group */}
        <DiagramContainer
          title="DB Instance Parameter Group"
          color="blue"
          className="flex-1"
        >
          <div className="space-y-3">
            <DiagramTooltip content="DB Instance Parameter Group применяется к конкретному инстансу. Используется для memory tuning, не для репликации. rds.logical_replication здесь НЕ доступен!">
              <div className="text-xs text-gray-400 text-center mb-3 cursor-help underline decoration-dotted">
                Применяется к конкретному инстансу
              </div>
            </DiagramTooltip>

            <div className="flex flex-col gap-2">
              <DiagramTooltip content="Размер shared buffer pool для кэширования данных. Настраивается на уровне инстанса в зависимости от его размера (instance class).">
                <FlowNode variant="sink" tabIndex={0} size="sm">
                  shared_buffers
                </FlowNode>
              </DiagramTooltip>

              <DiagramTooltip content="Память для операций сортировки и хэширования в запросах. Выделяется на каждое соединение, поэтому не устанавливайте слишком большое значение.">
                <FlowNode variant="sink" tabIndex={0} size="sm">
                  work_mem
                </FlowNode>
              </DiagramTooltip>

              <DiagramTooltip content="Память для операций обслуживания: VACUUM, CREATE INDEX, ALTER TABLE. Можно установить больше чем work_mem для ускорения обслуживания.">
                <FlowNode variant="sink" tabIndex={0} size="sm">
                  maintenance_work_mem
                </FlowNode>
              </DiagramTooltip>
            </div>
          </div>
        </DiagramContainer>
      </div>

      {/* Aurora Instances */}
      <div className="flex flex-col items-center gap-4">
        <div className="text-sm text-gray-400 text-center">
          Aurora Cluster Instances
        </div>

        <div className="flex flex-col md:flex-row gap-4 justify-center">
          <DiagramTooltip content="Primary инстанс Aurora, обрабатывающий write операции. Debezium подключается к Writer для чтения WAL. Только Writer генерирует изменения для CDC.">
            <FlowNode variant="connector" tabIndex={0} className="border-2 border-amber-400">
              Writer Instance
            </FlowNode>
          </DiagramTooltip>

          <DiagramTooltip content="Read replica для read-only запросов. Не участвует в CDC напрямую. Используется для распределения нагрузки чтения. Синхронизируется через storage layer Aurora.">
            <FlowNode variant="database" tabIndex={0}>
              Reader Instance 1
            </FlowNode>
          </DiagramTooltip>

          <DiagramTooltip content="Read replica для read-only запросов. Не участвует в CDC напрямую. Используется для распределения нагрузки чтения. Синхронизируется через storage layer Aurora.">
            <FlowNode variant="database" tabIndex={0}>
              Reader Instance 2
            </FlowNode>
          </DiagramTooltip>
        </div>

        <div className="text-xs text-gray-500 text-center">
          Cluster Parameter Group применяется ко ВСЕМ инстансам
        </div>
      </div>
    </div>
  );
}

/**
 * AuroraSetupProcessDiagram - 5-step setup process
 */
export function AuroraSetupProcessDiagram() {
  return (
    <div className="space-y-6">
      {/* 5-step process */}
      <div className="flex flex-col md:flex-row items-center justify-center gap-3 md:gap-2 flex-wrap">
        {/* Step 1 */}
        <DiagramTooltip content="Создание DB Cluster Parameter Group (не DB Instance!) в AWS Console или через CLI. Важно: тип группы критичен — только в Cluster group доступен rds.logical_replication.">
          <FlowNode variant="sink" tabIndex={0} size="sm">
            <div className="flex flex-col items-center">
              <span className="text-[10px] text-blue-400">Шаг 1</span>
              <span>Создать<br />Parameter Group</span>
            </div>
          </FlowNode>
        </DiagramTooltip>

        <Arrow direction="right" />

        {/* Step 2 */}
        <DiagramTooltip content="Настройка параметров: rds.logical_replication=1, max_replication_slots=10, max_wal_senders=10, max_logical_replication_workers=10. Все параметры требуют pending-reboot.">
          <FlowNode variant="database" tabIndex={0} size="sm">
            <div className="flex flex-col items-center">
              <span className="text-[10px] text-purple-400">Шаг 2</span>
              <span>Изменить<br />параметры</span>
            </div>
          </FlowNode>
        </DiagramTooltip>

        <Arrow direction="right" />

        {/* Step 3 */}
        <DiagramTooltip content="Применение parameter group к Aurora кластеру через Modify Cluster. Можно Apply Immediately или в maintenance window. После применения статус покажет pending-reboot.">
          <FlowNode variant="connector" tabIndex={0} size="sm">
            <div className="flex flex-col items-center">
              <span className="text-[10px] text-amber-400">Шаг 3</span>
              <span>Применить<br />к кластеру</span>
            </div>
          </FlowNode>
        </DiagramTooltip>

        <Arrow direction="right" />

        {/* Step 4 - CRITICAL */}
        <DiagramTooltip content="КРИТИЧЕСКИ ВАЖНО: Reboot Writer Instance обязателен! Без reboot wal_level останется 'replica' и Debezium не подключится. Это самая частая ошибка при настройке Aurora CDC.">
          <FlowNode variant="app" tabIndex={0} size="sm" className="border-2 border-rose-400 animate-pulse">
            <div className="flex flex-col items-center">
              <span className="text-[10px] text-rose-400 font-bold">Шаг 4 CRITICAL</span>
              <span>Reboot<br />Writer Instance</span>
            </div>
          </FlowNode>
        </DiagramTooltip>

        <Arrow direction="right" />

        {/* Step 5 */}
        <DiagramTooltip content="Проверка: SHOW wal_level; должен вернуть 'logical'. Если 'replica' — reboot не был выполнен. Также проверьте SHOW rds.logical_replication; — должен быть 'on'.">
          <FlowNode variant="cluster" tabIndex={0} size="sm">
            <div className="flex flex-col items-center">
              <span className="text-[10px] text-emerald-400">Шаг 5</span>
              <span>Проверить<br />конфигурацию</span>
            </div>
          </FlowNode>
        </DiagramTooltip>
      </div>

      {/* Critical warning */}
      <DiagramContainer title="Критическое предупреждение" color="rose" className="max-w-2xl mx-auto">
        <div className="text-sm text-gray-300 text-center space-y-2">
          <div className="font-semibold text-rose-300">
            Шаг 4 (Reboot) обязателен!
          </div>
          <div className="text-xs text-gray-400">
            Без reboot Writer Instance параметры НЕ применяются.
            <br />
            <code className="bg-gray-800 px-1 rounded text-[11px]">SHOW wal_level;</code> покажет <code className="bg-gray-800 px-1 rounded text-[11px]">replica</code> вместо <code className="bg-gray-800 px-1 rounded text-[11px]">logical</code>
            <br />
            Debezium выдаст ошибку: "wal_level must be logical to use logical replication"
          </div>
        </div>
      </DiagramContainer>

      {/* Verification checklist */}
      <DiagramContainer title="Проверка после настройки" color="emerald" className="max-w-lg mx-auto">
        <div className="text-[11px] text-gray-400 space-y-1 font-mono">
          <div>SHOW wal_level; -- должен быть 'logical'</div>
          <div>SHOW rds.logical_replication; -- должен быть 'on'</div>
          <div>SHOW max_replication_slots; -- минимум 10</div>
          <div>SHOW max_wal_senders; -- минимум 10</div>
        </div>
      </DiagramContainer>
    </div>
  );
}
