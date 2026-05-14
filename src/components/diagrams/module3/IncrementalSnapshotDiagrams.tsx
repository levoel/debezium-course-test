/** @jsxImportSource solid-js */
/**
 * Incremental Snapshot Diagrams for Module 3
 *
 * Exports:
 * - IncrementalSnapshotFlowDiagram: Incremental snapshot overview with parallel processing
 * - ChunkProcessingDiagram: Chunk processing detail with watermarks and deduplication
 * - SignalTableDiagram: Signal table structure and mechanism
 */

import { FlowNode } from '@primitives/FlowNode';
import { Arrow } from '@primitives/Arrow';
import { DiagramContainer } from '@primitives/DiagramContainer';
import { DiagramTooltip } from '@primitives/Tooltip';

/**
 * IncrementalSnapshotFlowDiagram - Incremental snapshot overview
 */
export function IncrementalSnapshotFlowDiagram() {
  return (
    <div class="space-y-6">
      <DiagramContainer title="Incremental Snapshot: Non-Blocking Flow" color="emerald">
        <div class="flex flex-col items-center gap-4">
          {/* Step 1: Signal received */}
          <div class="flex flex-col md:flex-row items-center gap-4 w-full justify-center">
            <DiagramTooltip content="Step 1: INSERT в signal table с type='execute-snapshot' запускает incremental snapshot. Можно указать конкретные таблицы.">
              <FlowNode variant="database" tabIndex={0}>
                Signal Received
                <br />
                <span class="text-xs text-[var(--ink-muted)]">execute-snapshot</span>
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
          <div class="flex flex-col md:flex-row items-center gap-4 w-full justify-center">
            <DiagramTooltip content="Step 2: Определяем границы chunk по primary key. Например, id >= 1 AND id < 2049 для chunk size 2048.">
              <FlowNode variant="app" tabIndex={0}>
                Select Chunk Range
                <br />
                <span class="text-xs text-[var(--ink-muted)]">WHERE id &gt;= N AND id &lt; N+2048</span>
              </FlowNode>
            </DiagramTooltip>

            <Arrow direction="right" />

            <DiagramTooltip content="SELECT с границами chunk. Не блокирует таблицу — использует обычный SELECT с WHERE условием.">
              <FlowNode variant="database" tabIndex={0}>
                Read Chunk
                <br />
                <span class="text-xs text-[var(--ink-muted)]">2048 rows</span>
              </FlowNode>
            </DiagramTooltip>
          </div>

          {/* Step 3: Emit and binlog */}
          <div class="flex flex-col md:flex-row items-center gap-4 w-full justify-center">
            <DiagramTooltip content="Step 3: Chunk events отправляются в Kafka с op='r' и source.snapshot='incremental'. Параллельно обрабатываются binlog events.">
              <FlowNode variant="cluster" tabIndex={0} className="border-2 border-emerald-400">
                Emit Chunk Events
                <br />
                <span class="text-xs text-emerald-400">op='r'</span>
              </FlowNode>
            </DiagramTooltip>

            <div class="text-xs text-[var(--ink-muted)]">+</div>

            <DiagramTooltip content="ПАРАЛЛЕЛЬНО: Binlog streaming продолжается. События op='c/u/d' отправляются в те же топики. Нет блокировки!">
              <FlowNode variant="cluster" tabIndex={0} className="border-2 border-blue-400">
                Stream Binlog
                <br />
                <span class="text-xs text-blue-400">op='c/u/d'</span>
              </FlowNode>
            </DiagramTooltip>
          </div>

          {/* Step 4: Next chunk */}
          <div class="flex flex-col md:flex-row items-center gap-4 w-full justify-center">
            <DiagramTooltip content="Step 4: После завершения chunk, Debezium переходит к следующему. При crash — resume с последнего chunk.">
              <FlowNode variant="connector" tabIndex={0}>
                Next Chunk
                <br />
                <span class="text-xs text-[var(--ink-muted)]">id &gt;= 2049</span>
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
        <div class="text-sm text-[var(--ink-default)] space-y-2">
          <div class="flex items-center gap-2">
            <span class="text-emerald-400 font-bold">НЕ БЛОКИРУЕТ:</span>
            <span>Streaming и snapshot работают параллельно.</span>
          </div>
          <div class="text-xs text-[var(--ink-muted)]">
            Initial snapshot блокирует binlog streaming до завершения. Incremental snapshot — нет.
            <br />
            Consumer различает события по полю <code class="bg-[var(--bg-sunken)] px-1 rounded">source.snapshot</code>:
            <br />
            <code class="bg-[var(--bg-sunken)] px-1 rounded">"incremental"</code> для snapshot, <code class="bg-[var(--bg-sunken)] px-1 rounded">"false"</code> для streaming.
          </div>
        </div>
      </DiagramContainer>

      {/* Comparison */}
      <div class="flex flex-col md:flex-row gap-4">
        <DiagramContainer title="Initial Snapshot" color="rose" className="flex-1">
          <ul class="text-xs text-[var(--ink-default)] space-y-1">
            <li>- Блокирует binlog streaming</li>
            <li>- Все таблицы сразу</li>
            <li>- Не resumable при crash</li>
            <li>- Требует restart connector</li>
          </ul>
        </DiagramContainer>

        <DiagramContainer title="Incremental Snapshot" color="emerald" className="flex-1">
          <ul class="text-xs text-[var(--ink-default)] space-y-1">
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
    <div class="space-y-6">
      <DiagramContainer title="Chunk Processing с Watermarks" color="amber">
        <div class="flex flex-col items-center gap-6">
          {/* Watermark concept */}
          <div class="flex flex-col md:flex-row items-center gap-6 w-full justify-center">
            <div class="flex flex-col items-center gap-2">
              <DiagramTooltip content="LOW watermark: Начало chunk. Например, id=1 для первого chunk с chunk size 2048.">
                <FlowNode variant="app" tabIndex={0} size="sm" className="border-2 border-blue-400">
                  LOW Watermark
                  <br />
                  <span class="text-xs text-[var(--ink-muted)]">id=1</span>
                </FlowNode>
              </DiagramTooltip>
            </div>

            <div class="flex flex-col items-center gap-2">
              <Arrow direction="right" label="chunk range" />
              <div class="text-xs text-[var(--ink-muted)] text-center">
                SELECT * WHERE
                <br />
                id &gt;= 1 AND id &lt; 2049
              </div>
            </div>

            <div class="flex flex-col items-center gap-2">
              <DiagramTooltip content="HIGH watermark: Конец chunk (exclusive). id=2049 для первого chunk. Следующий chunk начнется с этого значения.">
                <FlowNode variant="app" tabIndex={0} size="sm" className="border-2 border-emerald-400">
                  HIGH Watermark
                  <br />
                  <span class="text-xs text-[var(--ink-muted)]">id=2049</span>
                </FlowNode>
              </DiagramTooltip>
            </div>
          </div>

          {/* Interleaving visualization */}
          <div class="w-full">
            <div class="text-xs text-[var(--ink-muted)] mb-2 text-center">Interleaving с Binlog Events</div>
            <div class="flex flex-col gap-2">
              {/* Chunk 1 */}
              <div class="flex items-center gap-2 justify-center flex-wrap">
                <div class="bg-emerald-500/20 px-2 py-1 rounded text-xs">Chunk 1: rows 1-2048</div>
                <div class="text-[var(--ink-subtle)]">|</div>
                <div class="bg-blue-500/20 px-2 py-1 rounded text-xs">Binlog events</div>
                <div class="text-[var(--ink-subtle)]">|</div>
                <div class="bg-emerald-500/20 px-2 py-1 rounded text-xs">Chunk 2: rows 2049-4096</div>
              </div>
            </div>
          </div>
        </div>
      </DiagramContainer>

      {/* Deduplication */}
      <DiagramContainer title="Collision Detection и Deduplication" color="neutral">
        <div class="flex flex-col gap-4">
          <div class="text-sm text-[var(--ink-default)]">
            <span class="text-amber-400 font-bold">Проблема:</span> Что если row изменился во время snapshot?
          </div>

          <div class="flex flex-col md:flex-row items-start gap-6">
            {/* Scenario */}
            <div class="flex-1">
              <DiagramContainer title="Сценарий Collision" color="rose" className="h-full">
                <div class="text-xs text-[var(--ink-default)] space-y-2">
                  <div class="flex items-start gap-2">
                    <span class="text-[var(--ink-muted)]">T1:</span>
                    <span>Snapshot читает row id=500 со значением A</span>
                  </div>
                  <div class="flex items-start gap-2">
                    <span class="text-[var(--ink-muted)]">T2:</span>
                    <span>UPDATE row id=500 SET value=B (binlog event)</span>
                  </div>
                  <div class="flex items-start gap-2">
                    <span class="text-rose-400">?</span>
                    <span>Какое значение правильное?</span>
                  </div>
                </div>
              </DiagramContainer>
            </div>

            {/* Resolution */}
            <div class="flex-1">
              <DiagramContainer title="Решение: Streaming Priority" color="emerald" className="h-full">
                <div class="text-xs text-[var(--ink-default)] space-y-2">
                  <div class="flex items-start gap-2">
                    <span class="text-emerald-400">1.</span>
                    <span>Debezium сравнивает timestamps</span>
                  </div>
                  <div class="flex items-start gap-2">
                    <span class="text-emerald-400">2.</span>
                    <span>Binlog event (streaming) имеет приоритет</span>
                  </div>
                  <div class="flex items-start gap-2">
                    <span class="text-emerald-400">3.</span>
                    <span>Snapshot event для этого row пропускается</span>
                  </div>
                </div>
              </DiagramContainer>
            </div>
          </div>

          <div class="text-xs text-[var(--ink-muted)]">
            <span class="font-bold">Результат:</span> Consumer всегда видит актуальное значение.
            Streaming events (более свежие) имеют приоритет над snapshot events.
          </div>
        </div>
      </DiagramContainer>

      {/* Chunk size recommendation */}
      <DiagramContainer title="Выбор Chunk Size" color="neutral">
        <div class="overflow-x-auto">
          <table class="text-xs text-[var(--ink-default)] w-full">
            <thead>
              <tr class="border-b border-[var(--line-thin)]">
                <th class="text-left py-2 pr-4">Chunk Size</th>
                <th class="text-left py-2 pr-4">Когда использовать</th>
                <th class="text-left py-2">Trade-offs</th>
              </tr>
            </thead>
            <tbody>
              <tr class="border-b border-[var(--line-thin)]">
                <td class="py-2 pr-4 font-mono">1024</td>
                <td class="py-2 pr-4">Широкие rows (100+ columns)</td>
                <td class="py-2 text-[var(--ink-muted)]">Медленнее, меньше memory</td>
              </tr>
              <tr class="border-b border-[var(--line-thin)]">
                <td class="py-2 pr-4 font-mono text-emerald-400">2048</td>
                <td class="py-2 pr-4 text-emerald-400">Default — большинство cases</td>
                <td class="py-2 text-[var(--ink-muted)]">Balanced performance</td>
              </tr>
              <tr class="border-b border-[var(--line-thin)]">
                <td class="py-2 pr-4 font-mono">4096</td>
                <td class="py-2 pr-4">Узкие rows (5-10 columns)</td>
                <td class="py-2 text-[var(--ink-muted)]">Быстрее, больше memory</td>
              </tr>
              <tr>
                <td class="py-2 pr-4 font-mono">8192</td>
                <td class="py-2 pr-4">Large tables, high-perf</td>
                <td class="py-2 text-[var(--ink-muted)]">Может вызвать memory pressure</td>
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
    <div class="space-y-6">
      {/* Table structure */}
      <DiagramContainer title="Signal Table Schema" color="purple">
        <div class="flex flex-col items-center gap-4">
          <DiagramTooltip content="Signal table — специальная таблица для управления Debezium. Debezium мониторит INSERT events через binlog.">
            <FlowNode variant="database" tabindex={0}>
              debezium_signal
            </FlowNode>
          </DiagramTooltip>

          <div class="font-mono text-xs bg-[var(--bg-sunken)] p-4 rounded w-full max-w-lg">
            <div class="text-purple-400 mb-2">CREATE TABLE debezium_signal (</div>
            <div class="pl-4 space-y-1">
              <div>
                <span class="text-emerald-400">id</span>
                <span class="text-[var(--ink-muted)]"> VARCHAR(36) NOT NULL,</span>
                <span class="text-[var(--ink-subtle)] ml-2">-- UUID</span>
              </div>
              <div>
                <span class="text-amber-400">type</span>
                <span class="text-[var(--ink-muted)]"> VARCHAR(32) NOT NULL,</span>
                <span class="text-[var(--ink-subtle)] ml-2">-- execute-snapshot</span>
              </div>
              <div>
                <span class="text-blue-400">data</span>
                <span class="text-[var(--ink-muted)]"> TEXT,</span>
                <span class="text-[var(--ink-subtle)] ml-2">-- JSON payload</span>
              </div>
              <div>
                <span class="text-rose-400">PRIMARY KEY (id)</span>
                <span class="text-[var(--ink-subtle)] ml-2">-- CRITICAL!</span>
              </div>
            </div>
            <div class="text-purple-400">);</div>
          </div>
        </div>
      </DiagramContainer>

      {/* Signal flow */}
      <DiagramContainer title="Signal Mechanism" color="amber">
        <div class="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8">
          <div class="flex flex-col items-center gap-2">
            <DiagramTooltip content="Step 1: Operations engineer выполняет INSERT в signal table с командой execute-snapshot.">
              <FlowNode variant="app" tabindex={0} size="sm">
                INSERT signal
              </FlowNode>
            </DiagramTooltip>
            <div class="text-xs text-[var(--ink-muted)]">Engineer</div>
          </div>

          <Arrow direction="right" label="binlog" />

          <div class="flex flex-col items-center gap-2">
            <DiagramTooltip content="Step 2: INSERT создает binlog event. Debezium читает этот event как часть обычного streaming.">
              <FlowNode variant="database" tabIndex={0} size="sm">
                Binlog Event
              </FlowNode>
            </DiagramTooltip>
            <div class="text-xs text-[var(--ink-muted)]">MySQL</div>
          </div>

          <Arrow direction="right" label="parse" />

          <div class="flex flex-col items-center gap-2">
            <DiagramTooltip content="Step 3: Debezium распознает signal table и парсит команду. Запускает incremental snapshot для указанных таблиц.">
              <FlowNode variant="connector" tabIndex={0} size="sm" className="border-2 border-emerald-400">
                Execute Snapshot
              </FlowNode>
            </DiagramTooltip>
            <div class="text-xs text-[var(--ink-muted)]">Debezium</div>
          </div>
        </div>
      </DiagramContainer>

      {/* Signal examples */}
      <div class="flex flex-col md:flex-row gap-4">
        <DiagramContainer title="Execute Snapshot" color="emerald" className="flex-1">
          <div class="font-mono text-xs bg-[var(--bg-sunken)] p-3 rounded">
            <div class="text-[var(--ink-muted)]">INSERT INTO debezium_signal</div>
            <div class="text-[var(--ink-muted)]">(id, type, data) VALUES (</div>
            <div class="pl-2">
              <span class="text-emerald-400">UUID()</span>,
            </div>
            <div class="pl-2">
              <span class="text-amber-400">'execute-snapshot'</span>,
            </div>
            <div class="pl-2 text-blue-400">
              '&#123;"data-collections":<br />
              &nbsp;&nbsp;["inventory.orders"]&#125;'
            </div>
            <div class="text-[var(--ink-muted)]">);</div>
          </div>
        </DiagramContainer>

        <DiagramContainer title="Stop Snapshot" color="rose" className="flex-1">
          <div class="font-mono text-xs bg-[var(--bg-sunken)] p-3 rounded">
            <div class="text-[var(--ink-muted)]">INSERT INTO debezium_signal</div>
            <div class="text-[var(--ink-muted)]">(id, type, data) VALUES (</div>
            <div class="pl-2">
              <span class="text-emerald-400">UUID()</span>,
            </div>
            <div class="pl-2">
              <span class="text-rose-400">'stop-snapshot'</span>,
            </div>
            <div class="pl-2 text-blue-400">
              '&#123;"data-collections":<br />
              &nbsp;&nbsp;["inventory.orders"],<br />
              &nbsp;&nbsp;"type":"INCREMENTAL"&#125;'
            </div>
            <div class="text-[var(--ink-muted)]">);</div>
          </div>
        </DiagramContainer>
      </div>

      {/* Critical warning */}
      <DiagramContainer title="CRITICAL: PRIMARY KEY обязателен" color="rose">
        <div class="text-sm text-[var(--ink-default)] space-y-2">
          <div class="flex items-center gap-2">
            <span class="text-rose-400 font-bold">БЕЗ PRIMARY KEY:</span>
            <span>Signal table не работает (silent failure).</span>
          </div>
          <div class="text-xs text-[var(--ink-muted)]">
            Debezium использует PK для парсинга binlog events.
            <br />
            Без PK: INSERT event не распознается как signal → snapshot не запускается → нет ошибки в логах.
            <br />
            <br />
            <span class="text-rose-400">Проверка:</span>{' '}
            <code class="bg-[var(--bg-sunken)] px-1 rounded">SHOW CREATE TABLE debezium_signal\G</code>
            <br />
            <span class="text-emerald-400">Исправление:</span>{' '}
            <code class="bg-[var(--bg-sunken)] px-1 rounded">ALTER TABLE debezium_signal ADD PRIMARY KEY (id);</code>
          </div>
        </div>
      </DiagramContainer>

      {/* Connector config */}
      <DiagramContainer title="Connector Configuration" color="neutral">
        <div class="font-mono text-xs bg-[var(--bg-sunken)] p-3 rounded">
          <div class="text-[var(--ink-muted)]">// Обязательные свойства для signal table</div>
          <div class="mt-2">
            <span class="text-emerald-400">"signal.data.collection"</span>
            <span class="text-[var(--ink-muted)]">: </span>
            <span class="text-amber-400">"inventory.debezium_signal"</span>
          </div>
          <div class="mt-1">
            <span class="text-emerald-400">"incremental.snapshot.chunk.size"</span>
            <span class="text-[var(--ink-muted)]">: </span>
            <span class="text-blue-400">"2048"</span>
          </div>
          <div class="mt-3 text-[var(--ink-muted)]">
            // Schema ДОЛЖНА быть в database.include.list
          </div>
          <div>
            <span class="text-emerald-400">"database.include.list"</span>
            <span class="text-[var(--ink-muted)]">: </span>
            <span class="text-amber-400">"inventory"</span>
          </div>
        </div>
      </DiagramContainer>
    </div>
  );
}
