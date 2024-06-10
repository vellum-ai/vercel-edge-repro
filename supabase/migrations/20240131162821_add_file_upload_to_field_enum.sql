-- Migration: Add 'file_upload' value to 'field' enum

BEGIN;

-- Step 1: Add 'file_upload' to the enum type
ALTER TYPE field ADD VALUE 'file_upload';

COMMIT;
