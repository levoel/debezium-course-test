/**
 * Recovery Procedure Diagrams for Module 3
 *
 * Exports:
 * - RecoveryDecisionTreeDiagram: Decision tree for recovery scenario diagnosis
 * - RecoveryFlowDiagram: Step-by-step recovery procedure flow
 */

import { FlowNode } from '../primitives/FlowNode';
import { Arrow } from '../primitives/Arrow';
import { DiagramContainer } from '../primitives/DiagramContainer';
import { DiagramTooltip } from '../primitives/Tooltip';

/**
 * RecoveryDecisionTreeDiagram - Decision tree for recovery scenario diagnosis
 */
export function RecoveryDecisionTreeDiagram() {
  return (
    <div className="space-y-6">
      <DiagramContainer title="Recovery Decision Tree" color="amber">
        <div className="flex flex-col items-center gap-4">
          {/* Root: Connector failed */}
          <DiagramTooltip content="Connector перешёл в состояние FAILED. Необходимо диагностировать причину по error message в логах.">
            <FlowNode variant="sink" tabIndex={0} className="border-2 border-rose-400">
              Connector Failed
              <br />
              <span className="text-xs text-gray-400">Status: FAILED</span>
            </FlowNode>
          </DiagramTooltip>

          <Arrow direction="down" label="read error" />

          {/* Error analysis */}
          <DiagramTooltip content="Читаем error message в connector logs. Ключевые паттерны определяют сценарий восстановления.">
            <FlowNode variant="app" tabIndex={0}>
              Analyze Error Message
            </FlowNode>
          </DiagramTooltip>

          <div className="flex flex-col md:flex-row items-start gap-6 md:gap-8 w-full justify-center">
            {/* Scenario 1: Binlog Position Loss */}
            <div className="flex flex-col items-center gap-3 flex-1">
              <div className="text-xs text-amber-400 font-medium text-center">
                "binlog file", "purged",
                <br />
                "file not available"
              </div>
              <Arrow direction="down" />

              <DiagramTooltip content="SCENARIO 1: Binlog position потерян. Connector требует binlog файл, который уже удалён из-за retention.">
                <FlowNode variant="connector" tabIndex={0} className="border-2 border-amber-400">
                  Binlog Position Loss
                </FlowNode>
              </DiagramTooltip>

              <Arrow direction="down" />

              <div className="flex flex-col items-center gap-2 text-xs">
                <DiagramTooltip content="SHOW BINARY LOGS покажет доступные файлы. Сравните с offset topic для определения gap.">
                  <div className="bg-gray-800/50 px-3 py-2 rounded text-gray-300">
                    1. SHOW BINARY LOGS
                    <br />
                    2. Check offset topic
                    <br />
                    3. Compare positions
                  </div>
                </DiagramTooltip>
              </div>

              <Arrow direction="down" />

              <DiagramTooltip content="snapshot.mode=when_needed автоматически триггерит snapshot когда binlog unavailable. Минимальное ручное вмешательство.">
                <FlowNode variant="cluster" tabIndex={0} size="sm" className="border-2 border-emerald-400">
                  snapshot.mode=
                  <br />
                  when_needed
                </FlowNode>
              </DiagramTooltip>
            </div>

            {/* Scenario 2: Schema History Corruption */}
            <div className="flex flex-col items-center gap-3 flex-1">
              <div className="text-xs text-rose-400 font-medium text-center">
                "db history topic",
                <br />
                "partially missing"
              </div>
              <Arrow direction="down" />

              <DiagramTooltip content="SCENARIO 2: Schema history topic corrupted или missing. DDL история недоступна для connector.">
                <FlowNode variant="sink" tabIndex={0} className="border-2 border-rose-400">
                  Schema History
                  <br />
                  Corruption
                </FlowNode>
              </DiagramTooltip>

              <Arrow direction="down" />

              <DiagramTooltip content="Проверьте были ли DDL изменения с last offset. Это критично для выбора recovery strategy.">
                <FlowNode variant="app" tabIndex={0} size="sm">
                  DDL changes
                  <br />
                  since last offset?
                </FlowNode>
              </DiagramTooltip>

              <div className="flex flex-col md:flex-row items-start gap-4 mt-2">
                <div className="flex flex-col items-center gap-2">
                  <span className="text-xs text-emerald-400">Нет DDL</span>
                  <Arrow direction="down" />
                  <DiagramTooltip content="Если DDL не было, snapshot.mode=recovery безопасно. Читает current schema из DB.">
                    <FlowNode variant="cluster" tabIndex={0} size="sm" className="border-2 border-emerald-400">
                      recovery mode
                    </FlowNode>
                  </DiagramTooltip>
                </div>

                <div className="flex flex-col items-center gap-2">
                  <span className="text-xs text-rose-400">Были DDL</span>
                  <Arrow direction="down" />
                  <DiagramTooltip content="Если DDL были, нужен fresh connector с новым именем. Recovery mode небезопасен.">
                    <FlowNode variant="app" tabIndex={0} size="sm" className="border-2 border-amber-400">
                      fresh connector
                    </FlowNode>
                  </DiagramTooltip>
                </div>

                <div className="flex flex-col items-center gap-2">
                  <span className="text-xs text-blue-400">Есть backup</span>
                  <Arrow direction="down" />
                  <DiagramTooltip content="Восстановление из backup — самый быстрый путь (минуты вместо часов).">
                    <FlowNode variant="database" tabIndex={0} size="sm" className="border-2 border-blue-400">
                      restore backup
                    </FlowNode>
                  </DiagramTooltip>
                </div>
              </div>
            </div>

            {/* Scenario 3: Schema Mismatch */}
            <div className="flex flex-col items-center gap-3 flex-1">
              <div className="text-xs text-amber-400 font-medium text-center">
                "not found in schema",
                <br />
                "column mismatch"
              </div>
              <Arrow direction="down" />

              <DiagramTooltip content="SCENARIO 3: Schema mismatch. Обычно следствие Scenario 2 — схема в history не совпадает с текущей DB.">
                <FlowNode variant="connector" tabIndex={0} className="border-2 border-amber-400">
                  Schema Mismatch
                </FlowNode>
              </DiagramTooltip>

              <Arrow direction="down" />

              <div className="text-xs text-gray-400 text-center">
                Обычно следствие
                <br />
                Schema History issue
              </div>

              <Arrow direction="down" />

              <DiagramTooltip content="Решение зависит от причины — диагностируйте через schema history topic analysis.">
                <FlowNode variant="app" tabIndex={0} size="sm">
                  See Scenario 2
                </FlowNode>
              </DiagramTooltip>
            </div>
          </div>
        </div>
      </DiagramContainer>

      {/* Error patterns reference */}
      <DiagramContainer title="Error Message Patterns" color="neutral">
        <div className="overflow-x-auto">
          <table className="text-xs text-gray-300 w-full">
            <thead>
              <tr className="border-b border-gray-600">
                <th className="text-left py-2 pr-4">Error Pattern</th>
                <th className="text-left py-2 pr-4">Scenario</th>
                <th className="text-left py-2">Recovery Path</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-700">
                <td className="py-2 pr-4 font-mono text-amber-400">binlog file not available</td>
                <td className="py-2 pr-4">Binlog Position Loss</td>
                <td className="py-2 text-emerald-400">when_needed / initial</td>
              </tr>
              <tr className="border-b border-gray-700">
                <td className="py-2 pr-4 font-mono text-rose-400">history topic missing</td>
                <td className="py-2 pr-4">Schema History Corruption</td>
                <td className="py-2 text-amber-400">recovery / backup / fresh</td>
              </tr>
              <tr>
                <td className="py-2 pr-4 font-mono text-amber-400">table not found in schema</td>
                <td className="py-2 pr-4">Schema Mismatch</td>
                <td className="py-2 text-gray-400">See Schema History</td>
              </tr>
            </tbody>
          </table>
        </div>
      </DiagramContainer>
    </div>
  );
}

/**
 * RecoveryFlowDiagram - Step-by-step recovery procedure flow
 */
export function RecoveryFlowDiagram() {
  return (
    <div className="space-y-6">
      <DiagramContainer title="Recovery Procedure Flow" color="amber">
        <div className="flex flex-col items-center gap-4">
          {/* Step 1: Detect */}
          <div className="flex flex-col md:flex-row items-center gap-4 w-full justify-center">
            <DiagramTooltip content="Step 1: Обнаружение проблемы. Мониторинг или ручная проверка обнаруживают FAILED connector.">
              <FlowNode variant="sink" tabIndex={0} className="border-2 border-rose-400">
                1. Detect Issue
                <br />
                <span className="text-xs text-gray-400">Connector: FAILED</span>
              </FlowNode>
            </DiagramTooltip>

            <Arrow direction="right" />

            <DiagramTooltip content="Step 2: Немедленно останавливаем connector. Критично: не пытайтесь исправить работающий connector.">
              <FlowNode variant="app" tabIndex={0} className="border-2 border-amber-400 animate-pulse">
                2. Stop Connector
                <br />
                <span className="text-xs text-amber-400">CRITICAL</span>
              </FlowNode>
            </DiagramTooltip>
          </div>

          <Arrow direction="down" />

          {/* Step 3: Diagnose */}
          <div className="flex flex-col md:flex-row items-center gap-4 w-full justify-center">
            <DiagramTooltip content="Step 3: Диагностика причины. Анализ логов, проверка binlog, schema history topic.">
              <FlowNode variant="connector" tabIndex={0}>
                3. Diagnose Cause
                <br />
                <span className="text-xs text-gray-400">Check logs, binlog, schema history</span>
              </FlowNode>
            </DiagramTooltip>

            <Arrow direction="right" />

            <DiagramTooltip content="Step 4: Применение fix в зависимости от сценария: when_needed, recovery, backup restore, fresh connector.">
              <FlowNode variant="cluster" tabIndex={0}>
                4. Apply Fix
                <br />
                <span className="text-xs text-gray-400">Based on diagnosis</span>
              </FlowNode>
            </DiagramTooltip>
          </div>

          <Arrow direction="down" />

          {/* Step 5: Verify */}
          <div className="flex flex-col md:flex-row items-center gap-4 w-full justify-center">
            <DiagramTooltip content="Step 5: Верификация перед resume. Проверяем connector logs, test events, consumer health.">
              <FlowNode variant="app" tabIndex={0} className="border-2 border-blue-400">
                5. Verify Fix
                <br />
                <span className="text-xs text-gray-400">Test before resume</span>
              </FlowNode>
            </DiagramTooltip>

            <Arrow direction="right" />

            <DiagramTooltip content="Step 6: Resume connector. Мониторим 1+ час для подтверждения стабильной работы.">
              <FlowNode variant="cluster" tabIndex={0} className="border-2 border-emerald-400">
                6. Resume CDC
                <br />
                <span className="text-xs text-emerald-400">Monitor 1+ hour</span>
              </FlowNode>
            </DiagramTooltip>
          </div>
        </div>
      </DiagramContainer>

      {/* Critical warning */}
      <DiagramContainer title="Critical: Stop Before Fix" color="rose">
        <div className="text-sm text-gray-300 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-rose-400 font-bold">ПРАВИЛО:</span>
            <span>Всегда останавливайте connector перед исправлением.</span>
          </div>
          <div className="text-xs text-gray-400">
            Попытка исправить running connector может привести к:
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>Data duplication (partial snapshot + streaming)</li>
              <li>Offset corruption (race condition)</li>
              <li>Schema history conflict (concurrent writes)</li>
            </ul>
          </div>
        </div>
      </DiagramContainer>

      {/* Recovery time estimates */}
      <DiagramContainer title="Recovery Time Estimates" color="neutral">
        <div className="overflow-x-auto">
          <table className="text-xs text-gray-300 w-full">
            <thead>
              <tr className="border-b border-gray-600">
                <th className="text-left py-2 pr-4">Recovery Method</th>
                <th className="text-left py-2 pr-4">Time Estimate</th>
                <th className="text-left py-2">When to Use</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-700">
                <td className="py-2 pr-4 text-emerald-400">Restore from backup</td>
                <td className="py-2 pr-4">1-5 minutes</td>
                <td className="py-2 text-gray-400">Backup exists, schema history corruption</td>
              </tr>
              <tr className="border-b border-gray-700">
                <td className="py-2 pr-4 text-blue-400">snapshot.mode=recovery</td>
                <td className="py-2 pr-4">Seconds-minutes</td>
                <td className="py-2 text-gray-400">No DDL since last offset</td>
              </tr>
              <tr className="border-b border-gray-700">
                <td className="py-2 pr-4 text-amber-400">snapshot.mode=when_needed</td>
                <td className="py-2 pr-4">Hours (data-dependent)</td>
                <td className="py-2 text-gray-400">Binlog position loss</td>
              </tr>
              <tr>
                <td className="py-2 pr-4 text-rose-400">Fresh connector + initial</td>
                <td className="py-2 pr-4">Hours (data-dependent)</td>
                <td className="py-2 text-gray-400">DDL happened, no other option</td>
              </tr>
            </tbody>
          </table>
        </div>
      </DiagramContainer>
    </div>
  );
}
