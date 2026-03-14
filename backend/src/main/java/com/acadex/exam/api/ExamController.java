package com.acadex.exam.api;

import com.acadex.auth.security.AcadexUserPrincipal;
import com.acadex.exam.api.ExamRequests.CreateExamRequest;
import com.acadex.exam.api.ExamRequests.CreateGradingSchemeRequest;
import com.acadex.exam.api.ExamRequests.RecordScoreRequest;
import com.acadex.exam.api.ExamResponses.ExamResponse;
import com.acadex.exam.api.ExamResponses.GradingSchemeResponse;
import com.acadex.exam.api.ExamResponses.RankingEntry;
import com.acadex.exam.api.ExamResponses.ReportCardResponse;
import com.acadex.exam.api.ExamResponses.ScoreResponse;
import com.acadex.exam.service.ExamService;
import java.util.List;
import java.util.UUID;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/exams")
public class ExamController {

    private final ExamService examService;

    public ExamController(ExamService examService) {
        this.examService = examService;
    }

    @PostMapping
    @PreAuthorize("hasRole('TEACHER') or hasRole('SCHOOL_ADMIN') or hasRole('SUPER_ADMIN')")
    public ExamResponse createExam(@RequestBody CreateExamRequest request, @AuthenticationPrincipal AcadexUserPrincipal principal) {
        return examService.createExam(request, principal.getUserId());
    }

    @PostMapping("/grading-schemes")
    @PreAuthorize("hasRole('SCHOOL_ADMIN') or hasRole('SUPER_ADMIN')")
    public GradingSchemeResponse createScheme(@RequestBody CreateGradingSchemeRequest request, @AuthenticationPrincipal AcadexUserPrincipal principal) {
        return examService.createGradingScheme(request, principal.getUserId());
    }

    @PostMapping("/scores")
    @PreAuthorize("hasRole('TEACHER') or hasRole('SCHOOL_ADMIN') or hasRole('SUPER_ADMIN')")
    public ScoreResponse recordScore(@RequestBody RecordScoreRequest request, @AuthenticationPrincipal AcadexUserPrincipal principal) {
        return examService.recordScore(request, principal.getUserId());
    }

    @GetMapping("/classes/{classId}/ranking")
    public List<RankingEntry> ranking(@PathVariable UUID classId) {
        return examService.ranking(classId);
    }

    @GetMapping("/students/{studentId}/report-card")
    public ReportCardResponse reportCard(@PathVariable UUID studentId) {
        return examService.reportCard(studentId);
    }

    @GetMapping(value = "/students/{studentId}/report-card/pdf", produces = MediaType.APPLICATION_PDF_VALUE)
    public byte[] reportCardPdf(@PathVariable UUID studentId) {
        return examService.reportCardPdf(studentId);
    }
}
