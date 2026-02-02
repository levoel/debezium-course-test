/**
 * Aurora Parameter Diagrams (Module 3)
 *
 * Exports:
 * - ParameterHierarchyDiagram: Parameter group hierarchy (Cluster -> DB -> Instance)
 * - AuroraSetupProcessDiagram: Setup steps flow with critical reboot step
 */

import { FlowNode } from '../primitives/FlowNode';
import { Arrow } from '../primitives/Arrow';
import { DiagramContainer } from '../primitives/DiagramContainer';
import { DiagramTooltip } from '../primitives/Tooltip';

/**
 * ParameterHierarchyDiagram - Parameter group hierarchy
 * Cluster parameter group -> DB parameter group -> Instance
 * Shows inheritance and override behavior
 */
export function ParameterHierarchyDiagram() {
  return (
    <div className="space-y-6">
      {/* Hierarchy Structure */}
      <DiagramContainer title="Aurora Parameter Group Hierarchy" color="emerald">
        <div className="flex flex-col items-center gap-4">
          {/* Cluster Level */}
          <DiagramTooltip content="DB Cluster Parameter Group применяется ко ВСЕМУ кластеру Aurora. Здесь настраиваются binlog_format, gtid_mode, aurora_enhanced_binlog. Это КРИТИЧЕСКИ важный уровень для CDC!">
            <FlowNode variant="cluster" tabIndex={0} className="border-2 border-emerald-400">
              <div className="flex flex-col items-center">
                <span className="text-xs text-emerald-400">Cluster Level</span>
                <span className="font-medium">DB Cluster Parameter Group</span>
              </div>
            </FlowNode>
          </DiagramTooltip>

          <div className="flex items-center gap-2">
            <Arrow direction="down" label="Inherits" />
            <div className="text-xs text-gray-400">(binlog, replication params)</div>
          </div>

          {/* Instance Level */}
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <DiagramTooltip content="Writer Instance получает ВСЕ параметры от Cluster PG + свои instance-specific (memory, connections). Debezium подключается ТОЛЬКО к Writer для чтения binlog.">
              <FlowNode variant="connector" tabIndex={0} className="border-2 border-amber-400">
                <div className="flex flex-col items-center">
                  <span className="text-xs text-amber-400">Writer</span>
                  <span>Instance PG</span>
                </div>
              </FlowNode>
            </DiagramTooltip>

            <DiagramTooltip content="Reader Instance получает те же cluster params, но НЕ имеет binlog (Aurora использует storage-level replication). НЕ подключайте Debezium к reader!">
              <FlowNode variant="database" tabIndex={0}>
                <div className="flex flex-col items-center">
                  <span className="text-xs text-blue-400">Reader</span>
                  <span>Instance PG</span>
                </div>
              </FlowNode>
            </DiagramTooltip>

            <DiagramTooltip content="Дополнительные readers получают идентичные cluster params. Масштабируют read нагрузку, но не участвуют в CDC.">
              <FlowNode variant="database" tabIndex={0}>
                <div className="flex flex-col items-center">
                  <span className="text-xs text-blue-400">Reader</span>
                  <span>Instance PG</span>
                </div>
              </FlowNode>
            </DiagramTooltip>
          </div>
        </div>
      </DiagramContainer>

      {/* Parameter Placement */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Cluster Parameters */}
        <DiagramContainer
          title="Cluster Parameter Group"
          color="emerald"
          recommended
          className="flex-1"
        >
          <div className="space-y-3">
            <DiagramTooltip content="Cluster parameters применяются ко всем инстансам кластера одновременно. Изменения требуют reboot ВСЕХ инстансов (Aurora 2.10+ — вручную каждый).">
              <div className="text-xs text-gray-400 text-center mb-3 cursor-help underline decoration-dotted">
                Применяется ко ВСЕМ инстансам
              </div>
            </DiagramTooltip>

            <div className="flex flex-col gap-2">
              <DiagramTooltip content="binlog_format=ROW обязателен для CDC. При STATEMENT или MIXED Debezium не сможет корректно захватывать изменения. Требует reboot.">
                <FlowNode variant="cluster" tabIndex={0} size="sm">
                  binlog_format = ROW
                </FlowNode>
              </DiagramTooltip>

              <DiagramTooltip content="binlog_row_image=FULL записывает полные данные строки до и после изменения. Рекомендуется для CDC, хотя увеличивает размер binlog.">
                <FlowNode variant="cluster" tabIndex={0} size="sm">
                  binlog_row_image = FULL
                </FlowNode>
              </DiagramTooltip>

              <DiagramTooltip content="GTID mode для надёжного failover. При включённом GTID Debezium может автоматически переключиться на новый primary без потери данных.">
                <FlowNode variant="cluster" tabIndex={0} size="sm">
                  gtid_mode = ON
                </FlowNode>
              </DiagramTooltip>

              <DiagramTooltip content="Aurora Enhanced Binlog — оптимизация для высоконагруженных CDC workloads. Параллельные записи, 99% улучшение recovery, но несовместим с backtrack.">
                <FlowNode variant="cluster" tabIndex={0} size="sm">
                  aurora_enhanced_binlog = 0/1
                </FlowNode>
              </DiagramTooltip>
            </div>
          </div>
        </DiagramContainer>

        {/* Instance Parameters */}
        <DiagramContainer
          title="DB Parameter Group (Instance)"
          color="blue"
          className="flex-1"
        >
          <div className="space-y-3">
            <DiagramTooltip content="Instance parameters применяются к конкретному инстансу. Используются для performance tuning. binlog параметры здесь НЕ доступны!">
              <div className="text-xs text-gray-400 text-center mb-3 cursor-help underline decoration-dotted">
                Применяется к конкретному инстансу
              </div>
            </DiagramTooltip>

            <div className="flex flex-col gap-2">
              <DiagramTooltip content="Максимум одновременных подключений. По умолчанию зависит от instance size. Debezium использует 1-2 подключения.">
                <FlowNode variant="sink" tabIndex={0} size="sm">
                  max_connections
                </FlowNode>
              </DiagramTooltip>

              <DiagramTooltip content="InnoDB buffer pool для кэширования данных. Aurora автоматически настраивает на основе instance memory.">
                <FlowNode variant="sink" tabIndex={0} size="sm">
                  innodb_buffer_pool_size
                </FlowNode>
              </DiagramTooltip>

              <DiagramTooltip content="Timeout для новых подключений. Увеличьте при high latency между Debezium и Aurora.">
                <FlowNode variant="sink" tabIndex={0} size="sm">
                  connect_timeout
                </FlowNode>
              </DiagramTooltip>
            </div>
          </div>
        </DiagramContainer>
      </div>

      {/* Critical Warning */}
      <DiagramContainer title="Критическая ошибка" color="rose" className="max-w-2xl mx-auto">
        <div className="text-sm text-gray-300 text-center space-y-2">
          <DiagramTooltip content="binlog_format, gtid_mode и другие replication параметры доступны ТОЛЬКО в DB Cluster Parameter Group. Попытка установить их в DB Parameter Group приведёт к ошибке или игнорированию.">
            <div className="font-semibold text-rose-300 cursor-help underline decoration-dotted">
              Не пытайтесь настроить binlog в Instance Parameter Group!
            </div>
          </DiagramTooltip>
          <div className="text-xs text-gray-400">
            AWS вернёт ошибку "parameter not applicable"<br />
            или изменение будет молча проигнорировано.
          </div>
        </div>
      </DiagramContainer>
    </div>
  );
}

/**
 * AuroraSetupProcessDiagram - Setup steps flow
 * Create cluster -> Configure parameters -> Enable binlog -> Reboot
 * Highlights critical reboot step with animate-pulse
 */
export function AuroraSetupProcessDiagram() {
  return (
    <div className="space-y-6">
      {/* 5-step process */}
      <DiagramContainer title="Aurora CDC Setup Process" color="emerald">
        <div className="flex flex-col md:flex-row items-center justify-center gap-3 md:gap-2 flex-wrap">
          {/* Step 1 */}
          <DiagramTooltip content="Создание DB Cluster Parameter Group (НЕ DB Instance!) через AWS Console, CLI или Terraform. Тип группы критичен — только в Cluster group доступен binlog_format.">
            <FlowNode variant="sink" tabIndex={0} size="sm">
              <div className="flex flex-col items-center">
                <span className="text-[10px] text-blue-400">Шаг 1</span>
                <span>Create Cluster<br />Parameter Group</span>
              </div>
            </FlowNode>
          </DiagramTooltip>

          <Arrow direction="right" />

          {/* Step 2 */}
          <DiagramTooltip content="Настройка параметров: binlog_format=ROW, binlog_row_image=FULL, gtid_mode=ON, enforce_gtid_consistency=ON. Все требуют ApplyMethod=pending-reboot.">
            <FlowNode variant="database" tabIndex={0} size="sm">
              <div className="flex flex-col items-center">
                <span className="text-[10px] text-purple-400">Шаг 2</span>
                <span>Modify Binlog<br />Parameters</span>
              </div>
            </FlowNode>
          </DiagramTooltip>

          <Arrow direction="right" />

          {/* Step 3 */}
          <DiagramTooltip content="Привязка parameter group к Aurora cluster через Modify Cluster. Apply Immediately или в maintenance window. После применения статус покажет pending-reboot.">
            <FlowNode variant="connector" tabIndex={0} size="sm">
              <div className="flex flex-col items-center">
                <span className="text-[10px] text-amber-400">Шаг 3</span>
                <span>Associate with<br />Aurora Cluster</span>
              </div>
            </FlowNode>
          </DiagramTooltip>

          <Arrow direction="right" />

          {/* Step 4 - CRITICAL with animate-pulse */}
          <DiagramTooltip content="КРИТИЧЕСКИ ВАЖНО: Reboot ВСЕХ инстансов обязателен! Aurora 2.10+ НЕ перезагружает readers автоматически. Без reboot binlog_format останется старым и Debezium не подключится.">
            <FlowNode variant="app" tabIndex={0} size="sm" className="border-2 border-rose-400 animate-pulse">
              <div className="flex flex-col items-center">
                <span className="text-[10px] text-rose-400 font-bold">Шаг 4 CRITICAL</span>
                <span>Reboot ALL<br />Instances</span>
              </div>
            </FlowNode>
          </DiagramTooltip>

          <Arrow direction="right" />

          {/* Step 5 */}
          <DiagramTooltip content="Проверка: SHOW VARIABLES LIKE 'binlog_format'; должен вернуть 'ROW' на ВСЕХ инстансах. Также mysql.rds_set_configuration('binlog retention hours', 168) для retention.">
            <FlowNode variant="cluster" tabIndex={0} size="sm">
              <div className="flex flex-col items-center">
                <span className="text-[10px] text-emerald-400">Шаг 5</span>
                <span>Verify Config<br />+ Set Retention</span>
              </div>
            </FlowNode>
          </DiagramTooltip>
        </div>
      </DiagramContainer>

      {/* Reboot Warning */}
      <DiagramContainer title="Aurora 2.10+ Reboot Behavior" color="rose" className="max-w-3xl mx-auto">
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 text-center">
              <div className="text-sm text-gray-300 mb-2">Aurora &lt; 2.10</div>
              <DiagramTooltip content="В старых версиях Aurora reboot writer автоматически перезагружал все readers. Одна команда — все инстансы обновлены.">
                <FlowNode variant="connector" tabIndex={0} size="sm" className="mx-auto">
                  Reboot Writer &rarr; All Rebooted
                </FlowNode>
              </DiagramTooltip>
            </div>

            <div className="flex-1 text-center">
              <div className="text-sm text-gray-300 mb-2">Aurora 2.10+</div>
              <DiagramTooltip content="КРИТИЧНО: Readers НЕ перезагружаются автоматически! После reboot writer нужно вручную перезагрузить каждый reader. Иначе readers будут показывать старые параметры.">
                <FlowNode variant="target" tabIndex={0} size="sm" className="mx-auto border-2 border-rose-400">
                  Reboot Writer + Each Reader
                </FlowNode>
              </DiagramTooltip>
            </div>
          </div>

          <div className="text-xs text-gray-400 text-center">
            Проверьте binlog_format на КАЖДОМ инстансе после reboot!<br />
            <code className="bg-gray-800 px-1 rounded">SHOW VARIABLES LIKE 'binlog_format';</code> должен показать ROW на всех.
          </div>
        </div>
      </DiagramContainer>

      {/* Binlog Retention */}
      <DiagramContainer title="Binlog Retention через Stored Procedure" color="amber" className="max-w-2xl mx-auto">
        <div className="space-y-3">
          <div className="text-sm text-gray-300 text-center">
            Aurora НЕ поддерживает binlog_expire_logs_seconds.<br />
            Используйте stored procedure:
          </div>

          <DiagramTooltip content="mysql.rds_set_configuration — Aurora-специфичная процедура для настройки retention. Максимум 2160 часов (90 дней) для Aurora 3.x. Выполняйте только на Writer instance.">
            <div className="bg-gray-800/50 rounded-lg p-3 font-mono text-xs text-center">
              CALL mysql.rds_set_configuration('binlog retention hours', 168);
            </div>
          </DiagramTooltip>

          <div className="text-xs text-gray-400 text-center">
            168 часов = 7 дней (рекомендуется для CDC)
          </div>
        </div>
      </DiagramContainer>

      {/* Verification Checklist */}
      <DiagramContainer title="Чеклист проверки после настройки" color="emerald" className="max-w-lg mx-auto">
        <div className="text-xs text-gray-400 space-y-2 font-mono">
          <DiagramTooltip content="Проверяет формат binlog. Должен быть ROW для CDC.">
            <div className="cursor-help">SHOW VARIABLES LIKE 'binlog_format'; -- ROW</div>
          </DiagramTooltip>
          <DiagramTooltip content="Проверяет полноту row image. FULL рекомендуется.">
            <div className="cursor-help">SHOW VARIABLES LIKE 'binlog_row_image'; -- FULL</div>
          </DiagramTooltip>
          <DiagramTooltip content="Проверяет GTID mode. ON для надёжного failover.">
            <div className="cursor-help">SHOW VARIABLES LIKE 'gtid_mode'; -- ON</div>
          </DiagramTooltip>
          <DiagramTooltip content="Проверяет текущую binlog позицию и GTID set.">
            <div className="cursor-help">SHOW MASTER STATUS; -- file, position, gtid</div>
          </DiagramTooltip>
          <DiagramTooltip content="Проверяет настроенный retention через stored procedure.">
            <div className="cursor-help">CALL mysql.rds_show_configuration; -- retention hours</div>
          </DiagramTooltip>
        </div>
      </DiagramContainer>
    </div>
  );
}
