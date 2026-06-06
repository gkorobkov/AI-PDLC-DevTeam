-- Idempotent PostgreSQL bootstrap for AI PDLC.
--
-- Run this script with psql against a maintenance database.
-- All credentials must be passed from the local environment.

\set ON_ERROR_STOP on

-- AI PDLC application database parameters.
-- Infra/admin connection parameters stay outside this file and come from the
-- psql connection string, for example POSTGRES_* values from .env.
\set app_db ai_pdlc
\set app_schema ai_pdlc
\set app_user pdlc_user

\if :{?app_password}
\else
  \echo 'app_password is required. Pass it from environment with psql -v app_password=...'
  \quit 1
\endif

SELECT format('CREATE ROLE %I WITH LOGIN PASSWORD %L', :'app_user', :'app_password')
WHERE NOT EXISTS (
    SELECT 1
    FROM pg_catalog.pg_roles
    WHERE rolname = :'app_user'
);
\gexec

SELECT format('ALTER ROLE %I WITH LOGIN PASSWORD %L', :'app_user', :'app_password');
\gexec

SELECT format('CREATE DATABASE %I OWNER %I', :'app_db', :'app_user')
WHERE NOT EXISTS (
    SELECT 1
    FROM pg_catalog.pg_database
    WHERE datname = :'app_db'
);
\gexec

\connect :app_db

SELECT format('CREATE SCHEMA IF NOT EXISTS %I AUTHORIZATION %I', :'app_schema', :'app_user');
\gexec

SELECT format('GRANT CONNECT ON DATABASE %I TO %I', :'app_db', :'app_user');
\gexec

SELECT format('GRANT USAGE, CREATE ON SCHEMA %I TO %I', :'app_schema', :'app_user');
\gexec

SELECT format('ALTER ROLE %I SET search_path TO %I, public', :'app_user', :'app_schema');
\gexec

SELECT format('ALTER DEFAULT PRIVILEGES FOR ROLE %I IN SCHEMA %I GRANT ALL ON TABLES TO %I', :'app_user', :'app_schema', :'app_user');
\gexec

SELECT format('ALTER DEFAULT PRIVILEGES FOR ROLE %I IN SCHEMA %I GRANT ALL ON SEQUENCES TO %I', :'app_user', :'app_schema', :'app_user');
\gexec

\if :{?readonly_user}
  \if :{?readonly_password}
    SELECT format('CREATE ROLE %I WITH LOGIN PASSWORD %L', :'readonly_user', :'readonly_password')
    WHERE NOT EXISTS (
        SELECT 1
        FROM pg_catalog.pg_roles
        WHERE rolname = :'readonly_user'
    );
    \gexec

    SELECT format('ALTER ROLE %I WITH LOGIN PASSWORD %L', :'readonly_user', :'readonly_password');
    \gexec

    SELECT format('GRANT CONNECT ON DATABASE %I TO %I', :'app_db', :'readonly_user');
    \gexec

    SELECT format('GRANT USAGE ON SCHEMA %I TO %I', :'app_schema', :'readonly_user');
    \gexec

    SELECT format('GRANT SELECT ON ALL TABLES IN SCHEMA %I TO %I', :'app_schema', :'readonly_user');
    \gexec

    SELECT format('GRANT SELECT ON ALL SEQUENCES IN SCHEMA %I TO %I', :'app_schema', :'readonly_user');
    \gexec

    SELECT format('ALTER DEFAULT PRIVILEGES FOR ROLE %I IN SCHEMA %I GRANT SELECT ON TABLES TO %I', :'app_user', :'app_schema', :'readonly_user');
    \gexec

    SELECT format('ALTER DEFAULT PRIVILEGES FOR ROLE %I IN SCHEMA %I GRANT SELECT ON SEQUENCES TO %I', :'app_user', :'app_schema', :'readonly_user');
    \gexec
  \else
    \echo 'readonly_user is set, but readonly_password is missing'
    \quit 1
  \endif
\endif

\echo 'PostgreSQL bootstrap completed'
