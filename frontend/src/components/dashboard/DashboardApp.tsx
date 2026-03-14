import { FormEvent, ReactNode, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { registerSchoolAdmin } from "../../features/auth/api";
import {
  createAcademicYear,
  createAnnouncement,
  createClass,
  createExam,
  createFeeStructure,
  createInAppNotification,
  createUser,
  fetchAcademicYears,
  fetchAnnouncements,
  fetchClasses,
  fetchDashboardAnalytics,
  fetchFinanceSummary,
  fetchMessages,
  fetchNotifications,
  fetchSchools,
  fetchUsers,
  sendMessage,
  updateSchool,
  validateFileUpload
} from "../../features/platform/api";
import { useAuthStore } from "../../store/auth";
import type { FeatureFlag, PlatformRole, SubscriptionPlan } from "../../types";
import { MetricCard } from "../MetricCard";
import { Sidebar } from "../Sidebar";

type Tab = "overview" | "tenants" | "users" | "academics" | "finance" | "comms";
type FileBucket = "schoolLogo" | "studentPhoto" | "studentDocuments";

interface UploadItem {
  name: string;
  size: number;
  contentType: string;
}

const schoolPlans: SubscriptionPlan[] = ["STARTER", "GROWTH", "ENTERPRISE"];
const schoolRoles: PlatformRole[] = ["SCHOOL_ADMIN", "TEACHER", "STUDENT", "PARENT"];
const featureFlags: FeatureFlag[] = [
  "ENABLE_PARENT_PORTAL",
  "ENABLE_FINANCE_MODULE",
  "ENABLE_ANALYTICS",
  "ENABLE_SMS_ALERTS",
  "ENABLE_ATTENDANCE_ALERTS"
];

function join(values: Array<string | number | null | undefined>) {
  return values.filter(Boolean).join(" • ");
}

function bytes(size: number) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function Panel({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <section className="rounded-[2rem] border border-black/5 bg-white/88 p-6 shadow-sm backdrop-blur">
      <p className="text-xs uppercase tracking-[0.2em] text-black/55">{subtitle}</p>
      <h3 className="mt-2 font-display text-3xl">{title}</h3>
      <div className="mt-5 space-y-4">{children}</div>
    </section>
  );
}

function Items({ values }: { values: string[] }) {
  return values.length ? (
    <div className="space-y-2">
      {values.map((value) => (
        <div key={value} className="rounded-2xl bg-sand/60 p-3 text-sm text-black/80">
          {value}
        </div>
      ))}
    </div>
  ) : (
    <p className="text-sm text-black/50">No records yet.</p>
  );
}

function UploadChip({ item }: { item: UploadItem }) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-sand/60 px-4 py-3 text-sm">
      <span className="truncate pr-3 text-black/85">{item.name}</span>
      <span className="whitespace-nowrap text-black/55">{bytes(item.size)}</span>
    </div>
  );
}

function UploadGrid({
  label,
  hint,
  multiple,
  name,
  onSelect,
  items
}: {
  label: string;
  hint: string;
  multiple?: boolean;
  name: string;
  onSelect: (files: FileList | null) => void;
  items: UploadItem[];
}) {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-semibold text-black/75">{label}</label>
      <label className="flex cursor-pointer flex-col items-center justify-center rounded-[1.4rem] border border-dashed border-black/15 bg-white px-4 py-6 text-center">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-ink/5 text-ink">
          <UploadIcon />
        </span>
        <span className="mt-3 text-sm font-semibold text-black/80">Choose file{multiple ? "s" : ""}</span>
        <span className="mt-1 text-xs text-black/55">{hint}</span>
        <input className="sr-only" multiple={multiple} name={name} onChange={(event) => onSelect(event.target.files)} type="file" />
      </label>
      {items.length ? (
        <div className="space-y-2">
          {items.map((item) => (
            <UploadChip item={item} key={`${item.name}-${item.size}`} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function IconWrapper({ children }: { children: ReactNode }) {
  return <span className="h-4 w-4">{children}</span>;
}

function OverviewIcon() {
  return <IconWrapper><svg aria-hidden="true" fill="none" viewBox="0 0 24 24"><path d="M4 13h7V4H4v9Zm9 7h7v-6h-7v6ZM13 4v8h7V4h-7ZM4 20h7v-5H4v5Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.8" /></svg></IconWrapper>;
}

function SchoolIcon() {
  return <IconWrapper><svg aria-hidden="true" fill="none" viewBox="0 0 24 24"><path d="M4 18h16M7 18V8l5-3 5 3v10M10 11h4M10 14h4" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" /></svg></IconWrapper>;
}

function UsersIcon() {
  return <IconWrapper><svg aria-hidden="true" fill="none" viewBox="0 0 24 24"><path d="M8 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm8 1.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM3.5 19a4.5 4.5 0 0 1 9 0M13 19a3.5 3.5 0 0 1 7 0" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" /></svg></IconWrapper>;
}

function AcademicIcon() {
  return <IconWrapper><svg aria-hidden="true" fill="none" viewBox="0 0 24 24"><path d="m3 9 9-5 9 5-9 5-9-5Zm3 3.5v4L12 20l6-3.5v-4" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" /></svg></IconWrapper>;
}

function FinanceIcon() {
  return <IconWrapper><svg aria-hidden="true" fill="none" viewBox="0 0 24 24"><path d="M12 4v16M7.5 7.5c0-1.4 1.8-2.5 4.5-2.5s4.5 1.1 4.5 2.5S14.7 10 12 10 7.5 8.9 7.5 7.5Zm0 9c0 1.4 1.8 2.5 4.5 2.5s4.5-1.1 4.5-2.5-1.8-2.5-4.5-2.5-4.5 1.1-4.5 2.5Z" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" /></svg></IconWrapper>;
}

function CommsIcon() {
  return <IconWrapper><svg aria-hidden="true" fill="none" viewBox="0 0 24 24"><path d="M5 6.5h14v9H8l-3 3v-12Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" /></svg></IconWrapper>;
}

function UploadIcon() {
  return <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24"><path d="M12 16V5m0 0-4 4m4-4 4 4M5 19h14" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" /></svg>;
}

function EnrollmentIcon() {
  return <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24"><path d="M6 19V7m6 12V5m6 14v-8" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" /></svg>;
}

function AttendanceIcon() {
  return <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24"><path d="M7 4v3M17 4v3M5 9h14M6 7h12a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1Zm2.5 7 2 2 5-5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" /></svg>;
}

function CollectionsIcon() {
  return <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24"><path d="M12 4v16M8 8.5C8 7.1 9.8 6 12 6s4 1.1 4 2.5-1.8 2.5-4 2.5-4 1.1-4 2.5 1.8 2.5 4 2.5 4 1.1 4 2.5S14.2 20 12 20s-4-1.1-4-2.5" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" /></svg>;
}

export function DashboardApp() {
  const user = useAuthStore((s) => s.user)!;
  const accessToken = useAuthStore((s) => s.accessToken)!;
  const tenantId = useAuthStore((s) => s.tenantId)!;
  const clearSession = useAuthStore((s) => s.clearSession);
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<Tab>("overview");
  const [flash, setFlash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [schoolLogo, setSchoolLogo] = useState<UploadItem | null>(null);
  const [studentPhoto, setStudentPhoto] = useState<UploadItem | null>(null);
  const [studentDocuments, setStudentDocuments] = useState<UploadItem[]>([]);

  const session = { accessToken, tenantId };
  const isSuperAdmin = user.role === "SUPER_ADMIN";

  const tabs = useMemo<Tab[]>(
    () => (isSuperAdmin ? ["overview", "tenants", "users", "academics", "finance", "comms"] : ["overview", "users", "academics", "finance", "comms"]),
    [isSuperAdmin]
  );

  const dashboard = useQuery({ queryKey: ["dashboard"], queryFn: () => fetchDashboardAnalytics(session) });
  const announcements = useQuery({ queryKey: ["announcements"], queryFn: () => fetchAnnouncements(session) });
  const schools = useQuery({ queryKey: ["schools"], enabled: isSuperAdmin, queryFn: () => fetchSchools(session) });
  const users = useQuery({ queryKey: ["users"], queryFn: () => fetchUsers(session) });
  const years = useQuery({ queryKey: ["years"], queryFn: () => fetchAcademicYears(session) });
  const classes = useQuery({ queryKey: ["classes"], queryFn: () => fetchClasses(session) });
  const finance = useQuery({ queryKey: ["finance"], queryFn: () => fetchFinanceSummary(session) });
  const notifications = useQuery({ queryKey: ["notifications"], queryFn: () => fetchNotifications(session) });
  const messages = useQuery({ queryKey: ["messages"], queryFn: () => fetchMessages(session) });

  async function run(action: () => Promise<unknown>, refresh: string[] = [], success = "Saved successfully.") {
    try {
      setError(null);
      setFlash(null);
      await action();
      await Promise.all(refresh.map((key) => queryClient.invalidateQueries({ queryKey: [key] })));
      setFlash(success);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed.");
    }
  }

  async function handle(
    event: FormEvent<HTMLFormElement>,
    action: (fd: FormData) => Promise<unknown>,
    refresh: string[] = [],
    success?: string,
    afterSuccess?: () => void
  ) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await run(async () => {
      await action(form);
      afterSuccess?.();
    }, refresh, success);
    event.currentTarget.reset();
  }

  async function validateFiles(bucket: FileBucket, files: FileList | null) {
    if (!files?.length) return;

    try {
      const validated = await Promise.all(
        Array.from(files).map(async (file) => {
          const result = await validateFileUpload(session, file);
          return { name: file.name, size: result.size, contentType: result.contentType };
        })
      );

      if (bucket === "schoolLogo") {
        setSchoolLogo(validated[0] ?? null);
      } else if (bucket === "studentPhoto") {
        setStudentPhoto(validated[0] ?? null);
      } else {
        setStudentDocuments(validated);
      }

      setFlash("Files validated and ready for onboarding.");
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "File validation failed.");
    }
  }

  const sidebarItems = tabs.map((item) => {
    const icons: Record<Tab, ReactNode> = {
      overview: <OverviewIcon />,
      tenants: <SchoolIcon />,
      users: <UsersIcon />,
      academics: <AcademicIcon />,
      finance: <FinanceIcon />,
      comms: <CommsIcon />
    };

    return {
      label: item.charAt(0).toUpperCase() + item.slice(1),
      icon: icons[item],
      active: tab === item,
      onClick: () => setTab(item)
    };
  });

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f7f1e6_0%,#efe4d3_100%)] text-ink">
      <div className="flex min-h-screen flex-col lg:flex-row">
        <Sidebar
          items={sidebarItems}
          subtitle={isSuperAdmin ? "Platform owner workspace" : "School admin workspace"}
          title={isSuperAdmin ? "Admin Control" : "School Dashboard"}
        />

        <main className="flex-1 px-4 py-4 md:px-6 md:py-6">
          <div className="min-h-full rounded-[2rem] border border-black/5 bg-white/55 p-5 shadow-xl shadow-black/5 backdrop-blur md:p-8">
            <div className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-[2rem] bg-white/85 p-5">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-black/55">Authenticated session</p>
                <h2 className="mt-2 font-display text-3xl">{user.firstName} {user.lastName}</h2>
                <p className="text-sm text-black/70">{join([user.email, user.role, `tenant ${user.tenantId}`])}</p>
              </div>
              <button className="rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white" onClick={clearSession} type="button">
                Sign out
              </button>
            </div>

            {flash ? <p className="mb-4 rounded-2xl bg-moss/10 p-4 text-sm text-moss">{flash}</p> : null}
            {error ? <p className="mb-4 rounded-2xl bg-red-50 p-4 text-sm text-red-700">{error}</p> : null}

            {tab === "overview" ? (
              <div className="space-y-6">
                <section className="grid gap-4 md:grid-cols-3">
                  <MetricCard detail="Student enrollment activity across the tenant." icon={<EnrollmentIcon />} label="Enrollments" value={String(dashboard.data?.studentEnrollments ?? 0)} />
                  <MetricCard detail="Present attendance entries currently tracked." icon={<AttendanceIcon />} label="Attendance" value={String(dashboard.data?.presentAttendanceRecords ?? 0)} />
                  <MetricCard detail="Captured payments from the finance module." icon={<CollectionsIcon />} label="Collections" value={String(dashboard.data?.totalCollected ?? 0)} />
                </section>
                <div className="grid gap-6 lg:grid-cols-[1.45fr_1fr]">
                  <Panel subtitle="Analytics" title="Operating picture">
                    <Items values={[
                      `Classes: ${dashboard.data?.classesCount ?? 0}`,
                      `Exams: ${dashboard.data?.examsCount ?? 0}`,
                      `Teacher assignments: ${dashboard.data?.teacherAssignments ?? 0}`,
                      `Academic years: ${years.data?.length ?? 0}`
                    ]} />
                  </Panel>
                  <Panel subtitle="Comms" title="Recent announcements">
                    <Items values={(announcements.data?.content ?? []).map((item) => join([item.title, item.audience])).slice(0, 5)} />
                  </Panel>
                </div>
              </div>
            ) : null}

            {tab === "tenants" && isSuperAdmin ? (
              <div className="grid gap-6 lg:grid-cols-2">
                <Panel subtitle="Platform onboarding" title="Add school">
                  <p className="text-sm leading-7 text-black/70">New schools are created here together with their first school admin. Add a logo at onboarding so the workspace can feel branded from day one.</p>
                  <form className="grid gap-3 md:grid-cols-2" onSubmit={(e) => handle(e, (fd) => registerSchoolAdmin({
                    schoolName: String(fd.get("schoolName")),
                    schoolSlug: String(fd.get("schoolSlug")),
                    schoolEmail: String(fd.get("schoolEmail")),
                    adminFirstName: String(fd.get("adminFirstName")),
                    adminLastName: String(fd.get("adminLastName")),
                    adminEmail: String(fd.get("adminEmail")),
                    password: String(fd.get("password")),
                    subscriptionPlan: String(fd.get("subscriptionPlan")) as SubscriptionPlan
                  }), ["schools"], schoolLogo ? `School and first school admin created. Logo captured for ${schoolLogo.name}.` : "School and first school admin created.", () => setSchoolLogo(null))}>
                    <input className="rounded-2xl border border-black/10 p-3 md:col-span-2" name="schoolName" placeholder="School name" />
                    <input className="rounded-2xl border border-black/10 p-3" name="schoolSlug" placeholder="school-slug" />
                    <input className="rounded-2xl border border-black/10 p-3" name="schoolEmail" placeholder="school@email.com" />
                    <input className="rounded-2xl border border-black/10 p-3" name="adminFirstName" placeholder="Admin first name" />
                    <input className="rounded-2xl border border-black/10 p-3" name="adminLastName" placeholder="Admin last name" />
                    <input className="rounded-2xl border border-black/10 p-3 md:col-span-2" name="adminEmail" placeholder="Admin email" />
                    <input className="rounded-2xl border border-black/10 p-3 md:col-span-2" name="password" placeholder="Temporary password" type="password" />
                    <select className="rounded-2xl border border-black/10 p-3 md:col-span-2" defaultValue="STARTER" name="subscriptionPlan">
                      {schoolPlans.map((plan) => <option key={plan} value={plan}>{plan}</option>)}
                    </select>
                    <div className="md:col-span-2">
                      <UploadGrid hint="PNG or JPG recommended for dashboard branding" items={schoolLogo ? [schoolLogo] : []} label="School logo" name="schoolLogo" onSelect={(files) => validateFiles("schoolLogo", files)} />
                    </div>
                    <button className="rounded-full bg-ember px-5 py-3 text-sm font-semibold text-white md:col-span-2" type="submit">Add school</button>
                  </form>
                </Panel>

                <Panel subtitle="Plans and controls" title="Existing schools">
                  <Items values={(schools.data?.content ?? []).map((school) => join([school.name, school.subscriptionPlan, school.status]))} />
                  <form className="space-y-3" onSubmit={(e) => handle(e, (fd) => updateSchool(session, String(fd.get("schoolId")), {
                    name: String(fd.get("name")),
                    slug: String(fd.get("slug")),
                    contactEmail: String(fd.get("contactEmail")),
                    subscriptionPlan: String(fd.get("subscriptionPlan")),
                    status: String(fd.get("status")),
                    enabledFeatures: featureFlags.filter((flag) => fd.getAll("features").includes(flag))
                  }), ["schools"], "School updated.")}>
                    <input className="w-full rounded-2xl border border-black/10 p-3" name="schoolId" placeholder="School ID" />
                    <input className="w-full rounded-2xl border border-black/10 p-3" name="name" placeholder="School name" />
                    <input className="w-full rounded-2xl border border-black/10 p-3" name="slug" placeholder="Slug" />
                    <input className="w-full rounded-2xl border border-black/10 p-3" name="contactEmail" placeholder="Contact email" />
                    <input className="w-full rounded-2xl border border-black/10 p-3" name="subscriptionPlan" placeholder="Subscription plan" />
                    <input className="w-full rounded-2xl border border-black/10 p-3" name="status" placeholder="Status" />
                    <div className="grid gap-2 md:grid-cols-2">
                      {featureFlags.map((flag) => (
                        <label key={flag} className="flex items-center gap-2 rounded-2xl bg-sand/50 p-3 text-sm">
                          <input name="features" type="checkbox" value={flag} />
                          {flag}
                        </label>
                      ))}
                    </div>
                    <button className="rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white" type="submit">Update school</button>
                  </form>
                </Panel>
              </div>
            ) : null}

            {tab === "users" ? (
              <div className="grid gap-6 lg:grid-cols-2">
                <Panel subtitle="Tenant users" title="People directory">
                  <Items values={(users.data ?? []).map((person) => join([`${person.firstName} ${person.lastName}`, person.role, person.email, person.emailVerified ? "verified" : "pending"]))} />
                </Panel>
                <div className="space-y-6">
                  <Panel subtitle="Admin-managed onboarding" title="Add school users">
                    <p className="text-sm leading-7 text-black/70">Use this for teachers, parents, and school admins. Student registration is handled below with profile media and supporting documents.</p>
                    <form className="space-y-3" onSubmit={(e) => handle(e, (fd) => createUser(session, {
                      firstName: String(fd.get("firstName")),
                      lastName: String(fd.get("lastName")),
                      email: String(fd.get("email")),
                      password: String(fd.get("password")),
                      role: String(fd.get("role"))
                    }), ["users"], "User created for this school.")}>
                      <input className="w-full rounded-2xl border border-black/10 p-3" name="firstName" placeholder="First name" />
                      <input className="w-full rounded-2xl border border-black/10 p-3" name="lastName" placeholder="Last name" />
                      <input className="w-full rounded-2xl border border-black/10 p-3" name="email" placeholder="Email" />
                      <input className="w-full rounded-2xl border border-black/10 p-3" name="password" placeholder="Temporary password" type="password" />
                      <select className="w-full rounded-2xl border border-black/10 p-3" defaultValue="TEACHER" name="role">
                        {schoolRoles.filter((role) => role !== "STUDENT").map((role) => <option key={role} value={role}>{role}</option>)}
                      </select>
                      <button className="rounded-full bg-ember px-5 py-3 text-sm font-semibold text-white" type="submit">Add user</button>
                    </form>
                  </Panel>

                  <Panel subtitle="Student intake" title="Register student">
                    <form className="space-y-4" onSubmit={(e) => handle(e, (fd) => createUser(session, {
                      firstName: String(fd.get("firstName")),
                      lastName: String(fd.get("lastName")),
                      email: String(fd.get("email")),
                      password: String(fd.get("password")),
                      role: "STUDENT"
                    }), ["users"], `Student registered${studentPhoto ? ` with profile photo ${studentPhoto.name}` : ""}${studentDocuments.length ? ` and ${studentDocuments.length} supporting document(s)` : ""}.`, () => {
                      setStudentPhoto(null);
                      setStudentDocuments([]);
                    })}>
                      <div className="grid gap-3 md:grid-cols-2">
                        <input className="rounded-2xl border border-black/10 p-3" name="firstName" placeholder="Student first name" />
                        <input className="rounded-2xl border border-black/10 p-3" name="lastName" placeholder="Student last name" />
                        <input className="rounded-2xl border border-black/10 p-3" name="email" placeholder="Student email" />
                        <input className="rounded-2xl border border-black/10 p-3" name="password" placeholder="Temporary password" type="password" />
                        <input className="rounded-2xl border border-black/10 p-3" name="admissionNumber" placeholder="Admission number" />
                        <input className="rounded-2xl border border-black/10 p-3" name="dateOfBirth" type="date" />
                        <input className="rounded-2xl border border-black/10 p-3 md:col-span-2" name="guardianName" placeholder="Parent or guardian name" />
                      </div>

                      <UploadGrid hint="Passport-style photo for personalized profiles" items={studentPhoto ? [studentPhoto] : []} label="Student profile photo" name="studentPhoto" onSelect={(files) => validateFiles("studentPhoto", files)} />
                      <UploadGrid hint="Birth certificate, immunization card, ID slip, or similar school records" items={studentDocuments} label="Supporting documents" multiple name="studentDocuments" onSelect={(files) => validateFiles("studentDocuments", files)} />

                      <button className="rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white" type="submit">Register student</button>
                    </form>
                  </Panel>
                </div>
              </div>
            ) : null}

            {tab === "academics" ? (
              <div className="grid gap-6 lg:grid-cols-2">
                <Panel subtitle="Years and classes" title="Academic setup">
                  <form className="space-y-3" onSubmit={(e) => handle(e, (fd) => createAcademicYear(session, {
                    name: String(fd.get("name")),
                    startDate: String(fd.get("startDate")),
                    endDate: String(fd.get("endDate")),
                    active: fd.get("active") === "on"
                  }), ["years"], "Academic year created.")}>
                    <input className="w-full rounded-2xl border border-black/10 p-3" name="name" placeholder="Academic year" />
                    <input className="w-full rounded-2xl border border-black/10 p-3" name="startDate" type="date" />
                    <input className="w-full rounded-2xl border border-black/10 p-3" name="endDate" type="date" />
                    <label className="flex items-center gap-2 text-sm"><input name="active" type="checkbox" />Active</label>
                    <button className="rounded-full bg-ember px-5 py-3 text-sm font-semibold text-white" type="submit">Create year</button>
                  </form>
                  <form className="space-y-3" onSubmit={(e) => handle(e, (fd) => createClass(session, {
                    name: String(fd.get("name")),
                    levelName: String(fd.get("levelName")),
                    classTeacherId: String(fd.get("classTeacherId") || "")
                  }), ["classes"], "Class created.")}>
                    <input className="w-full rounded-2xl border border-black/10 p-3" name="name" placeholder="Class name" />
                    <input className="w-full rounded-2xl border border-black/10 p-3" name="levelName" placeholder="Level" />
                    <input className="w-full rounded-2xl border border-black/10 p-3" name="classTeacherId" placeholder="Teacher ID" />
                    <button className="rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white" type="submit">Create class</button>
                  </form>
                </Panel>
                <Panel subtitle="At a glance" title="Academic activity">
                  <Items values={[
                    `Academic years: ${years.data?.length ?? 0}`,
                    `Classes: ${classes.data?.length ?? 0}`,
                    `Attendance tracked: ${dashboard.data?.presentAttendanceRecords ?? 0}`,
                    `Exams tracked: ${dashboard.data?.examsCount ?? 0}`
                  ]} />
                  <form className="space-y-3" onSubmit={(e) => handle(e, (fd) => createExam(session, {
                    name: String(fd.get("name")),
                    subjectId: String(fd.get("subjectId")),
                    classId: String(fd.get("classId")),
                    termId: String(fd.get("termId")),
                    maxScore: Number(fd.get("maxScore")),
                    examDate: String(fd.get("examDate"))
                  }), [], "Exam created.")}>
                    <input className="w-full rounded-2xl border border-black/10 p-3" name="name" placeholder="Exam name" />
                    <input className="w-full rounded-2xl border border-black/10 p-3" name="subjectId" placeholder="Subject ID" />
                    <input className="w-full rounded-2xl border border-black/10 p-3" name="classId" placeholder="Class ID" />
                    <input className="w-full rounded-2xl border border-black/10 p-3" name="termId" placeholder="Term ID" />
                    <input className="w-full rounded-2xl border border-black/10 p-3" name="maxScore" placeholder="Max score" type="number" />
                    <input className="w-full rounded-2xl border border-black/10 p-3" name="examDate" type="date" />
                    <button className="rounded-full bg-ember px-5 py-3 text-sm font-semibold text-white" type="submit">Create exam</button>
                  </form>
                </Panel>
              </div>
            ) : null}

            {tab === "finance" ? (
              <div className="grid gap-6 lg:grid-cols-2">
                <Panel subtitle="Fees and collections" title="Finance summary">
                  <Items values={[
                    `Invoiced: ${finance.data?.totalInvoiced ?? 0}`,
                    `Collected: ${finance.data?.totalCollected ?? 0}`,
                    `Outstanding: ${finance.data?.outstandingBalance ?? 0}`
                  ]} />
                </Panel>
                <Panel subtitle="Finance operations" title="Create fee structure">
                  <form className="space-y-3" onSubmit={(e) => handle(e, (fd) => createFeeStructure(session, {
                    name: String(fd.get("name")),
                    classId: String(fd.get("classId")),
                    amount: Number(fd.get("amount")),
                    dueDate: String(fd.get("dueDate"))
                  }), ["finance"], "Fee structure created.")}>
                    <input className="w-full rounded-2xl border border-black/10 p-3" name="name" placeholder="Fee structure name" />
                    <input className="w-full rounded-2xl border border-black/10 p-3" name="classId" placeholder="Class ID" />
                    <input className="w-full rounded-2xl border border-black/10 p-3" name="amount" placeholder="Amount" type="number" />
                    <input className="w-full rounded-2xl border border-black/10 p-3" name="dueDate" type="date" />
                    <button className="rounded-full bg-ember px-5 py-3 text-sm font-semibold text-white" type="submit">Create fee structure</button>
                  </form>
                </Panel>
              </div>
            ) : null}

            {tab === "comms" ? (
              <div className="grid gap-6 lg:grid-cols-2">
                <Panel subtitle="Notifications" title="Announcements and alerts">
                  <Items values={(notifications.data ?? []).map((item) => join([item.subject, item.status]))} />
                  <form className="space-y-3" onSubmit={(e) => handle(e, (fd) => createAnnouncement(session, {
                    title: String(fd.get("title")),
                    content: String(fd.get("content")),
                    audience: String(fd.get("audience"))
                  }), ["announcements"], "Announcement created.")}>
                    <input className="w-full rounded-2xl border border-black/10 p-3" name="title" placeholder="Announcement title" />
                    <textarea className="w-full rounded-2xl border border-black/10 p-3" name="content" placeholder="Content" rows={4} />
                    <select className="w-full rounded-2xl border border-black/10 p-3" defaultValue="SCHOOL_WIDE" name="audience">
                      <option>SCHOOL_WIDE</option>
                      <option>TEACHERS</option>
                      <option>STUDENTS</option>
                      <option>PARENTS</option>
                      <option>CLASS_SPECIFIC</option>
                    </select>
                    <button className="rounded-full bg-ember px-5 py-3 text-sm font-semibold text-white" type="submit">Create announcement</button>
                  </form>
                  <form className="space-y-3" onSubmit={(e) => handle(e, (fd) => createInAppNotification(session, {
                    recipientUserId: String(fd.get("recipientUserId")),
                    subject: String(fd.get("subject")),
                    content: String(fd.get("content"))
                  }), ["notifications"], "In-app notification queued.")}>
                    <input className="w-full rounded-2xl border border-black/10 p-3" name="recipientUserId" placeholder="Recipient user ID" />
                    <input className="w-full rounded-2xl border border-black/10 p-3" name="subject" placeholder="Subject" />
                    <textarea className="w-full rounded-2xl border border-black/10 p-3" name="content" placeholder="Content" rows={3} />
                    <button className="rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white" type="submit">Send notification</button>
                  </form>
                </Panel>
                <Panel subtitle="Teacher-parent communication" title="Messages">
                  <Items values={(messages.data ?? []).map((item) => join([item.senderUserId, item.recipientUserId, item.body]))} />
                  <form className="space-y-3" onSubmit={(e) => handle(e, (fd) => sendMessage(session, {
                    recipientUserId: String(fd.get("recipientUserId")),
                    body: String(fd.get("body"))
                  }), ["messages"], "Message sent.")}>
                    <input className="w-full rounded-2xl border border-black/10 p-3" name="recipientUserId" placeholder="Recipient user ID" />
                    <textarea className="w-full rounded-2xl border border-black/10 p-3" name="body" placeholder="Message body" rows={4} />
                    <button className="rounded-full bg-ember px-5 py-3 text-sm font-semibold text-white" type="submit">Send message</button>
                  </form>
                </Panel>
              </div>
            ) : null}
          </div>
        </main>
      </div>
    </div>
  );
}
