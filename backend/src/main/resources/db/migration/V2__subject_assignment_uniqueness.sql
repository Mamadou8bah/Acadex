create unique index uk_subject_assignments_tenant_class_subject
    on subject_assignments(tenant_id, class_id, subject_id);
