package com.acadex.academic.api;

import java.time.LocalDate;
import java.util.UUID;

public final class AcademicRequests {
    private AcademicRequests() {}

    public record CreateAcademicYearRequest(String name, LocalDate startDate, LocalDate endDate, boolean active) {}
    public record CreateTermRequest(UUID academicYearId, String name, LocalDate startDate, LocalDate endDate) {}
    public record CreateClassRequest(String name, String levelName, UUID classTeacherId) {}
    public record CreateSubjectRequest(String name, String code) {}
    public record AssignSubjectRequest(UUID subjectId, UUID teacherId, UUID classId) {}
    public record EnrollStudentRequest(UUID studentId, UUID classId, UUID academicYearId) {}
}
