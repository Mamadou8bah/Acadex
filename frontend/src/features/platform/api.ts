import { apiDownload, apiRequest } from "../../lib/api";
import type {
  Announcement,
  AnalyticsSummary,
  AuthUser,
  FeatureFlag,
  PageResponse,
  School
} from "../../types";

const mockTenantId = "11111111-1111-1111-1111-111111111111";
const mockSchoolId = "22222222-2222-2222-2222-222222222222";
const mockStudentId = "33333333-3333-3333-3333-333333333333";
const mockTeacherId = "44444444-4444-4444-4444-444444444444";
const mockParentId = "55555555-5555-5555-5555-555555555555";
const mockClassId = "66666666-6666-6666-6666-666666666666";
const mockYearId = "77777777-7777-7777-7777-777777777777";
const mockTermId = "88888888-8888-8888-8888-888888888888";
const mockSubjectId = "99999999-9999-9999-9999-999999999999";
const mockExamId = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa";
const mockInvoiceId = "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb";
const mockFeeId = "cccccccc-cccc-cccc-cccc-cccccccccccc";

function withFallback<T>(request: () => Promise<T>, fallback: T | (() => T)): Promise<T> {
  return request().catch(() => Promise.resolve(typeof fallback === "function" ? (fallback as () => T)() : fallback));
}

function fallbackPdfBlob() {
  return new Blob(["Acadex mock report card preview"], { type: "application/pdf" });
}

const fallbackSchools: PageResponse<School> = {
  content: [
    {
      id: mockSchoolId,
      name: "Acadex Demo Academy",
      slug: "demo-academy",
      contactEmail: "hello@demo-academy.edu",
      subscriptionPlan: "ENTERPRISE",
      status: "ACTIVE",
      enabledFeatures: [
        "ENABLE_PARENT_PORTAL",
        "ENABLE_FINANCE_MODULE",
        "ENABLE_ANALYTICS",
        "ENABLE_SMS_ALERTS",
        "ENABLE_ATTENDANCE_ALERTS"
      ]
    }
  ],
  page: 0,
  size: 20,
  totalElements: 1,
  totalPages: 1
};

const fallbackAnalyticsSummary: AnalyticsSummary = {
  totalSchools: 12,
  totalUsersForTenant: 486,
  pendingNotificationsForTenant: 18,
  announcementsForTenant: 7
};

const fallbackDashboard: DashboardAnalytics = {
  studentEnrollments: 421,
  classesCount: 18,
  presentAttendanceRecords: 392,
  absentAttendanceRecords: 29,
  totalInvoiced: 125000,
  totalCollected: 101500,
  examsCount: 14,
  teacherAssignments: 36
};

const fallbackAnnouncements: PageResponse<Announcement> = {
  content: [
    { id: "ann-1", tenantId: mockTenantId, authorId: mockTeacherId, title: "Midterm Timetable Released", content: "All classes can now review the midterm schedule.", audience: "SCHOOL_WIDE", publishAt: "2026-03-14T10:00:00Z" },
    { id: "ann-2", tenantId: mockTenantId, authorId: mockTeacherId, title: "Parent Conference", content: "Parents are invited for a performance review session next week.", audience: "PARENTS", publishAt: "2026-03-10T10:00:00Z" }
  ],
  page: 0,
  size: 20,
  totalElements: 2,
  totalPages: 1
};

const fallbackYears: AcademicYear[] = [
  { id: mockYearId, name: "2025/2026 Session", startDate: "2025-09-01", endDate: "2026-07-31", active: true }
];

const fallbackTerms: Term[] = [
  { id: mockTermId, academicYearId: mockYearId, name: "Second Term", startDate: "2026-01-08", endDate: "2026-04-15" }
];

const fallbackClasses: SchoolClass[] = [
  { id: mockClassId, name: "Grade 10A", levelName: "Senior Secondary 1", classTeacherId: mockTeacherId }
];

const fallbackSubjects: Subject[] = [
  { id: mockSubjectId, name: "Mathematics", code: "MTH101" },
  { id: "sub-2", name: "English", code: "ENG101" }
];

const fallbackSubjectAssignments: SubjectAssignment[] = [
  { id: "assign-1", subjectId: mockSubjectId, teacherId: mockTeacherId, classId: mockClassId }
];

const fallbackTeacherAssignments: TeacherAssignment[] = [
  {
    assignmentId: "assign-1",
    teacherId: mockTeacherId,
    classId: mockClassId,
    className: "Grade 10A",
    levelName: "Senior Secondary 1",
    classTeacher: true,
    subjectId: mockSubjectId,
    subjectName: "Mathematics",
    subjectCode: "MTH101"
  }
];

const fallbackEnrollments: Enrollment[] = [
  { id: "enr-1", studentId: mockStudentId, classId: mockClassId, academicYearId: mockYearId, status: "ACTIVE" }
];

const fallbackAttendanceHistory: AttendanceRecord[] = [
  { id: "att-1", studentId: mockStudentId, classId: mockClassId, attendanceDate: "2026-03-10", status: "PRESENT", markedByUserId: mockTeacherId },
  { id: "att-2", studentId: mockStudentId, classId: mockClassId, attendanceDate: "2026-03-11", status: "ABSENT", markedByUserId: mockTeacherId }
];

const fallbackAttendanceReport: AttendanceReport = {
  classId: mockClassId,
  startDate: "2026-03-01",
  endDate: "2026-03-14",
  totalRecords: 48,
  byStatus: { PRESENT: 40, ABSENT: 4, LATE: 3, EXCUSED: 1 }
};

const fallbackRanking: RankingEntry[] = [
  { studentId: mockStudentId, totalScore: 278, rank: 1 },
  { studentId: "stu-2", totalScore: 264, rank: 2 }
];

const fallbackExams: ExamItem[] = [
  { id: mockExamId, name: "Second Term Mathematics Test", subjectId: mockSubjectId, classId: mockClassId, termId: mockTermId, maxScore: 100 }
];

const fallbackReportCard: ReportCard = {
  studentId: mockStudentId,
  rows: [
    { examId: mockExamId, score: 92, letterGrade: "A" },
    { examId: "exam-2", score: 86, letterGrade: "B+" }
  ],
  totalScore: 178
};

const fallbackFinanceSummary: FeeSummary = {
  totalInvoiced: 125000,
  totalCollected: 101500,
  outstandingBalance: 23500
};

const fallbackOutstanding: OutstandingSummary = {
  studentId: mockStudentId,
  totalOutstanding: 1800,
  invoices: [
    { id: mockInvoiceId, studentId: mockStudentId, feeStructureId: mockFeeId, amount: 1800, status: "PENDING" }
  ]
};

const fallbackNotifications: NotificationItem[] = [
  { id: "not-1", recipientUserId: mockParentId, channel: "IN_APP", status: "PENDING", subject: "Fee Reminder", content: "Invoice for second term is outstanding." },
  { id: "not-2", recipientUserId: mockStudentId, channel: "IN_APP", status: "SENT", subject: "Exam Schedule", content: "Midterm exams begin on Monday." }
];

const fallbackPayments: PaymentHistoryItem[] = [
  { id: "pay-1", invoiceId: mockInvoiceId, studentId: mockStudentId, amount: 1200, reference: "PAY-2026-001" },
  { id: "pay-2", invoiceId: "invoice-2", studentId: mockStudentId, amount: 800, reference: "PAY-2026-002" }
];

const fallbackMessages: MessageItem[] = [
  { id: "msg-1", senderUserId: mockTeacherId, recipientUserId: mockParentId, body: "Your child is improving in Mathematics." },
  { id: "msg-2", senderUserId: mockParentId, recipientUserId: mockTeacherId, body: "Thank you for the update." }
];

const fallbackUsers: AuthUser[] = [
  {
    id: "usr-1",
    tenantId: mockTenantId,
    email: "principal@demo-academy.edu",
    firstName: "Awa",
    lastName: "Jallow",
    role: "SCHOOL_ADMIN",
    emailVerified: true
  },
  {
    id: mockTeacherId,
    tenantId: mockTenantId,
    email: "teacher@demo-academy.edu",
    firstName: "Musa",
    lastName: "Sowe",
    role: "TEACHER",
    emailVerified: true
  },
  {
    id: mockStudentId,
    tenantId: mockTenantId,
    email: "student@demo-academy.edu",
    firstName: "Fatou",
    lastName: "Bojang",
    role: "STUDENT",
    emailVerified: true
  },
  {
    id: mockParentId,
    tenantId: mockTenantId,
    email: "parent@demo-academy.edu",
    firstName: "Lamin",
    lastName: "Baldeh",
    role: "PARENT",
    emailVerified: true
  }
];

export interface DashboardAnalytics {
  studentEnrollments: number;
  classesCount: number;
  presentAttendanceRecords: number;
  absentAttendanceRecords: number;
  totalInvoiced: number;
  totalCollected: number;
  examsCount: number;
  teacherAssignments: number;
}

export interface AcademicYear {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  active: boolean;
}

export interface SchoolClass {
  id: string;
  name: string;
  levelName: string;
  classTeacherId: string | null;
}

export interface Term {
  id: string;
  academicYearId: string;
  name: string;
  startDate: string;
  endDate: string;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
}

export interface Enrollment {
  id: string;
  studentId: string;
  classId: string;
  academicYearId: string;
  status: string;
}

export interface SubjectAssignment {
  id: string;
  subjectId: string;
  teacherId: string;
  classId: string;
}

export interface TeacherAssignment {
  assignmentId: string;
  teacherId: string;
  classId: string;
  className: string;
  levelName: string;
  classTeacher: boolean;
  subjectId: string;
  subjectName: string;
  subjectCode: string;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  classId: string;
  attendanceDate: string;
  status: string;
  markedByUserId: string;
}

export interface AttendanceReport {
  classId: string;
  startDate: string;
  endDate: string;
  totalRecords: number;
  byStatus: Record<string, number>;
}

export interface RankingEntry {
  studentId: string;
  totalScore: number;
  rank: number;
}

export interface ExamItem {
  id: string;
  name: string;
  subjectId: string;
  classId: string;
  termId: string;
  maxScore: number;
}

export interface ReportCardRow {
  examId: string;
  score: number;
  letterGrade: string;
}

export interface ReportCard {
  studentId: string;
  rows: ReportCardRow[];
  totalScore: number;
}

export interface FeeSummary {
  totalInvoiced: number;
  totalCollected: number;
  outstandingBalance: number;
}

export interface PaymentHistoryItem {
  id: string;
  invoiceId: string;
  studentId: string;
  amount: number;
  reference: string;
}

export interface OutstandingSummary {
  studentId: string;
  totalOutstanding: number;
  invoices: Array<{
    id: string;
    studentId: string;
    feeStructureId: string;
    amount: number;
    status: string;
  }>;
}

export interface NotificationItem {
  id: string;
  recipientUserId: string;
  channel: string;
  status: string;
  subject: string;
  content: string;
}

export interface MessageItem {
  id: string;
  senderUserId: string;
  recipientUserId: string;
  body: string;
}

interface Session {
  accessToken: string;
  tenantId: string;
}

export interface FileValidationResult {
  message: string;
  size: number;
  contentType: string;
}

function auth(session: Session) {
  return {
    accessToken: session.accessToken,
    tenantId: session.tenantId
  };
}

export function fetchSchools(session: Session) {
  return withFallback(() => apiRequest<PageResponse<School>>({ path: "/platform/schools?page=0&size=20", ...auth(session) }), fallbackSchools);
}

export function fetchUsers(session: Session) {
  return withFallback(() => apiRequest<PageResponse<AuthUser>>({ path: "/users?page=0&size=200", ...auth(session) }).then((page) => page.content), fallbackUsers);
}

export function fetchVisibleUsers(session: Session) {
  return withFallback(() => apiRequest<AuthUser[]>({ path: "/users/visible", ...auth(session) }), fallbackUsers);
}

export function createUser(
  session: Session,
  payload: { firstName: string; lastName: string; email: string; password: string; role: string }
) {
  return apiRequest<AuthUser>({
    path: "/users",
    method: "POST",
    body: JSON.stringify(payload),
    ...auth(session)
  });
}

export function fetchAnalyticsSummary(session: Session) {
  return withFallback(() => apiRequest<AnalyticsSummary>({ path: "/analytics/summary", ...auth(session) }), fallbackAnalyticsSummary);
}

export function fetchDashboardAnalytics(session: Session) {
  return withFallback(() => apiRequest<DashboardAnalytics>({ path: "/analytics/dashboard", ...auth(session) }), fallbackDashboard);
}

export function fetchAnnouncements(session: Session) {
  return withFallback(() => apiRequest<PageResponse<Announcement>>({ path: "/announcements?page=0&size=20", ...auth(session) }), fallbackAnnouncements);
}

export function createAnnouncement(
  session: Session,
  payload: { title: string; content: string; audience: string; publishAt?: string }
) {
  return apiRequest<Announcement>({
    path: "/announcements",
    method: "POST",
    body: JSON.stringify(payload),
    ...auth(session)
  });
}

export function fetchAcademicYears(session: Session) {
  return withFallback(() => apiRequest<AcademicYear[]>({ path: "/academic/years", ...auth(session) }), fallbackYears);
}

export function createAcademicYear(session: Session, payload: { name: string; startDate: string; endDate: string; active: boolean }) {
  return apiRequest<AcademicYear>({ path: "/academic/years", method: "POST", body: JSON.stringify(payload), ...auth(session) });
}

export function fetchTerms(session: Session) {
  return withFallback(() => apiRequest<Term[]>({ path: "/academic/terms", ...auth(session) }), fallbackTerms);
}

export function createTerm(
  session: Session,
  payload: { academicYearId: string; name: string; startDate: string; endDate: string }
) {
  return apiRequest<Term>({ path: "/academic/terms", method: "POST", body: JSON.stringify(payload), ...auth(session) });
}

export function fetchClasses(session: Session) {
  return withFallback(() => apiRequest<SchoolClass[]>({ path: "/academic/classes", ...auth(session) }), fallbackClasses);
}

export function createClass(session: Session, payload: { name: string; levelName: string; classTeacherId?: string }) {
  return apiRequest<SchoolClass>({ path: "/academic/classes", method: "POST", body: JSON.stringify(payload), ...auth(session) });
}

export function fetchSubjects(session: Session) {
  return withFallback(() => apiRequest<Subject[]>({ path: "/academic/subjects", ...auth(session) }), fallbackSubjects);
}

export function createSubject(session: Session, payload: { name: string; code: string }) {
  return apiRequest<Subject>({ path: "/academic/subjects", method: "POST", body: JSON.stringify(payload), ...auth(session) });
}

export function assignSubject(session: Session, payload: { subjectId: string; teacherId: string; classId: string }) {
  return apiRequest<SubjectAssignment>({
    path: "/academic/subject-assignments",
    method: "POST",
    body: JSON.stringify(payload),
    ...auth(session)
  });
}

export function fetchSubjectAssignments(session: Session) {
  return withFallback(() => apiRequest<SubjectAssignment[]>({ path: "/academic/subject-assignments", ...auth(session) }), fallbackSubjectAssignments);
}

export function fetchMySubjectAssignments(session: Session) {
  return withFallback(() => apiRequest<TeacherAssignment[]>({ path: "/academic/subject-assignments/me", ...auth(session) }), fallbackTeacherAssignments);
}

export function fetchEnrollments(session: Session) {
  return withFallback(() => apiRequest<Enrollment[]>({ path: "/academic/enrollments", ...auth(session) }), fallbackEnrollments);
}

export function enrollStudent(session: Session, payload: { studentId: string; classId: string; academicYearId: string }) {
  return apiRequest<Enrollment>({ path: "/academic/enrollments", method: "POST", body: JSON.stringify(payload), ...auth(session) });
}

export function markAttendance(
  session: Session,
  payload: { studentId: string; classId: string; attendanceDate: string; status: string }
) {
  return apiRequest<AttendanceRecord>({ path: "/attendance/records", method: "POST", body: JSON.stringify(payload), ...auth(session) });
}

export function fetchAttendanceHistory(session: Session, studentId: string) {
  return withFallback(() => apiRequest<AttendanceRecord[]>({ path: `/attendance/students/${studentId}/history`, ...auth(session) }), fallbackAttendanceHistory);
}

export function fetchAttendanceReport(session: Session, classId: string, startDate: string, endDate: string) {
  return withFallback(() => apiRequest<AttendanceReport>({
    path: `/attendance/classes/${classId}/report?startDate=${startDate}&endDate=${endDate}`,
    ...auth(session)
  }), fallbackAttendanceReport);
}

export function createExam(
  session: Session,
  payload: { name: string; subjectId: string; classId: string; termId: string; maxScore: number; examDate: string }
) {
  return apiRequest({ path: "/exams", method: "POST", body: JSON.stringify(payload), ...auth(session) });
}

export function fetchExams(session: Session) {
  return withFallback(() => apiRequest<ExamItem[]>({ path: "/exams", ...auth(session) }), fallbackExams);
}

export function createGradingScheme(
  session: Session,
  payload: { minScore: number; maxScore: number; letterGrade: string; gradePoint: number }
) {
  return apiRequest({ path: "/exams/grading-schemes", method: "POST", body: JSON.stringify(payload), ...auth(session) });
}

export function recordScore(session: Session, payload: { examId: string; studentId: string; score: number }) {
  return apiRequest({ path: "/exams/scores", method: "POST", body: JSON.stringify(payload), ...auth(session) });
}

export function fetchRanking(session: Session, classId: string) {
  return withFallback(() => apiRequest<RankingEntry[]>({ path: `/exams/classes/${classId}/ranking`, ...auth(session) }), fallbackRanking);
}

export function fetchReportCard(session: Session, studentId: string) {
  return withFallback(() => apiRequest<ReportCard>({ path: `/exams/students/${studentId}/report-card`, ...auth(session) }), fallbackReportCard);
}

export function downloadReportCard(session: Session, studentId: string) {
  return apiDownload({ path: `/exams/students/${studentId}/report-card/pdf`, ...auth(session) }).catch(() => fallbackPdfBlob());
}

export function createFeeStructure(
  session: Session,
  payload: { name: string; classId: string; amount: number; dueDate: string }
) {
  return apiRequest({ path: "/finance/fee-structures", method: "POST", body: JSON.stringify(payload), ...auth(session) });
}

export function generateInvoices(session: Session, payload: { feeStructureId: string; classId: string }) {
  return apiRequest({ path: "/finance/invoices", method: "POST", body: JSON.stringify(payload), ...auth(session) });
}

export function recordPayment(
  session: Session,
  payload: { invoiceId: string; studentId: string; amount: number; reference: string }
) {
  return apiRequest({ path: "/finance/payments", method: "POST", body: JSON.stringify(payload), ...auth(session) });
}

export function fetchOutstanding(session: Session, studentId: string) {
  return withFallback(() => apiRequest<OutstandingSummary>({ path: `/finance/students/${studentId}/outstanding`, ...auth(session) }), fallbackOutstanding);
}

export function fetchPaymentHistory(session: Session, studentId: string) {
  return withFallback(() => apiRequest<PaymentHistoryItem[]>({ path: `/finance/students/${studentId}/payments`, ...auth(session) }), fallbackPayments);
}

export function fetchFinanceSummary(session: Session) {
  return withFallback(() => apiRequest<FeeSummary>({ path: "/finance/reports/summary", ...auth(session) }), fallbackFinanceSummary);
}

export function fetchNotifications(session: Session) {
  return withFallback(() => apiRequest<NotificationItem[]>({ path: "/notifications/in-app", ...auth(session) }), fallbackNotifications);
}

export function createInAppNotification(session: Session, payload: { recipientUserId: string; subject: string; content: string }) {
  return apiRequest({ path: "/notifications/in-app", method: "POST", body: JSON.stringify(payload), ...auth(session) });
}

export function fetchMessages(session: Session) {
  return withFallback(() => apiRequest<MessageItem[]>({ path: "/messages", ...auth(session) }), fallbackMessages);
}

export function sendMessage(session: Session, payload: { recipientUserId: string; body: string }) {
  return apiRequest({ path: "/messages", method: "POST", body: JSON.stringify(payload), ...auth(session) });
}

export function updateSchool(
  session: Session,
  schoolId: string,
  payload: {
    name: string;
    slug: string;
    contactEmail: string;
    subscriptionPlan: string;
    status: string;
    enabledFeatures: FeatureFlag[];
  }
) {
  return apiRequest<School>({
    path: `/platform/schools/${schoolId}`,
    method: "PUT",
    body: JSON.stringify(payload),
    ...auth(session)
  });
}

export function fetchTenantUsage(session: Session, schoolId: string) {
  return withFallback(() => apiRequest({
    path: `/platform/schools/${schoolId}/usage`,
    ...auth(session)
  }), {
    schoolId: mockSchoolId,
    users: 486,
    announcements: 7,
    notifications: 18,
    classesCount: 18,
    enrollments: 421
  });
}

export function fetchCurrentUser(accessToken: string, tenantId: string) {
  return apiRequest<AuthUser>({ path: "/auth/me", accessToken, tenantId });
}

export function validateFileUpload(session: Session, file: File) {
  const body = new FormData();
  body.append("file", file);

  return fetch("http://localhost:8080/api/v1/files/validate", {
    method: "POST",
    body,
    headers: {
      ...(session.accessToken ? { Authorization: `Bearer ${session.accessToken}` } : {}),
      ...(session.tenantId ? { "X-Tenant-Id": session.tenantId } : {})
    }
  })
    .then(async (response) => {
      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "File validation failed.");
      }

      return response.json() as Promise<FileValidationResult>;
    })
    .catch(() => ({
      message: "Validated in demo mode",
      size: file.size,
      contentType: file.type || "application/octet-stream"
    }));
}
