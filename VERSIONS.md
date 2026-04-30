# Course versions — Debezium CDC Mastery

Last review: 2026-04-30
Next review: 2026-07-30

## Cadence

Квартальный — Debezium 3.x релизит минор каждые 1-2 месяца, exactly-once и Debezium Server активно эволюционируют, source connectors (Postgres logical replication, MySQL GTIDs) получают апдейты с каждой мажорной версией БД.

## Pinned baseline (April 2026)

| Component | Version | Released | Course depth |
|-----------|---------|----------|--------------|
| Debezium | 3.4.1 | 2026-01 | full |
| Debezium 3.4.0 (exactly-once для всех ядерных коннекторов) | 3.4.0 | 2025-12 | full |
| Debezium 3.3 (EOS baseline) | 3.3.0 | 2025-10 | full |
| Debezium Server | 3.4.x | 2026-01 | full |
| Postgres connector | 3.4.x | 2026-01 | full |
| MySQL connector | 3.4.x | 2026-01 | full |
| Oracle connector | 3.4.x | 2026-01 | partial |
| MongoDB connector | 3.4.x | 2026-01 | partial |
| SQL Server connector | 3.4.x | 2026-01 | mention |
| Apache Kafka (для Connect runtime) | 4.0 | 2025-03 | partial |
| Strimzi Kafka operator | 0.45+ | 2026-Q1 | partial |
| Debezium UI | 2.x | 2026 | mention |

## Forthcoming (next review)

- Debezium 3.5 / 3.6 — incremental snapshot улучшения, vector type support.
- Postgres 18 logical replication features (failover slots).
- MySQL 9.x GTID и binlog row image v2.
- Debezium на Kafka Connect 4.x runtime — нюансы KRaft.
- Debezium Server outbox routing best practices.

## Recent updates

- 2026-04-30 — Wave 1 P0 правки (Debezium 3.4.1, EOS GA для всех коннекторов) + Wave 2 новые уроки (Debezium Server, outbox pattern) + Wave 3 cross-refs (kafka-course, storage-formats).
