/**
 * PII Masking Diagrams
 *
 * Exports:
 * - MaskFieldTransformDiagram: MaskField SMT transformation showing email masking
 * - UnwrapComparisonDiagram: Before/After ExtractNewRecordState comparison
 */

import { FlowNode } from '../primitives/FlowNode';
import { Arrow } from '../primitives/Arrow';
import { DiagramContainer } from '../primitives/DiagramContainer';
import { DiagramTooltip } from '../primitives/Tooltip';

/**
 * MaskFieldTransformDiagram - MaskField SMT transformation
 */
export function MaskFieldTransformDiagram() {
  return (
    <DiagramContainer
      title="MaskField Transformation"
      color="amber"
      description="Маскировка PII полей для GDPR compliance"
    >
      <div className="flex items-center justify-center gap-4 flex-wrap">
        {/* Input Record */}
        <DiagramTooltip
          content={
            <div>
              <strong>Input Record</strong>
              <p className="mt-1">
                Flat JSON record после ExtractNewRecordState unwrap.
                Содержит чувствительные поля: email, phone, ssn.
              </p>
              <p className="mt-2 text-xs text-rose-300">
                Требует маскировки перед публикацией в Kafka.
              </p>
            </div>
          }
        >
          <FlowNode
            variant="app"
            className="bg-rose-500/20 border-rose-400/30 text-rose-200"
            tabIndex={0}
          >
            <div className="text-sm font-semibold">Input Record</div>
            <div className="text-xs text-gray-400 mt-2 font-mono text-left">
              <div>id: 1</div>
              <div>name: "Alice"</div>
              <div className="text-rose-300">email: "alice@example.com"</div>
              <div className="text-rose-300">phone: "+1-555-0100"</div>
              <div className="text-rose-300">ssn: "123-45-6789"</div>
            </div>
            <div className="text-xs text-rose-300 mt-2">
              ⚠ PII fields exposed
            </div>
          </FlowNode>
        </DiagramTooltip>

        <Arrow direction="right" label="MaskField SMT" />

        {/* MaskField SMT */}
        <DiagramTooltip
          content={
            <div>
              <strong>MaskField SMT</strong>
              <p className="mt-1">
                Kafka Connect SMT (не Debezium). Заменяет указанные поля на null или ***MASKED***.
              </p>
              <div className="mt-2 text-xs">
                <strong>Конфигурация:</strong>
                <pre className="mt-1 text-xs bg-gray-800 p-2 rounded">
{`"transforms.mask.type":
  "org.apache.kafka.connect
   .transforms.MaskField$Value"
"transforms.mask.fields":
  "email,phone,ssn"`}
                </pre>
              </div>
              <p className="mt-2 text-xs text-amber-300">
                Работает с flat data после unwrap.
              </p>
            </div>
          }
        >
          <FlowNode
            variant="connector"
            className="bg-amber-500/20 border-amber-400/30 text-amber-200"
            tabIndex={0}
          >
            <div>MaskField SMT</div>
            <div className="text-xs text-gray-400 mt-2">Маскирует:</div>
            <div className="text-xs text-gray-400">email, phone, ssn</div>
          </FlowNode>
        </DiagramTooltip>

        <Arrow direction="right" label="masked" />

        {/* Output Record */}
        <DiagramTooltip
          content={
            <div>
              <strong>Output Record</strong>
              <p className="mt-1">
                PII поля замаскированы (null). Публикуется в Kafka без чувствительных данных.
              </p>
              <p className="mt-2 text-xs text-emerald-300">
                GDPR compliant. Консьюмеры не видят оригинальные PII.
              </p>
            </div>
          }
        >
          <FlowNode
            variant="app"
            className="bg-emerald-500/20 border-emerald-400/30 text-emerald-200"
            tabIndex={0}
          >
            <div className="text-sm font-semibold">Output Record</div>
            <div className="text-xs text-gray-400 mt-2 font-mono text-left">
              <div>id: 1</div>
              <div>name: "Alice"</div>
              <div className="text-emerald-300">email: null</div>
              <div className="text-emerald-300">phone: null</div>
              <div className="text-emerald-300">ssn: null</div>
            </div>
            <div className="text-xs text-emerald-300 mt-2">
              ✓ PII masked
            </div>
          </FlowNode>
        </DiagramTooltip>
      </div>

      {/* Additional note */}
      <div className="mt-4 text-xs text-gray-400 text-center">
        <strong>Альтернатива:</strong> MaskField может использовать replacement="***MASKED***" вместо null
      </div>
    </DiagramContainer>
  );
}

/**
 * UnwrapComparisonDiagram - Before/After ExtractNewRecordState comparison
 */
export function UnwrapComparisonDiagram() {
  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Before unwrap */}
      <DiagramContainer
        title="Before ExtractNewRecordState"
        color="rose"
        className="flex-1"
        description="Debezium envelope формат"
      >
        <DiagramTooltip
          content={
            <div>
              <strong>Debezium Envelope</strong>
              <p className="mt-1">
                Полный Debezium envelope с before, after, op, source, ts_ms.
                Сложный формат для консьюмеров — требует парсинга вложенных полей.
              </p>
              <p className="mt-2 text-xs text-rose-300">
                Консьюмеры должны извлекать after field и обрабатывать разные op типы.
              </p>
            </div>
          }
        >
          <div className="text-sm font-mono space-y-2 text-left" tabIndex={0}>
            <div className="text-gray-400">
              <span className="text-gray-500">before:</span> null
            </div>
            <div className="text-emerald-400">
              <span className="text-gray-500">after:</span> {'{'}
              <div className="ml-4 space-y-1">
                <div>
                  <span className="text-blue-400">id:</span> 1,
                </div>
                <div>
                  <span className="text-blue-400">name:</span> "Alice",
                </div>
                <div>
                  <span className="text-blue-400">email:</span> "alice@example.com"
                </div>
              </div>
              {'}'}
            </div>
            <div>
              <span className="text-gray-500">op:</span> <span className="text-purple-400">"c"</span>
            </div>
            <div className="text-gray-500">
              source: {'{'} ... {'}'}
            </div>
            <div>
              <span className="text-gray-500">ts_ms:</span>{' '}
              <span className="text-amber-400">1706745600000</span>
            </div>
          </div>
        </DiagramTooltip>

        <div className="mt-4 text-xs text-rose-300 text-center">
          ⚠ Сложный формат для консьюмеров
        </div>
      </DiagramContainer>

      {/* After unwrap */}
      <DiagramContainer
        title="After ExtractNewRecordState"
        color="emerald"
        recommended
        className="flex-1"
        description="Flat JSON формат"
      >
        <DiagramTooltip
          content={
            <div>
              <strong>Flat JSON</strong>
              <p className="mt-1">
                ExtractNewRecordState извлек поле after и добавил metadata с prefix __.
                Простой flat JSON для консьюмеров.
              </p>
              <p className="mt-2 text-xs text-emerald-300">
                Консьюмеры парсят стандартный JSON без вложенных структур.
              </p>
            </div>
          }
        >
          <div className="text-sm font-mono space-y-2 text-left" tabIndex={0}>
            <div>
              <span className="text-blue-400">id:</span> 1
            </div>
            <div>
              <span className="text-blue-400">name:</span> "Alice"
            </div>
            <div>
              <span className="text-blue-400">email:</span> "alice@example.com"
            </div>
            <div className="text-purple-400 mt-4">
              <span className="text-gray-500">__op:</span> "c"
            </div>
            <div className="text-purple-400">
              <span className="text-gray-500">__table:</span> "customers"
            </div>
            <div className="text-purple-400">
              <span className="text-gray-500">__ts_ms:</span>{' '}
              <span className="text-amber-400">1706745600000</span>
            </div>
          </div>
        </DiagramTooltip>

        <div className="mt-4 text-xs text-emerald-300 text-center">
          ✓ Metadata добавлено с prefix __
        </div>
      </DiagramContainer>
    </div>
  );
}
