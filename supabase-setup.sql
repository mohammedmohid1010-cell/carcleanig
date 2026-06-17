-- Run this in your Supabase SQL Editor
-- Go to: Supabase Dashboard > SQL Editor > New Query > paste this > Run

create table messages (
  id uuid primary key default gen_random_uuid(),
  phone_number text not null,
  customer_name text,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz default now()
);

-- Index to quickly fetch a customer's conversation history
create index messages_phone_number_idx on messages (phone_number, created_at);

-- Optional: auto-delete messages older than 30 days to save storage
-- (remove the lines below if you want to keep all history)
-- create extension if not exists pg_cron;
-- select cron.schedule('delete-old-messages', '0 2 * * *',
--   'delete from messages where created_at < now() - interval ''30 days''');
