create table "public"."chats" (
    "id" text not null,
    "user_id" text not null,
    "payload" jsonb
);

CREATE UNIQUE INDEX chats_pkey ON public.chats USING btree (id);

alter table "public"."chats" add constraint "chats_pkey" PRIMARY KEY using index "chats_pkey";
-- RLS
alter table "public"."chats" enable row level security;

create policy "Allow public read for shared chats"
on "public"."chats"
as permissive
for select
to public
using (((payload ->> 'sharePath'::text) IS NOT NULL));

create or replace function requesting_user_id()
returns text 
language sql stable
as $$
  select nullif(current_setting('request.jwt.claims', true)::json->>'sub', '')::text;
$$;

CREATE POLICY "Authenticated users can manage their own chats" 
    ON public.chats FOR ALL USING (
        auth.role() = 'authenticated'::text AND
        requesting_user_id() = user_id::text
    );