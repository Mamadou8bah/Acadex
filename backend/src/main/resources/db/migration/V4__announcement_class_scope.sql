alter table announcements add column class_id uuid;

create index idx_announcements_tenant_class_id on announcements(tenant_id, class_id);
