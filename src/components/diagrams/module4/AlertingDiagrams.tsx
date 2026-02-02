/**
 * Alerting Diagrams for Module 4 Lesson 04
 *
 * Exports:
 * - AlertComparisonDiagram: Reactive (bad) vs Proactive (good) alerting approaches
 * - AlertSeverityHierarchyDiagram: Warning -> Critical -> Emergency escalation
 * - BatchInsertSpikeDiagram: Transient lag spike vs recovery
 * - NotificationRoutingDiagram: Alert-to-channel routing decision tree
 */

import { FlowNode } from '../primitives/FlowNode';
import { Arrow } from '../primitives/Arrow';
import { DiagramContainer } from '../primitives/DiagramContainer';
import { DiagramTooltip } from '../primitives/Tooltip';

/**
 * AlertComparisonDiagram - Reactive vs Proactive alerting approaches
 */
export function AlertComparisonDiagram() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Without Alerts - Reactive (Bad) */}
      <DiagramContainer title="Без алертов" color="rose">
        <div className="flex flex-col items-center gap-2">
          <DiagramTooltip content="Lag растет незамеченным. Команда занята другими задачами, никто не смотрит на дашборды.">
            <FlowNode variant="app" tabIndex={0} size="sm">
              <div className="text-xs">Lag растет</div>
            </FlowNode>
          </DiagramTooltip>

          <Arrow direction="down" />

          <DiagramTooltip content="Дашборды есть, но никто не сидит и не смотрит на них 24/7. Проблема остается незамеченной.">
            <FlowNode variant="app" tabIndex={0} size="sm">
              <div className="text-xs">Никто не смотрит</div>
            </FlowNode>
          </DiagramTooltip>

          <Arrow direction="down" />

          <DiagramTooltip content="SLO нарушен: данные в downstream системах устарели на минуты или часы. Бизнес-процессы начинают страдать.">
            <FlowNode variant="target" tabIndex={0} size="sm">
              <div className="text-xs">SLO нарушен</div>
            </FlowNode>
          </DiagramTooltip>

          <Arrow direction="down" />

          <DiagramTooltip content="Клиент замечает проблему раньше инженеров. Репутационный ущерб, стресс, спешное расследование.">
            <FlowNode variant="target" tabIndex={0} size="sm">
              <div className="text-xs">Клиент жалуется</div>
            </FlowNode>
          </DiagramTooltip>

          <Arrow direction="down" />

          <DiagramTooltip content="Реактивный firefighting: команда тушит пожар вместо планомерной работы. Стресс, переработки, выгорание.">
            <FlowNode variant="target" tabIndex={0} size="sm">
              <div className="text-xs">Firefighting</div>
            </FlowNode>
          </DiagramTooltip>
        </div>
      </DiagramContainer>

      {/* With Alerts - Proactive (Good) */}
      <DiagramContainer title="С алертами" color="emerald" recommended>
        <div className="flex flex-col items-center gap-2">
          <DiagramTooltip content="Lag начинает расти, но мониторинг уже следит. Система готова уведомить команду.">
            <FlowNode variant="connector" tabIndex={0} size="sm">
              <div className="text-xs">Lag растет</div>
            </FlowNode>
          </DiagramTooltip>

          <Arrow direction="down" />

          <DiagramTooltip content="Warning через 2 минуты: инженер получает уведомление в Slack. Есть время разобраться до нарушения SLO.">
            <FlowNode variant="connector" tabIndex={0} size="sm" className="bg-amber-500/20 border-amber-400/30">
              <div className="text-xs">Warning через 2 мин</div>
            </FlowNode>
          </DiagramTooltip>

          <Arrow direction="down" />

          <DiagramTooltip content="Инженер открывает дашборд, видит рост lag, проверяет нагрузку на БД и состояние Kafka.">
            <FlowNode variant="connector" tabIndex={0} size="sm">
              <div className="text-xs">Инженер проверяет</div>
            </FlowNode>
          </DiagramTooltip>

          <Arrow direction="down" />

          <DiagramTooltip content="Проблема решена до нарушения SLO. Клиенты ничего не заметили. Команда работает проактивно.">
            <FlowNode variant="connector" tabIndex={0} size="sm">
              <div className="text-xs">Проблема решена</div>
            </FlowNode>
          </DiagramTooltip>

          <Arrow direction="down" />

          <DiagramTooltip content="SLO соблюден: downstream системы получают данные вовремя. Бизнес доволен, команда спокойна.">
            <FlowNode variant="cluster" tabIndex={0} size="sm">
              <div className="text-xs">SLO соблюден</div>
            </FlowNode>
          </DiagramTooltip>
        </div>
      </DiagramContainer>
    </div>
  );
}

/**
 * AlertSeverityHierarchyDiagram - Warning -> Critical -> Emergency escalation
 */
export function AlertSeverityHierarchyDiagram() {
  return (
    <DiagramContainer title="Alert Severity Hierarchy" color="amber">
      <div className="flex flex-col items-center gap-2">
        {/* Warning */}
        <DiagramTooltip content="Warning: lag 5 секунд в течение 2 минут. Investigate during business hours. Slack notification.">
          <FlowNode
            variant="connector"
            tabIndex={0}
            className="bg-yellow-500/20 border-yellow-400/30 text-yellow-200"
          >
            <div className="text-sm">
              <div className="font-semibold">Warning</div>
              <div className="text-xs text-yellow-300/70">Investigate during business hours</div>
            </div>
          </FlowNode>
        </DiagramTooltip>

        <Arrow direction="down" label="30 min unresolved" />

        {/* Critical */}
        <DiagramTooltip content="Critical: lag 30 секунд в течение 5 минут. SLO уже нарушен! Immediate action required. PagerDuty notification.">
          <FlowNode
            variant="app"
            tabIndex={0}
            className="bg-orange-500/20 border-orange-400/30 text-orange-200"
          >
            <div className="text-sm">
              <div className="font-semibold">Critical</div>
              <div className="text-xs text-orange-300/70">Immediate action required</div>
            </div>
          </FlowNode>
        </DiagramTooltip>

        <Arrow direction="down" label="15 min unresolved" />

        {/* Emergency */}
        <DiagramTooltip content="Emergency: lag более 60 секунд в течение 15 минут. Critical business impact. Wake up on-call engineer. Phone call escalation.">
          <FlowNode
            variant="target"
            tabIndex={0}
            className="bg-rose-500/20 border-rose-400/30 text-rose-200"
          >
            <div className="text-sm">
              <div className="font-semibold">Emergency</div>
              <div className="text-xs text-rose-300/70">Wake up on-call engineer</div>
            </div>
          </FlowNode>
        </DiagramTooltip>
      </div>
    </DiagramContainer>
  );
}

/**
 * BatchInsertSpikeDiagram - Transient lag spike vs recovery
 */
export function BatchInsertSpikeDiagram() {
  return (
    <DiagramContainer
      title="Batch INSERT Spike"
      color="neutral"
      description="Нормальный паттерн: кратковременный spike при bulk операциях"
    >
      <div className="flex items-center justify-center gap-3 flex-wrap">
        {/* Batch INSERT */}
        <DiagramTooltip content="Batch INSERT 1000 rows: приложение выполняет bulk операцию. Это нормальная операция, не ошибка.">
          <FlowNode variant="database" tabIndex={0} size="sm">
            <div className="text-xs">
              <div>INSERT</div>
              <div className="text-purple-300/70">1000 rows</div>
            </div>
          </FlowNode>
        </DiagramTooltip>

        <Arrow direction="right" />

        {/* Lag Spike */}
        <DiagramTooltip content="Lag spike 3s: временный рост lag из-за объема данных. Debezium обрабатывает события последовательно. Это НОРМАЛЬНО.">
          <FlowNode variant="app" tabIndex={0} size="sm">
            <div className="text-xs">
              <div>Lag Spike</div>
              <div className="text-rose-300/70">3 секунды</div>
            </div>
          </FlowNode>
        </DiagramTooltip>

        <Arrow direction="right" />

        {/* Processing */}
        <DiagramTooltip content="Processing: Debezium активно обрабатывает события. TotalNumberOfEventsSeen растет, QueueRemainingCapacity снижается.">
          <FlowNode variant="connector" tabIndex={0} size="sm">
            <div className="text-xs">
              <div>Processing</div>
              <div className="text-emerald-300/70">events flowing</div>
            </div>
          </FlowNode>
        </DiagramTooltip>

        <Arrow direction="right" />

        {/* Recovery */}
        <DiagramTooltip content="Recovery: через секунды lag возвращается к нормальному уровню 0.2s. Если lag не снижается - тогда проблема.">
          <FlowNode variant="cluster" tabIndex={0} size="sm">
            <div className="text-xs">
              <div>Recovery</div>
              <div className="text-emerald-300/70">lag 0.2s</div>
            </div>
          </FlowNode>
        </DiagramTooltip>
      </div>

      {/* Clarification */}
      <div className="mt-4 flex flex-col md:flex-row gap-4 justify-center">
        <DiagramTooltip content="Transient spike: lag быстро возвращается к норме после batch операции. Duration clause в алерте предотвращает ложные срабатывания.">
          <div className="bg-emerald-900/20 border border-emerald-500/30 p-3 rounded-lg text-center">
            <div className="text-emerald-400 font-semibold text-sm">Transient = OK</div>
            <div className="text-xs text-gray-400 mt-1">Duration filter отсеивает</div>
          </div>
        </DiagramTooltip>

        <DiagramTooltip content="Sustained lag: если lag НЕ снижается в течение for duration - это реальная проблема, требующая расследования.">
          <div className="bg-rose-900/20 border border-rose-500/30 p-3 rounded-lg text-center">
            <div className="text-rose-400 font-semibold text-sm">Sustained = Problem</div>
            <div className="text-xs text-gray-400 mt-1">Alert срабатывает</div>
          </div>
        </DiagramTooltip>
      </div>
    </DiagramContainer>
  );
}

/**
 * NotificationRoutingDiagram - Alert-to-channel routing decision tree
 */
export function NotificationRoutingDiagram() {
  return (
    <DiagramContainer
      title="Notification Routing"
      color="neutral"
      description="Маршрутизация алертов по severity"
    >
      <div className="flex flex-col items-center gap-3">
        {/* Alert fires */}
        <DiagramTooltip content="Alert fires: условие выполняется в течение for duration. Grafana начинает маршрутизацию по notification policies.">
          <FlowNode variant="connector" tabIndex={0}>
            <div className="text-sm">Alert fires</div>
          </FlowNode>
        </DiagramTooltip>

        <Arrow direction="down" />

        {/* Severity check */}
        <DiagramTooltip content="Notification policy проверяет label severity. Разные severity направляются в разные каналы.">
          <FlowNode variant="connector" tabIndex={0}>
            <div className="text-sm">Severity check</div>
          </FlowNode>
        </DiagramTooltip>

        {/* Branches */}
        <div className="flex flex-col md:flex-row gap-4 mt-2">
          {/* Warning branch */}
          <div className="flex flex-col items-center gap-2">
            <Arrow direction="down" label="warning" />
            <DiagramTooltip content="Warning: Slack notification в канал #alerts. Дежурный инженер увидит в рабочее время.">
              <FlowNode
                variant="connector"
                tabIndex={0}
                size="sm"
                className="bg-yellow-500/20 border-yellow-400/30 text-yellow-200"
              >
                <div className="text-xs">
                  <div>Slack</div>
                  <div className="text-yellow-300/70">#alerts</div>
                </div>
              </FlowNode>
            </DiagramTooltip>
          </div>

          {/* Critical branch */}
          <div className="flex flex-col items-center gap-2">
            <Arrow direction="down" label="critical" />
            <DiagramTooltip content="Critical: PagerDuty incident. On-call engineer получает push notification на телефон.">
              <FlowNode
                variant="app"
                tabIndex={0}
                size="sm"
                className="bg-orange-500/20 border-orange-400/30 text-orange-200"
              >
                <div className="text-xs">
                  <div>PagerDuty</div>
                  <div className="text-orange-300/70">on-call</div>
                </div>
              </FlowNode>
            </DiagramTooltip>
          </div>

          {/* Emergency branch */}
          <div className="flex flex-col items-center gap-2">
            <Arrow direction="down" label="emergency" />
            <DiagramTooltip content="Emergency: Phone call escalation. Автоматический звонок на телефон on-call engineer и backup.">
              <FlowNode
                variant="target"
                tabIndex={0}
                size="sm"
                className="bg-rose-500/20 border-rose-400/30 text-rose-200"
              >
                <div className="text-xs">
                  <div>Phone Call</div>
                  <div className="text-rose-300/70">escalation</div>
                </div>
              </FlowNode>
            </DiagramTooltip>
          </div>
        </div>

        {/* Repeat logic */}
        <div className="mt-4">
          <DiagramTooltip content="Repeat interval: если алерт не resolved, уведомление повторяется каждые 4 часа. Не дает забыть о проблеме.">
            <div className="bg-gray-800/50 border border-gray-600/30 p-3 rounded-lg text-center">
              <div className="text-gray-300 text-sm">Repeat every 4h if not resolved</div>
            </div>
          </DiagramTooltip>
        </div>
      </div>
    </DiagramContainer>
  );
}
