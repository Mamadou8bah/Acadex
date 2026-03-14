create table schools (
    id uuid primary key,
    created_at timestamptz not null,
    updated_at timestamptz not null,
    name varchar(255) not null unique,
    slug varchar(255) not null unique,
    contact_email varchar(255) not null unique,
    subscription_plan varchar(50) not null,
    status varchar(50) not null
);

create table school_features (
    school_id uuid not null references schools(id) on delete cascade,
    feature_flag varchar(100) not null
);

create table users (
    id uuid primary key,
    created_at timestamptz not null,
    updated_at timestamptz not null,
    tenant_id uuid not null,
    first_name varchar(255) not null,
    last_name varchar(255) not null,
    email varchar(255) not null unique,
    password_hash varchar(255) not null,
    role varchar(50) not null,
    email_verified boolean not null,
    active boolean not null,
    last_login_at timestamptz
);

create index idx_users_tenant_id on users(tenant_id);

create table refresh_tokens (
    id uuid primary key,
    created_at timestamptz not null,
    updated_at timestamptz not null,
    user_id uuid not null,
    token_hash varchar(128) not null unique,
    expires_at timestamptz not null,
    revoked boolean not null
);

create table verification_tokens (
    id uuid primary key,
    created_at timestamptz not null,
    updated_at timestamptz not null,
    user_id uuid not null,
    type varchar(50) not null,
    token_hash varchar(128) not null unique,
    expires_at timestamptz not null,
    used_at timestamptz
);

create table audit_logs (
    id uuid primary key,
    created_at timestamptz not null,
    updated_at timestamptz not null,
    tenant_id uuid not null,
    actor_id uuid not null,
    action varchar(255) not null,
    entity_type varchar(255) not null,
    entity_id varchar(255) not null,
    metadata varchar(4000)
);

create index idx_audit_logs_tenant_id on audit_logs(tenant_id);

create table announcements (
    id uuid primary key,
    created_at timestamptz not null,
    updated_at timestamptz not null,
    tenant_id uuid not null,
    author_id uuid not null,
    title varchar(255) not null,
    content varchar(4000) not null,
    audience varchar(50) not null,
    publish_at timestamptz not null
);

create index idx_announcements_tenant_id on announcements(tenant_id);

create table notification_outbox (
    id uuid primary key,
    created_at timestamptz not null,
    updated_at timestamptz not null,
    tenant_id uuid not null,
    recipient_user_id uuid not null,
    channel varchar(50) not null,
    status varchar(50) not null,
    subject varchar(255) not null,
    content varchar(4000) not null
);

create index idx_notification_outbox_tenant_id on notification_outbox(tenant_id);

create table webhook_events (
    id uuid primary key,
    created_at timestamptz not null,
    updated_at timestamptz not null,
    external_event_id varchar(255) not null unique,
    source varchar(255) not null,
    payload varchar(4000) not null,
    processed_at timestamptz
);

create index idx_webhook_events_external_id on webhook_events(external_event_id);

create table academic_years (
    id uuid primary key,
    created_at timestamptz not null,
    updated_at timestamptz not null,
    tenant_id uuid not null,
    name varchar(255) not null,
    start_date date not null,
    end_date date not null,
    active boolean not null
);

create index idx_academic_years_tenant_id on academic_years(tenant_id);

create table terms (
    id uuid primary key,
    created_at timestamptz not null,
    updated_at timestamptz not null,
    tenant_id uuid not null,
    academic_year_id uuid not null,
    name varchar(255) not null,
    start_date date not null,
    end_date date not null
);

create index idx_terms_tenant_id on terms(tenant_id);

create table school_classes (
    id uuid primary key,
    created_at timestamptz not null,
    updated_at timestamptz not null,
    tenant_id uuid not null,
    name varchar(255) not null,
    level_name varchar(255) not null,
    class_teacher_id uuid
);

create index idx_school_classes_tenant_id on school_classes(tenant_id);

create table subjects (
    id uuid primary key,
    created_at timestamptz not null,
    updated_at timestamptz not null,
    tenant_id uuid not null,
    name varchar(255) not null,
    code varchar(255) not null unique
);

create index idx_subjects_tenant_id on subjects(tenant_id);

create table subject_assignments (
    id uuid primary key,
    created_at timestamptz not null,
    updated_at timestamptz not null,
    tenant_id uuid not null,
    subject_id uuid not null,
    teacher_id uuid not null,
    class_id uuid not null
);

create index idx_subject_assignments_tenant_id on subject_assignments(tenant_id);

create table student_enrollments (
    id uuid primary key,
    created_at timestamptz not null,
    updated_at timestamptz not null,
    tenant_id uuid not null,
    student_id uuid not null,
    class_id uuid not null,
    academic_year_id uuid not null,
    status varchar(50) not null
);

create index idx_student_enrollments_tenant_id on student_enrollments(tenant_id);

create table attendance_records (
    id uuid primary key,
    created_at timestamptz not null,
    updated_at timestamptz not null,
    tenant_id uuid not null,
    student_id uuid not null,
    class_id uuid not null,
    attendance_date date not null,
    status varchar(50) not null,
    marked_by_user_id uuid not null
);

create index idx_attendance_records_tenant_id on attendance_records(tenant_id);

create table exams (
    id uuid primary key,
    created_at timestamptz not null,
    updated_at timestamptz not null,
    tenant_id uuid not null,
    name varchar(255) not null,
    subject_id uuid not null,
    class_id uuid not null,
    term_id uuid not null,
    max_score double precision not null,
    exam_date date not null
);

create index idx_exams_tenant_id on exams(tenant_id);

create table grading_schemes (
    id uuid primary key,
    created_at timestamptz not null,
    updated_at timestamptz not null,
    tenant_id uuid not null,
    min_score double precision not null,
    max_score double precision not null,
    letter_grade varchar(50) not null,
    grade_point double precision not null
);

create index idx_grading_schemes_tenant_id on grading_schemes(tenant_id);

create table student_scores (
    id uuid primary key,
    created_at timestamptz not null,
    updated_at timestamptz not null,
    tenant_id uuid not null,
    exam_id uuid not null,
    student_id uuid not null,
    score double precision not null
);

create index idx_student_scores_tenant_id on student_scores(tenant_id);

create table fee_structures (
    id uuid primary key,
    created_at timestamptz not null,
    updated_at timestamptz not null,
    tenant_id uuid not null,
    name varchar(255) not null,
    class_id uuid not null,
    amount double precision not null,
    due_date date not null
);

create index idx_fee_structures_tenant_id on fee_structures(tenant_id);

create table invoices (
    id uuid primary key,
    created_at timestamptz not null,
    updated_at timestamptz not null,
    tenant_id uuid not null,
    student_id uuid not null,
    fee_structure_id uuid not null,
    amount double precision not null,
    status varchar(50) not null,
    due_date date not null,
    generated_at timestamptz not null
);

create index idx_invoices_tenant_id on invoices(tenant_id);

create table payment_records (
    id uuid primary key,
    created_at timestamptz not null,
    updated_at timestamptz not null,
    tenant_id uuid not null,
    invoice_id uuid not null,
    student_id uuid not null,
    amount double precision not null,
    reference varchar(255) not null unique,
    paid_at timestamptz not null
);

create index idx_payment_records_tenant_id on payment_records(tenant_id);

create table message_threads (
    id uuid primary key,
    created_at timestamptz not null,
    updated_at timestamptz not null,
    tenant_id uuid not null,
    sender_user_id uuid not null,
    recipient_user_id uuid not null,
    body varchar(4000) not null
);

create index idx_message_threads_tenant_id on message_threads(tenant_id);
