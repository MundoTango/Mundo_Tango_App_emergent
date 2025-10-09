alter table fb_event_links enable row level security;
create policy owner_rw on fb_event_links for all using (owner_user_id = auth.uid()) with check (owner_user_id = auth.uid());

alter table fb_tokens enable row level security;
create policy service_read on fb_tokens for select using (auth.role() = 'service_role');

alter table event_sync_log enable row level security;
create policy support_read on event_sync_log for select using (auth.jwt() ->> 'role') in ('support','service_role');
