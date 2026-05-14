/** @jsxImportSource solid-js */
/**
 * Disaster Recovery Diagrams
 *
 * Exports:
 * - FailureModesDiagram: 4 failure types with their impacts
 * - StateStorageLocationsDiagram: Where CDC state is stored
 * - OrphanedSlotCleanupDiagram: Safe decision tree for slot cleanup
 */

import { FlowNode } from '@primitives/FlowNode';
import { Arrow } from '@primitives/Arrow';
import { DiagramContainer } from '@primitives/DiagramContainer';
import { DiagramTooltip } from '@primitives/Tooltip';

/**
 * FailureModesDiagram - Failure types and their impacts
 */
export function FailureModesDiagram() {
  return (
    <DiagramContainer
      title="Возможные отказы и их последствия"
      color="rose"
    >
      <div class="flex flex-col gap-6">
        {/* Failure types row */}
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <DiagramTooltip content="Kafka Connect worker crash или restart. Offsets сохранены в connect-offsets. Автоматическое восстановление - коннектор продолжит с последней позиции.">
            <FlowNode variant="sink" tabIndex={0} size="sm">
              <div class="text-center">
                <div class="text-blue-700 font-semibold text-sm">Connect Crash</div>
                <div class="text-xs text-[var(--ink-muted)] mt-1">Worker restart</div>
              </div>
            </FlowNode>
          </DiagramTooltip>

          <DiagramTooltip content="Случайное удаление коннектора через REST API. Offsets остаются в connect-offsets, но slot может стать orphaned и заполнить диск.">
            <FlowNode variant="connector" tabIndex={0} size="sm">
              <div class="text-center">
                <div class="text-amber-700 font-semibold text-sm">Connector Delete</div>
                <div class="text-xs text-[var(--ink-muted)] mt-1">Accidental</div>
              </div>
            </FlowNode>
          </DiagramTooltip>

          <DiagramTooltip content="Database failover (Aurora, RDS Multi-AZ). Replication slot теряется на Aurora до PG17. Данные между failover и recreate slot потеряны.">
            <FlowNode variant="app" tabIndex={0} size="sm">
              <div class="text-center">
                <div class="text-rose-700 font-semibold text-sm">DB Failover</div>
                <div class="text-xs text-[var(--ink-muted)] mt-1">Slot lost</div>
              </div>
            </FlowNode>
          </DiagramTooltip>

          <DiagramTooltip content="Kafka cluster failure или потеря данных. Offsets потеряны полностью. Требуется full resnapshot всех таблиц.">
            <FlowNode variant="database" tabIndex={0} size="sm">
              <div class="text-center">
                <div class="text-purple-700 font-semibold text-sm">Kafka Loss</div>
                <div class="text-xs text-[var(--ink-muted)] mt-1">Cluster failure</div>
              </div>
            </FlowNode>
          </DiagramTooltip>
        </div>

        {/* Arrows */}
        <div class="flex justify-center gap-8 lg:gap-16">
          <Arrow direction="down" />
          <Arrow direction="down" />
          <Arrow direction="down" />
          <Arrow direction="down" />
        </div>

        {/* Impact types row */}
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <DiagramTooltip content="Коннектор автоматически восстанавливается с последнего сохраненного offset. Никаких действий не требуется.">
            <div class="bg-emerald-500/20 border border-emerald-400/30 rounded-xl p-3 text-center">
              <div class="text-emerald-700 font-semibold text-sm">Auto Recovery</div>
              <div class="text-xs text-[var(--ink-muted)] mt-1">From last offset</div>
            </div>
          </DiagramTooltip>

          <DiagramTooltip content="Необходимо удалить orphaned slot в PostgreSQL. Если не удалить - WAL будет расти бесконечно.">
            <div class="bg-amber-500/20 border border-amber-400/30 rounded-xl p-3 text-center">
              <div class="text-amber-700 font-semibold text-sm">Slot Cleanup</div>
              <div class="text-xs text-[var(--ink-muted)] mt-1">Remove orphaned</div>
            </div>
          </DiagramTooltip>

          <DiagramTooltip content="Данные между последним offset и моментом failover потеряны навсегда. Incremental snapshot может восстановить текущее состояние.">
            <div class="bg-rose-500/20 border border-rose-400/30 rounded-xl p-3 text-center">
              <div class="text-rose-700 font-semibold text-sm">Data Loss</div>
              <div class="text-xs text-[var(--ink-muted)] mt-1">Gap in history</div>
            </div>
          </DiagramTooltip>

          <DiagramTooltip content="Полный resnapshot всех таблиц. Может занять часы или дни для больших баз данных. Критическое событие.">
            <div class="bg-purple-500/20 border border-purple-400/30 rounded-xl p-3 text-center">
              <div class="text-purple-700 font-semibold text-sm">Full Resnapshot</div>
              <div class="text-xs text-[var(--ink-muted)] mt-1">Hours/days</div>
            </div>
          </DiagramTooltip>
        </div>

        {/* Severity matrix */}
        <div class="mt-4">
          <div class="text-sm text-[var(--ink-muted)] mb-3 text-center">Severity Matrix</div>
          <div class="grid grid-cols-3 gap-2 text-xs">
            <div class="text-center text-[var(--ink-muted)]">Сценарий</div>
            <div class="text-center text-[var(--ink-muted)]">Вероятность</div>
            <div class="text-center text-[var(--ink-muted)]">Влияние</div>

            <div class="text-blue-700">Connect restart</div>
            <div class="text-center text-emerald-400">Высокая</div>
            <div class="text-center text-emerald-400">Низкое</div>

            <div class="text-amber-700">Connector deletion</div>
            <div class="text-center text-amber-400">Низкая</div>
            <div class="text-center text-amber-400">Среднее</div>

            <div class="text-rose-700">DB failover</div>
            <div class="text-center text-amber-400">Низкая</div>
            <div class="text-center text-rose-400">Высокое</div>

            <div class="text-purple-700">Kafka loss</div>
            <div class="text-center text-emerald-400">Очень низкая</div>
            <div class="text-center text-rose-400">Критическое</div>
          </div>
        </div>
      </div>
    </DiagramContainer>
  );
}

/**
 * StateStorageLocationsDiagram - Where CDC state is stored
 */
export function StateStorageLocationsDiagram() {
  return (
    <DiagramContainer
      title="Распределение состояния CDC"
      color="blue"
      description="Состояние хранится в нескольких местах - recovery требует координации"
    >
      <div class="flex flex-col lg:flex-row gap-6 items-start">
        {/* Kafka section */}
        <DiagramContainer
          title="Kafka Cluster"
          color="purple"
          className="flex-1"
        >
          <div class="flex flex-col gap-3">
            <DiagramTooltip content="connect-configs: конфигурации всех коннекторов. При потере можно пересоздать вручную из backup.">
              <FlowNode variant="database" tabindex={0} size="sm">
                <div class="text-center">
                  <div class="text-purple-700">connect-configs</div>
                  <div class="text-xs text-[var(--ink-muted)]">Configurations</div>
                </div>
              </FlowNode>
            </DiagramTooltip>

            <DiagramTooltip content="connect-offsets: КРИТИЧЕСКИ ВАЖНЫЙ топик. Содержит LSN позицию каждого коннектора. Без него - full resnapshot.">
              <FlowNode variant="connector" tabindex={0} size="sm" className="border-2 border-amber-400">
                <div class="text-center">
                  <div class="text-amber-700">connect-offsets</div>
                  <div class="text-xs text-[var(--ink-muted)]">LSN positions</div>
                </div>
              </FlowNode>
            </DiagramTooltip>

            <DiagramTooltip content="connect-statuses: текущий статус tasks (RUNNING, PAUSED, FAILED). Информационный топик.">
              <FlowNode variant="sink" tabindex={0} size="sm">
                <div class="text-center">
                  <div class="text-blue-700">connect-statuses</div>
                  <div class="text-xs text-[var(--ink-muted)]">Task states</div>
                </div>
              </FlowNode>
            </DiagramTooltip>
          </div>
        </DiagramContainer>

        {/* PostgreSQL section */}
        <DiagramContainer
          title="PostgreSQL"
          color="emerald"
          className="flex-1"
        >
          <div class="flex flex-col gap-3">
            <DiagramTooltip content="Replication Slot: отслеживает restart_lsn - позицию, с которой можно безопасно читать. PostgreSQL удерживает WAL от этой позиции.">
              <FlowNode variant="connector" tabindex={0} size="sm" className="border-2 border-emerald-400">
                <div class="text-center">
                  <div class="text-emerald-700">Replication Slot</div>
                  <div class="text-xs text-[var(--ink-muted)]">restart_lsn position</div>
                </div>
              </FlowNode>
            </DiagramTooltip>

            <DiagramTooltip content="WAL Segments: физические файлы журнала транзакций. Удерживаются для slot до max_slot_wal_keep_size.">
              <FlowNode variant="database" tabindex={0} size="sm">
                <div class="text-center">
                  <div class="text-purple-700">WAL Segments</div>
                  <div class="text-xs text-[var(--ink-muted)]">Retained for slot</div>
                </div>
              </FlowNode>
            </DiagramTooltip>
          </div>
        </DiagramContainer>

        {/* Connect section */}
        <DiagramContainer
          title="Kafka Connect"
          color="amber"
          className="flex-1"
        >
          <div class="flex flex-col gap-3">
            <DiagramTooltip content="Worker Process: координатор, распределяет tasks между workers. Stateless - состояние в Kafka.">
              <FlowNode variant="app" tabIndex={0} size="sm">
                <div class="text-center">
                  <div class="text-rose-700">Worker Process</div>
                  <div class="text-xs text-[var(--ink-muted)]">Task distribution</div>
                </div>
              </FlowNode>
            </DiagramTooltip>

            <DiagramTooltip content="Running Tasks: активные задачи коннекторов. In-memory state, восстанавливается из offsets при restart.">
              <FlowNode variant="connector" tabindex={0} size="sm">
                <div class="text-center">
                  <div class="text-emerald-700">Running Tasks</div>
                  <div class="text-xs text-[var(--ink-muted)]">In-memory</div>
                </div>
              </FlowNode>
            </DiagramTooltip>
          </div>
        </DiagramContainer>
      </div>

      {/* Recovery coordination note */}
      <div class="bg-amber-500/10 border border-amber-400/30 rounded-lg px-4 py-3 text-center mt-4">
        <DiagramTooltip content="Recovery требует согласования: offset в Kafka должен соответствовать данным в slot. Несоответствие = дубли или потеря данных.">
          <span class="text-amber-700 text-sm cursor-help">
            Recovery требует координации всех трех компонентов
          </span>
        </DiagramTooltip>
      </div>
    </DiagramContainer>
  );
}

/**
 * OrphanedSlotCleanupDiagram - Safe decision tree for slot cleanup
 */
export function OrphanedSlotCleanupDiagram() {
  return (
    <DiagramContainer
      title="Безопасный cleanup orphaned slots"
      color="neutral"
    >
      <div class="flex flex-col gap-6">
        {/* Decision tree */}
        <div class="flex flex-col items-center gap-4">
          {/* Root */}
          <DiagramTooltip content="Обнаружен inactive slot (active = false). Перед удалением необходимо проверить, не принадлежит ли он существующему коннектору.">
            <FlowNode variant="connector" tabindex={0} size="lg">
              <div class="text-center">
                <div>Найден inactive slot</div>
                <div class="text-xs text-[var(--ink-muted)]">active = false</div>
              </div>
            </FlowNode>
          </DiagramTooltip>

          <Arrow direction="down" />

          {/* First question */}
          <DiagramTooltip content="Проверить через REST API: curl http://localhost:8083/connectors и сравнить slot.name каждого коннектора.">
            <FlowNode variant="sink" tabindex={0}>
              <div class="text-center">
                <div>Коннектор существует?</div>
              </div>
            </FlowNode>
          </DiagramTooltip>

          <div class="flex flex-col lg:flex-row gap-8 items-start mt-4">
            {/* Yes branch - connector exists */}
            <div class="flex flex-col items-center gap-3">
              <div class="text-emerald-400 text-sm font-semibold">Да</div>
              <Arrow direction="down" />

              <DiagramTooltip content="Коннектор может быть в состоянии PAUSED. Проверить: curl http://localhost:8083/connectors/{name}/status">
                <FlowNode variant="connector" tabindex={0} size="sm">
                  <div class="text-center">
                    <div>Коннектор PAUSED?</div>
                  </div>
                </FlowNode>
              </DiagramTooltip>

              <div class="flex flex-row gap-4 mt-2">
                {/* Yes - paused */}
                <div class="flex flex-col items-center gap-2">
                  <div class="text-emerald-400 text-xs">Да</div>
                  <DiagramTooltip content="НЕ удалять! Slot принадлежит paused коннектору. Дождаться resume или связаться с владельцем.">
                    <div class="bg-blue-500/20 border border-blue-400/30 rounded-xl px-4 py-3 text-center">
                      <div class="text-blue-700 font-semibold text-sm">WAIT</div>
                      <div class="text-xs text-[var(--ink-muted)] mt-1">Дождаться resume</div>
                    </div>
                  </DiagramTooltip>
                </div>

                {/* No - not paused */}
                <div class="flex flex-col items-center gap-2">
                  <div class="text-rose-400 text-xs">Нет</div>
                  <DiagramTooltip content="Коннектор RUNNING но slot inactive? Проверить логи коннектора на ошибки подключения.">
                    <div class="bg-amber-500/20 border border-amber-400/30 rounded-xl px-4 py-3 text-center">
                      <div class="text-amber-700 font-semibold text-sm">CHECK LOGS</div>
                      <div class="text-xs text-[var(--ink-muted)] mt-1">Investigate</div>
                    </div>
                  </DiagramTooltip>
                </div>
              </div>
            </div>

            {/* No branch - connector doesn't exist */}
            <div class="flex flex-col items-center gap-3">
              <div class="text-rose-400 text-sm font-semibold">Нет</div>
              <Arrow direction="down" />

              <DiagramTooltip content="Проверить документацию или runbook. Возможно slot был создан для будущего коннектора или это тестовый slot.">
                <FlowNode variant="connector" tabIndex={0} size="sm">
                  <div class="text-center">
                    <div>Документация</div>
                    <div class="text-xs text-[var(--ink-muted)]">подтверждает удаление?</div>
                  </div>
                </FlowNode>
              </DiagramTooltip>

              <div class="flex flex-row gap-4 mt-2">
                {/* Yes - documented */}
                <div class="flex flex-col items-center gap-2">
                  <div class="text-emerald-400 text-xs">Да</div>
                  <DiagramTooltip content="Безопасно удалить: SELECT pg_drop_replication_slot('slot_name'); WAL retention освободится.">
                    <div class="bg-emerald-500/20 border border-emerald-400/30 rounded-xl px-4 py-3 text-center">
                      <div class="text-emerald-700 font-semibold text-sm">DROP SLOT</div>
                      <div class="text-xs text-[var(--ink-muted)] mt-1">Безопасно</div>
                    </div>
                  </DiagramTooltip>
                </div>

                {/* No - not documented */}
                <div class="flex flex-col items-center gap-2">
                  <div class="text-rose-400 text-xs">Нет</div>
                  <DiagramTooltip content="Эскалировать к владельцу системы. Не удалять без подтверждения - может привести к потере данных.">
                    <div class="bg-amber-500/20 border border-amber-400/30 rounded-xl px-4 py-3 text-center">
                      <div class="text-amber-700 font-semibold text-sm">ESCALATE</div>
                      <div class="text-xs text-[var(--ink-muted)] mt-1">К владельцу</div>
                    </div>
                  </DiagramTooltip>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Warning about wal_status */}
        <div class="bg-rose-500/10 border border-rose-400/30 rounded-lg px-4 py-3 mt-4">
          <DiagramTooltip content="Если wal_status='lost', slot уже инвалидирован. Удаление безопасно, но данные потеряны. Потребуется full resnapshot при пересоздании коннектора.">
            <div class="text-center cursor-help">
              <span class="text-rose-700 text-sm font-semibold">
                wal_status = 'lost' = точка невозврата
              </span>
              <div class="text-xs text-[var(--ink-muted)] mt-1">
                Full resnapshot неизбежен
              </div>
            </div>
          </DiagramTooltip>
        </div>

        {/* SQL check */}
        <div class="bg-[var(--bg-sunken)] rounded-lg p-3 mt-2">
          <div class="text-xs text-[var(--ink-muted)] mb-2">Проверка статуса slots:</div>
          <code class="text-xs text-emerald-700 font-mono">
            SELECT slot_name, active, wal_status,<br />
            &nbsp;&nbsp;pg_size_pretty(pg_wal_lsn_diff(pg_current_wal_lsn(), restart_lsn)) AS lag<br />
            FROM pg_replication_slots WHERE slot_type='logical';
          </code>
        </div>
      </div>
    </DiagramContainer>
  );
}
