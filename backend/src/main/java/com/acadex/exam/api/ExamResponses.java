package com.acadex.exam.api;

import java.util.List;
import java.util.UUID;

public final class ExamResponses {
    private ExamResponses() {}

    public record ExamResponse(UUID id, String name, UUID subjectId, UUID classId, UUID termId, double maxScore) {}
    public record GradingSchemeResponse(UUID id, double minScore, double maxScore, String letterGrade, double gradePoint) {}
    public record ScoreResponse(UUID id, UUID examId, UUID studentId, double score, String letterGrade) {}
    public record RankingEntry(UUID studentId, double totalScore, int rank) {}
    public record ReportCardRow(UUID examId, double score, String letterGrade) {}
    public record ReportCardResponse(UUID studentId, List<ReportCardRow> rows, double totalScore) {}
}
