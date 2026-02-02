/**
 * GTID Diagrams
 *
 * Exports:
 * - GtidAnatomyDiagram: Structure of a GTID (source_id:transaction_id)
 * - GtidReplicationDiagram: GTID-based replication flow with failover
 * - GtidFailoverComparisonDiagram: Comparison of failover with and without GTID
 */

import { FlowNode } from '../primitives/FlowNode';
import { Arrow } from '../primitives/Arrow';
import { DiagramContainer } from '../primitives/DiagramContainer';
import { DiagramTooltip } from '../primitives/Tooltip';
import { SequenceDiagram } from '../primitives/SequenceDiagram';
import type { SequenceActorDef, SequenceMessageDef } from '../primitives/types';

/**
 * GtidAnatomyDiagram - Structure of a GTID (source_id:transaction_id)
 */
export function GtidAnatomyDiagram() {
  return (
    <div className="space-y-6">
      {/* GTID structure */}
      <DiagramContainer title="Структура GTID" color="emerald">
        <div className="flex flex-col items-center gap-4">
          <DiagramTooltip content="Global Transaction Identifier - глобально уникальный идентификатор транзакции в топологии MySQL репликации. Формат: server_uuid:sequence_number.">
            <FlowNode variant="connector" tabIndex={0} size="lg">
              <span className="font-mono">GTID</span>
            </FlowNode>
          </DiagramTooltip>

          <div className="flex flex-col md:flex-row gap-4">
            <Arrow direction="down" />
            <Arrow direction="down" />
          </div>

          <div className="flex flex-col md:flex-row gap-6 items-center">
            <DiagramTooltip content="Server UUID - автоматически генерируется при первом запуске MySQL. Хранится в /var/lib/mysql/auto.cnf. Гарантированно уникален для каждого сервера.">
              <FlowNode variant="database" tabIndex={0}>
                <div className="text-center">
                  <span className="block text-xs text-gray-400">source_id</span>
                  <span className="font-mono text-xs text-blue-400">
                    3E11FA47-71CA-11E1-<br />
                    9E33-C80AA9429562
                  </span>
                </div>
              </FlowNode>
            </DiagramTooltip>

            <span className="text-2xl text-gray-500">:</span>

            <DiagramTooltip content="Transaction ID - монотонно возрастающий номер транзакции на данном сервере. Начинается с 1, никогда не используется повторно.">
              <FlowNode variant="sink" tabIndex={0}>
                <div className="text-center">
                  <span className="block text-xs text-gray-400">transaction_id</span>
                  <span className="font-mono text-rose-400">23</span>
                </div>
              </FlowNode>
            </DiagramTooltip>
          </div>
        </div>
      </DiagramContainer>

      {/* GTID Set example */}
      <DiagramContainer title="GTID Set (диапазоны)" color="blue">
        <div className="flex flex-col gap-4">
          <div className="text-center font-mono text-sm bg-gray-800/50 p-3 rounded">
            <DiagramTooltip content="Компактное представление множества GTIDs. Показывает транзакции 1-100 от первого сервера и 1-50 от второго. Диапазоны экономят память и bandwidth.">
              <span className="cursor-help">
                <span className="text-blue-400">3E11FA47-71CA-11E1-9E33-C80AA9429562</span>
                <span className="text-gray-400">:</span>
                <span className="text-emerald-400">1-100</span>
                <span className="text-gray-400">,</span>
                <br />
                <span className="text-amber-400">4E22GB58-82DB-22F2-AF44-D91BA0530673</span>
                <span className="text-gray-400">:</span>
                <span className="text-emerald-400">1-50</span>
              </span>
            </DiagramTooltip>
          </div>

          <div className="text-xs text-gray-400 text-center">
            Транзакции 1-100 от первого сервера<br />
            + транзакции 1-50 от второго (после failover)
          </div>
        </div>
      </DiagramContainer>

      {/* Key benefits */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <DiagramTooltip content="GTID одинаков на primary, replica и после failover. Транзакция ...562:23 имеет тот же ID везде в топологии.">
          <div className="bg-gray-800/30 p-4 rounded-lg text-center cursor-help">
            <div className="text-emerald-400 font-semibold mb-1">Глобально уникален</div>
            <div className="text-xs text-gray-400">Одинаков на всех серверах</div>
          </div>
        </DiagramTooltip>

        <DiagramTooltip content="В отличие от file:offset, GTID не зависит от конкретного сервера. Debezium может продолжить чтение с нового primary.">
          <div className="bg-gray-800/30 p-4 rounded-lg text-center cursor-help">
            <div className="text-blue-400 font-semibold mb-1">Position-независим</div>
            <div className="text-xs text-gray-400">Не привязан к binlog файлам</div>
          </div>
        </DiagramTooltip>

        <DiagramTooltip content="Диапазоны позволяют легко обнаружить пропущенные транзакции. Например, 1-10:15-20 показывает gap 11-14.">
          <div className="bg-gray-800/30 p-4 rounded-lg text-center cursor-help">
            <div className="text-amber-400 font-semibold mb-1">Gap detection</div>
            <div className="text-xs text-gray-400">Обнаружение пропусков</div>
          </div>
        </DiagramTooltip>
      </div>
    </div>
  );
}

/**
 * GtidReplicationDiagram - GTID-based replication flow with failover
 */
export function GtidReplicationDiagram() {
  const actors: SequenceActorDef[] = [
    {
      id: 'debezium',
      label: 'Debezium',
      variant: 'service',
      tooltip: 'CDC connector, отслеживающий изменения. Хранит GTID set в Kafka Connect offset storage. При failover использует сохраненный GTID для продолжения.',
    },
    {
      id: 'primary1',
      label: 'Primary (old)',
      variant: 'database',
      tooltip: 'Исходный primary сервер MySQL. Debezium читает binlog через replication protocol. GTID_EVENT предшествует каждой транзакции.',
    },
    {
      id: 'primary2',
      label: 'Primary (new)',
      variant: 'database',
      tooltip: 'Новый primary сервер после failover (бывшая replica). Содержит те же GTIDs, что и старый primary. Debezium может продолжить чтение.',
    },
  ];

  const messages: SequenceMessageDef[] = [
    {
      id: 'msg1',
      from: 'debezium',
      to: 'primary1',
      label: 'Reading (GTID: ...562:1-100)',
      variant: 'sync',
      tooltip: 'Debezium читает события с позиции GTID ...562:1-100. Каждое прочитанное событие обновляет offset в Kafka.',
    },
    {
      id: 'msg2',
      from: 'primary1',
      to: 'debezium',
      label: 'PRIMARY CRASHES',
      variant: 'return',
      tooltip: 'Primary сервер падает (hardware failure, network issue, crash). Connection потерян. Debezium сохранил offset: gtid_set=...562:100.',
    },
    {
      id: 'msg3',
      from: 'debezium',
      to: 'primary2',
      label: 'Connect to new primary',
      variant: 'async',
      tooltip: 'Debezium переключается на новый primary. Автоматически (через DNS/Load Balancer) или через ручную реконфигурацию.',
    },
    {
      id: 'msg4',
      from: 'debezium',
      to: 'primary2',
      label: 'Request changes after ...562:100',
      variant: 'sync',
      tooltip: 'Debezium запрашивает события после последнего обработанного GTID. Новый primary знает, какие транзакции отдать.',
    },
    {
      id: 'msg5',
      from: 'primary2',
      to: 'debezium',
      label: 'Stream from ...562:101',
      variant: 'return',
      tooltip: 'Новый primary отдает события начиная с GTID ...562:101. CDC продолжается без потери данных и без resnapshot.',
    },
  ];

  return (
    <div className="w-full">
      <SequenceDiagram
        actors={actors}
        messages={messages}
        messageSpacing={55}
      />
      <div className="text-center mt-4 text-sm text-emerald-400 font-semibold">
        CDC продолжается БЕЗ resnapshot!
      </div>
    </div>
  );
}

/**
 * GtidFailoverComparisonDiagram - Comparison of failover with and without GTID
 */
export function GtidFailoverComparisonDiagram() {
  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Without GTID */}
      <DiagramContainer
        title="Без GTID (file:offset)"
        color="rose"
        className="flex-1"
      >
        <div className="flex flex-col gap-4">
          <div className="space-y-3">
            <DiagramTooltip content="Debezium читает binlog с позиции mysql-bin.000003:154. Позиция привязана к конкретному файлу на конкретном сервере.">
              <FlowNode variant="connector" tabIndex={0} size="sm">
                <span className="font-mono text-xs">Position: mysql-bin.000003:154</span>
              </FlowNode>
            </DiagramTooltip>

            <div className="text-center text-rose-400 font-semibold text-sm">
              PRIMARY CRASHES
            </div>

            <DiagramTooltip content="На новом primary файлы binlog имеют другие имена и смещения. Позиция mysql-bin.000003:154 бессмысленна.">
              <FlowNode variant="database" tabIndex={0} size="sm">
                <span className="text-xs">New primary: mysql-bin.000001:89</span>
              </FlowNode>
            </DiagramTooltip>

            <div className="text-center text-xs text-gray-400">
              Position на старом сервере<br />
              не соответствует той же<br />
              транзакции на новом
            </div>

            <DiagramTooltip content="Единственный вариант - полный resnapshot базы данных. Может занять часы или дни для больших таблиц.">
              <FlowNode variant="sink" tabIndex={0} size="sm">
                <span className="text-rose-400 font-semibold">FULL RESNAPSHOT</span>
              </FlowNode>
            </DiagramTooltip>
          </div>

          <div className="text-xs text-rose-400 text-center px-2">
            Часы/дни downtime для больших баз
          </div>
        </div>
      </DiagramContainer>

      {/* With GTID */}
      <DiagramContainer
        title="С GTID"
        color="emerald"
        recommended
        className="flex-1"
      >
        <div className="flex flex-col gap-4">
          <div className="space-y-3">
            <DiagramTooltip content="Debezium хранит GTID set в offset. Позиция не зависит от имени файла или сервера.">
              <FlowNode variant="connector" tabIndex={0} size="sm">
                <span className="font-mono text-xs">GTID: ...562:1-100</span>
              </FlowNode>
            </DiagramTooltip>

            <div className="text-center text-amber-400 font-semibold text-sm">
              PRIMARY CRASHES
            </div>

            <DiagramTooltip content="Новый primary имеет те же GTIDs (реплицировал транзакции). GTID ...562:100 означает то же самое.">
              <FlowNode variant="database" tabIndex={0} size="sm">
                <span className="text-xs">New primary: same GTIDs</span>
              </FlowNode>
            </DiagramTooltip>

            <div className="text-center text-xs text-gray-400">
              Debezium запрашивает<br />
              все после GTID ...562:100
            </div>

            <DiagramTooltip content="Мгновенное продолжение чтения с нового primary. Без потери данных, без resnapshot.">
              <FlowNode variant="app" tabIndex={0} size="sm">
                <span className="text-emerald-400 font-semibold">INSTANT RESUME</span>
              </FlowNode>
            </DiagramTooltip>
          </div>

          <div className="text-xs text-emerald-400 text-center px-2">
            Секунды для переключения
          </div>
        </div>
      </DiagramContainer>
    </div>
  );
}
