/**
 * Schema Evolution Diagrams
 *
 * Exports:
 * - SchemaCompatibilityDiagram: Compatibility types matrix (BACKWARD/FORWARD/FULL/NONE)
 * - EvolutionDecisionTreeDiagram: Decision tree for schema change safety
 */

import { FlowNode } from '../primitives/FlowNode';
import { Arrow } from '../primitives/Arrow';
import { DiagramContainer } from '../primitives/DiagramContainer';
import { DiagramTooltip } from '../primitives/Tooltip';

/**
 * SchemaCompatibilityDiagram - Shows compatibility types with color coding
 */
export function SchemaCompatibilityDiagram() {
  return (
    <DiagramContainer
      title="Schema Compatibility Types"
      color="purple"
      description="Какой compatibility mode выбрать для вашего pipeline"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* BACKWARD - recommended for most cases */}
        <DiagramTooltip
          content={
            <div>
              <strong>BACKWARD (default)</strong>
              <p className="mt-1">
                Old consumer code может читать new data. Самый популярный режим.
              </p>
              <p className="mt-2">
                <strong>Безопасные изменения:</strong>
                <br />✅ Add optional field (с default value)
                <br />✅ Remove field
              </p>
              <p className="mt-2">
                <strong>Upgrade order:</strong>
                <br />1. Update consumers (они научатся читать new fields)
                <br />2. Update producers (начнут отправлять new schema)
              </p>
              <p className="mt-2 text-emerald-300">
                Используйте BACKWARD для CDC, где consumers должны работать
                со старыми данными
              </p>
            </div>
          }
        >
          <div
            className="p-4 rounded-lg bg-emerald-500/20 border-2 border-emerald-400/30 cursor-pointer hover:border-emerald-400"
            tabIndex={0}
          >
            <div className="text-lg font-bold text-emerald-200">BACKWARD</div>
            <div className="text-sm text-gray-300 mt-2">
              Old consumer + New data
            </div>
            <div className="text-xs text-emerald-400 mt-2">✅ Compatible</div>
            <div className="text-xs text-gray-400 mt-1">
              Add optional field, Remove field
            </div>
          </div>
        </DiagramTooltip>

        {/* FORWARD */}
        <DiagramTooltip
          content={
            <div>
              <strong>FORWARD</strong>
              <p className="mt-1">
                New consumer code может читать old data. Полезно для pre-deployment
                testing.
              </p>
              <p className="mt-2">
                <strong>Безопасные изменения:</strong>
                <br />✅ Add field (любое)
                <br />✅ Remove optional field (с default value)
              </p>
              <p className="mt-2">
                <strong>Upgrade order:</strong>
                <br />1. Update producers (начнут отправлять new schema)
                <br />2. Update consumers (научатся читать new fields)
              </p>
              <p className="mt-2 text-blue-300">
                Используйте FORWARD, если хотите сначала обновить producers
              </p>
            </div>
          }
        >
          <div
            className="p-4 rounded-lg bg-blue-500/20 border-2 border-blue-400/30 cursor-pointer hover:border-blue-400"
            tabIndex={0}
          >
            <div className="text-lg font-bold text-blue-200">FORWARD</div>
            <div className="text-sm text-gray-300 mt-2">
              New consumer + Old data
            </div>
            <div className="text-xs text-blue-400 mt-2">✅ Compatible</div>
            <div className="text-xs text-gray-400 mt-1">
              Add field, Remove optional field
            </div>
          </div>
        </DiagramTooltip>

        {/* FULL - recommended for critical systems */}
        <DiagramTooltip
          content={
            <div>
              <strong>FULL (самый строгий)</strong>
              <p className="mt-1">
                Гарантирует BACKWARD + FORWARD одновременно. Любой порядок обновления
                producers/consumers безопасен.
              </p>
              <p className="mt-2">
                <strong>Безопасные изменения:</strong>
                <br />✅ Add optional field (с default value)
                <br />✅ Remove optional field (с default value)
              </p>
              <p className="mt-2">
                <strong>Upgrade order:</strong>
                <br />Любой порядок — обновляйте producers и consumers независимо
              </p>
              <p className="mt-2 text-purple-300">
                Используйте FULL для production-critical систем, где нужна
                максимальная гибкость deployment
              </p>
            </div>
          }
        >
          <div
            className="p-4 rounded-lg bg-purple-500/20 border-2 border-purple-400/30 cursor-pointer hover:border-purple-400"
            tabIndex={0}
          >
            <div className="text-lg font-bold text-purple-200">FULL</div>
            <div className="text-sm text-gray-300 mt-2">
              Both directions compatible
            </div>
            <div className="text-xs text-purple-400 mt-2">✅ Max safety</div>
            <div className="text-xs text-gray-400 mt-1">
              Only optional field changes
            </div>
          </div>
        </DiagramTooltip>

        {/* NONE - not recommended */}
        <DiagramTooltip
          content={
            <div>
              <strong>NONE (опасный режим)</strong>
              <p className="mt-1">
                Никаких compatibility проверок. Можно зарегистрировать любую схему,
                даже несовместимую.
              </p>
              <p className="mt-2">
                <strong>Риски:</strong>
                <br />❌ Breaking changes не блокируются
                <br />❌ Consumers могут сломаться внезапно
                <br />❌ Нет защиты от некорректных схем
              </p>
              <p className="mt-2 text-rose-300">
                НЕ используйте NONE в production. Только для dev/testing.
              </p>
            </div>
          }
        >
          <div
            className="p-4 rounded-lg bg-rose-500/20 border-2 border-rose-400/30 cursor-pointer hover:border-rose-400"
            tabIndex={0}
          >
            <div className="text-lg font-bold text-rose-200">NONE</div>
            <div className="text-sm text-gray-300 mt-2">No compatibility check</div>
            <div className="text-xs text-rose-400 mt-2">⚠️ No validation</div>
            <div className="text-xs text-gray-400 mt-1">
              Any change allowed (dangerous)
            </div>
          </div>
        </DiagramTooltip>
      </div>

      <div className="mt-4 text-sm text-purple-400 border-l-2 border-purple-400 pl-3">
        <strong>Рекомендация для CDC систем:</strong>
        <p className="mt-1 text-gray-300">
          Используйте FULL для production pipelines. Это позволяет обновлять Debezium
          connector и consumers независимо без coordinated deployment. BACKWARD подходит
          для менее критичных систем.
        </p>
      </div>
    </DiagramContainer>
  );
}

/**
 * EvolutionDecisionTreeDiagram - Decision tree for schema change safety
 */
export function EvolutionDecisionTreeDiagram() {
  return (
    <DiagramContainer
      title="Schema Evolution: Decision Framework"
      color="blue"
      description="Какие изменения схемы безопасны и почему"
    >
      <div className="flex flex-col items-center gap-4">
        <FlowNode variant="app">Планируется изменение схемы</FlowNode>

        <Arrow direction="down" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Path 1: Adding field */}
          <div className="flex flex-col items-center gap-3">
            <DiagramTooltip
              content={
                <div>
                  <strong>Adding Field</strong>
                  <p className="mt-1">
                    ALTER TABLE customers ADD COLUMN phone VARCHAR(20);
                  </p>
                  <p className="mt-2">
                    Debezium начнет отправлять events с новым полем.
                    Безопасно ли это?
                  </p>
                </div>
              }
            >
              <FlowNode
                variant="connector"
                size="sm"
                className="bg-blue-500/20 border-blue-400/30 text-blue-200"
                tabIndex={0}
              >
                Добавление поля?
              </FlowNode>
            </DiagramTooltip>

            <Arrow direction="down" label="Да" />

            <DiagramTooltip
              content={
                <div>
                  <strong>Optional field с default value</strong>
                  <p className="mt-1">
                    Schema Registry разрешит изменение, если поле optional или
                    имеет default value.
                  </p>
                  <p className="mt-2 text-emerald-300">
                    Old consumers игнорируют новое поле. New consumers читают его.
                  </p>
                  <p className="mt-2 text-sm font-mono">
                    &#x7B;"name": "phone", "type": ["null", "string"], "default": null&#x7D;
                  </p>
                </div>
              }
            >
              <FlowNode
                variant="app"
                size="sm"
                className="bg-emerald-500/20 border-emerald-400/30 text-emerald-200"
                tabIndex={0}
              >
                ✅ BACKWARD compatible
                <span className="block text-xs text-gray-400 mt-1">
                  Add optional field
                </span>
              </FlowNode>
            </DiagramTooltip>

            <div className="text-xs text-gray-400 text-center mt-2">
              Old consumer + New data → Works
            </div>
          </div>

          {/* Path 2: Removing field */}
          <div className="flex flex-col items-center gap-3">
            <DiagramTooltip
              content={
                <div>
                  <strong>Removing Field</strong>
                  <p className="mt-1">
                    ALTER TABLE customers DROP COLUMN middle_name;
                  </p>
                  <p className="mt-2">
                    Debezium перестанет отправлять поле middle_name.
                    Consumers ожидают его?
                  </p>
                </div>
              }
            >
              <FlowNode
                variant="connector"
                size="sm"
                className="bg-blue-500/20 border-blue-400/30 text-blue-200"
                tabIndex={0}
              >
                Удаление поля?
              </FlowNode>
            </DiagramTooltip>

            <Arrow direction="down" label="Да" />

            <DiagramTooltip
              content={
                <div>
                  <strong>FORWARD compatible (если поле было optional)</strong>
                  <p className="mt-1">
                    New consumers не ожидают удаленное поле. Old consumers получат
                    null или default value.
                  </p>
                  <p className="mt-2 text-blue-300">
                    Обновите producers первыми, затем consumers.
                  </p>
                  <p className="mt-2 text-amber-300">
                    Если поле было required — это breaking change!
                  </p>
                </div>
              }
            >
              <FlowNode
                variant="app"
                size="sm"
                className="bg-blue-500/20 border-blue-400/30 text-blue-200"
                tabIndex={0}
              >
                ✅ FORWARD compatible
                <span className="block text-xs text-gray-400 mt-1">
                  Remove optional field
                </span>
              </FlowNode>
            </DiagramTooltip>

            <div className="text-xs text-gray-400 text-center mt-2">
              New consumer + Old data → Works
            </div>
          </div>

          {/* Path 3: Changing field type */}
          <div className="flex flex-col items-center gap-3">
            <DiagramTooltip
              content={
                <div>
                  <strong>Changing Field Type</strong>
                  <p className="mt-1">
                    ALTER TABLE customers ALTER COLUMN age TYPE BIGINT;
                  </p>
                  <p className="mt-2">
                    Debezium начнет отправлять age как BIGINT вместо INT.
                    Это breaking change.
                  </p>
                </div>
              }
            >
              <FlowNode
                variant="connector"
                size="sm"
                className="bg-blue-500/20 border-blue-400/30 text-blue-200"
                tabIndex={0}
              >
                Изменение типа?
              </FlowNode>
            </DiagramTooltip>

            <Arrow direction="down" label="Да" />

            <DiagramTooltip
              content={
                <div>
                  <strong>Breaking Change - НЕ совместимо</strong>
                  <p className="mt-1">
                    Schema Registry ЗАБЛОКИРУЕТ регистрацию несовместимой схемы.
                    Нельзя изменить тип поля без migration strategy.
                  </p>
                  <p className="mt-2 text-rose-300">
                    Решение: создайте новое поле (age_v2), deprecated старое.
                    После миграции всех consumers удалите старое поле.
                  </p>
                  <p className="mt-2 text-sm">
                    <strong>Migration steps:</strong>
                    <br />1. ADD age_v2 BIGINT (optional)
                    <br />2. Populate age_v2 в application
                    <br />3. Update consumers to use age_v2
                    <br />4. DROP age (old field)
                  </p>
                </div>
              }
            >
              <FlowNode
                variant="app"
                size="sm"
                className="bg-rose-500/20 border-rose-400/30 text-rose-200"
                tabIndex={0}
              >
                ❌ BREAKING change
                <span className="block text-xs text-gray-400 mt-1">
                  Needs migration
                </span>
              </FlowNode>
            </DiagramTooltip>

            <div className="text-xs text-rose-400 text-center mt-2">
              Type change = incompatible
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
          {/* Safe changes summary */}
          <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-400/30">
            <div className="text-sm font-bold text-emerald-300">
              ✅ Безопасные изменения
            </div>
            <ul className="mt-2 text-xs text-gray-300 space-y-1">
              <li>• Add optional field (с default value)</li>
              <li>• Remove optional field</li>
              <li>• Add enum value (append only)</li>
              <li>• Promote type (int → long, float → double)</li>
            </ul>
          </div>

          {/* Unsafe changes summary */}
          <div className="p-4 rounded-lg bg-rose-500/10 border border-rose-400/30">
            <div className="text-sm font-bold text-rose-300">
              ❌ Breaking changes
            </div>
            <ul className="mt-2 text-xs text-gray-300 space-y-1">
              <li>• Add required field (no default)</li>
              <li>• Remove required field</li>
              <li>• Change field type (incompatible)</li>
              <li>• Rename field (treated as remove + add)</li>
              <li>• Remove enum value</li>
            </ul>
          </div>
        </div>

        <div className="mt-4 text-sm text-blue-400 border-l-2 border-blue-400 pl-3">
          <strong>Golden Rule:</strong>
          <p className="mt-1 text-gray-300">
            Если изменение схемы может сломать десериализацию у существующих
            consumers — это breaking change. Всегда используйте Schema Registry
            compatibility mode для автоматической валидации перед deployment.
          </p>
        </div>
      </div>
    </DiagramContainer>
  );
}
