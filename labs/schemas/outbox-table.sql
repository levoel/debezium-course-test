-- Outbox table for reliable event publishing
-- Used with Debezium Outbox Event Router SMT

CREATE TABLE IF NOT EXISTS public.outbox (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    aggregatetype VARCHAR(255) NOT NULL,
    aggregateid VARCHAR(255) NOT NULL,
    type VARCHAR(255) NOT NULL,
    payload JSONB NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_outbox_created ON public.outbox(created_at);

COMMENT ON TABLE public.outbox IS 'Transactional outbox for reliable event publishing via Debezium';
COMMENT ON COLUMN public.outbox.aggregatetype IS 'Domain entity type for topic routing (Order, Customer, Payment)';
COMMENT ON COLUMN public.outbox.aggregateid IS 'Entity ID used as Kafka partition key';
COMMENT ON COLUMN public.outbox.type IS 'Event type (OrderCreated, OrderApproved, etc.)';
COMMENT ON COLUMN public.outbox.payload IS 'Event data as JSON';
