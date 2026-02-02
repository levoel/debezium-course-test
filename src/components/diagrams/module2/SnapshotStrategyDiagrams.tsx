/**
 * Snapshot Strategy Diagrams
 *
 * Exports:
 * - SnapshotDataLossDiagram: Simple "without snapshot" data loss visualization
 * - TraditionalSnapshotDiagram: Sequence showing streaming blocked during snapshot
 * - IncrementalSnapshotDiagram: Sequence showing parallel processing
 * - SnapshotDecisionDiagram: Decision flowchart for choosing strategy
 */

import { FlowNode } from '../primitives/FlowNode';
import { Arrow } from '../primitives/Arrow';
import { DiagramContainer } from '../primitives/DiagramContainer';
import { DiagramTooltip } from '../primitives/Tooltip';
import { SequenceDiagram } from '../primitives/SequenceDiagram';
import type { SequenceActorDef, SequenceMessageDef } from '../primitives/types';

/**
 * SnapshotDataLossDiagram - Simple "without snapshot" data loss visualization
 */
export function SnapshotDataLossDiagram() {
  return (
    <DiagramContainer title="Без snapshot: Потеря существующих данных" color="rose">
      <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-8">
        {/* Existing data flow */}
        <div className="flex flex-col items-center gap-3">
          <DiagramTooltip content="Миллионы записей уже существуют в таблице до запуска CDC. Без snapshot consumer их никогда не увидит. Эти данные критичны для полной картины.">
            <FlowNode variant="database" tabIndex={0}>
              Существующие данные
            </FlowNode>
          </DiagramTooltip>

          <Arrow direction="down" />

          <DiagramTooltip content="Потеря данных — существующие записи невидимы для CDC. Только операции INSERT/UPDATE/DELETE после запуска коннектора захватываются. История теряется.">
            <FlowNode variant="app" tabIndex={0} className="border-2 border-rose-400">
              <span className="text-rose-400 font-bold">ПОТЕРЯНЫ</span>
            </FlowNode>
          </DiagramTooltip>
        </div>

        {/* Divider */}
        <div className="hidden md:block h-24 w-px bg-gray-600" />
        <div className="md:hidden w-24 h-px bg-gray-600" />

        {/* New changes flow */}
        <div className="flex flex-col items-center gap-3">
          <DiagramTooltip content="CDC захватывает только изменения после запуска. INSERT, UPDATE, DELETE попадают в Kafka. Но это только часть данных.">
            <FlowNode variant="connector" tabIndex={0}>
              Новые изменения
            </FlowNode>
          </DiagramTooltip>

          <Arrow direction="down" />

          <DiagramTooltip content="Топик содержит только новые события. Для полной картины нужен initial snapshot существующих данных или incremental snapshot по требованию.">
            <FlowNode variant="cluster" tabIndex={0} className="border-2 border-emerald-400">
              Kafka
            </FlowNode>
          </DiagramTooltip>
        </div>
      </div>

      <div className="mt-4 text-xs text-center text-gray-400">
        Consumer видит только новые изменения, не зная о миллионах существующих записей
      </div>
    </DiagramContainer>
  );
}

/**
 * TraditionalSnapshotDiagram - Sequence showing streaming blocked during snapshot
 */
export function TraditionalSnapshotDiagram() {
  const actors: SequenceActorDef[] = [
    {
      id: 'connector',
      label: 'Connector',
      variant: 'service',
      tooltip:
        'Во время traditional snapshot коннектор полностью занят чтением таблицы. SELECT * без WHERE — последовательное чтение миллионов строк. Streaming заблокирован.',
    },
    {
      id: 'pg',
      label: 'PostgreSQL',
      variant: 'database',
      tooltip:
        'База выполняет full table scan. WAL продолжает накапливаться от новых транзакций, но Debezium не читает его до завершения snapshot.',
    },
    {
      id: 'kafka',
      label: 'Kafka',
      variant: 'queue',
      tooltip:
        'Kafka получает только snapshot события (op="r") во время snapshot фазы. Streaming события будут отправлены только после завершения snapshot.',
    },
  ];

  const messages: SequenceMessageDef[] = [
    {
      id: 'msg1',
      from: 'connector',
      to: 'pg',
      label: 'SELECT * FROM large_table',
      variant: 'sync',
      tooltip:
        'Начало traditional snapshot. Коннектор выполняет полное сканирование таблицы. Для таблицы 10M строк это может занять часы.',
    },
    {
      id: 'msg2',
      from: 'pg',
      to: 'connector',
      label: '10M rows...',
      variant: 'return',
      tooltip:
        'PostgreSQL возвращает миллионы строк последовательно. Пока идет чтение — WAL от новых транзакций накапливается.',
    },
    {
      id: 'msg3',
      from: 'connector',
      to: 'kafka',
      label: 'op="r" events',
      variant: 'async',
      tooltip:
        'Snapshot события с op="r" (read) отправляются в Kafka. Каждая строка становится отдельным событием.',
    },
    {
      id: 'msg4',
      from: 'connector',
      to: 'pg',
      label: 'Read WAL',
      variant: 'async',
      tooltip:
        'ТОЛЬКО после завершения snapshot коннектор начинает читать накопленный WAL. Может быть большой backlog.',
    },
    {
      id: 'msg5',
      from: 'pg',
      to: 'connector',
      label: 'Accumulated changes',
      variant: 'return',
      tooltip:
        'PostgreSQL отдает накопленные изменения. Чем дольше длился snapshot, тем больше backlog.',
    },
    {
      id: 'msg6',
      from: 'connector',
      to: 'kafka',
      label: 'op="c/u/d" events',
      variant: 'async',
      tooltip:
        'Streaming события (create, update, delete) отправляются в Kafka. Теперь идет нормальная CDC работа.',
    },
  ];

  return (
    <div className="space-y-4">
      <SequenceDiagram actors={actors} messages={messages} messageSpacing={50} />

      {/* Blocking period indicator */}
      <DiagramContainer title="Период блокировки streaming" color="rose">
        <div className="text-sm text-gray-300 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-rose-400 font-bold">ПРОБЛЕМА:</span>
            <span>Streaming заблокирован на время snapshot.</span>
          </div>
          <div className="text-xs text-gray-400">
            Для таблицы 100GB это могут быть часы. WAL retention растет, replication slot lag увеличивается.
            <br />
            При crash во время snapshot — приходится начинать сначала.
          </div>
        </div>
      </DiagramContainer>
    </div>
  );
}

/**
 * IncrementalSnapshotDiagram - Sequence showing parallel processing
 */
export function IncrementalSnapshotDiagram() {
  const actors: SequenceActorDef[] = [
    {
      id: 'signal',
      label: 'Signal Table',
      variant: 'database',
      tooltip:
        'Таблица debezium_signal принимает команды. INSERT с type="execute-snapshot" запускает incremental snapshot. Позволяет контролировать snapshot по требованию.',
    },
    {
      id: 'connector',
      label: 'Connector',
      variant: 'service',
      tooltip:
        'Коннектор читает таблицу chunk-by-chunk (по 512-4096 строк) по primary key. Между chunks обрабатывает streaming события — параллельная работа.',
    },
    {
      id: 'pg',
      label: 'PostgreSQL',
      variant: 'database',
      tooltip:
        'База обрабатывает и snapshot запросы (SELECT с WHERE), и обычные транзакции. Chunk-based подход минимизирует нагрузку.',
    },
    {
      id: 'kafka',
      label: 'Kafka',
      variant: 'queue',
      tooltip:
        'Параллельная обработка: snapshot op="r" и streaming op="c/u/d" в одном топике. Consumer различает события по source.snapshot поля.',
    },
  ];

  const messages: SequenceMessageDef[] = [
    {
      id: 'msg1',
      from: 'signal',
      to: 'connector',
      label: 'execute-snapshot',
      variant: 'async',
      tooltip:
        'INSERT в signaling table запускает incremental snapshot. type="execute-snapshot", data содержит список таблиц.',
    },
    {
      id: 'msg2',
      from: 'connector',
      to: 'pg',
      label: 'SELECT WHERE id 1-512',
      variant: 'sync',
      tooltip:
        'Первый chunk: SELECT * WHERE id BETWEEN 1 AND 512. Chunk size настраивается через incremental.snapshot.chunk.size.',
    },
    {
      id: 'msg3',
      from: 'connector',
      to: 'kafka',
      label: 'op="r" chunk 1',
      variant: 'async',
      tooltip:
        'Snapshot события первого chunk отправляются в Kafka с op="r" и source.snapshot="incremental".',
    },
    {
      id: 'msg4',
      from: 'pg',
      to: 'connector',
      label: 'WAL changes',
      variant: 'return',
      tooltip:
        'ПАРАЛЛЕЛЬНО: Между chunks коннектор обрабатывает streaming события из WAL. Нет блокировки!',
    },
    {
      id: 'msg5',
      from: 'connector',
      to: 'kafka',
      label: 'op="c/u/d"',
      variant: 'async',
      tooltip:
        'Streaming события отправляются в Kafka параллельно со snapshot. Consumer видит оба типа событий.',
    },
    {
      id: 'msg6',
      from: 'connector',
      to: 'pg',
      label: 'SELECT WHERE id 513-1024',
      variant: 'sync',
      tooltip:
        'Следующий chunk: SELECT * WHERE id BETWEEN 513 AND 1024. Возобновляемо — при crash продолжит с последнего chunk.',
    },
    {
      id: 'msg7',
      from: 'connector',
      to: 'kafka',
      label: 'op="r" chunk N',
      variant: 'async',
      tooltip:
        'Snapshot завершается chunk за chunk. При collision (запись изменилась) — приоритет streaming событию.',
    },
  ];

  return (
    <div className="space-y-4">
      <SequenceDiagram actors={actors} messages={messages} messageSpacing={45} />

      {/* Parallel processing indicator */}
      <DiagramContainer title="Параллельная обработка" color="emerald">
        <div className="text-sm text-gray-300 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-emerald-400 font-bold">ПРЕИМУЩЕСТВО:</span>
            <span>Snapshot и streaming работают параллельно.</span>
          </div>
          <div className="text-xs text-gray-400">
            Минимальный downtime, возобновляемость при crash, collision detection.
            <br />
            Consumer различает события по полю <code className="bg-gray-800 px-1 rounded">source.snapshot</code>
          </div>
        </div>
      </DiagramContainer>
    </div>
  );
}

/**
 * SnapshotDecisionDiagram - Decision flowchart for choosing strategy
 */
export function SnapshotDecisionDiagram() {
  return (
    <div className="space-y-6">
      {/* Decision tree */}
      <div className="flex flex-col items-center gap-4">
        {/* Root question */}
        <DiagramTooltip content="Первый вопрос: нужны ли существующие данные? Для аналитики с историей — да. Для real-time алертов на новые события — возможно нет.">
          <FlowNode variant="connector" tabIndex={0} className="border-2 border-amber-400">
            Нужен snapshot?
          </FlowNode>
        </DiagramTooltip>

        <div className="flex flex-col md:flex-row items-center gap-6 md:gap-12">
          {/* No branch */}
          <div className="flex flex-col items-center gap-3">
            <div className="text-xs text-gray-400">Нет</div>
            <Arrow direction="down" />
            <DiagramTooltip content="Используется с incremental snapshot через signaling table. Коннектор сразу начинает streaming. Подходит когда история не нужна или будет загружена отдельно.">
              <FlowNode variant="database" tabIndex={0} className="border-2 border-purple-400">
                snapshot.mode=never
              </FlowNode>
            </DiagramTooltip>
          </div>

          {/* Yes branch */}
          <div className="flex flex-col items-center gap-3">
            <div className="text-xs text-gray-400">Да</div>
            <Arrow direction="down" />

            <DiagramTooltip content="Ключевой фактор: размер таблицы определяет стратегию. < 1M строк — traditional справится за минуты. >= 1M — нужен incremental.">
              <FlowNode variant="connector" tabIndex={0} className="border-2 border-blue-400">
                Размер таблицы?
              </FlowNode>
            </DiagramTooltip>

            <div className="flex flex-col md:flex-row items-center gap-6">
              {/* Small table */}
              <div className="flex flex-col items-center gap-3">
                <div className="text-xs text-gray-400">&lt; 1M строк</div>
                <Arrow direction="down" />
                <DiagramTooltip content="< 1M строк: Traditional snapshot пройдет за минуты. Простой выбор snapshot.mode=initial. Минимальная конфигурация.">
                  <FlowNode variant="sink" tabIndex={0} className="border-2 border-amber-400">
                    Downtime OK?
                  </FlowNode>
                </DiagramTooltip>

                <div className="flex flex-row items-center gap-4">
                  <div className="flex flex-col items-center gap-2">
                    <div className="text-xs text-gray-400">Да</div>
                    <DiagramTooltip content="Если допустим downtime до 30 минут — можно использовать traditional snapshot даже для средних таблиц. Простейший вариант.">
                      <FlowNode variant="cluster" tabIndex={0} size="sm">
                        initial
                      </FlowNode>
                    </DiagramTooltip>
                  </div>

                  <div className="flex flex-col items-center gap-2">
                    <div className="text-xs text-gray-400">Нет</div>
                    <DiagramTooltip content=">= 1M строк: Incremental snapshot обязателен. Минимальный downtime, возобновляемость, параллельный streaming.">
                      <FlowNode variant="cluster" tabIndex={0} size="sm" className="border-2 border-emerald-400">
                        incremental
                      </FlowNode>
                    </DiagramTooltip>
                  </div>
                </div>
              </div>

              {/* Large table */}
              <div className="flex flex-col items-center gap-3">
                <div className="text-xs text-gray-400">&gt;= 1M строк</div>
                <Arrow direction="down" />
                <DiagramTooltip content="Большие таблицы: только incremental snapshot. Traditional заблокирует streaming на часы. Используйте signaling table для контроля.">
                  <FlowNode variant="cluster" tabIndex={0} className="border-2 border-emerald-400">
                    Incremental Snapshot
                  </FlowNode>
                </DiagramTooltip>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations summary */}
      <div className="flex flex-col md:flex-row gap-4">
        <DiagramContainer title="Рекомендации" color="emerald" className="flex-1">
          <div className="text-xs text-gray-300 space-y-2">
            <div>
              <span className="text-emerald-400 font-bold">snapshot.mode=initial</span>
              <br />
              Новое развертывание, таблицы &lt; 1M строк
            </div>
            <div>
              <span className="text-emerald-400 font-bold">snapshot.mode=never + incremental</span>
              <br />
              Большие таблицы, zero downtime требование
            </div>
          </div>
        </DiagramContainer>

        <DiagramContainer title="Анти-паттерны" color="rose" className="flex-1">
          <div className="text-xs text-gray-300 space-y-2">
            <div>
              <span className="text-rose-400 font-bold">snapshot.mode=always</span>
              <br />
              Полный snapshot при каждом рестарте — только для dev
            </div>
            <div>
              <span className="text-rose-400 font-bold">initial для &gt; 10M строк</span>
              <br />
              Часы блокировки streaming, WAL backlog
            </div>
          </div>
        </DiagramContainer>
      </div>
    </div>
  );
}
