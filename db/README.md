# Database Bootstrap

This directory contains the idempotent PostgreSQL bootstrap script for the AI
PDLC database, schema, and application roles.

Credentials must come only from the local environment. Do not put database
usernames, passwords, or full connection strings into documentation.

## Required Environment Variables

Load or define these values from `.env` before running `psql`:

```powershell
$maintenanceUrl = "postgresql://$env:POSTGRES_USER:$env:POSTGRES_PASSWORD@$env:POSTGRES_HOST:$env:POSTGRES_PORT/$env:POSTGRES_DB"
```

Run the bootstrap:

```powershell
psql $maintenanceUrl `
  -v app_db="$env:PDLC_DB_NAME" `
  -v app_schema="$env:PDLC_DB_SCHEMA" `
  -v app_user="$env:PDLC_DB_USER" `
  -v app_password="$env:PDLC_DB_PASSWORD" `
  -f db/001_bootstrap_pg_ai-pdlc.sql
```

Optional read-only role:

```powershell
psql $maintenanceUrl `
  -v app_db="$env:PDLC_DB_NAME" `
  -v app_schema="$env:PDLC_DB_SCHEMA" `
  -v app_user="$env:PDLC_DB_USER" `
  -v app_password="$env:PDLC_DB_PASSWORD" `
  -v readonly_user="$env:PDLC_READONLY_USER" `
  -v readonly_password="$env:PDLC_READONLY_PASSWORD" `
  -f db/001_bootstrap_pg_ai-pdlc.sql
```

The script is idempotent. It creates or updates the application login role,
creates the database if needed, creates the schema, grants owner privileges,
sets the application role `search_path`, and grants read-only access when the
optional read-only values are provided.
