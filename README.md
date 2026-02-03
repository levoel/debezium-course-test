# Debezium CDC Mastery

Полное руководство по Change Data Capture с Debezium — от основ до production deployment.

## О курсе

- **Автор:** Lev Neganov
- **Уровень:** Intermediate
- **Длительность:** ~25 часов
- **Язык:** Русский

## Модули

1. **Введение в курс** — обзор и подготовка окружения
2. **Введение в CDC** — основы Change Data Capture
3. **Postgres/Aurora** — настройка для PostgreSQL
4. **MySQL/Aurora** — настройка для MySQL
5. **Prod Operations** — мониторинг и операционные задачи
6. **SMT и Паттерны** — трансформации и архитектурные паттерны
7. **Data Engineering** — интеграция с Python/Spark/Flink
8. **Cloud-Native GCP** — развёртывание в Google Cloud
9. **Capstone Project** — финальный проект

## Структура

```
├── config.json          # Метаданные курса
├── labs/                # Docker labs для практики
└── src/
    ├── components/      # Диаграммы модулей
    └── content/         # MDX уроки
```

## Использование

Этот репозиторий — контент для [learning-platform-engine](https://github.com/levoel/learning-platform-engine). Подключается как git submodule.

```bash
# В engine репо
git submodule add https://github.com/levoel/debezium-course-test.git content/courses/debezium-course
```

## Лицензия

© 2026 Lev Neganov
