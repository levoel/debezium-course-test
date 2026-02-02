/**
 * IAM and Workload Identity Diagrams for Module 7 Lesson 03
 *
 * Exports:
 * - WorkloadIdentityFlowDiagram: Sequence showing K8s SA → Workload Identity → GCP SA → API flow
 */

import { SequenceDiagram } from '../primitives/SequenceDiagram';
import { DiagramContainer } from '../primitives/DiagramContainer';

/**
 * WorkloadIdentityFlowDiagram - Authentication sequence with anti-pattern warning
 */
export function WorkloadIdentityFlowDiagram() {
  return (
    <DiagramContainer
      title="Workload Identity поток аутентификации"
      color="purple"
      description="K8s Service Account → GCP Service Account binding без ключей"
    >
      <SequenceDiagram
        actors={[
          {
            id: 'pod',
            label: 'Pod в GKE',
            variant: 'service',
            tooltip: (
              <div>
                <p className="font-semibold mb-1">Kubernetes Pod</p>
                <p className="text-sm">Запускается с K8s Service Account аннотацией</p>
                <p className="text-sm mt-1">serviceAccountName: debezium-sa</p>
              </div>
            )
          },
          {
            id: 'ksa',
            label: 'K8s Service Account',
            variant: 'service',
            tooltip: (
              <div>
                <p className="font-semibold mb-1">Kubernetes SA</p>
                <p className="text-sm">Аннотация:</p>
                <p className="text-xs font-mono mt-1">iam.gke.io/gcp-service-account=debezium@project.iam</p>
              </div>
            )
          },
          {
            id: 'wi',
            label: 'Workload Identity',
            variant: 'external',
            tooltip: (
              <div>
                <p className="font-semibold mb-1">GKE Metadata Server</p>
                <p className="text-sm">Предоставляет GCP access token pod'у автоматически</p>
                <p className="text-sm mt-1">Токен автоматически ротируется каждый час</p>
              </div>
            )
          },
          {
            id: 'gcpsa',
            label: 'GCP Service Account',
            variant: 'external',
            tooltip: (
              <div>
                <p className="font-semibold mb-1">GCP Service Account</p>
                <p className="text-sm">IAM роли:</p>
                <p className="text-xs mt-1">• roles/pubsub.publisher</p>
                <p className="text-xs">• roles/cloudsql.client</p>
              </div>
            )
          },
          {
            id: 'api',
            label: 'Pub/Sub API',
            variant: 'queue',
            tooltip: (
              <div>
                <p className="font-semibold mb-1">Google Cloud APIs</p>
                <p className="text-sm">Проверяет IAM роли GCP SA перед доступом</p>
              </div>
            )
          }
        ]}
        messages={[
          {
            id: '1',
            from: 'pod',
            to: 'ksa',
            label: 'Использует K8s SA',
            variant: 'sync',
            tooltip: "Pod указывает serviceAccountName в манифесте"
          },
          {
            id: '2',
            from: 'ksa',
            to: 'wi',
            label: 'Аннотация связывает',
            variant: 'async',
            tooltip: "Workload Identity binding создается через gcloud iam service-accounts add-iam-policy-binding"
          },
          {
            id: '3',
            from: 'wi',
            to: 'gcpsa',
            label: 'Запрос GCP токена',
            variant: 'sync',
            tooltip: "GKE Metadata Server выдает short-lived OAuth 2.0 token"
          },
          {
            id: '4',
            from: 'gcpsa',
            to: 'pod',
            label: 'Токен (1h TTL)',
            variant: 'return',
            tooltip: "Access token действителен 1 час, автоматически обновляется"
          },
          {
            id: '5',
            from: 'pod',
            to: 'api',
            label: 'Аутентифицированный вызов',
            variant: 'sync',
            tooltip: "Pod использует токен в Authorization: Bearer header"
          },
          {
            id: '6',
            from: 'api',
            to: 'pod',
            label: 'API Response',
            variant: 'return',
            tooltip: "Pub/Sub API проверяет IAM роли и возвращает результат"
          }
        ]}
        messageSpacing={55}
      />

      <div className="mt-4 pt-3 border-t border-white/10">
        <div className="grid md:grid-cols-2 gap-4 text-xs">
          <div>
            <h3 className="font-semibold text-emerald-200 mb-1">✅ Workload Identity (Рекомендуется)</h3>
            <ul className="text-emerald-200/70 space-y-1">
              <li>• Токен автоматически ротируется каждый час</li>
              <li>• Нет ключей для хранения и ротации</li>
              <li>• Аудит через Cloud Logging</li>
              <li>• Least privilege IAM роли</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-rose-200 mb-1">❌ Service Account Keys (Не делайте)</h3>
            <ul className="text-rose-200/70 space-y-1">
              <li>• key.json может утечь в git/logs</li>
              <li>• Нет автоматической ротации</li>
              <li>• Сложный аудит утечек</li>
              <li>• Долгоживущие credentials</li>
            </ul>
          </div>
        </div>
      </div>
    </DiagramContainer>
  );
}
