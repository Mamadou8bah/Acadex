import { FormEvent, useMemo, useState } from "react";
import type { AuthUser } from "../../types";
import {
  assignSubject,
  createAcademicYear,
  createClass,
  createExam,
  createGradingScheme,
  createSubject,
  createTerm,
  enrollStudent,
  recordScore,
  type AcademicYear,
  type DashboardAnalytics,
  type Enrollment,
  type ExamItem,
  type RankingEntry,
  type ReportCard,
  type SchoolClass,
  type Subject,
  type SubjectAssignment,
  type TeacherAssignment,
  type Term
} from "../../features/platform/api";
import { Items, Panel } from "./shared";

interface Session {
  accessToken: string;
  tenantId: string;
}

interface AcademicTabProps {
  session: Session;
  isSchoolAdmin: boolean;
  isSuperAdmin: boolean;
  isTeacher: boolean;
  years: AcademicYear[];
  terms: Term[];
  classes: SchoolClass[];
  subjects: Subject[];
  enrollments: Enrollment[];
  dashboard: DashboardAnalytics | undefined;
  ranking: RankingEntry[];
  reportCard: ReportCard | undefined;
  classDetailItems: string[];
  studentDetailItems: string[];
  studentUsers: AuthUser[];
  teacherUsers: AuthUser[];
  subjectAssignments: SubjectAssignment[];
  teacherAssignments: TeacherAssignment[];
  exams: ExamItem[];
  defaultStudentId: string;
  handle: (
    event: FormEvent<HTMLFormElement>,
    action: (fd: FormData) => Promise<unknown>,
    refresh?: string[],
    success?: string,
    afterSuccess?: () => void
  ) => Promise<void>;
  handleReportCardDownload: (studentId: string) => Promise<void>;
}

export function AcademicTab({
  session,
  isSchoolAdmin,
  isSuperAdmin,
  isTeacher,
  years,
  terms,
  classes,
  subjects,
  enrollments,
  dashboard,
  ranking,
  reportCard,
  classDetailItems,
  studentDetailItems,
  studentUsers,
  teacherUsers,
  subjectAssignments,
  teacherAssignments,
  exams,
  defaultStudentId,
  handle,
  handleReportCardDownload
}: AcademicTabProps) {
  const isAdmin = isSchoolAdmin || isSuperAdmin;
  const [selectedTeachingAssignmentId, setSelectedTeachingAssignmentId] = useState<string>(teacherAssignments[0]?.assignmentId ?? "");
  const [selectedScoreExamId, setSelectedScoreExamId] = useState<string>(exams[0]?.id ?? "");

  const selectedTeachingAssignment = teacherAssignments.find((item) => item.assignmentId === selectedTeachingAssignmentId) ?? teacherAssignments[0] ?? null;
  const selectedScoreExam = exams.find((item) => item.id === selectedScoreExamId) ?? exams[0] ?? null;
  const selectedScoreClassId = selectedScoreExam?.classId ?? "";

  const studentsForSelectedExam = useMemo(() => {
    const studentById = new Map(studentUsers.map((student) => [student.id, student]));
    return enrollments
      .filter((enrollment) => enrollment.classId === selectedScoreClassId)
      .map((enrollment) => {
        const student = studentById.get(enrollment.studentId);
        if (!student) return null;
        return {
          id: student.id,
          label: `${student.firstName} ${student.lastName}`
        };
      })
      .filter((item): item is { id: string; label: string } => Boolean(item));
  }, [enrollments, selectedScoreClassId, studentUsers]);

  const teacherAssignmentItems = teacherAssignments.map((assignment) =>
    `${assignment.termName} • ${assignment.className} (${assignment.levelName}) • ${assignment.subjectName} ${assignment.classTeacher ? "• class teacher" : ""}`.replace(/\s+•\s+$/, "")
  );

  const adminAssignmentItems = subjectAssignments.map((assignment) => {
    const subject = subjects.find((item) => item.id === assignment.subjectId);
    const schoolClass = classes.find((item) => item.id === assignment.classId);
    const teacher = teacherUsers.find((item) => item.id === assignment.teacherId);
    return [
      terms.find((item) => item.id === assignment.termId)?.name ?? "Unknown term",
      schoolClass?.name ?? "Unknown class",
      subject?.name ?? "Unknown subject",
      teacher ? `${teacher.firstName} ${teacher.lastName}` : "Unknown teacher"
    ].join(" • ");
  });

  if (isAdmin) {
    return (
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel subtitle="Class directory" title="Classes and staffing">
          <Items values={classDetailItems} />
        </Panel>

        <Panel subtitle="Years and classes" title="Academic setup">
          <form
            className="space-y-3"
            onSubmit={(event) =>
              handle(
                event,
                (fd) =>
                  createAcademicYear(session, {
                    name: String(fd.get("name")),
                    startDate: String(fd.get("startDate")),
                    endDate: String(fd.get("endDate")),
                    active: fd.get("active") === "on"
                  }),
                ["years"],
                "Academic year created."
              )
            }
          >
            <input className="w-full rounded-2xl border border-black/10 p-3" name="name" placeholder="Academic year" />
            <input className="w-full rounded-2xl border border-black/10 p-3" name="startDate" type="date" />
            <input className="w-full rounded-2xl border border-black/10 p-3" name="endDate" type="date" />
            <label className="flex items-center gap-2 text-sm"><input name="active" type="checkbox" />Active</label>
            <button className="rounded-full bg-ember px-5 py-3 text-sm font-semibold text-white" type="submit">Create year</button>
          </form>

          <form
            className="space-y-3"
            onSubmit={(event) =>
              handle(
                event,
                (fd) =>
                  createClass(session, {
                    name: String(fd.get("name")),
                    levelName: String(fd.get("levelName")),
                    classTeacherId: String(fd.get("classTeacherId") || "")
                  }),
                ["classes"],
                "Class created."
              )
            }
          >
            <input className="w-full rounded-2xl border border-black/10 p-3" name="name" placeholder="Class name" />
            <input className="w-full rounded-2xl border border-black/10 p-3" name="levelName" placeholder="Level" />
            <select className="w-full rounded-2xl border border-black/10 p-3" defaultValue="" name="classTeacherId">
              <option value="">Select class teacher</option>
              {teacherUsers.map((teacher) => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.firstName} {teacher.lastName}
                </option>
              ))}
            </select>
            <button className="rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white" type="submit">Create class</button>
          </form>
        </Panel>

        <Panel subtitle="At a glance" title="Academic activity">
          <Items
            values={[
              `Academic years: ${years.length}`,
              `Classes: ${classes.length}`,
              `Terms: ${terms.length}`,
              `Subjects: ${subjects.length}`,
              `Attendance tracked: ${dashboard?.presentAttendanceRecords ?? 0}`,
              `Exams tracked: ${dashboard?.examsCount ?? 0}`
            ]}
          />
          <form
            className="space-y-3"
            onSubmit={(event) =>
              handle(
                event,
                (fd) =>
                  createExam(session, {
                    name: String(fd.get("name")),
                    subjectId: String(fd.get("subjectId")),
                    classId: String(fd.get("classId")),
                    termId: String(fd.get("termId")),
                    maxScore: Number(fd.get("maxScore")),
                    examDate: String(fd.get("examDate"))
                  }),
                ["dashboard", "exams"],
                "Exam created."
              )
            }
          >
            <input className="w-full rounded-2xl border border-black/10 p-3" name="name" placeholder="Exam name" />
            <select className="w-full rounded-2xl border border-black/10 p-3" defaultValue="" name="subjectId">
              <option value="">Select subject</option>
              {subjects.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.name}
                </option>
              ))}
            </select>
            <select className="w-full rounded-2xl border border-black/10 p-3" defaultValue="" name="classId">
              <option value="">Select class</option>
              {classes.map((schoolClass) => (
                <option key={schoolClass.id} value={schoolClass.id}>
                  {schoolClass.name} ({schoolClass.levelName})
                </option>
              ))}
            </select>
            <select className="w-full rounded-2xl border border-black/10 p-3" defaultValue="" name="termId">
              <option value="">Select term</option>
              {terms.map((term) => (
                <option key={term.id} value={term.id}>
                  {term.name}
                </option>
              ))}
            </select>
            <input className="w-full rounded-2xl border border-black/10 p-3" name="maxScore" placeholder="Max score" type="number" />
            <input className="w-full rounded-2xl border border-black/10 p-3" name="examDate" type="date" />
            <button className="rounded-full bg-ember px-5 py-3 text-sm font-semibold text-white" type="submit">Create exam</button>
          </form>
        </Panel>

        <Panel subtitle="Terms and subjects" title="Curriculum structure">
          <Items values={[`Terms configured: ${terms.length}/3`, `Subjects configured: ${subjects.length}`]} />
          <form
            className="space-y-3"
            onSubmit={(event) =>
              handle(
                event,
                (fd) =>
                  createTerm(session, {
                    academicYearId: String(fd.get("academicYearId")),
                    name: String(fd.get("name")),
                    startDate: String(fd.get("startDate")),
                    endDate: String(fd.get("endDate"))
                  }),
                ["terms"],
                "Term created."
              )
            }
          >
            <select className="w-full rounded-2xl border border-black/10 p-3" defaultValue="" name="academicYearId">
              <option value="">Select academic year</option>
              {years.map((year) => (
                <option key={year.id} value={year.id}>
                  {year.name}
                </option>
              ))}
            </select>
            <input className="w-full rounded-2xl border border-black/10 p-3" name="name" placeholder="Term name" />
            <input className="w-full rounded-2xl border border-black/10 p-3" name="startDate" type="date" />
            <input className="w-full rounded-2xl border border-black/10 p-3" name="endDate" type="date" />
            <button className="rounded-full bg-ember px-5 py-3 text-sm font-semibold text-white" type="submit">Create term</button>
          </form>

          <form
            className="space-y-3"
            onSubmit={(event) =>
              handle(
                event,
                (fd) =>
                  createSubject(session, {
                    name: String(fd.get("name")),
                    code: String(fd.get("code"))
                  }),
                ["subjects"],
                "Subject created."
              )
            }
          >
            <input className="w-full rounded-2xl border border-black/10 p-3" name="name" placeholder="Subject name" />
            <input className="w-full rounded-2xl border border-black/10 p-3" name="code" placeholder="Subject code" />
            <button className="rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white" type="submit">Create subject</button>
          </form>
        </Panel>

        <Panel subtitle="Assignments" title="Teachers and enrollment">
          <Items
            values={[
              `Enrollments: ${enrollments.length}`,
              `Teacher assignments: ${dashboard?.teacherAssignments ?? 0}`,
              `Students listed: ${studentUsers.length}`
            ]}
          />
          <Items values={adminAssignmentItems.length ? adminAssignmentItems : studentDetailItems.slice(0, 6)} />
          <form
            className="space-y-3"
            onSubmit={(event) =>
              handle(
                event,
                (fd) =>
                  assignSubject(session, {
                    subjectId: String(fd.get("subjectId")),
                    teacherId: String(fd.get("teacherId")),
                    classId: String(fd.get("classId")),
                    termId: String(fd.get("termId"))
                  }),
                ["dashboard", "subject-assignments"],
                "Subject assigned."
              )
            }
          >
            <select className="w-full rounded-2xl border border-black/10 p-3" defaultValue="" name="subjectId">
              <option value="">Select subject</option>
              {subjects.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.name}
                </option>
              ))}
            </select>
            <select className="w-full rounded-2xl border border-black/10 p-3" defaultValue="" name="teacherId">
              <option value="">Select teacher</option>
              {teacherUsers.map((teacher) => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.firstName} {teacher.lastName}
                </option>
              ))}
            </select>
            <select className="w-full rounded-2xl border border-black/10 p-3" defaultValue="" name="classId">
              <option value="">Select class</option>
              {classes.map((schoolClass) => (
                <option key={schoolClass.id} value={schoolClass.id}>
                  {schoolClass.name} ({schoolClass.levelName})
                </option>
              ))}
            </select>
            <select className="w-full rounded-2xl border border-black/10 p-3" defaultValue="" name="termId">
              <option value="">Select term</option>
              {terms.map((term) => (
                <option key={term.id} value={term.id}>
                  {term.name}
                </option>
              ))}
            </select>
            <button className="rounded-full bg-ember px-5 py-3 text-sm font-semibold text-white" type="submit">Assign subject</button>
          </form>

          <form
            className="space-y-3"
            onSubmit={(event) =>
              handle(
                event,
                (fd) =>
                  enrollStudent(session, {
                    studentId: String(fd.get("studentId")),
                    classId: String(fd.get("classId")),
                    academicYearId: String(fd.get("academicYearId"))
                  }),
                ["enrollments"],
                "Student enrolled."
              )
            }
          >
            <select className="w-full rounded-2xl border border-black/10 p-3" defaultValue="" name="studentId">
              <option value="">Select student</option>
              {studentUsers.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.firstName} {student.lastName}
                </option>
              ))}
            </select>
            <select className="w-full rounded-2xl border border-black/10 p-3" defaultValue="" name="classId">
              <option value="">Select class</option>
              {classes.map((schoolClass) => (
                <option key={schoolClass.id} value={schoolClass.id}>
                  {schoolClass.name}
                </option>
              ))}
            </select>
            <select className="w-full rounded-2xl border border-black/10 p-3" defaultValue="" name="academicYearId">
              <option value="">Select academic year</option>
              {years.map((year) => (
                <option key={year.id} value={year.id}>
                  {year.name}
                </option>
              ))}
            </select>
            <button className="rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white" type="submit">Enroll student</button>
          </form>
        </Panel>

        <Panel subtitle="Grading" title="Grading scales">
          <Items values={[`Ranking entries: ${ranking.length}`, `Report card rows: ${reportCard?.rows?.length ?? 0}`]} />
          <form
            className="space-y-3"
            onSubmit={(event) =>
              handle(
                event,
                (fd) =>
                  createGradingScheme(session, {
                    minScore: Number(fd.get("minScore")),
                    maxScore: Number(fd.get("maxScore")),
                    letterGrade: String(fd.get("letterGrade")),
                    gradePoint: Number(fd.get("gradePoint"))
                  }),
                [],
                "Grading scheme created."
              )
            }
          >
            <div className="grid gap-3 md:grid-cols-2">
              <input className="rounded-2xl border border-black/10 p-3" name="minScore" placeholder="Min score" type="number" />
              <input className="rounded-2xl border border-black/10 p-3" name="maxScore" placeholder="Max score" type="number" />
              <input className="rounded-2xl border border-black/10 p-3" name="letterGrade" placeholder="Letter grade" />
              <input className="rounded-2xl border border-black/10 p-3" name="gradePoint" placeholder="Grade point" type="number" />
            </div>
            <button className="rounded-full bg-ember px-5 py-3 text-sm font-semibold text-white" type="submit">Create grading scheme</button>
          </form>
        </Panel>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Panel subtitle="Teaching load" title={isTeacher ? "My classes and subjects" : "Learning snapshot"}>
        <Items
          values={
            isTeacher
              ? teacherAssignmentItems
              : [
                  `Academic years: ${years.length}`,
                  `Classes available: ${classes.length}`,
                  `Exams scheduled: ${dashboard?.examsCount ?? 0}`,
                  `Attendance tracked: ${dashboard?.presentAttendanceRecords ?? 0}`
                ]
          }
        />
      </Panel>

      <Panel subtitle="Access" title={isTeacher ? "Teacher workflow" : "Student permissions"}>
        <Items
          values={
            isTeacher
              ? [
                  "Teachers now see the subjects and classes assigned to them.",
                  "Exam creation and grading are scoped to those assignments.",
                  "School-wide setup actions remain restricted to administrators."
                ]
              : [
                  "Students can review learning progress, announcements, and finance status.",
                  "Administrative setup and user management stay hidden."
                ]
          }
        />
      </Panel>

      {isTeacher ? (
        <>
          <Panel subtitle="Assessment setup" title="Create exam for your subject">
            <form
              className="space-y-3"
              onSubmit={(event) =>
                handle(
                  event,
                  (fd) => {
                    const assignment = teacherAssignments.find((item) => item.assignmentId === String(fd.get("assignmentId")));
                    if (!assignment) {
                      return Promise.reject(new Error("Select a teaching assignment."));
                    }
                    return createExam(session, {
                      name: String(fd.get("name")),
                      subjectId: assignment.subjectId,
                      classId: assignment.classId,
                      termId: assignment.termId,
                      maxScore: Number(fd.get("maxScore")),
                      examDate: String(fd.get("examDate"))
                    });
                  },
                  ["dashboard", "exams"],
                  "Exam created."
                )
              }
            >
              <select
                className="w-full rounded-2xl border border-black/10 p-3"
                defaultValue={selectedTeachingAssignment?.assignmentId ?? ""}
                name="assignmentId"
                onChange={(event) => setSelectedTeachingAssignmentId(event.target.value)}
              >
                <option value="">Select class and subject</option>
                {teacherAssignments.map((assignment) => (
                  <option key={assignment.assignmentId} value={assignment.assignmentId}>
                    {assignment.termName} - {assignment.className} - {assignment.subjectName}
                  </option>
                ))}
              </select>
              <input className="w-full rounded-2xl border border-black/10 p-3" name="name" placeholder="Exam name" />
              <input className="w-full rounded-2xl border border-black/10 p-3" name="maxScore" placeholder="Max score" type="number" />
              <input className="w-full rounded-2xl border border-black/10 p-3" name="examDate" type="date" />
              {selectedTeachingAssignment ? (
                <p className="text-sm text-black/55">
                  Creating for {selectedTeachingAssignment.termName} • {selectedTeachingAssignment.className} • {selectedTeachingAssignment.subjectName}
                </p>
              ) : null}
              <button className="rounded-full bg-ember px-5 py-3 text-sm font-semibold text-white" type="submit">Create exam</button>
            </form>
          </Panel>

          <Panel subtitle="Grade entry" title="Record student scores">
            <form
              className="space-y-3"
              onSubmit={(event) =>
                handle(
                  event,
                  (fd) =>
                    recordScore(session, {
                      examId: String(fd.get("examId")),
                      studentId: String(fd.get("studentId")),
                      score: Number(fd.get("score"))
                    }),
                  [],
                  "Score recorded."
                )
              }
            >
              <select
                className="w-full rounded-2xl border border-black/10 p-3"
                defaultValue={selectedScoreExam?.id ?? ""}
                name="examId"
                onChange={(event) => setSelectedScoreExamId(event.target.value)}
              >
                <option value="">Select exam</option>
                {exams.map((exam) => {
                  const assignment = teacherAssignments.find((item) => item.classId === exam.classId && item.subjectId === exam.subjectId);
                  const label = assignment ? `${exam.name} • ${assignment.className} • ${assignment.subjectName}` : exam.name;
                  return (
                    <option key={exam.id} value={exam.id}>
                      {label}
                    </option>
                  );
                })}
              </select>
              <select className="w-full rounded-2xl border border-black/10 p-3" defaultValue="" name="studentId">
                <option value="">Select student</option>
                {studentsForSelectedExam.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.label}
                  </option>
                ))}
              </select>
              <input className="w-full rounded-2xl border border-black/10 p-3" name="score" placeholder="Score" type="number" />
              {selectedScoreExam ? <p className="text-sm text-black/55">Exam max score: {selectedScoreExam.maxScore}</p> : null}
              <button className="rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white" type="submit">Record score</button>
            </form>
          </Panel>
        </>
      ) : null}

      <Panel subtitle="Performance" title="Reports and ranking">
        <Items
          values={[
            `Class ranking entries: ${ranking.length}`,
            `Report card rows: ${reportCard?.rows?.length ?? 0}`,
            `Report card total: ${String(reportCard?.totalScore ?? 0)}`
          ]}
        />
        {defaultStudentId ? (
          <button className="rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white" onClick={() => handleReportCardDownload(defaultStudentId)} type="button">
            Download report card PDF
          </button>
        ) : null}
      </Panel>
    </div>
  );
}
