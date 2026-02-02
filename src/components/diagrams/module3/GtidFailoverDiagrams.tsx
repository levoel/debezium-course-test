/**
 * GTID Failover Procedure Diagrams
 *
 * Exports:
 * - FailoverWithoutGtidSequence: Sequence diagram showing position-based failover failure
 * - FailoverWithGtidSequence: Sequence diagram showing GTID failover success
 * - FailoverDecisionDiagram: Decision tree for failover handling
 * - GtidSetComparisonDiagram: GTID set before/after failover comparison
 * - ReplicaPromotionDiagram: Replica promotion flow
 * - ConnectorReconfigurationDiagram: Connector reconfiguration steps after failover
 * - FailoverTimelineDiagram: Timeline of failover events
 */

import { FlowNode } from '../primitives/FlowNode';
import { Arrow } from '../primitives/Arrow';
import { DiagramContainer } from '../primitives/DiagramContainer';
import { DiagramTooltip } from '../primitives/Tooltip';
import { SequenceDiagram } from '../primitives/SequenceDiagram';
import type { SequenceActorDef, SequenceMessageDef } from '../primitives/types';

/**
 * FailoverWithoutGtidSequence - Sequence diagram showing position-based failover failure
 */
export function FailoverWithoutGtidSequence() {
  const actors: SequenceActorDef[] = [
    {
      id: 'debezium',
      label: 'Debezium',
      variant: 'service',
      tooltip:
        'Debezium connector читает binlog с position mysql-bin.000015:2548. После crash primary эта позиция бессмысленна на новом сервере.',
    },
    {
      id: 'primary',
      label: 'Primary (old)',
      variant: 'database',
      tooltip:
        'Старый primary сервер с binlog файлом mysql-bin.000015. При crash или failover этот файл недоступен для нового primary.',
    },
    {
      id: 'replica',
      label: 'Replica -> Primary',
      variant: 'database',
      tooltip:
        'Replica становится новым primary. Но её binlog файлы имеют ДРУГИЕ имена и смещения. Позиция с старого primary невалидна.',
    },
  ];

  const messages: SequenceMessageDef[] = [
    {
      id: 'msg1',
      from: 'debezium',
      to: 'primary',
      label: 'Read: mysql-bin.000015:2548',
      variant: 'sync',
      tooltip:
        'Debezium читает binlog с позиции mysql-bin.000015:2548. File:position tracking — устаревший метод, проблемный для failover.',
    },
    {
      id: 'msg2',
      from: 'primary',
      to: 'debezium',
      label: 'Events OK',
      variant: 'return',
      tooltip:
        'Нормальная работа: primary отдает события из binlog. Debezium сохраняет offset: mysql-bin.000015:2548.',
    },
    {
      id: 'msg3',
      from: 'primary',
      to: 'primary',
      label: 'CRASH',
      variant: 'sync',
      tooltip:
        'Primary сервер падает (hardware failure, network partition, software crash). Connection с Debezium потерян.',
    },
    {
      id: 'msg4',
      from: 'replica',
      to: 'replica',
      label: 'Promotion',
      variant: 'sync',
      tooltip:
        'Replica обнаруживает недоступность primary и становится новым primary. Занимает 1-2 минуты для Aurora.',
    },
    {
      id: 'msg5',
      from: 'debezium',
      to: 'replica',
      label: 'Connect: mysql-bin.000015:2548',
      variant: 'sync',
      tooltip:
        'Debezium пытается подключиться к новому primary с сохраненной позицией mysql-bin.000015:2548.',
    },
    {
      id: 'msg6',
      from: 'replica',
      to: 'debezium',
      label: 'ERROR: File not found',
      variant: 'return',
      tooltip:
        'КРИТИЧЕСКАЯ ОШИБКА: Новый primary не имеет файла mysql-bin.000015. Его binlog файлы называются иначе (mysql-bin.000001 или другой sequence).',
    },
  ];

  return (
    <div className="space-y-4">
      <SequenceDiagram actors={actors} messages={messages} messageSpacing={50} />

      <DiagramContainer title="Результат без GTID" color="rose">
        <div className="text-sm text-gray-300 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-rose-400 font-bold">ПРОБЛЕМА:</span>
            <span>File:position бессмысленна на новом primary.</span>
          </div>
          <div className="text-xs text-gray-400">
            Binlog файлы на replica имеют ДРУГИЕ имена и смещения. Позиция mysql-bin.000015:2548 не существует на новом сервере.
            <br />
            Требуется ручное вмешательство или FULL RESNAPSHOT (часы/дни).
          </div>
        </div>
      </DiagramContainer>
    </div>
  );
}

/**
 * FailoverWithGtidSequence - Sequence diagram showing GTID failover success
 */
export function FailoverWithGtidSequence() {
  const actors: SequenceActorDef[] = [
    {
      id: 'debezium',
      label: 'Debezium',
      variant: 'service',
      tooltip:
        'Debezium connector с GTID-based offset. GTID глобально уникален — работает на любом сервере в топологии.',
    },
    {
      id: 'primary',
      label: 'Primary (old)',
      variant: 'database',
      tooltip:
        'Старый primary сервер. GTID выполненных транзакций: ...562:1-1000. При crash GTID остается валидным глобально.',
    },
    {
      id: 'replica',
      label: 'Replica -> Primary',
      variant: 'database',
      tooltip:
        'Replica с теми же GTID. После promotion Debezium может продолжить с той же GTID позиции — автоматическое восстановление.',
    },
  ];

  const messages: SequenceMessageDef[] = [
    {
      id: 'msg1',
      from: 'debezium',
      to: 'primary',
      label: 'Read: GTID ...562:1-1000',
      variant: 'sync',
      tooltip:
        'Debezium читает binlog с GTID offset ...562:1000. GTID уникален глобально — одинаков на всех серверах.',
    },
    {
      id: 'msg2',
      from: 'primary',
      to: 'debezium',
      label: 'Events OK',
      variant: 'return',
      tooltip:
        'Нормальная работа: primary отдает события. Debezium сохраняет offset как GTID set, не file:position.',
    },
    {
      id: 'msg3',
      from: 'primary',
      to: 'primary',
      label: 'CRASH',
      variant: 'sync',
      tooltip:
        'Primary сервер падает. Но GTID ...562:1000 остается валидным — он существует на replica тоже.',
    },
    {
      id: 'msg4',
      from: 'replica',
      to: 'replica',
      label: 'Promotion',
      variant: 'sync',
      tooltip:
        'Replica становится новым primary. GTID set: ...562:1-1000 (тот же, что был на старом primary).',
    },
    {
      id: 'msg5',
      from: 'debezium',
      to: 'replica',
      label: 'Connect: GTID ...562:1000',
      variant: 'sync',
      tooltip:
        'Debezium подключается с GTID offset. Новый primary знает этот GTID — автоматически находит позицию.',
    },
    {
      id: 'msg6',
      from: 'replica',
      to: 'debezium',
      label: 'Events from GTID ...562:1001',
      variant: 'return',
      tooltip:
        'УСПЕХ: Новый primary находит позицию по GTID и отдает события начиная с ...562:1001. Нет потери данных!',
    },
  ];

  return (
    <div className="space-y-4">
      <SequenceDiagram actors={actors} messages={messages} messageSpacing={50} />

      <DiagramContainer title="Результат с GTID" color="emerald">
        <div className="text-sm text-gray-300 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-emerald-400 font-bold">УСПЕХ:</span>
            <span>CDC продолжается БЕЗ MANUAL INTERVENTION.</span>
          </div>
          <div className="text-xs text-gray-400">
            GTID глобально уникален — одинаков на всех серверах в топологии.
            <br />
            Debezium может продолжить с той же позиции на любом сервере. Автоматическое восстановление за 30-60 секунд.
          </div>
        </div>
      </DiagramContainer>
    </div>
  );
}

/**
 * FailoverDecisionDiagram - Decision tree for failover handling
 */
export function FailoverDecisionDiagram() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center gap-4">
        {/* Root question */}
        <DiagramTooltip content="Ключевой вопрос при failover: включен ли GTID mode на MySQL? Определяет, будет ли автоматическое восстановление или потребуется ручное вмешательство.">
          <FlowNode variant="connector" tabIndex={0} className="border-2 border-amber-400">
            GTID Mode Enabled?
          </FlowNode>
        </DiagramTooltip>

        <div className="flex flex-col md:flex-row items-start gap-8 md:gap-16">
          {/* Yes branch */}
          <div className="flex flex-col items-center gap-3">
            <div className="text-xs text-emerald-400 font-medium">Да (ON)</div>
            <Arrow direction="down" />

            <DiagramTooltip content="С GTID connector автоматически находит позицию на новом primary. Время восстановления: 30-60 секунд. Нет потери данных.">
              <FlowNode variant="cluster" tabIndex={0} className="border-2 border-emerald-400">
                Automatic Recovery
              </FlowNode>
            </DiagramTooltip>

            <Arrow direction="down" />

            <div className="flex flex-col items-center gap-2">
              <DiagramTooltip content="Debezium reconnect с GTID offset. Новый primary автоматически находит позицию. CDC продолжается в течение минуты.">
                <FlowNode variant="app" tabIndex={0} size="sm">
                  Reconnect + Resume
                </FlowNode>
              </DiagramTooltip>
              <div className="text-xs text-emerald-400 text-center">30-60s recovery</div>
            </div>
          </div>

          {/* No branch */}
          <div className="flex flex-col items-center gap-3">
            <div className="text-xs text-rose-400 font-medium">Нет (OFF)</div>
            <Arrow direction="down" />

            <DiagramTooltip content="Без GTID file:position невалидна на новом primary. Автоматическое восстановление невозможно.">
              <FlowNode variant="sink" tabIndex={0} className="border-2 border-rose-400">
                Manual Intervention
              </FlowNode>
            </DiagramTooltip>

            <Arrow direction="down" />

            <div className="flex flex-col md:flex-row items-center gap-4">
              <div className="flex flex-col items-center gap-2">
                <DiagramTooltip content="Вариант 1: Инженер вручную находит соответствующую позицию на новом primary. Сложно и error-prone.">
                  <FlowNode variant="app" tabIndex={0} size="sm" className="border-2 border-amber-400">
                    Find Position
                  </FlowNode>
                </DiagramTooltip>
                <div className="text-xs text-amber-400 text-center">Часы работы</div>
              </div>

              <div className="text-xs text-gray-400">или</div>

              <div className="flex flex-col items-center gap-2">
                <DiagramTooltip content="Вариант 2: Полный resnapshot базы данных. Гарантирует консистентность, но занимает часы/дни для больших баз.">
                  <FlowNode variant="app" tabIndex={0} size="sm" className="border-2 border-rose-400">
                    Full Resnapshot
                  </FlowNode>
                </DiagramTooltip>
                <div className="text-xs text-rose-400 text-center">Часы/дни downtime</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recommendation */}
      <DiagramContainer title="Рекомендация для Production" color="emerald" recommended>
        <div className="text-sm text-gray-300">
          <span className="text-emerald-400 font-bold">Всегда включайте GTID mode</span> для Aurora MySQL и self-hosted MySQL:
          <div className="mt-2 font-mono text-xs bg-gray-800/50 p-2 rounded">
            gtid_mode = ON
            <br />
            enforce_gtid_consistency = ON
          </div>
        </div>
      </DiagramContainer>
    </div>
  );
}

/**
 * GtidSetComparisonDiagram - GTID set before/after failover comparison
 */
export function GtidSetComparisonDiagram() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Before failover */}
        <DiagramContainer title="До Failover" color="blue" className="flex-1">
          <div className="flex flex-col items-center gap-4">
            <DiagramTooltip content="Primary server UUID: 3e11fa47-... GTID set показывает все выполненные транзакции: с 1 по 10000.">
              <FlowNode variant="database" tabIndex={0}>
                Primary
                <br />
                <span className="text-xs text-gray-400">UUID: 3e11fa47...</span>
              </FlowNode>
            </DiagramTooltip>

            <div className="font-mono text-xs bg-gray-800/50 p-3 rounded text-center">
              <div className="text-blue-400">gtid_executed:</div>
              <div className="text-gray-300">3e11fa47-...:1-10000</div>
            </div>

            <Arrow direction="down" dashed label="replication" />

            <DiagramTooltip content="Replica синхронизирована с primary. Тот же GTID set (синхронная или асинхронная репликация).">
              <FlowNode variant="database" tabIndex={0}>
                Replica
                <br />
                <span className="text-xs text-gray-400">UUID: 4f22gb58...</span>
              </FlowNode>
            </DiagramTooltip>

            <div className="font-mono text-xs bg-gray-800/50 p-3 rounded text-center">
              <div className="text-blue-400">gtid_executed:</div>
              <div className="text-gray-300">3e11fa47-...:1-10000</div>
            </div>
          </div>
        </DiagramContainer>

        {/* Arrow between */}
        <div className="flex items-center justify-center">
          <Arrow direction="right" label="Failover" />
        </div>

        {/* After failover */}
        <DiagramContainer title="После Failover" color="emerald" className="flex-1">
          <div className="flex flex-col items-center gap-4">
            <DiagramTooltip content="После promotion replica становится новым primary. Новые транзакции создают GTID с её UUID (4f22gb58...).">
              <FlowNode variant="database" tabIndex={0} className="border-2 border-emerald-400">
                New Primary
                <br />
                <span className="text-xs text-gray-400">UUID: 4f22gb58...</span>
              </FlowNode>
            </DiagramTooltip>

            <div className="font-mono text-xs bg-gray-800/50 p-3 rounded text-center">
              <div className="text-emerald-400">gtid_executed:</div>
              <div className="text-gray-300">3e11fa47-...:1-10000,</div>
              <div className="text-emerald-300">4f22gb58-...:1-50</div>
            </div>

            <div className="text-xs text-gray-400 text-center">
              + 50 новых транзакций с новым UUID
            </div>
          </div>
        </DiagramContainer>
      </div>

      {/* Explanation */}
      <DiagramContainer title="Merge GTID Sets" color="neutral">
        <div className="text-sm text-gray-300 space-y-2">
          <div className="flex items-start gap-2">
            <span className="text-blue-400 font-bold">1.</span>
            <span>Старые GTID (от primary): 3e11fa47-...:1-10000 — сохраняются</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-emerald-400 font-bold">2.</span>
            <span>Новые GTID (от promoted replica): 4f22gb58-...:1-50 — добавляются</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-amber-400 font-bold">3.</span>
            <span>
              <span className="font-mono">gtid.source.includes=".*"</span> — Debezium читает оба UUID
            </span>
          </div>
        </div>
      </DiagramContainer>
    </div>
  );
}

/**
 * ReplicaPromotionDiagram - Replica promotion flow
 */
export function ReplicaPromotionDiagram() {
  return (
    <div className="space-y-6">
      <DiagramContainer title="Процесс Promotion Replica -> Primary" color="amber">
        <div className="flex flex-col items-center gap-4">
          {/* Step 1: Failure detection */}
          <div className="flex flex-col md:flex-row items-center gap-4 w-full justify-center">
            <DiagramTooltip content="Step 1: RDS Control Plane обнаруживает недоступность primary (30-60 секунд для Aurora). Health checks failing.">
              <FlowNode variant="database" tabIndex={0} className="border-2 border-rose-400 animate-pulse">
                Primary Failure
              </FlowNode>
            </DiagramTooltip>

            <Arrow direction="right" label="detect" />

            <DiagramTooltip content="Aurora automatic failure detection: health checks каждые 5 секунд, promotion после 3 failed checks.">
              <FlowNode variant="app" tabIndex={0}>
                RDS Control Plane
              </FlowNode>
            </DiagramTooltip>
          </div>

          {/* Step 2: Promotion */}
          <div className="flex flex-col md:flex-row items-center gap-4 w-full justify-center">
            <DiagramTooltip content="Step 2: Control Plane выбирает replica с наименьшим lag и инициирует promotion. SET read_only=OFF.">
              <FlowNode variant="app" tabIndex={0}>
                Select Best Replica
              </FlowNode>
            </DiagramTooltip>

            <Arrow direction="right" label="promote" />

            <DiagramTooltip content="Replica становится новым Writer. read_only=OFF, принимает write операции. GTID sequence продолжается.">
              <FlowNode variant="database" tabIndex={0} className="border-2 border-emerald-400">
                New Primary
              </FlowNode>
            </DiagramTooltip>
          </div>

          {/* Step 3: DNS update */}
          <div className="flex flex-col md:flex-row items-center gap-4 w-full justify-center">
            <DiagramTooltip content="Step 3: Aurora cluster endpoint DNS обновляется для указания на новый primary. TTL 5 секунд.">
              <FlowNode variant="cluster" tabIndex={0}>
                DNS Update
              </FlowNode>
            </DiagramTooltip>

            <Arrow direction="right" label="10-30s" />

            <DiagramTooltip content="Приложения (включая Debezium) автоматически подключаются к новому primary через cluster endpoint.">
              <FlowNode variant="connector" tabIndex={0}>
                Debezium Reconnect
              </FlowNode>
            </DiagramTooltip>
          </div>
        </div>
      </DiagramContainer>

      {/* Timeline */}
      <DiagramContainer title="Timeline Aurora Failover" color="neutral">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex flex-col items-center">
            <div className="text-rose-400 font-bold">0s</div>
            <div className="text-gray-400">Failure</div>
          </div>
          <Arrow direction="right" />
          <div className="flex flex-col items-center">
            <div className="text-amber-400 font-bold">30-60s</div>
            <div className="text-gray-400">Detection</div>
          </div>
          <Arrow direction="right" />
          <div className="flex flex-col items-center">
            <div className="text-blue-400 font-bold">60-90s</div>
            <div className="text-gray-400">Promotion</div>
          </div>
          <Arrow direction="right" />
          <div className="flex flex-col items-center">
            <div className="text-purple-400 font-bold">90-120s</div>
            <div className="text-gray-400">DNS Update</div>
          </div>
          <Arrow direction="right" />
          <div className="flex flex-col items-center">
            <div className="text-emerald-400 font-bold">~2 min</div>
            <div className="text-gray-400">Recovery</div>
          </div>
        </div>
      </DiagramContainer>
    </div>
  );
}

/**
 * ConnectorReconfigurationDiagram - Connector reconfiguration steps after failover
 */
export function ConnectorReconfigurationDiagram() {
  return (
    <div className="space-y-6">
      <DiagramContainer title="Connector Reconfiguration After Failover" color="amber">
        <div className="flex flex-col items-center gap-4">
          {/* Step 1: Stop */}
          <div className="flex flex-col md:flex-row items-center gap-4 w-full justify-center">
            <DiagramTooltip content="Step 1: Остановить connector через REST API или Kafka Connect UI. Важно: сохранить текущий offset.">
              <FlowNode variant="connector" tabIndex={0}>
                1. Stop Connector
              </FlowNode>
            </DiagramTooltip>

            <div className="font-mono text-xs bg-gray-800/50 p-2 rounded">
              POST /connectors/mysql/stop
            </div>
          </div>

          {/* Step 2: Update config */}
          <div className="flex flex-col md:flex-row items-center gap-4 w-full justify-center">
            <DiagramTooltip content="Step 2: Обновить конфигурацию если нужно (например, database.hostname если не используется cluster endpoint).">
              <FlowNode variant="app" tabIndex={0}>
                2. Update Config
              </FlowNode>
            </DiagramTooltip>

            <div className="font-mono text-xs bg-gray-800/50 p-2 rounded text-left">
              <div className="text-amber-400">// Если используете cluster endpoint:</div>
              <div className="text-gray-400">// Изменения не нужны</div>
              <div className="text-emerald-400 mt-2">// Если прямой endpoint:</div>
              <div className="text-gray-300">database.hostname: new-primary</div>
            </div>
          </div>

          {/* Step 3: Restart */}
          <div className="flex flex-col md:flex-row items-center gap-4 w-full justify-center">
            <DiagramTooltip content="Step 3: Перезапустить connector. С GTID он автоматически найдет позицию на новом primary.">
              <FlowNode variant="connector" tabIndex={0} className="border-2 border-emerald-400">
                3. Restart Connector
              </FlowNode>
            </DiagramTooltip>

            <div className="font-mono text-xs bg-gray-800/50 p-2 rounded">
              POST /connectors/mysql/restart
            </div>
          </div>

          {/* Step 4: Verify */}
          <div className="flex flex-col md:flex-row items-center gap-4 w-full justify-center">
            <DiagramTooltip content="Step 4: Проверить статус connector и lag. Connected=1, задержка должна уменьшаться.">
              <FlowNode variant="app" tabIndex={0}>
                4. Verify Status
              </FlowNode>
            </DiagramTooltip>

            <div className="font-mono text-xs bg-gray-800/50 p-2 rounded text-left">
              <div className="text-gray-300">GET /connectors/mysql/status</div>
              <div className="text-emerald-400">state: RUNNING</div>
            </div>
          </div>
        </div>
      </DiagramContainer>

      {/* Key configs */}
      <div className="flex flex-col md:flex-row gap-4">
        <DiagramContainer title="gtid.source.includes" color="emerald" className="flex-1">
          <div className="text-xs text-gray-300">
            <div className="font-mono bg-gray-800/50 p-2 rounded mb-2">
              "gtid.source.includes": ".*"
            </div>
            <div className="text-gray-400">
              Рекомендуется ".*" для включения всех server UUIDs.
              После failover новый primary может иметь другой UUID.
            </div>
          </div>
        </DiagramContainer>

        <DiagramContainer title="snapshot.mode" color="blue" className="flex-1">
          <div className="text-xs text-gray-300">
            <div className="font-mono bg-gray-800/50 p-2 rounded mb-2">
              "snapshot.mode": "when_needed"
            </div>
            <div className="text-gray-400">
              Позволяет connector resume с GTID offset без resnapshot.
              Snapshot только если offset невалиден.
            </div>
          </div>
        </DiagramContainer>
      </div>
    </div>
  );
}

/**
 * FailoverTimelineDiagram - Timeline of failover events
 */
export function FailoverTimelineDiagram() {
  return (
    <div className="space-y-6">
      <DiagramContainer title="Failover Events Timeline" color="neutral">
        <div className="flex flex-col gap-6">
          {/* Timeline visualization */}
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gray-600 transform -translate-x-1/2" />

            {/* Events */}
            <div className="flex flex-col gap-8">
              {/* Event 1: Failure */}
              <div className="flex items-center gap-4">
                <div className="flex-1 text-right">
                  <DiagramTooltip content="Primary сервер становится недоступен. Hardware failure, network partition, или software crash.">
                    <FlowNode variant="database" tabIndex={0} size="sm" className="border-2 border-rose-400">
                      Primary Failure
                    </FlowNode>
                  </DiagramTooltip>
                </div>
                <div className="w-4 h-4 bg-rose-400 rounded-full z-10" />
                <div className="flex-1 text-xs text-gray-400">
                  <span className="text-rose-400 font-bold">T+0s</span>
                  <br />
                  Connection lost
                </div>
              </div>

              {/* Event 2: Detection */}
              <div className="flex items-center gap-4">
                <div className="flex-1 text-right text-xs text-gray-400">
                  <span className="text-amber-400 font-bold">T+30-60s</span>
                  <br />
                  Health checks failing
                </div>
                <div className="w-4 h-4 bg-amber-400 rounded-full z-10" />
                <div className="flex-1">
                  <DiagramTooltip content="RDS Control Plane обнаруживает failure. Aurora использует distributed consensus для detection.">
                    <FlowNode variant="app" tabIndex={0} size="sm">
                      Failure Detection
                    </FlowNode>
                  </DiagramTooltip>
                </div>
              </div>

              {/* Event 3: Promotion */}
              <div className="flex items-center gap-4">
                <div className="flex-1 text-right">
                  <DiagramTooltip content="Replica с наименьшим lag выбирается и промотится в primary. SET read_only=OFF.">
                    <FlowNode variant="database" tabIndex={0} size="sm" className="border-2 border-emerald-400">
                      Replica Promoted
                    </FlowNode>
                  </DiagramTooltip>
                </div>
                <div className="w-4 h-4 bg-emerald-400 rounded-full z-10" />
                <div className="flex-1 text-xs text-gray-400">
                  <span className="text-emerald-400 font-bold">T+60-90s</span>
                  <br />
                  New primary ready
                </div>
              </div>

              {/* Event 4: DNS */}
              <div className="flex items-center gap-4">
                <div className="flex-1 text-right text-xs text-gray-400">
                  <span className="text-blue-400 font-bold">T+90-120s</span>
                  <br />
                  TTL 5s propagation
                </div>
                <div className="w-4 h-4 bg-blue-400 rounded-full z-10" />
                <div className="flex-1">
                  <DiagramTooltip content="Cluster endpoint DNS обновляется. Приложения автоматически направляются на новый primary.">
                    <FlowNode variant="cluster" tabIndex={0} size="sm">
                      DNS Updated
                    </FlowNode>
                  </DiagramTooltip>
                </div>
              </div>

              {/* Event 5: Resume */}
              <div className="flex items-center gap-4">
                <div className="flex-1 text-right">
                  <DiagramTooltip content="Debezium reconnect к новому primary. С GTID автоматически находит позицию и resume streaming.">
                    <FlowNode variant="connector" tabIndex={0} size="sm" className="border-2 border-purple-400">
                      Debezium Resume
                    </FlowNode>
                  </DiagramTooltip>
                </div>
                <div className="w-4 h-4 bg-purple-400 rounded-full z-10" />
                <div className="flex-1 text-xs text-gray-400">
                  <span className="text-purple-400 font-bold">T+~2min</span>
                  <br />
                  CDC restored
                </div>
              </div>
            </div>
          </div>
        </div>
      </DiagramContainer>

      {/* Time estimates */}
      <div className="flex flex-col md:flex-row gap-4">
        <DiagramContainer title="Aurora Multi-AZ" color="emerald" className="flex-1">
          <div className="text-xs text-gray-300">
            <span className="text-emerald-400 font-bold">1-2 минуты</span> total recovery
            <br />
            <span className="text-gray-400">Automatic failover, no manual intervention</span>
          </div>
        </DiagramContainer>

        <DiagramContainer title="Self-Hosted MySQL" color="amber" className="flex-1">
          <div className="text-xs text-gray-300">
            <span className="text-amber-400 font-bold">5-30 минут</span> total recovery
            <br />
            <span className="text-gray-400">Depends on orchestration (Orchestrator, ProxySQL)</span>
          </div>
        </DiagramContainer>
      </div>
    </div>
  );
}
