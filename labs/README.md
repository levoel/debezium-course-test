# Debezium Lab Environment

Лабораторная среда для практических упражнений курса по Debezium CDC.

## Требования

- **Docker Desktop** 4.x или выше
- **RAM:** минимум 8 GB (рекомендуется 10+ GB для всех сервисов)
- **Платформы:**
  - macOS (Apple Silicon M1/M2/M3/M4 или Intel)
  - Linux (x86_64, ARM64)
  - Windows с WSL2

> **Примечание для Apple Silicon:** Все образы протестированы на ARM64 и работают без эмуляции Rosetta.

## Быстрый старт

### 1. Скопируйте файл окружения

```bash
cd labs
cp .env.example .env
```

### 2. Запустите все сервисы

```bash
docker compose up -d
```

### 3. Дождитесь запуска (2-3 минуты)

```bash
docker compose ps
```

Все сервисы должны показывать статус `healthy` или `running`.

### 4. Откройте JupyterLab

Перейдите по адресу: http://localhost:8888

Запустите ноутбук `01-setup-verification.ipynb` для проверки установки.

## Сервисы

| Сервис | Порт | URL | Назначение |
|--------|------|-----|------------|
| PostgreSQL | 5433 | - | База данных с logical replication |
| Kafka | 9092 | - | Message broker (KRaft mode, без ZooKeeper) |
| Kafka Connect | 8083 | http://localhost:8083 | Debezium connectors |
| Schema Registry | 8081 | http://localhost:8081 | Avro schema management |
| Prometheus | 9090 | http://localhost:9090 | Сбор метрик |
| Grafana | 3000 | http://localhost:3000 | Мониторинг дашборды |
| JupyterLab | 8888 | http://localhost:8888 | Python ноутбуки |

> **Примечание:** PostgreSQL использует порт 5433 (не стандартный 5432), так как порт 5432 часто занят локальной установкой PostgreSQL.

## Проверка установки

### Автоматическая проверка

1. Откройте http://localhost:8888
2. Запустите ноутбук `01-setup-verification.ipynb`
3. Все ячейки должны выполниться без ошибок

### Ручная проверка

```bash
# PostgreSQL - проверка logical replication
docker compose exec postgres psql -U postgres -c "SHOW wal_level;"
# Ожидается: logical

# Kafka - список топиков
docker compose exec kafka kafka-topics --bootstrap-server localhost:9092 --list

# Connect API - версия
curl -s http://localhost:8083/ | jq .version
# Ожидается: "3.6.1" (или актуальная версия)

# Schema Registry - список схем
curl -s http://localhost:8081/subjects
# Ожидается: []

# Prometheus - количество целей
curl -s http://localhost:9090/api/v1/targets | jq '.data.activeTargets | length'
# Ожидается: 2 (prometheus + kafka-connect)
```

## Создание коннектора

Пример создания PostgreSQL коннектора для таблицы customers:

```bash
curl -X POST http://localhost:8083/connectors \
  -H "Content-Type: application/json" \
  -d '{
    "name": "inventory-connector",
    "config": {
      "connector.class": "io.debezium.connector.postgresql.PostgresConnector",
      "database.hostname": "postgres",
      "database.port": "5432",
      "database.user": "postgres",
      "database.password": "postgres",
      "database.dbname": "inventory",
      "topic.prefix": "dbserver1",
      "plugin.name": "pgoutput",
      "publication.name": "dbz_publication"
    }
  }'
```

### Проверка коннектора

```bash
# Список коннекторов
curl -s http://localhost:8083/connectors

# Статус коннектора
curl -s http://localhost:8083/connectors/inventory-connector/status | jq
```

## Мониторинг

### Grafana

1. Откройте http://localhost:3000
2. Логин: `admin`, пароль: `admin`
3. Перейдите в Dashboards > Debezium > Debezium Connect Monitoring

Дашборд показывает:
- Статус коннекторов (Running/Failed/Paused)
- Количество обработанных записей
- Скорость обработки (records/min)
- Отставание (lag) коннектора

### Prometheus

Прямой доступ к метрикам: http://localhost:9090

Полезные запросы:
- `debezium_metrics_MilliSecondsBehindSource` - отставание коннектора
- `kafka_connect_connector_task_status` - статус задач

## Устранение неполадок

### Сервисы не запускаются

```bash
# Проверьте логи конкретного сервиса
docker compose logs kafka
docker compose logs connect

# Перезапустите всё
docker compose down
docker compose up -d
```

### Connect не может подключиться к Kafka

Убедитесь что Kafka полностью запущена:

```bash
docker compose ps kafka
# Статус должен быть healthy
```

Если kafka показывает unhealthy, подождите ещё 30 секунд или перезапустите:

```bash
docker compose restart kafka
```

### Ошибка "port already in use"

Измените порты в файле `.env`:

```bash
# Если порт 5433 занят:
POSTGRES_PORT=5434

# Если порт 8083 занят:
CONNECT_PORT=8084
```

### Нехватка памяти

Увеличьте лимит памяти Docker Desktop:
- Settings > Resources > Memory: минимум 8 GB

### JupyterLab не открывается

```bash
# Проверьте статус
docker compose ps jupyter

# Посмотрите логи
docker compose logs jupyter
```

## Остановка и очистка

### Остановить сервисы (данные сохраняются)

```bash
docker compose down
```

### Полная очистка (удаление всех данных)

```bash
docker compose down -v
```

### Удалить образы (освободить место)

```bash
docker compose down -v --rmi all
```

## Структура каталогов

```
labs/
├── docker-compose.yml    # Конфигурация всех сервисов
├── .env.example          # Шаблон переменных окружения
├── .env                  # Ваши настройки (создать из .env.example)
├── postgres/
│   └── init.sql          # Начальная схема БД
├── jupyter/
│   ├── Dockerfile        # Образ JupyterLab
│   └── requirements.txt  # Python зависимости
├── notebooks/
│   └── 01-setup-verification.ipynb  # Проверка установки
└── monitoring/
    ├── prometheus.yml              # Конфигурация Prometheus
    └── grafana/
        ├── provisioning/           # Авто-настройка Grafana
        └── dashboards/             # Debezium дашборд
```

## Версии компонентов

| Компонент | Версия | Примечание |
|-----------|--------|------------|
| PostgreSQL | 15 | С поддержкой logical replication |
| Kafka | 7.8.1 (Confluent) | KRaft mode, без ZooKeeper |
| Debezium Connect | 2.5.4.Final | Java 17 для ARM64 совместимости |
| Schema Registry | 7.8.1 (Confluent) | Avro schema management |
| Prometheus | latest | Сбор JMX метрик |
| Grafana | latest | Визуализация метрик |
| JupyterLab | scipy-notebook | С confluent-kafka клиентом |

---

*Часть курса по Debezium CDC*
