import { FormEvent, ReactNode, useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { registerSchoolAdmin } from "../../features/auth/api";
import {
  createUser,
  downloadReportCard,
  fetchAcademicYears,
  fetchAnnouncements,
  fetchAttendanceReport,
  fetchClasses,
  fetchDashboardAnalytics,
  fetchEnrollments,
  fetchExams,
  fetchFinanceSummary,
  fetchMessages,
  fetchMySubjectAssignments,
  fetchNotifications,
  fetchOutstanding,
  fetchPaymentHistory,
  fetchRanking,
  fetchReportCard,
  fetchSchools,
  fetchSubjectAssignments,
  fetchSubjects,
  fetchTerms,
  fetchUsers,
  fetchVisibleUsers,
  markAttendance,
  recordScore,
  uploadManagedFile,
  updateSchool,
  validateFileUpload
} from "../../features/platform/api";
import { useAuthStore } from "../../store/auth";
import type { FeatureFlag, PlatformRole, SubscriptionPlan } from "../../types";
import { MetricCard } from "../MetricCard";
import { Sidebar } from "../Sidebar";
import { AcademicTab } from "./AcademicTab";
import { CommsTab } from "./CommsTab";
import { FinanceTab } from "./FinanceTab";
import { Items, Panel } from "./shared";

type Tab = "overview" | "tenants" | "users" | "teachers" | "students" | "academics" | "finance" | "comms";
type FileBucket = "schoolLogo" | "studentPhoto" | "studentDocuments";

interface UploadItem {
  name: string;
  size: number;
  contentType: string;
  provider: "CLOUDINARY" | "UPLOADTHING";
  url: string;
  fileKey: string;
}

interface StudentSummary {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  verified: boolean;
  className: string;
  enrollmentStatus: string;
}

interface TeacherSummary {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  verified: boolean;
  classes: string[];
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

function formatNumber(value: number) {
  return new Intl.NumberFormat().format(value);
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(value);
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function thirtyDaysAgo() {
  const date = new Date();
  date.setDate(date.getDate() - 30);
  return date.toISOString().slice(0, 10);
}

function polarToCartesian(cx: number, cy: number, radius: number, angleInDegrees: number) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(angleInRadians),
    y: cy + radius * Math.sin(angleInRadians)
  };
}

function describeArc(cx: number, cy: number, radius: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(cx, cy, radius, endAngle);
  const end = polarToCartesian(cx, cy, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
}

function MiniLegend({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div className="rounded-2xl bg-sand/55 p-3">
      <div className="flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-black/45">
        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: tone }} />
        {label}
      </div>
      <p className="mt-2 text-lg font-semibold text-ink">{value}</p>
    </div>
  );
}

function BarChart({
  title,
  items
}: {
  title: string;
  items: Array<{ label: string; value: number; color: string }>;
}) {
  const max = Math.max(...items.map((item) => item.value), 1);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-black/60">{title}</p>
        <p className="text-xs uppercase tracking-[0.16em] text-black/45">Live values</p>
      </div>
      <div className="rounded-[1.6rem] bg-[#fbf6ee] p-4">
        <svg aria-label={title} className="h-64 w-full" role="img" viewBox="0 0 420 220">
          <line stroke="rgba(17,24,39,0.1)" strokeWidth="1" x1="28" x2="392" y1="188" y2="188" />
          {items.map((item, index) => {
            const barWidth = 58;
            const gap = 28;
            const x = 40 + index * (barWidth + gap);
            const height = Math.max((item.value / max) * 132, 10);
            const y = 188 - height;

            return (
              <g key={item.label}>
                <rect fill={item.color} height={height} opacity="0.9" rx="18" width={barWidth} x={x} y={y} />
                <text fill="#111827" fontSize="13" fontWeight="700" textAnchor="middle" x={x + barWidth / 2} y={y - 10}>
                  {formatNumber(item.value)}
                </text>
                <text fill="rgba(17,24,39,0.6)" fontSize="12" textAnchor="middle" x={x + barWidth / 2} y="208">
                  {item.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

function DonutChart({
  label,
  total,
  segments
}: {
  label: string;
  total: number;
  segments: Array<{ label: string; value: number; color: string }>;
}) {
  let angle = 0;

  return (
    <div className="grid gap-4 lg:grid-cols-[180px_1fr] lg:items-center">
      <div className="mx-auto w-[180px]">
        <svg aria-label={label} className="h-[180px] w-[180px]" role="img" viewBox="0 0 180 180">
          <circle cx="90" cy="90" fill="none" r="58" stroke="rgba(17,24,39,0.08)" strokeWidth="16" />
          {segments.map((segment) => {
            const sweep = total > 0 ? (segment.value / total) * 359.99 : 0;
            const path = describeArc(90, 90, 58, angle, angle + sweep);
            angle += sweep;
            return <path d={path} fill="none" key={segment.label} stroke={segment.color} strokeLinecap="round" strokeWidth="16" />;
          })}
          <text fill="#111827" fontSize="28" fontWeight="700" textAnchor="middle" x="90" y="86">
            {formatNumber(total)}
          </text>
          <text fill="rgba(17,24,39,0.58)" fontSize="12" letterSpacing="2" textAnchor="middle" x="90" y="106">
            TOTAL
          </text>
        </svg>
      </div>
      <div className="grid gap-3">
        {segments.map((segment) => (
          <MiniLegend
            key={segment.label}
            label={segment.label}
            tone={segment.color}
            value={`${formatNumber(segment.value)} • ${total > 0 ? Math.round((segment.value / total) * 100) : 0}%`}
          />
        ))}
      </div>
    </div>
  );
}

function HorizontalComparisonChart({
  items
}: {
  items: Array<{ label: string; value: number; color: string; format?: (value: number) => string }>;
}) {
  const max = Math.max(...items.map((item) => item.value), 1);

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div key={item.label} className="space-y-2">
          <div className="flex items-center justify-between gap-4 text-sm">
            <span className="font-medium text-black/75">{item.label}</span>
            <span className="font-semibold text-ink">{(item.format ?? formatNumber)(item.value)}</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-black/5">
            <div
              className="h-full rounded-full"
              style={{ backgroundColor: item.color, width: `${Math.max((item.value / max) * 100, item.value > 0 ? 10 : 0)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function UploadChip({ item }: { item: UploadItem }) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-sand/60 px-4 py-3 text-sm">
      <div className="min-w-0 pr-3">
        <span className="block truncate text-black/85">{item.name}</span>
        <span className="block text-xs uppercase tracking-[0.16em] text-black/45">{item.provider}</span>
      </div>
      <span className="whitespace-nowrap text-black/55">{bytes(item.size)}</span>
    </div>
  );
}

function StudentList({
  students,
  selectedStudentId,
  onSelect
}: {
  students: StudentSummary[];
  selectedStudentId: string | null;
  onSelect: (studentId: string) => void;
}) {
  if (!students.length) {
    return <p className="text-sm text-black/50">No students available.</p>;
  }

  return (
    <div className="space-y-2">
      {students.map((student) => (
        <button
          className={`w-full rounded-2xl border px-4 py-3 text-left transition ${
            selectedStudentId === student.id ? "border-ink bg-ink text-white" : "border-black/5 bg-sand/60 text-black/80"
          }`}
          key={student.id}
          onClick={() => onSelect(student.id)}
          type="button"
        >
          <p className="font-semibold">{student.name}</p>
          <p className={`mt-1 text-sm ${selectedStudentId === student.id ? "text-white/80" : "text-black/55"}`}>{student.className}</p>
        </button>
      ))}
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

function StudentIcon() {
  return <IconWrapper><svg aria-hidden="true" fill="none" viewBox="0 0 24 24"><path d="M12 5 4 9l8 4 8-4-8-4Zm-5 7v3.5C7 17.4 9.5 19 12 19s5-1.6 5-3.5V12" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" /></svg></IconWrapper>;
}

function TeacherIcon() {
  return <IconWrapper><svg aria-hidden="true" fill="none" viewBox="0 0 24 24"><path d="M12 5a4 4 0 1 1 0 8 4 4 0 0 1 0-8Zm-7 14a7 7 0 0 1 14 0" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" /></svg></IconWrapper>;
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
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [attendanceMode, setAttendanceMode] = useState(false);
  const [attendanceDraft, setAttendanceDraft] = useState<Record<string, "PRESENT" | "ABSENT">>({});
  const [studentSearch, setStudentSearch] = useState("");
  const [studentSort, setStudentSort] = useState<"name-asc" | "name-desc" | "class-asc">("name-asc");
  const [studentClassFilter, setStudentClassFilter] = useState("ALL");
  const [teacherSearch, setTeacherSearch] = useState("");
  const [teacherSort, setTeacherSort] = useState<"name-asc" | "name-desc" | "classes-desc">("name-asc");

  const session = { accessToken, tenantId };
  const isSuperAdmin = user.role === "SUPER_ADMIN";
  const isSchoolAdmin = user.role === "SCHOOL_ADMIN";
  const isTeacher = user.role === "TEACHER";
  const isStudent = user.role === "STUDENT";
  const isParent = user.role === "PARENT";

  const tabs = useMemo<Tab[]>(
    () => {
      if (isSuperAdmin) return ["overview", "tenants", "users", "teachers", "students", "academics", "finance", "comms"];
      if (isSchoolAdmin) return ["overview", "users", "teachers", "students", "academics", "finance", "comms"];
      if (isTeacher) return ["overview", "students", "academics", "comms"];
      if (isStudent) return ["overview", "students", "academics", "finance", "comms"];
      if (isParent) return ["overview", "students", "finance", "comms"];
      return ["overview"];
    },
    [isParent, isSchoolAdmin, isStudent, isSuperAdmin, isTeacher]
  );

  const dashboard = useQuery({ queryKey: ["dashboard"], queryFn: () => fetchDashboardAnalytics(session) });
  const announcements = useQuery({ queryKey: ["announcements"], queryFn: () => fetchAnnouncements(session) });
  const schools = useQuery({ queryKey: ["schools"], enabled: isSuperAdmin, queryFn: () => fetchSchools(session) });
  const users = useQuery({ queryKey: ["users"], enabled: isSchoolAdmin || isSuperAdmin, queryFn: () => fetchUsers(session) });
  const visibleUsers = useQuery({
    queryKey: ["visible-users"],
    enabled: !isSchoolAdmin && !isSuperAdmin,
    queryFn: () => fetchVisibleUsers(session)
  });
  const years = useQuery({ queryKey: ["years"], queryFn: () => fetchAcademicYears(session) });
  const terms = useQuery({ queryKey: ["terms"], queryFn: () => fetchTerms(session) });
  const classes = useQuery({ queryKey: ["classes"], queryFn: () => fetchClasses(session) });
  const subjects = useQuery({ queryKey: ["subjects"], queryFn: () => fetchSubjects(session) });
  const subjectAssignments = useQuery({
    queryKey: ["subject-assignments"],
    enabled: isSchoolAdmin || isSuperAdmin,
    queryFn: () => fetchSubjectAssignments(session)
  });
  const teacherAssignments = useQuery({
    queryKey: ["my-subject-assignments"],
    enabled: isTeacher,
    queryFn: () => fetchMySubjectAssignments(session)
  });
  const enrollments = useQuery({ queryKey: ["enrollments"], queryFn: () => fetchEnrollments(session) });
  const exams = useQuery({
    queryKey: ["exams"],
    enabled: isSchoolAdmin || isSuperAdmin || isTeacher,
    queryFn: () => fetchExams(session)
  });
  const finance = useQuery({
    queryKey: ["finance"],
    enabled: isSchoolAdmin || isSuperAdmin,
    queryFn: () => fetchFinanceSummary(session)
  });
  const notifications = useQuery({ queryKey: ["notifications"], queryFn: () => fetchNotifications(session) });
  const messages = useQuery({ queryKey: ["messages"], queryFn: () => fetchMessages(session) });

  const visibleUserList = isSchoolAdmin || isSuperAdmin ? (users.data ?? []) : (visibleUsers.data ?? []);
  const studentUsers = visibleUserList.filter((person) => person.role === "STUDENT");
  const teacherUsers = (users.data ?? []).filter((person) => person.role === "TEACHER");
  const studentEnrollmentById = new Map((enrollments.data ?? []).map((item) => [item.studentId, item]));
  const classById = new Map((classes.data ?? []).map((item) => [item.id, item]));
  const defaultClassId = useMemo(() => {
    if (isTeacher) return teacherAssignments.data?.[0]?.classId ?? "";
    if (isStudent) return studentEnrollmentById.get(user.id)?.classId ?? "";
    return classes.data?.[0]?.id ?? "";
  }, [classes.data, isStudent, isTeacher, studentEnrollmentById, teacherAssignments.data, user.id]);
  const defaultStudentId = useMemo(() => {
    if (isStudent) return user.id;
    if (isTeacher) return studentUsers[0]?.id ?? "";
    return users.data?.find((person) => person.role === "STUDENT")?.id ?? "";
  }, [isStudent, isTeacher, studentUsers, user.id, users.data]);
  const reportStartDate = thirtyDaysAgo();
  const reportEndDate = today();

  const attendanceReport = useQuery({
    queryKey: ["attendance-report", defaultClassId, reportStartDate, reportEndDate],
    enabled: Boolean(defaultClassId),
    queryFn: () => fetchAttendanceReport(session, defaultClassId, reportStartDate, reportEndDate)
  });
  const ranking = useQuery({
    queryKey: ["ranking", defaultClassId],
    enabled: Boolean(defaultClassId),
    queryFn: () => fetchRanking(session, defaultClassId)
  });
  const reportCard = useQuery({
    queryKey: ["report-card", defaultStudentId],
    enabled: Boolean(defaultStudentId),
    queryFn: () => fetchReportCard(session, defaultStudentId)
  });
  const outstanding = useQuery({
    queryKey: ["outstanding", defaultStudentId],
    enabled: Boolean(defaultStudentId) && !isTeacher && !isParent,
    queryFn: () => fetchOutstanding(session, defaultStudentId)
  });
  const payments = useQuery({
    queryKey: ["payments-history", defaultStudentId],
    enabled: Boolean(defaultStudentId) && !isTeacher && !isParent,
    queryFn: () => fetchPaymentHistory(session, defaultStudentId)
  });

  const studentSummaries: StudentSummary[] = studentUsers.map((student) => {
    const enrollment = studentEnrollmentById.get(student.id);
    const assignedClass = enrollment ? classById.get(enrollment.classId) : null;
    return {
      id: student.id,
      name: `${student.firstName} ${student.lastName}`,
      firstName: student.firstName,
      lastName: student.lastName,
      email: student.email,
      verified: student.emailVerified,
      className: assignedClass ? assignedClass.name : "No class assigned",
      enrollmentStatus: enrollment?.status ?? "Not enrolled"
    };
  });
  const teacherSummaries: TeacherSummary[] = teacherUsers.map((teacher) => {
    const assignedClasses = (classes.data ?? [])
      .filter((schoolClass) => schoolClass.classTeacherId === teacher.id)
      .map((schoolClass) => schoolClass.name);
    return {
      id: teacher.id,
      name: `${teacher.firstName} ${teacher.lastName}`,
      firstName: teacher.firstName,
      lastName: teacher.lastName,
      email: teacher.email,
      verified: teacher.emailVerified,
      classes: assignedClasses
    };
  });
  const filteredStudentSummaries = studentSummaries
    .filter((student) => {
      const query = studentSearch.trim().toLowerCase();
      const classMatches = studentClassFilter === "ALL" || student.className === studentClassFilter;
      if (!classMatches) return false;
      if (!query) return true;
      return [student.name, student.email, student.className, student.enrollmentStatus].some((value) => value.toLowerCase().includes(query));
    })
    .sort((left, right) => {
      if (studentSort === "name-desc") return right.name.localeCompare(left.name);
      if (studentSort === "class-asc") return left.className.localeCompare(right.className) || left.name.localeCompare(right.name);
      return left.name.localeCompare(right.name);
    });
  const teacherAssignedClassNames = Array.from(new Set((teacherAssignments.data ?? []).map((assignment) => assignment.className)));
  const filteredTeacherSummaries = teacherSummaries
    .filter((teacher) => {
      const query = teacherSearch.trim().toLowerCase();
      if (!query) return true;
      return [teacher.name, teacher.email, teacher.classes.join(" ")].some((value) => value.toLowerCase().includes(query));
    })
    .sort((left, right) => {
      if (teacherSort === "name-desc") return right.name.localeCompare(left.name);
      if (teacherSort === "classes-desc") return right.classes.length - left.classes.length || left.name.localeCompare(right.name);
      return left.name.localeCompare(right.name);
    });
  const selectedStudent =
    filteredStudentSummaries.find((student) => student.id === selectedStudentId) ??
    (filteredStudentSummaries.length ? filteredStudentSummaries[0] : null);
  const studentDetailItems = studentSummaries.map((student) =>
    join([student.name, student.email, student.verified ? "verified" : "pending", student.className, student.enrollmentStatus])
  );
  const classDetailItems = (classes.data ?? []).map((schoolClass) => {
    const studentCount = (enrollments.data ?? []).filter((item) => item.classId === schoolClass.id).length;
    const teacherName = teacherUsers.find((teacher) => teacher.id === schoolClass.classTeacherId);
    return join([
      schoolClass.name,
      schoolClass.levelName,
      teacherName ? `${teacherName.firstName} ${teacherName.lastName}` : "No class teacher",
      `${studentCount} students`
    ]);
  });
  const overviewMetrics = isSuperAdmin || isSchoolAdmin
    ? [
        { label: "Enrollments", value: String(dashboard.data?.studentEnrollments ?? 0), detail: "Student enrollment activity across the tenant.", icon: <EnrollmentIcon /> },
        { label: "Attendance", value: String(dashboard.data?.presentAttendanceRecords ?? 0), detail: "Present attendance entries currently tracked.", icon: <AttendanceIcon /> },
        { label: "Collections", value: String(dashboard.data?.totalCollected ?? 0), detail: "Captured payments from the finance module.", icon: <CollectionsIcon /> }
      ]
    : isTeacher
      ? [
          { label: "My Classes", value: String(teacherAssignedClassNames.length), detail: "Classes assigned to you this term.", icon: <TeacherIcon /> },
          { label: "My Students", value: String(studentSummaries.length), detail: "Students you can search and grade.", icon: <StudentIcon /> },
          { label: "My Exams", value: String(exams.data?.length ?? 0), detail: "Assessments you can manage.", icon: <AcademicIcon /> }
        ]
      : isStudent
        ? [
            { label: "My Class", value: selectedStudent?.className ?? "Unassigned", detail: "Current class placement.", icon: <StudentIcon /> },
            { label: "Report Rows", value: String(reportCard.data?.rows?.length ?? 0), detail: "Subjects and exams on your report card.", icon: <AcademicIcon /> },
            { label: "Attendance", value: String(attendanceReport.data?.totalRecords ?? 0), detail: "Attendance records visible for your class.", icon: <AttendanceIcon /> }
          ]
        : [
            { label: "Notifications", value: String(notifications.data?.length ?? 0), detail: "Alerts sent directly to this account.", icon: <CommsIcon /> },
            { label: "Messages", value: String(messages.data?.length ?? 0), detail: "Conversation threads relevant to you.", icon: <UsersIcon /> },
            { label: "Announcements", value: String(announcements.data?.content?.length ?? 0), detail: "Audience-filtered school updates.", icon: <SchoolIcon /> }
          ];
  const overviewBarItems = isSuperAdmin || isSchoolAdmin
    ? [
        { label: "Classes", value: dashboard.data?.classesCount ?? 0, color: "#d97706" },
        { label: "Exams", value: dashboard.data?.examsCount ?? 0, color: "#0f766e" },
        { label: "Teachers", value: dashboard.data?.teacherAssignments ?? 0, color: "#1d4ed8" },
        { label: "Years", value: years.data?.length ?? 0, color: "#7c3aed" }
      ]
    : isTeacher
      ? [
          { label: "Classes", value: teacherAssignedClassNames.length, color: "#d97706" },
          { label: "Subjects", value: teacherAssignments.data?.length ?? 0, color: "#0f766e" },
          { label: "Students", value: studentSummaries.length, color: "#1d4ed8" },
          { label: "Exams", value: exams.data?.length ?? 0, color: "#7c3aed" }
        ]
      : isStudent
        ? [
            { label: "Rows", value: reportCard.data?.rows?.length ?? 0, color: "#d97706" },
            { label: "Total", value: Math.round(reportCard.data?.totalScore ?? 0), color: "#0f766e" },
            { label: "Present", value: attendanceReport.data?.byStatus?.PRESENT ?? 0, color: "#1d4ed8" },
            { label: "Absent", value: attendanceReport.data?.byStatus?.ABSENT ?? 0, color: "#dc2626" }
          ]
        : [
            { label: "Alerts", value: notifications.data?.length ?? 0, color: "#d97706" },
            { label: "Msgs", value: messages.data?.length ?? 0, color: "#0f766e" },
            { label: "Posts", value: announcements.data?.content?.length ?? 0, color: "#1d4ed8" },
            { label: "Unread", value: (notifications.data ?? []).filter((item) => item.status !== "SENT").length, color: "#7c3aed" }
          ];
  const overviewDonutSegments = isTeacher
    ? [
        { label: "Present", value: attendanceReport.data?.byStatus?.PRESENT ?? 0, color: "#15803d" },
        { label: "Absent", value: attendanceReport.data?.byStatus?.ABSENT ?? 0, color: "#dc2626" }
      ]
    : isStudent
      ? [
          { label: "Present", value: attendanceReport.data?.byStatus?.PRESENT ?? 0, color: "#15803d" },
          { label: "Absent", value: attendanceReport.data?.byStatus?.ABSENT ?? 0, color: "#dc2626" }
        ]
      : isParent
        ? [
            { label: "Messages", value: messages.data?.length ?? 0, color: "#15803d" },
            { label: "Notifications", value: notifications.data?.length ?? 0, color: "#dc2626" }
          ]
        : [
            { label: "Present", value: dashboard.data?.presentAttendanceRecords ?? 0, color: "#15803d" },
            { label: "Absent", value: dashboard.data?.absentAttendanceRecords ?? 0, color: "#dc2626" }
          ];
  const overviewDonutTotal = overviewDonutSegments.reduce((sum, item) => sum + item.value, 0);
  const overviewComparisonItems = isSuperAdmin || isSchoolAdmin
    ? [
        { label: "Invoiced", value: finance.data?.totalInvoiced ?? dashboard.data?.totalInvoiced ?? 0, color: "#b45309", format: formatCurrency },
        { label: "Collected", value: finance.data?.totalCollected ?? dashboard.data?.totalCollected ?? 0, color: "#2563eb", format: formatCurrency },
        { label: "Outstanding", value: finance.data?.outstandingBalance ?? Math.max((dashboard.data?.totalInvoiced ?? 0) - (dashboard.data?.totalCollected ?? 0), 0), color: "#111827", format: formatCurrency }
      ]
    : isTeacher
      ? [
          { label: "Assigned classes", value: teacherAssignedClassNames.length, color: "#b45309", format: formatNumber },
          { label: "Assigned subjects", value: teacherAssignments.data?.length ?? 0, color: "#2563eb", format: formatNumber },
          { label: "Searchable students", value: studentSummaries.length, color: "#111827", format: formatNumber }
        ]
      : isStudent
        ? [
            { label: "Report total", value: reportCard.data?.totalScore ?? 0, color: "#b45309", format: formatNumber },
            { label: "Outstanding", value: outstanding.data?.totalOutstanding ?? 0, color: "#2563eb", format: formatCurrency },
            { label: "Payments", value: payments.data?.length ?? 0, color: "#111827", format: formatNumber }
          ]
        : [
            { label: "Messages", value: messages.data?.length ?? 0, color: "#b45309", format: formatNumber },
            { label: "Notifications", value: notifications.data?.length ?? 0, color: "#2563eb", format: formatNumber },
            { label: "Announcements", value: announcements.data?.content?.length ?? 0, color: "#111827", format: formatNumber }
          ];

  useEffect(() => {
    if (!tabs.includes(tab)) {
      setTab(tabs[0] ?? "overview");
    }
  }, [tab, tabs]);

  useEffect(() => {
    if (!studentSummaries.length) {
      setSelectedStudentId(null);
      return;
    }

    if (!selectedStudentId || !studentSummaries.some((student) => student.id === selectedStudentId)) {
      setSelectedStudentId(studentSummaries[0].id);
    }
  }, [selectedStudentId, studentSummaries]);

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
      const uploaded = await Promise.all(
        Array.from(files).map(async (file) => {
          const result = await validateFileUpload(session, file);
          const uploadBucket =
            bucket === "schoolLogo"
              ? "school-logo"
              : bucket === "studentPhoto"
                ? "student-photo"
                : "student-document";
          const stored = await uploadManagedFile(session, file, uploadBucket);
          return {
            name: file.name,
            size: result.size,
            contentType: result.contentType,
            provider: stored.provider,
            url: stored.url,
            fileKey: stored.fileKey
          };
        })
      );

      if (bucket === "schoolLogo") {
        setSchoolLogo(uploaded[0] ?? null);
      } else if (bucket === "studentPhoto") {
        setStudentPhoto(uploaded[0] ?? null);
      } else {
        setStudentDocuments(uploaded);
      }

      setFlash("Files uploaded successfully and linked to this draft session.");
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "File validation failed.");
    }
  }

  async function handleReportCardDownload(studentId: string) {
    if (!studentId) return;

    try {
      const blob = await downloadReportCard(session, studentId);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `report-card-${studentId}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
      setFlash("Report card downloaded.");
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to download report card.");
    }
  }

  const sidebarItems = tabs.map((item) => {
    const icons: Record<Tab, ReactNode> = {
      overview: <OverviewIcon />,
      tenants: <SchoolIcon />,
      users: <UsersIcon />,
      teachers: <TeacherIcon />,
      students: <StudentIcon />,
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
                <section className="rounded-[2rem] border border-black/5 bg-white/82 p-5 shadow-sm">
                  <p className="text-xs uppercase tracking-[0.24em] text-black/50">Workspace mode</p>
                  <h3 className="mt-2 font-display text-2xl">
                    {isSuperAdmin
                      ? "Platform-wide oversight"
                      : isSchoolAdmin
                        ? "School operations command center"
                        : isTeacher
                          ? "Teaching and class activity view"
                          : isStudent
                            ? "Student progress snapshot"
                            : "Parent engagement snapshot"}
                  </h3>
                  <p className="mt-2 max-w-3xl text-sm leading-7 text-black/65">
                    {isSuperAdmin
                      ? "You are seeing the full multi-school control surface."
                      : isSchoolAdmin
                        ? "This view is scoped to one school tenant, so school administrators only manage their own institution."
                        : isTeacher
                          ? "Teachers can monitor academic activity and communication without school-wide admin controls."
                          : isStudent
                            ? "Students can track their own learning and finance information without administrative actions."
                            : "Parents can follow communications and finance status without access to internal school management tools."}
                  </p>
                </section>
                <section className="grid gap-4 md:grid-cols-3">
                  {overviewMetrics.map((metric) => (
                    <MetricCard detail={metric.detail} icon={metric.icon} key={metric.label} label={metric.label} value={metric.value} />
                  ))}
                </section>
                <div className="grid gap-6 xl:grid-cols-[1.2fr_0.9fr]">
                  <Panel subtitle="Analytics" title="Operating picture">
                    <BarChart
                      items={overviewBarItems}
                      title={
                        isTeacher
                          ? "Assigned classroom workload"
                          : isStudent
                            ? "My learning snapshot"
                            : isParent
                              ? "My communication overview"
                              : "Core academic operations"
                      }
                    />
                  </Panel>
                  <Panel subtitle={isParent ? "Inbox" : "Attendance"} title={isParent ? "Messages and alerts" : "Presence mix"}>
                    <DonutChart label="Overview distribution" segments={overviewDonutSegments} total={overviewDonutTotal} />
                  </Panel>
                </div>
                <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
                  <Panel subtitle={isTeacher ? "Teaching" : isStudent ? "Progress" : isParent ? "Visibility" : "Finance"} title={isTeacher ? "Teaching health" : isStudent ? "My current standing" : isParent ? "Family-facing view" : "Revenue health"}>
                    <HorizontalComparisonChart items={overviewComparisonItems} />
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
                  {isSchoolAdmin || isSuperAdmin ? (
                    <Panel subtitle="Students" title="Student details">
                      <Items values={studentDetailItems} />
                    </Panel>
                  ) : null}
                  {isSchoolAdmin || isSuperAdmin ? (
                    <>
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
                    </>
                  ) : (
                    <Panel subtitle="Access" title="Directory visibility">
                      <p className="text-sm leading-7 text-black/70">
                        User creation is limited to school administrators. This demo view lets you inspect the people directory for your tenant only.
                      </p>
                    </Panel>
                  )}
                </div>
              </div>
            ) : null}

            {tab === "teachers" && (isSchoolAdmin || isSuperAdmin) ? (
              <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
                <Panel subtitle="Teachers" title="Teacher directory">
                  <div className="grid gap-3 md:grid-cols-[1fr_180px]">
                    <input
                      className="rounded-2xl border border-black/10 p-3"
                      onChange={(event) => setTeacherSearch(event.target.value)}
                      placeholder="Search teacher, email, or class"
                      value={teacherSearch}
                    />
                    <select
                      className="rounded-2xl border border-black/10 p-3"
                      onChange={(event) => setTeacherSort(event.target.value as "name-asc" | "name-desc" | "classes-desc")}
                      value={teacherSort}
                    >
                      <option value="name-asc">Name A-Z</option>
                      <option value="name-desc">Name Z-A</option>
                      <option value="classes-desc">Most classes</option>
                    </select>
                  </div>
                  <div className="mt-4 space-y-2">
                    {filteredTeacherSummaries.map((teacher) => (
                      <div className="rounded-2xl bg-sand/60 p-4" key={teacher.id}>
                        <p className="font-semibold text-ink">{teacher.name}</p>
                        <p className="mt-1 text-sm text-black/55">{teacher.email}</p>
                        <p className="mt-2 text-sm text-black/70">
                          {teacher.classes.length ? `Classes: ${teacher.classes.join(", ")}` : "No class assignment yet"}
                        </p>
                        <p className="mt-1 text-xs uppercase tracking-[0.18em] text-black/45">
                          {teacher.verified ? "Verified" : "Pending verification"}
                        </p>
                      </div>
                    ))}
                  </div>
                </Panel>
                <Panel subtitle="Staffing" title="Teacher overview">
                  <Items values={[
                    `Teachers: ${teacherSummaries.length}`,
                    `Classes covered: ${classDetailItems.length}`,
                    `Teachers with assigned classes: ${teacherSummaries.filter((teacher) => teacher.classes.length).length}`
                  ]} />
                  <Items values={teacherSummaries.slice(0, 6).map((teacher) => join([
                    teacher.name,
                    `${teacher.classes.length} assigned classes`,
                    teacher.verified ? "verified" : "pending"
                  ]))} />
                </Panel>
              </div>
            ) : null}

            {tab === "students" ? (
              <div className="grid gap-6 lg:grid-cols-2">
                <Panel subtitle="Roster" title={isTeacher ? "My assigned students" : isStudent ? "Student profile" : isParent ? "Student overview" : "Student directory"}>
                  {!isStudent && !isParent ? (
                    <div className="flex flex-wrap gap-3">
                      {(isSchoolAdmin || isSuperAdmin || isTeacher) ? (
                        <button
                          className={`rounded-full px-5 py-3 text-sm font-semibold ${attendanceMode ? "bg-ink text-white" : "bg-black/5 text-ink"}`}
                          onClick={() => setAttendanceMode((value) => !value)}
                          type="button"
                        >
                          {attendanceMode ? "Close attendance" : "Mark attendance"}
                        </button>
                      ) : null}
                    </div>
                  ) : null}
                  {!isStudent && !isParent ? (
                    <div className="mt-4 grid gap-3 md:grid-cols-[1fr_180px_220px]">
                      <input
                        className="rounded-2xl border border-black/10 p-3"
                        onChange={(event) => setStudentSearch(event.target.value)}
                        placeholder="Search students globally"
                        value={studentSearch}
                      />
                      <select
                        className="rounded-2xl border border-black/10 p-3"
                        onChange={(event) => setStudentSort(event.target.value as "name-asc" | "name-desc" | "class-asc")}
                        value={studentSort}
                      >
                        <option value="name-asc">Name A-Z</option>
                        <option value="name-desc">Name Z-A</option>
                        <option value="class-asc">Class A-Z</option>
                      </select>
                      <select
                        className="rounded-2xl border border-black/10 p-3"
                        onChange={(event) => setStudentClassFilter(event.target.value)}
                        value={studentClassFilter}
                      >
                        <option value="ALL">All classes</option>
                        {(isTeacher ? teacherAssignedClassNames : Array.from(new Set(studentSummaries.map((student) => student.className)))).map((className) => (
                          <option key={className} value={className}>
                            {className}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : null}
                  {isTeacher ? (
                    <Items values={teacherAssignedClassNames.length ? teacherAssignedClassNames.map((className) => `Assigned class: ${className}`) : ["No class assignment for this term yet."]} />
                  ) : null}
                  <div className="mt-4">
                    <StudentList
                      onSelect={setSelectedStudentId}
                      selectedStudentId={selectedStudentId}
                      students={
                        isStudent
                          ? studentSummaries.filter((student) => student.id === user.id)
                          : filteredStudentSummaries
                      }
                    />
                  </div>
                </Panel>

                {isSchoolAdmin || isSuperAdmin || isTeacher ? (
                  <div className="space-y-6">
                    {attendanceMode ? (
                      <Panel subtitle="Attendance" title="Mark class attendance">
                        <p className="text-sm leading-7 text-black/65">
                          Choose `Present` or `Absent` for each student, then save attendance for today.
                        </p>
                        <div className="space-y-3">
                          {studentSummaries.map((student) => (
                            <div className="flex flex-col gap-3 rounded-2xl bg-sand/60 p-4 md:flex-row md:items-center md:justify-between" key={student.id}>
                              <div>
                                <p className="font-semibold text-ink">{student.name}</p>
                                <p className="text-sm text-black/55">{student.className}</p>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  className={`rounded-full px-4 py-2 text-sm font-semibold ${attendanceDraft[student.id] === "PRESENT" ? "bg-moss text-white" : "bg-white text-ink"}`}
                                  onClick={() => setAttendanceDraft((current) => ({ ...current, [student.id]: "PRESENT" }))}
                                  type="button"
                                >
                                  Present
                                </button>
                                <button
                                  className={`rounded-full px-4 py-2 text-sm font-semibold ${attendanceDraft[student.id] === "ABSENT" ? "bg-red-600 text-white" : "bg-white text-ink"}`}
                                  onClick={() => setAttendanceDraft((current) => ({ ...current, [student.id]: "ABSENT" }))}
                                  type="button"
                                >
                                  Absent
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                        <button
                          className="rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white"
                          onClick={async () => {
                            const records = studentSummaries
                              .filter((student) => attendanceDraft[student.id] && student.className !== "No class assigned")
                              .map((student) => {
                                const enrollment = studentEnrollmentById.get(student.id);
                                return enrollment
                                  ? markAttendance(session, {
                                      studentId: student.id,
                                      classId: enrollment.classId,
                                      attendanceDate: today(),
                                      status: attendanceDraft[student.id]
                                    })
                                  : null;
                              })
                              .filter(Boolean) as Array<Promise<unknown>>;

                            await run(async () => {
                              await Promise.all(records);
                              setAttendanceDraft({});
                              setAttendanceMode(false);
                            }, ["dashboard"], "Attendance saved for selected students.");
                          }}
                          type="button"
                        >
                          Save attendance
                        </button>
                      </Panel>
                    ) : (
                      <>
                        <Panel subtitle="Student details" title={selectedStudent?.name ?? "Student details"}>
                          <Items values={selectedStudent ? [
                            `Student ID: ${selectedStudent.id}`,
                            `First name: ${selectedStudent.firstName}`,
                            `Last name: ${selectedStudent.lastName}`,
                            `Email: ${selectedStudent.email}`,
                            `Class: ${selectedStudent.className}`,
                            `Enrollment: ${selectedStudent.enrollmentStatus}`,
                            `Status: ${selectedStudent.verified ? "verified" : "pending"}`
                          ] : []} />
                        </Panel>

                        <Panel subtitle="Assessment" title="Grades and ranking">
                          <Items values={[
                            `Ranking entries: ${ranking.data?.length ?? 0}`,
                            `Report card rows: ${reportCard.data?.rows?.length ?? 0}`,
                            `Current report total: ${String(reportCard.data?.totalScore ?? 0)}`
                          ]} />
                          <Items values={(ranking.data ?? []).slice(0, 5).map((entry) => join([
                            `Student ${entry.studentId}`,
                            `Score ${entry.totalScore}`,
                            `Rank ${entry.rank}`
                          ]))} />
                          <form className="space-y-3" onSubmit={(e) => handle(e, (fd) => recordScore(session, {
                            examId: String(fd.get("examId")),
                            studentId: String(fd.get("studentId")),
                            score: Number(fd.get("score"))
                          }), [], "Score recorded.")}>
                            <select className="w-full rounded-2xl border border-black/10 p-3" defaultValue="" name="examId">
                              <option value="">Select exam</option>
                              {(exams.data ?? [])
                                .filter((exam) => {
                                  const assignment = (teacherAssignments.data ?? []).find((item) => item.classId === exam.classId && item.subjectId === exam.subjectId && item.termId === exam.termId);
                                  if (!isTeacher) return true;
                                  return Boolean(assignment);
                                })
                                .filter((exam) => {
                                  if (!selectedStudent) return true;
                                  const enrollment = studentEnrollmentById.get(selectedStudent.id);
                                  return !enrollment || exam.classId === enrollment.classId;
                                })
                                .map((exam) => {
                                  const assignment = (teacherAssignments.data ?? []).find((item) => item.classId === exam.classId && item.subjectId === exam.subjectId && item.termId === exam.termId);
                                  return (
                                    <option key={exam.id} value={exam.id}>
                                      {assignment ? `${assignment.termName} • ${assignment.className} • ${assignment.subjectName}` : exam.name}
                                    </option>
                                  );
                                })}
                            </select>
                            <input className="w-full rounded-2xl border border-black/10 p-3" defaultValue={selectedStudent?.id ?? ""} name="studentId" placeholder="Student ID" type="hidden" />
                            <input className="w-full rounded-2xl border border-black/10 p-3" name="score" placeholder="Score" type="number" />
                            <button className="rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white" type="submit">Record score</button>
                          </form>
                          {selectedStudent?.id ? (
                            <button className="rounded-full bg-black px-5 py-3 text-sm font-semibold text-white" onClick={() => handleReportCardDownload(selectedStudent.id)} type="button">
                              Download report card PDF
                            </button>
                          ) : null}
                        </Panel>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="space-y-6">
                    <Panel subtitle="Student details" title={selectedStudent?.name ?? (isStudent ? "My details" : "Student progress")}>
                      <Items values={selectedStudent ? [
                        `Student ID: ${selectedStudent.id}`,
                        `First name: ${selectedStudent.firstName}`,
                        `Last name: ${selectedStudent.lastName}`,
                        `Email: ${selectedStudent.email}`,
                        `Class: ${selectedStudent.className}`,
                        `Enrollment: ${selectedStudent.enrollmentStatus}`,
                        `Status: ${selectedStudent.verified ? "verified" : "pending"}`
                      ] : []} />
                    </Panel>
                    <Panel subtitle="Progress" title="Academic and finance snapshot">
                      <Items values={[
                        `Report card rows: ${reportCard.data?.rows?.length ?? 0}`,
                        `Report total: ${String(reportCard.data?.totalScore ?? 0)}`,
                        `Outstanding: ${String(outstanding.data?.totalOutstanding ?? 0)}`,
                        `Payments logged: ${payments.data?.length ?? 0}`,
                        `Present: ${String(attendanceReport.data?.byStatus?.PRESENT ?? 0)}`,
                        `Absent: ${String(attendanceReport.data?.byStatus?.ABSENT ?? 0)}`,
                        `Late: ${String(attendanceReport.data?.byStatus?.LATE ?? 0)}`
                      ]} />
                    </Panel>
                  </div>
                )}
              </div>
            ) : null}

            {tab === "academics" ? (
              <AcademicTab
                classDetailItems={classDetailItems}
                classes={classes.data ?? []}
                dashboard={dashboard.data}
                defaultStudentId={defaultStudentId}
                enrollments={enrollments.data ?? []}
                exams={exams.data ?? []}
                handle={handle}
                handleReportCardDownload={handleReportCardDownload}
                isSchoolAdmin={isSchoolAdmin}
                isSuperAdmin={isSuperAdmin}
                isTeacher={isTeacher}
                ranking={ranking.data ?? []}
                reportCard={reportCard.data}
                session={session}
                studentDetailItems={studentDetailItems}
                studentUsers={studentUsers}
                subjectAssignments={subjectAssignments.data ?? []}
                subjects={subjects.data ?? []}
                teacherAssignments={teacherAssignments.data ?? []}
                teacherUsers={teacherUsers}
                terms={terms.data ?? []}
                years={years.data ?? []}
              />
            ) : null}

            {tab === "finance" ? (
              <FinanceTab
                defaultStudentId={defaultStudentId}
                finance={finance.data}
                formatCurrency={formatCurrency}
                handle={handle}
                isParent={isParent}
                isSchoolAdmin={isSchoolAdmin}
                isSuperAdmin={isSuperAdmin}
                outstanding={outstanding.data}
                payments={payments.data ?? []}
                session={session}
              />
            ) : null}

            {tab === "comms" ? (
              <CommsTab
                announcements={announcements.data?.content ?? []}
                handle={handle}
                isSchoolAdmin={isSchoolAdmin}
                isStudent={isStudent}
                isSuperAdmin={isSuperAdmin}
                isTeacher={isTeacher}
                messages={messages.data ?? []}
                notifications={notifications.data ?? []}
                session={session}
              />
            ) : null}
          </div>
        </main>
      </div>
    </div>
  );
}
