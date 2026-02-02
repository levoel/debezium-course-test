/**
 * Incremental Snapshot Diagrams for Module 3
 *
 * Exports:
 * - IncrementalSnapshotFlowDiagram: Incremental snapshot overview with parallel processing
 * - ChunkProcessingDiagram: Chunk processing detail with watermarks and deduplication
 * - SignalTableDiagram: Signal table structure and mechanism
 */

import { FlowNode } from '../primitives/FlowNode';
import { Arrow } from '../primitives/Arrow';
import { DiagramContainer } from '../primitives/DiagramContainer';
import { DiagramTooltip } from '../primitives/Tooltip';

/**
 * IncrementalSnapshotFlowDiagram - Incremental snapshot overview
 */
export function IncrementalSnapshotFlowDiagram() {
  return (
    <div className="space-y-6">
      <DiagramContainer title="Incremental Snapshot: Non-Blocking Flow" color="emerald">
        <div className="flex flex-col items-center gap-4">
          {/* Step 1: Signal received */}
          <div className="flex flex-col md:flex-row items-center gap-4 w-full justify-center">
            <DiagramTooltip content="Step 1: INSERT в signal table с type='execute-snapshot' запускает incremental snapshot. Можно указать конкретные таблицы.">
              <FlowNode variant="database" tabIndex={0}>
                Signal Received
                <br />
                <span className="text-xs text-gray-400">execute-snapshot</span>
              </FlowNode>
            </DiagramTooltip>

            <Arrow direction="right" label="trigger" />

            <DiagramTooltip content="Debezium парсит signal и начинает incremental snapshot для указанных таблиц. Streaming НЕ останавливается.">
              <FlowNode variant="connector" tabIndex={0}>
                Start Snapshot
              </FlowNode>
            </DiagramTooltip>
          </div>

          {/* Step 2: Chunk selection */}
          <div className="flex flex-col md:flex-row items-center gap-4 w-full justify-center">
            <DiagramTooltip content="Step 2: Определяем границы chunk по primary key. Например, id >= 1 AND id < 2049 для chunk size 2048.">
              <FlowNode variant="app" tabIndex={0}>
                Select Chunk Range
                <br />
                <span className="text-xs text-gray-400">WHERE id &gt;= N AND id &lt; N+2048</span>
              </FlowNode>
            </DiagramTooltip>

            <Arrow direction="right" />

            <DiagramTooltip content="SELECT с границами chunk. Не блокирует таблицу — использует обычный SELECT с WHERE условием.">
              <FlowNode variant="database" tabIndex={0}>
                Read Chunk
                <br />
                <span className="text-xs text-gray-400">2048 rows</span>
              </FlowNode>
            </DiagramTooltip>
          </div>

          {/* Step 3: Emit and binlog */}
          <div className="flex flex-col md:flex-row items-center gap-4 w-full justify-center">
            <DiagramTooltip content="Step 3: Chunk events отправляются в Kafka с op='r' и source.snapshot='incremental'. Параллельно обрабатываются binlog events.">
              <FlowNode variant="cluster" tabIndex={0} className="border-2 border-emerald-400">
                Emit Chunk Events
                <br />
                <span className="text-xs text-emerald-400">op='r'</span>
              </FlowNode>
            </DiagramTooltip>

            <div className="text-xs text-gray-400">+</div>

            <DiagramTooltip content="ПАРАЛЛЕЛЬНО: Binlog streaming продолжается. События op='c/u/d' отправляются в те же топики. Нет блокировки!">
              <FlowNode variant="cluster" tabIndex={0} className="border-2 border-blue-400">
                Stream Binlog
                <br />
                <span className="text-xs text-blue-400">op='c/u/d'</span>
              </FlowNode>
            </DiagramTooltip>
          </div>

          {/* Step 4: Next chunk */}
          <div className="flex flex-col md:flex-row items-center gap-4 w-full justify-center">
            <DiagramTooltip content="Step 4: После завершения chunk, Debezium переходит к следующему. При crash — resume с последнего chunk.">
              <FlowNode variant="connector" tabIndex={0}>
                Next Chunk
                <br />
                <span className="text-xs text-gray-400">id &gt;= 2049</span>
              </FlowNode>
            </DiagramTooltip>

            <Arrow direction="right" label="repeat" />

            <DiagramTooltip content="Цикл продолжается до конца таблицы. Progress сохраняется — snapshot resumable.">
              <FlowNode variant="app" tabIndex={0} className="border-2 border-purple-400">
                Snapshot Complete
              </FlowNode>
            </DiagramTooltip>
          </div>
        </div>
      </DiagramContainer>

      {/* Key advantage */}
      <DiagramContainer title="Ключевое преимущество: Параллельная обработка" color="emerald" recommended>
        <div className="text-sm text-gray-300 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-emerald-400 font-bold">НЕ БЛОКИРУЕТ:</span>
            <span>Streaming и snapshot работают параллельно.</span>
          </div>
          <div className="text-xs text-gray-400">
            Initial snapshot блокирует binlog streaming до завершения. Incremental snapshot — нет.
            <br />
            Consumer различает события по полю <code className="bg-gray-800 px-1 rounded">source.snapshot</code>:
            <br />
            <code className="bg-gray-800 px-1 rounded">"incremental"</code> для snapshot, <code className="bg-gray-800 px-1 rounded">"false"</code> для streaming.
          </div>
        </div>
      </DiagramContainer>

      {/* Comparison */}
      <div className="flex flex-col md:flex-row gap-4">
        <DiagramContainer title="Initial Snapshot" color="rose" className="flex-1">
          <ul className="text-xs text-gray-300 space-y-1">
            <li>- Блокирует binlog streaming</li>
            <li>- Все таблицы сразу</li>
            <li>- Не resumable при crash</li>
            <li>- Требует restart connector</li>
          </ul>
        </DiagramContainer>

        <DiagramContainer title="Incremental Snapshot" color="emerald" className="flex-1">
          <ul className="text-xs text-gray-300 space-y-1">
            <li>+ Параллельно с streaming</li>
            <li>+ Конкретные таблицы on-demand</li>
            <li>+ Resumable при crash</li>
            <li>+ Через signal table (без restart)</li>
          </ul>
        </DiagramContainer>
      </div>
    </div>
  );
}

/**
 * ChunkProcessingDiagram - Chunk processing detail
 */
export function ChunkProcessingDiagram() {
  return (
    <div className="space-y-6">
      <DiagramContainer title="Chunk Processing с Watermarks" color="amber">
        <div className="flex flex-col items-center gap-6">
          {/* Watermark concept */}
          <div className="flex flex-col md:flex-row items-center gap-6 w-full justify-center">
            <div className="flex flex-col items-center gap-2">
              <DiagramTooltip content="LOW watermark: Начало chunk. Например, id=1 для первого chunk с chunk size 2048.">
                <FlowNode variant="app" tabIndex={0} size="sm" className="border-2 border-blue-400">
                  LOW Watermark
                  <br />
                  <span className="text-xs text-gray-400">id=1</span>
                </FlowNode>
              </DiagramTooltip>
            </div>

            <div className="flex flex-col items-center gap-2">
              <Arrow direction="right" label="chunk range" />
              <div className="text-xs text-gray-400 text-center">
                SELECT * WHERE
                <br />
                id &gt;= 1 AND id &lt; 2049
              </div>
            </div>

            <div className="flex flex-col items-center gap-2">
              <DiagramTooltip content="HIGH watermark: Конец chunk (exclusive). id=2049 для первого chunk. Следующий chunk начнется с этого значения.">
                <FlowNode variant="app" tabIndex={0} size="sm" className="border-2 border-emerald-400">
                  HIGH Watermark
                  <br />
                  <span className="text-xs text-gray-400">id=2049</span>
                </FlowNode>
              </DiagramTooltip>
            </div>
          </div>

          {/* Interleaving visualization */}
          <div className="w-full">
            <div className="text-xs text-gray-400 mb-2 text-center">Interleaving с Binlog Events</div>
            <div className="flex flex-col gap-2">
              {/* Chunk 1 */}
              <div className="flex items-center gap-2 justify-center flex-wrap">
                <div className="bg-emerald-500/20 px-2 py-1 rounded text-xs">Chunk 1: rows 1-2048</div>
                <div className="text-gray-500">|</div>
                <div className="bg-blue-500/20 px-2 py-1 rounded text-xs">Binlog events</div>
                <div className="text-gray-500">|</div>
                <div className="bg-emerald-500/20 px-2 py-1 rounded text-xs">Chunk 2: rows 2049-4096</div>
              </div>
            </div>
          </div>
        </div>
      </DiagramContainer>

      {/* Deduplication */}
      <DiagramContainer title="Collision Detection и Deduplication" color="neutral">
        <div className="flex flex-col gap-4">
          <div className="text-sm text-gray-300">
            <span className="text-amber-400 font-bold">Проблема:</span> Что если row изменился во время snapshot?
          </div>

          <div className="flex flex-col md:flex-row items-start gap-6">
            {/* Scenario */}
            <div className="flex-1">
              <DiagramContainer title="Сценарий Collision" color="rose" className="h-full">
                <div className="text-xs text-gray-300 space-y-2">
                  <div className="flex items-start gap-2">
                    <span className="text-gray-400">T1:</span>
                    <span>Snapshot читает row id=500 со значением A</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-gray-400">T2:</span>
                    <span>UPDATE row id=500 SET value=B (binlog event)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-rose-400">?</span>
                    <span>Какое значение правильное?</span>
                  </div>
                </div>
              </DiagramContainer>
            </div>

            {/* Resolution */}
            <div className="flex-1">
              <DiagramContainer title="Решение: Streaming Priority" color="emerald" className="h-full">
                <div className="text-xs text-gray-300 space-y-2">
                  <div className="flex items-start gap-2">
                    <span className="text-emerald-400">1.</span>
                    <span>Debezium сравнивает timestamps</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-emerald-400">2.</span>
                    <span>Binlog event (streaming) имеет приоритет</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-emerald-400">3.</span>
                    <span>Snapshot event для этого row пропускается</span>
                  </div>
                </div>
              </DiagramContainer>
            </div>
          </div>

          <div className="text-xs text-gray-400">
            <span className="font-bold">Результат:</span> Consumer всегда видит актуальное значение.
            Streaming events (более свежие) имеют приоритет над snapshot events.
          </div>
        </div>
      </DiagramContainer>

      {/* Chunk size recommendation */}
      <DiagramContainer title="Выбор Chunk Size" color="neutral">
        <div className="overflow-x-auto">
          <table className="text-xs text-gray-300 w-full">
            <thead>
              <tr className="border-b border-gray-600">
                <th className="text-left py-2 pr-4">Chunk Size</th>
                <th className="text-left py-2 pr-4">Когда использовать</th>
                <th className="text-left py-2">Trade-offs</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-700">
                <td className="py-2 pr-4 font-mono">1024</td>
                <td className="py-2 pr-4">Широкие rows (100+ columns)</td>
                <td className="py-2 text-gray-400">Медленнее, меньше memory</td>
              </tr>
              <tr className="border-b border-gray-700">
                <td className="py-2 pr-4 font-mono text-emerald-400">2048</td>
                <td className="py-2 pr-4 text-emerald-400">Default — большинство cases</td>
                <td className="py-2 text-gray-400">Balanced performance</td>
              </tr>
              <tr className="border-b border-gray-700">
                <td className="py-2 pr-4 font-mono">4096</td>
                <td className="py-2 pr-4">Узкие rows (5-10 columns)</td>
                <td className="py-2 text-gray-400">Быстрее, больше memory</td>
              </tr>
              <tr>
                <td className="py-2 pr-4 font-mono">8192</td>
                <td className="py-2 pr-4">Large tables, high-perf</td>
                <td className="py-2 text-gray-400">Может вызвать memory pressure</td>
              </tr>
            </tbody>
          </table>
        </div>
      </DiagramContainer>
    </div>
  );
}

/**
 * SignalTableDiagram - Signal table structure and mechanism
 */
export function SignalTableDiagram() {
  return (
    <div className="space-y-6">
      {/* Table structure */}
      <DiagramContainer title="Signal Table Schema" color="purple">
        <div className="flex flex-col items-center gap-4">
          <DiagramTooltip content="Signal table — специальная таблица для управления Debezium. Debezium мониторит INSERT events через binlog.">
            <FlowNode variant="database" tabIndex={0}>
              debezium_signal
            </FlowNode>
          </DiagramTooltip>

          <div className="font-mono text-xs bg-gray-800/50 p-4 rounded w-full max-w-lg">
            <div className="text-purple-400 mb-2">CREATE TABLE debezium_signal (</div>
            <div className="pl-4 space-y-1">
              <div>
                <span className="text-emerald-400">id</span>
                <span className="text-gray-400"> VARCHAR(36) NOT NULL,</span>
                <span className="text-gray-500 ml-2">-- UUID</span>
              </div>
              <div>
                <span className="text-amber-400">type</span>
                <span className="text-gray-400"> VARCHAR(32) NOT NULL,</span>
                <span className="text-gray-500 ml-2">-- execute-snapshot</span>
              </div>
              <div>
                <span className="text-blue-400">data</span>
                <span className="text-gray-400"> TEXT,</span>
                <span className="text-gray-500 ml-2">-- JSON payload</span>
              </div>
              <div>
                <span className="text-rose-400">PRIMARY KEY (id)</span>
                <span className="text-gray-500 ml-2">-- CRITICAL!</span>
              </div>
            </div>
            <div className="text-purple-400">);</div>
          </div>
        </div>
      </DiagramContainer>

      {/* Signal flow */}
      <DiagramContainer title="Signal Mechanism" color="amber">
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8">
          <div className="flex flex-col items-center gap-2">
            <DiagramTooltip content="Step 1: Operations engineer выполняет INSERT в signal table с командой execute-snapshot.">
              <FlowNode variant="app" tabIndex={0} size="sm">
                INSERT signal
              </FlowNode>
            </DiagramTooltip>
            <div className="text-xs text-gray-400">Engineer</div>
          </div>

          <Arrow direction="right" label="binlog" />

          <div className="flex flex-col items-center gap-2">
            <DiagramTooltip content="Step 2: INSERT создает binlog event. Debezium читает этот event как часть обычного streaming.">
              <FlowNode variant="database" tabIndex={0} size="sm">
                Binlog Event
              </FlowNode>
            </DiagramTooltip>
            <div className="text-xs text-gray-400">MySQL</div>
          </div>

          <Arrow direction="right" label="parse" />

          <div className="flex flex-col items-center gap-2">
            <DiagramTooltip content="Step 3: Debezium распознает signal table и парсит команду. Запускает incremental snapshot для указанных таблиц.">
              <FlowNode variant="connector" tabIndex={0} size="sm" className="border-2 border-emerald-400">
                Execute Snapshot
              </FlowNode>
            </DiagramTooltip>
            <div className="text-xs text-gray-400">Debezium</div>
          </div>
        </div>
      </DiagramContainer>

      {/* Signal examples */}
      <div className="flex flex-col md:flex-row gap-4">
        <DiagramContainer title="Execute Snapshot" color="emerald" className="flex-1">
          <div className="font-mono text-xs bg-gray-800/50 p-3 rounded">
            <div className="text-gray-400">INSERT INTO debezium_signal</div>
            <div className="text-gray-400">(id, type, data) VALUES (</div>
            <div className="pl-2">
              <span className="text-emerald-400">UUID()</span>,
            </div>
            <div className="pl-2">
              <span className="text-amber-400">'execute-snapshot'</span>,
            </div>
            <div className="pl-2 text-blue-400">
              '&#123;"data-collections":<br />
              &nbsp;&nbsp;["inventory.orders"]&#125;'
            </div>
            <div className="text-gray-400">);</div>
          </div>
        </DiagramContainer>

        <DiagramContainer title="Stop Snapshot" color="rose" className="flex-1">
          <div className="font-mono text-xs bg-gray-800/50 p-3 rounded">
            <div className="text-gray-400">INSERT INTO debezium_signal</div>
            <div className="text-gray-400">(id, type, data) VALUES (</div>
            <div className="pl-2">
              <span className="text-emerald-400">UUID()</span>,
            </div>
            <div className="pl-2">
              <span className="text-rose-400">'stop-snapshot'</span>,
            </div>
            <div className="pl-2 text-blue-400">
              '&#123;"data-collections":<br />
              &nbsp;&nbsp;["inventory.orders"],<br />
              &nbsp;&nbsp;"type":"INCREMENTAL"&#125;'
            </div>
            <div className="text-gray-400">);</div>
          </div>
        </DiagramContainer>
      </div>

      {/* Critical warning */}
      <DiagramContainer title="CRITICAL: PRIMARY KEY обязателен" color="rose">
        <div className="text-sm text-gray-300 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-rose-400 font-bold">БЕЗ PRIMARY KEY:</span>
            <span>Signal table не работает (silent failure).</span>
          </div>
          <div className="text-xs text-gray-400">
            Debezium использует PK для парсинга binlog events.
            <br />
            Без PK: INSERT event не распознается как signal → snapshot не запускается → нет ошибки в логах.
            <br />
            <br />
            <span className="text-rose-400">Проверка:</span>{' '}
            <code className="bg-gray-800 px-1 rounded">SHOW CREATE TABLE debezium_signal\G</code>
            <br />
            <span className="text-emerald-400">Исправление:</span>{' '}
            <code className="bg-gray-800 px-1 rounded">ALTER TABLE debezium_signal ADD PRIMARY KEY (id);</code>
          </div>
        </div>
      </DiagramContainer>

      {/* Connector config */}
      <DiagramContainer title="Connector Configuration" color="neutral">
        <div className="font-mono text-xs bg-gray-800/50 p-3 rounded">
          <div className="text-gray-400">// Обязательные свойства для signal table</div>
          <div className="mt-2">
            <span className="text-emerald-400">"signal.data.collection"</span>
            <span className="text-gray-400">: </span>
            <span className="text-amber-400">"inventory.debezium_signal"</span>
          </div>
          <div className="mt-1">
            <span className="text-emerald-400">"incremental.snapshot.chunk.size"</span>
            <span className="text-gray-400">: </span>
            <span className="text-blue-400">"2048"</span>
          </div>
          <div className="mt-3 text-gray-400">
            // Schema ДОЛЖНА быть в database.include.list
          </div>
          <div>
            <span className="text-emerald-400">"database.include.list"</span>
            <span className="text-gray-400">: </span>
            <span className="text-amber-400">"inventory"</span>
          </div>
        </div>
      </DiagramContainer>
    </div>
  );
}
