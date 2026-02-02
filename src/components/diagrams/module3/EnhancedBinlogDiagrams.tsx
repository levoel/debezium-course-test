/**
 * Enhanced Binlog Diagrams
 *
 * Exports:
 * - EnhancedBinlogArchitectureDiagram: Enhanced Binlog architecture with storage tier
 * - StorageTierDiagram: Storage architecture detail (6 nodes across 3 AZs)
 * - EnhancedVsStandardDiagram: Side-by-side comparison
 * - RetentionComparisonDiagram: Retention behavior comparison
 */

import { FlowNode } from '../primitives/FlowNode';
import { Arrow } from '../primitives/Arrow';
import { DiagramContainer } from '../primitives/DiagramContainer';
import { DiagramTooltip } from '../primitives/Tooltip';

/**
 * EnhancedBinlogArchitectureDiagram - Enhanced Binlog architecture
 * Aurora storage tier (shared) -> Enhanced Binlog layer -> Connector
 * Shows separation from compute tier
 */
export function EnhancedBinlogArchitectureDiagram() {
  return (
    <div className="space-y-6">
      {/* Architecture Overview */}
      <DiagramContainer title="Enhanced Binlog Architecture" color="emerald">
        <div className="flex flex-col items-center gap-6">
          {/* Compute Tier */}
          <div className="w-full">
            <div className="text-xs text-gray-400 text-center mb-2">Compute Tier</div>
            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <DiagramTooltip content="MySQL Engine выполняет транзакции и генерирует события ПАРАЛЛЕЛЬНО: transaction log events идут в standard storage, binlog events — в Enhanced Binlog storage. Без ожидания сортировки!">
                <FlowNode variant="database" tabIndex={0}>
                  <div className="flex flex-col items-center">
                    <span className="text-sm font-medium">MySQL Engine</span>
                    <span className="text-[10px] text-gray-400">Transaction Execution</span>
                  </div>
                </FlowNode>
              </DiagramTooltip>
            </div>
          </div>

          {/* Parallel Writes */}
          <div className="flex flex-col md:flex-row gap-8 items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <Arrow direction="down" label="Transaction Log" />
              <DiagramTooltip content="Standard Aurora storage nodes получают transaction log events. Это durability layer для данных таблиц. 6 копий across 3 AZs.">
                <FlowNode variant="sink" tabIndex={0} size="sm">
                  Standard Storage
                </FlowNode>
              </DiagramTooltip>
            </div>

            <div className="flex flex-col items-center gap-2">
              <Arrow direction="down" label="Binlog Events (unsorted)" />
              <DiagramTooltip content="Enhanced Binlog storage nodes — СПЕЦИАЛИЗИРОВАННЫЕ узлы для binlog. Принимают несортированные события, выполняют ordering на storage layer. Compute освобождается от сортировки!">
                <FlowNode variant="cluster" tabIndex={0} size="sm" className="border-2 border-emerald-400">
                  Enhanced Binlog Storage
                </FlowNode>
              </DiagramTooltip>
            </div>
          </div>

          {/* Storage Processing */}
          <DiagramTooltip content="Сортировка и упорядочивание binlog событий происходит на storage layer, НЕ на compute. Это ключевая инновация: CPU-intensive операция перенесена с движка на специализированные узлы.">
            <FlowNode variant="connector" tabIndex={0}>
              <div className="flex flex-col items-center">
                <span className="text-sm font-medium">Sorting & Ordering</span>
                <span className="text-[10px] text-gray-400">At Storage Layer</span>
              </div>
            </FlowNode>
          </DiagramTooltip>

          <Arrow direction="down" label="Ordered binlog" />

          {/* Output */}
          <DiagramTooltip content="Результат: упорядоченные binlog файлы mysql-bin-changelog.NNNNNN. Debezium читает через стандартный MySQL binlog protocol — никаких изменений в connector не требуется.">
            <FlowNode variant="sink" tabIndex={0}>
              <div className="flex flex-col items-center">
                <span className="text-sm font-medium">mysql-bin-changelog.*</span>
                <span className="text-[10px] text-gray-400">256 MB max_binlog_size</span>
              </div>
            </FlowNode>
          </DiagramTooltip>
        </div>
      </DiagramContainer>

      {/* Performance Claims */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <DiagramContainer title="Recovery Time" color="emerald" className="text-center">
          <DiagramTooltip content="AWS claim: 99% улучшение recovery времени. Standard binlog ~10 минут, Enhanced Binlog ~6 секунд. Storage nodes уже имеют упорядоченные события.">
            <div className="cursor-help">
              <div className="text-2xl font-bold text-emerald-300">99%</div>
              <div className="text-xs text-gray-400">улучшение recovery</div>
            </div>
          </DiagramTooltip>
        </DiagramContainer>

        <DiagramContainer title="Compute Overhead" color="emerald" className="text-center">
          <DiagramTooltip content="AWS claim: compute overhead падает с 50% до 13%. Сортировка binlog событий перенесена на storage layer, движок освобождается для обработки транзакций.">
            <div className="cursor-help">
              <div className="text-2xl font-bold text-emerald-300">50% &rarr; 13%</div>
              <div className="text-xs text-gray-400">compute overhead</div>
            </div>
          </DiagramTooltip>
        </DiagramContainer>

        <DiagramContainer title="Throughput" color="emerald" className="text-center">
          <DiagramTooltip content="AWS claim: +40% throughput на concurrent workloads. Sysbench тесты: 10K &rarr; 14K transactions/sec. Параллельные записи устраняют binlog bottleneck.">
            <div className="cursor-help">
              <div className="text-2xl font-bold text-emerald-300">+40%</div>
              <div className="text-xs text-gray-400">concurrent throughput</div>
            </div>
          </DiagramTooltip>
        </DiagramContainer>
      </div>
    </div>
  );
}

/**
 * StorageTierDiagram - Storage architecture detail
 * 6 storage nodes across 3 AZs with binlog replication
 */
export function StorageTierDiagram() {
  return (
    <DiagramContainer title="Aurora Storage Tier Architecture" color="blue">
      <div className="space-y-6">
        {/* 3 AZs with 2 nodes each */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* AZ-A */}
          <DiagramContainer title="Availability Zone A" color="purple" className="p-3">
            <div className="flex flex-col gap-2">
              <DiagramTooltip content="Storage node 1 в AZ-A хранит 1/6 данных. Aurora использует quorum writes (4/6) для durability. Каждый node содержит сегмент 10GB.">
                <FlowNode variant="database" tabIndex={0} size="sm">
                  Storage Node 1
                </FlowNode>
              </DiagramTooltip>
              <DiagramTooltip content="Storage node 2 в AZ-A — вторая копия для AZ-локальных reads. При Enhanced Binlog оба node участвуют в binlog storage.">
                <FlowNode variant="database" tabIndex={0} size="sm">
                  Storage Node 2
                </FlowNode>
              </DiagramTooltip>
            </div>
          </DiagramContainer>

          {/* AZ-B */}
          <DiagramContainer title="Availability Zone B" color="purple" className="p-3">
            <div className="flex flex-col gap-2">
              <DiagramTooltip content="Storage node 3 в AZ-B. Cross-AZ replication через Aurora storage network. Latency ~1ms между AZs.">
                <FlowNode variant="database" tabIndex={0} size="sm">
                  Storage Node 3
                </FlowNode>
              </DiagramTooltip>
              <DiagramTooltip content="Storage node 4 в AZ-B. При потере AZ-A Aurora продолжает работать с 4/6 nodes (2 в B + 2 в C).">
                <FlowNode variant="database" tabIndex={0} size="sm">
                  Storage Node 4
                </FlowNode>
              </DiagramTooltip>
            </div>
          </DiagramContainer>

          {/* AZ-C */}
          <DiagramContainer title="Availability Zone C" color="purple" className="p-3">
            <div className="flex flex-col gap-2">
              <DiagramTooltip content="Storage node 5 в AZ-C. Третья AZ обеспечивает durability при split-brain scenarios.">
                <FlowNode variant="database" tabIndex={0} size="sm">
                  Storage Node 5
                </FlowNode>
              </DiagramTooltip>
              <DiagramTooltip content="Storage node 6 в AZ-C. При Enhanced Binlog binlog события реплицируются по той же схеме 6 nodes / 3 AZs.">
                <FlowNode variant="database" tabIndex={0} size="sm">
                  Storage Node 6
                </FlowNode>
              </DiagramTooltip>
            </div>
          </DiagramContainer>
        </div>

        {/* Enhanced Binlog Layer */}
        <DiagramContainer title="Enhanced Binlog Storage Layer" color="emerald" className="max-w-xl mx-auto">
          <div className="text-center space-y-2">
            <DiagramTooltip content="Enhanced Binlog работает на storage tier — отдельный слой для binlog событий. НЕ зависит от compute tier, что обеспечивает durability при failover.">
              <FlowNode variant="cluster" tabIndex={0} className="mx-auto">
                Binlog Storage Layer
              </FlowNode>
            </DiagramTooltip>
            <div className="text-xs text-gray-400">
              Специализированный слой для binlog событий<br />
              Сортировка и ordering на storage level
            </div>
          </div>
        </DiagramContainer>

        {/* Durability Guarantees */}
        <div className="text-xs text-gray-400 text-center space-y-1">
          <div>Quorum writes: 4/6 nodes required for commit</div>
          <div>Quorum reads: 3/6 nodes required for read</div>
          <div>Survives: loss of any AZ or 2 nodes in different AZs</div>
        </div>
      </div>
    </DiagramContainer>
  );
}

/**
 * EnhancedVsStandardDiagram - Side-by-side comparison
 * Standard MySQL: Compute-based binlog
 * Aurora Enhanced: Storage-based binlog
 */
export function EnhancedVsStandardDiagram() {
  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Standard Binlog */}
      <DiagramContainer
        title="Standard Binlog"
        color="blue"
        className="flex-1"
      >
        <div className="flex flex-col items-center gap-4">
          <DiagramTooltip content="MySQL Engine выполняет транзакцию и ПОСЛЕДОВАТЕЛЬНО записывает: сначала redo log, затем commit, затем binlog. Binlog сортируется на compute tier.">
            <FlowNode variant="database" tabIndex={0}>
              MySQL Engine
            </FlowNode>
          </DiagramTooltip>

          <Arrow direction="down" label="Sequential" />

          <DiagramTooltip content="Redo log записывается первым для durability. Транзакция ещё не завершена.">
            <FlowNode variant="sink" tabIndex={0} size="sm">
              Redo Log
            </FlowNode>
          </DiagramTooltip>

          <Arrow direction="down" label="Then commit" />

          <DiagramTooltip content="После commit движок сортирует и записывает binlog события. Compute-intensive операция на том же сервере, что выполняет транзакции.">
            <FlowNode variant="sink" tabIndex={0} size="sm" className="border border-amber-400/50">
              Binlog (sorted on compute)
            </FlowNode>
          </DiagramTooltip>

          <div className="text-xs text-gray-400 text-center mt-2 px-4">
            <div>~50% compute overhead</div>
            <div>Sequential writes</div>
            <div>mysql-bin.000001 naming</div>
          </div>
        </div>
      </DiagramContainer>

      {/* Enhanced Binlog */}
      <DiagramContainer
        title="Enhanced Binlog"
        color="emerald"
        recommended
        className="flex-1"
      >
        <div className="flex flex-col items-center gap-4">
          <DiagramTooltip content="MySQL Engine генерирует события ПАРАЛЛЕЛЬНО. Transaction log и binlog записываются одновременно, без ожидания друг друга. Compute freed from sorting.">
            <FlowNode variant="database" tabIndex={0}>
              MySQL Engine
            </FlowNode>
          </DiagramTooltip>

          <div className="flex flex-row gap-4">
            <Arrow direction="down" label="Parallel" />
            <Arrow direction="down" label="Parallel" />
          </div>

          <div className="flex flex-row gap-4">
            <DiagramTooltip content="Transaction log идёт в standard storage. Durability для данных таблиц.">
              <FlowNode variant="sink" tabIndex={0} size="sm">
                Tx Log
              </FlowNode>
            </DiagramTooltip>

            <DiagramTooltip content="Binlog события (unsorted) идут в Enhanced Binlog storage. Сортировка происходит на storage layer, не на compute.">
              <FlowNode variant="cluster" tabIndex={0} size="sm" className="border-2 border-emerald-400">
                Binlog Storage
              </FlowNode>
            </DiagramTooltip>
          </div>

          <Arrow direction="down" label="Sorted at storage" />

          <DiagramTooltip content="Результат: упорядоченные binlog файлы. Debezium читает через стандартный протокол. Только имена файлов отличаются.">
            <FlowNode variant="sink" tabIndex={0} size="sm">
              mysql-bin-changelog.*
            </FlowNode>
          </DiagramTooltip>

          <div className="text-xs text-gray-400 text-center mt-2 px-4">
            <div>~13% compute overhead</div>
            <div>Parallel writes</div>
            <div>mysql-bin-changelog.000001 naming</div>
          </div>
        </div>
      </DiagramContainer>
    </div>
  );
}

/**
 * RetentionComparisonDiagram - Retention behavior comparison
 * Standard: binlog_expire_logs_seconds
 * Enhanced: aurora_binlog_retention_hours (via stored procedure)
 */
export function RetentionComparisonDiagram() {
  return (
    <div className="space-y-6">
      {/* Retention Methods */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Standard MySQL */}
        <DiagramContainer
          title="Standard MySQL Retention"
          color="blue"
          className="flex-1"
        >
          <div className="space-y-4">
            <DiagramTooltip content="Community MySQL использует binlog_expire_logs_seconds (или устаревший expire_logs_days). Настраивается через my.cnf или SET PERSIST.">
              <FlowNode variant="sink" tabIndex={0}>
                binlog_expire_logs_seconds
              </FlowNode>
            </DiagramTooltip>

            <div className="text-xs text-gray-400 space-y-2 px-2">
              <div className="flex items-center gap-2">
                <span className="text-blue-400">+</span>
                <span>Default: 2592000 (30 дней)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-blue-400">+</span>
                <span>Настраивается через my.cnf</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-blue-400">+</span>
                <span>SET PERSIST для runtime</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-blue-400">+</span>
                <span>Без ограничений (кроме диска)</span>
              </div>
            </div>
          </div>
        </DiagramContainer>

        {/* Aurora MySQL */}
        <DiagramContainer
          title="Aurora MySQL Retention"
          color="emerald"
          className="flex-1"
        >
          <div className="space-y-4">
            <DiagramTooltip content="Aurora НЕ поддерживает binlog_expire_logs_seconds — переменная read-only. Используйте mysql.rds_set_configuration stored procedure.">
              <FlowNode variant="cluster" tabIndex={0}>
                mysql.rds_set_configuration
              </FlowNode>
            </DiagramTooltip>

            <div className="text-xs text-gray-400 space-y-2 px-2">
              <div className="flex items-center gap-2">
                <span className="text-emerald-400">+</span>
                <span>Default: NULL (auto-purge)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-emerald-400">+</span>
                <span>Только stored procedure</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-amber-400">!</span>
                <span>Max: 2160 часов (90 дней)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-amber-400">!</span>
                <span>Связан с backup retention</span>
              </div>
            </div>
          </div>
        </DiagramContainer>
      </div>

      {/* Aurora Command */}
      <DiagramContainer title="Aurora Retention Configuration" color="amber" className="max-w-2xl mx-auto">
        <div className="space-y-4">
          <div className="bg-gray-800/50 rounded-lg p-3 font-mono text-xs text-center">
            <DiagramTooltip content="Устанавливает retention на 7 дней (168 часов). Выполняйте ТОЛЬКО на Writer instance. Rds_show_configuration для проверки.">
              <span className="cursor-help">CALL mysql.rds_set_configuration('binlog retention hours', 168);</span>
            </DiagramTooltip>
          </div>

          <div className="text-xs text-gray-400 text-center">
            Для проверки: <code className="bg-gray-800 px-1 rounded">CALL mysql.rds_show_configuration;</code>
          </div>
        </div>
      </DiagramContainer>

      {/* Critical Limitations */}
      <DiagramContainer title="Enhanced Binlog: Критические ограничения" color="rose" className="max-w-3xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <DiagramTooltip content="НЕОБРАТИМОЕ ограничение: Если кластер КОГДА-ЛИБО имел включённый backtrack (даже если сейчас выключен), Enhanced Binlog НЕЛЬЗЯ включить. Проверьте BacktrackWindow через AWS CLI.">
            <FlowNode variant="target" tabIndex={0} size="sm">
              <div className="flex flex-col items-center">
                <span className="text-rose-400 text-lg">!</span>
                <span>Backtrack несовместим</span>
              </div>
            </FlowNode>
          </DiagramTooltip>

          <DiagramTooltip content="Enhanced Binlog файлы НЕ включаются в Aurora snapshots и backups. После restore binlog начинается с .000001. Debezium потребует resnapshot!">
            <FlowNode variant="target" tabIndex={0} size="sm">
              <div className="flex flex-col items-center">
                <span className="text-rose-400 text-lg">!</span>
                <span>Not in Backups</span>
              </div>
            </FlowNode>
          </DiagramTooltip>

          <DiagramTooltip content="В Aurora Global Database Enhanced Binlog НЕ реплицируется в secondary регионы. После failover на другой регион binlog начинается заново.">
            <FlowNode variant="target" tabIndex={0} size="sm">
              <div className="flex flex-col items-center">
                <span className="text-rose-400 text-lg">!</span>
                <span>No Global DB replication</span>
              </div>
            </FlowNode>
          </DiagramTooltip>
        </div>

        <div className="text-xs text-gray-400 text-center mt-4">
          После restore/clone/failover Debezium offset становится невалидным.<br />
          Планируйте resnapshot процедуру заранее!
        </div>
      </DiagramContainer>
    </div>
  );
}
