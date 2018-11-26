# abstruse database tools

## Converting SQLite3 database to PostgreSQL

To convert SQLite3 `abstruse` database use `postgres.sh` script to make an export of Postgres database.
Script will automatically run Postgres server inside Docker, thus running Docker on the machine we are performing conversion is mandatory.

```sh
./postgres.sh abstruse.sqlite
```

PostgreSQL export file will be generated in current working directory as `abstruse.gz`, use that file to import database on your Postgres server as:

```sh
gunzip -c abstruse.gz | psql -h 127.0.0.1 -U postgres -W -d abstruse
```

After database is imported run the following function to update sequences (you can paste the following in `psql` cli console):

```sql
CREATE OR REPLACE FUNCTION fix_sequence(tableName text, columnName text)
RETURNS void AS $$
DECLARE
BEGIN
    EXECUTE 'SELECT setval(pg_get_serial_sequence(''' || tableName || ''', ''' || columnName || '''), (SELECT COALESCE (MAX(' || columnName || ') + 1, 1) FROM ' || tableName || '), false)';
END;
$$ LANGUAGE plpgsql VOLATILE;

SELECT
    table_name || '_' || column_name || '_seq' AS Sequence,
    fix_sequence(table_name, column_name) AS ResetResult
FROM information_schema.columns
WHERE column_default LIKE 'nextval%';

DROP FUNCTION fix_sequence(text, text);
```

That should be it.
