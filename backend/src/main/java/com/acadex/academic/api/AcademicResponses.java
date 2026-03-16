package com.acadex.academic.api;

import com.acadex.academic.model.EnrollmentStatus;
import java.time.LocalDate;
import java.util.UUID;

public final class AcademicResponses {
    private AcademicResponses() {}

    public record AcademicYearResponse(UUID id, String name, LocalDate startDate, LocalDate endDate, boolean active) {}
    public record TermResponse(UUID id, UUID academicYearId, String name, LocalDate startDate, LocalDate endDate) {}
    public record SchoolClassResponse(UUID id, String name, String levelName, UUID classTeacherId) {}
    public record SubjectResponse(UUID id, String name, String code) {}
    public record SubjectAssignmentResponse(UUID id, UUID subjectId, UUID teacherId, UUID classId) {}
    public record TeacherAssignmentResponse(
            UUID assignmentId,
            UUID teacherId,
            UUID classId,
            String className,
            String levelName,
            boolean classTeacher,
            UUID subjectId,
            String subjectName,
            String subjectCode
    ) {}
    public record EnrollmentResponse(UUID id, UUID studentId, UUID classId, UUID academicYearId, EnrollmentStatus status) {}
}
