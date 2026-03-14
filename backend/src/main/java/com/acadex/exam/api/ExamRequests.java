package com.acadex.exam.api;

import java.time.LocalDate;
import java.util.UUID;

public final class ExamRequests {
    private ExamRequests() {}

    public record CreateExamRequest(String name, UUID subjectId, UUID classId, UUID termId, double maxScore, LocalDate examDate) {}
    public record CreateGradingSchemeRequest(double minScore, double maxScore, String letterGrade, double gradePoint) {}
    public record RecordScoreRequest(UUID examId, UUID studentId, double score) {}
}
