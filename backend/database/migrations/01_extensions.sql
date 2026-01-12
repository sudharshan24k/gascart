-- =============================================
-- 01_extensions.sql
-- Enable required PostgreSQL extensions
-- Run this FIRST before any other migrations
-- =============================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable full-text search (optional, for future use)
-- CREATE EXTENSION IF NOT EXISTS "pg_trgm";
