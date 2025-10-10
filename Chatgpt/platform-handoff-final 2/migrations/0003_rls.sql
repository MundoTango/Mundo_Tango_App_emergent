alter table jobs enable row level security; alter table agent_runs enable row level security; alter table events_bus enable row level security;
alter table events enable row level security;
create policy events_owner_rw on events for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy events_public_r on events for select using (visibility = 'Public');

alter table fb_user_tokens enable row level security;
create policy fb_tokens_owner_rw on fb_user_tokens for all using (user_id = auth.uid()) with check (user_id = auth.uid());

alter table payments enable row level security;
create policy payments_owner_r on payments for select using (user_id = auth.uid());

alter table help_logs enable row level security;
create policy help_logs_owner_r on help_logs for select using (user_id = auth.uid());

alter table travel_plans enable row level security;
create policy travel_plans_owner_rw on travel_plans for all using (user_id = auth.uid()) with check (user_id = auth.uid());

alter table lodging_links enable row level security;
create policy lodging_links_owner_r on lodging_links for select using (travel_plan_id in (select id from travel_plans where user_id = auth.uid()));

alter table volunteers enable row level security;
create policy volunteers_user_r on volunteers for select using (user_id = auth.uid());

alter table bot_feedback enable row level security;
create policy bot_feedback_owner_rw on bot_feedback for all using (user_id = auth.uid()) with check (user_id = auth.uid());

alter table media_tasks enable row level security;
create policy media_tasks_owner_r on media_tasks for select using (true);