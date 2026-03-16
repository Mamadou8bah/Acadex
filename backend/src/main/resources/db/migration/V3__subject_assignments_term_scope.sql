alter table subject_assignments add column term_id uuid;

update subject_assignments
set term_id = (
    select id from terms
    where terms.tenant_id = subject_assignments.tenant_id
    order by created_at
    limit 1
);

alter table subject_assignments alter column term_id set not null;

drop index if exists uk_subject_assignments_tenant_class_subject;

create unique index uk_subject_assignments_tenant_class_subject_term
    on subject_assignments(tenant_id, class_id, subject_id, term_id);
