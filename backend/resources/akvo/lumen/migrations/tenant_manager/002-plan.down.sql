DROP INDEX plan_tenant_ends_key;
DROP TABLE IF EXISTS plan;
DROP TYPE IF EXISTS tier;
ALTER TABLE plan DROP CONSTRAINT plan_pkey;
