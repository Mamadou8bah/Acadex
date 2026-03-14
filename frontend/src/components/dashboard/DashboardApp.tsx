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
  updateSchool
} from "../../features/platform/api";
import { useAuthStore } from "../../store/auth";
import type { FeatureFlag, PlatformRole, SubscriptionPlan } from "../../types";
import { MetricCard } from "../MetricCard";
import { Sidebar } from "../Sidebar";

type Tab = "overview" | "tenants" | "users" | "academics" | "finance" | "comms";

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

function Panel({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <section className="rounded-[2rem] bg-white p-6 shadow-sm">
      <p className="text-xs uppercase tracking-[0.2em] text-black/45">{subtitle}</p>
      <h3 className="mt-2 font-display text-3xl">{title}</h3>
      <div className="mt-5 space-y-4">{children}</div>
    </section>
  );
}

function Items({ values }: { values: string[] }) {
  return values.length ? (
    <div className="space-y-2">
      {values.map((value) => (
        <div key={value} className="rounded-2xl bg-sand/60 p-3 text-sm">
          {value}
        </div>
      ))}
    </div>
  ) : (
    <p className="text-sm text-black/50">No records yet.</p>
  );
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
    success?: string
  ) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await run(() => action(form), refresh, success);
    event.currentTarget.reset();
  }

  const sidebarItems = tabs.map((item) => ({
    label: item.charAt(0).toUpperCase() + item.slice(1),
    code: item.slice(0, 2).toUpperCase(),
    active: tab === item,
    onClick: () => setTab(item)
  }));

  return (
    <div className="min-h-screen p-4 text-ink md:p-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 lg:flex-row">
        <Sidebar
          items={sidebarItems}
          subtitle={isSuperAdmin ? "Platform owner workspace" : "School admin workspace"}
          title={isSuperAdmin ? "Admin Control" : "School Dashboard"}
        />

        <main className="flex-1 rounded-[2rem] border border-black/5 bg-white/55 p-6 shadow-xl shadow-black/5 backdrop-blur md:p-8">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-[2rem] bg-white/80 p-5">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-black/45">Authenticated session</p>
              <h2 className="mt-2 font-display text-3xl">{user.firstName} {user.lastName}</h2>
              <p className="text-sm text-black/60">{join([user.email, user.role, `tenant ${user.tenantId}`])}</p>
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
                <MetricCard label="Enrollments" value={String(dashboard.data?.studentEnrollments ?? 0)} detail="Student enrollment activity across the tenant." />
                <MetricCard label="Attendance" value={String(dashboard.data?.presentAttendanceRecords ?? 0)} detail="Present attendance entries currently tracked." />
                <MetricCard label="Collections" value={String(dashboard.data?.totalCollected ?? 0)} detail="Captured payments from the finance module." />
              </section>
              <div className="grid gap-6 lg:grid-cols-[1.45fr_1fr]">
                <Panel title="Operating picture" subtitle="Analytics">
                  <Items values={[
                    `Classes: ${dashboard.data?.classesCount ?? 0}`,
                    `Exams: ${dashboard.data?.examsCount ?? 0}`,
                    `Teacher assignments: ${dashboard.data?.teacherAssignments ?? 0}`,
                    `Academic years: ${years.data?.length ?? 0}`
                  ]} />
                </Panel>
                <Panel title="Recent announcements" subtitle="Comms">
                  <Items values={(announcements.data?.content ?? []).map((item) => join([item.title, item.audience])).slice(0, 5)} />
                </Panel>
              </div>
            </div>
          ) : null}

          {tab === "tenants" && isSuperAdmin ? (
            <div className="grid gap-6 lg:grid-cols-2">
              <Panel title="Add school" subtitle="Platform onboarding">
                <p className="text-sm text-black/60">New schools are created here together with their first school admin. Public registration is disabled.</p>
                <form className="grid gap-3 md:grid-cols-2" onSubmit={(e) => handle(e, (fd) => registerSchoolAdmin({
                  schoolName: String(fd.get("schoolName")),
                  schoolSlug: String(fd.get("schoolSlug")),
                  schoolEmail: String(fd.get("schoolEmail")),
                  adminFirstName: String(fd.get("adminFirstName")),
                  adminLastName: String(fd.get("adminLastName")),
                  adminEmail: String(fd.get("adminEmail")),
                  password: String(fd.get("password")),
                  subscriptionPlan: String(fd.get("subscriptionPlan")) as SubscriptionPlan
                }), ["schools"], "School and first school admin created.")}>
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
                  <button className="rounded-full bg-ember px-5 py-3 text-sm font-semibold text-white md:col-span-2" type="submit">Add school</button>
                </form>
              </Panel>

              <Panel title="Existing schools" subtitle="Plans and controls">
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
              <Panel title="People directory" subtitle="Tenant users">
                <Items values={(users.data ?? []).map((person) => join([`${person.firstName} ${person.lastName}`, person.role, person.email, person.emailVerified ? "verified" : "pending"]))} />
              </Panel>
              <Panel title="Add school users" subtitle="Admin-managed onboarding">
                <p className="text-sm text-black/60">School admins add teachers, students, parents, and additional school admins from inside the dashboard.</p>
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
                    {schoolRoles.map((role) => <option key={role} value={role}>{role}</option>)}
                  </select>
                  <button className="rounded-full bg-ember px-5 py-3 text-sm font-semibold text-white" type="submit">Add user</button>
                </form>
              </Panel>
            </div>
          ) : null}

          {tab === "academics" ? (
            <div className="grid gap-6 lg:grid-cols-2">
              <Panel title="Academic setup" subtitle="Years and classes">
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
              <Panel title="Academic activity" subtitle="At a glance">
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
              <Panel title="Finance summary" subtitle="Fees and collections">
                <Items values={[
                  `Invoiced: ${finance.data?.totalInvoiced ?? 0}`,
                  `Collected: ${finance.data?.totalCollected ?? 0}`,
                  `Outstanding: ${finance.data?.outstandingBalance ?? 0}`
                ]} />
              </Panel>
              <Panel title="Create fee structure" subtitle="Finance operations">
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
              <Panel title="Announcements and alerts" subtitle="Notifications">
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
              <Panel title="Messages" subtitle="Teacher-parent communication">
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
        </main>
      </div>
    </div>
  );
}
