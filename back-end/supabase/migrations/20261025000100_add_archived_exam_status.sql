-- Own migration: a new enum value cannot be used in the transaction that adds it.
alter type public.exam_status add value 'archived';
