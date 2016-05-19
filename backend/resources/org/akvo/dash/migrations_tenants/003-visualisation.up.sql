CREATE TABLE IF NOT EXISTS visualisation (
    id text NOT NULL,
    dataset_id text REFERENCES dataset ON DELETE CASCADE,
    "name" text NOT NULL,
    "type" text NOT NULL,
    spec jsonb NOT NULL,
    author jsonb,
    created timestamptz DEFAULT now(),
    modified timestamptz DEFAULT now()
);


DO $$
BEGIN
    PERFORM tardis('visualisation');
END$$;
--;;

CREATE TRIGGER visualisation_modified
BEFORE UPDATE ON visualisation
FOR EACH ROW EXECUTE PROCEDURE update_modified();
--;;
