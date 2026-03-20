package com.acadex.exam.service;

import com.acadex.audit.service.AuditService;
import com.acadex.academic.repository.SubjectAssignmentRepository;
import com.acadex.auth.security.AcadexUserPrincipal;
import com.acadex.exam.api.ExamRequests.CreateExamRequest;
import com.acadex.exam.api.ExamRequests.CreateGradingSchemeRequest;
import com.acadex.exam.api.ExamRequests.RecordScoreRequest;
import com.acadex.exam.api.ExamResponses.ExamResponse;
import com.acadex.exam.api.ExamResponses.GradingSchemeResponse;
import com.acadex.exam.api.ExamResponses.RankingEntry;
import com.acadex.exam.api.ExamResponses.ReportCardResponse;
import com.acadex.exam.api.ExamResponses.ReportCardRow;
import com.acadex.exam.api.ExamResponses.ScoreResponse;
import com.acadex.exam.model.Exam;
import com.acadex.exam.model.GradingScheme;
import com.acadex.exam.model.StudentScore;
import com.acadex.exam.repository.ExamRepository;
import com.acadex.exam.repository.GradingSchemeRepository;
import com.acadex.exam.repository.StudentScoreRepository;
import com.acadex.notification.service.NotificationService;
import com.acadex.security.AccessScopeService;
import com.acadex.tenant.TenantAccessService;
import com.acadex.user.model.PlatformRole;
import com.acadex.user.repository.UserAccountRepository;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.FORBIDDEN;
import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
public class ExamService {

    private final TenantAccessService tenantAccessService;
    private final AuditService auditService;
    private final ExamRepository examRepository;
    private final GradingSchemeRepository gradingSchemeRepository;
    private final StudentScoreRepository studentScoreRepository;
    private final UserAccountRepository userAccountRepository;
    private final NotificationService notificationService;
    private final SubjectAssignmentRepository subjectAssignmentRepository;
    private final AccessScopeService accessScopeService;

    public ExamService(
            TenantAccessService tenantAccessService,
            AuditService auditService,
            ExamRepository examRepository,
            GradingSchemeRepository gradingSchemeRepository,
            StudentScoreRepository studentScoreRepository,
            UserAccountRepository userAccountRepository,
            NotificationService notificationService,
            SubjectAssignmentRepository subjectAssignmentRepository,
            AccessScopeService accessScopeService
    ) {
        this.tenantAccessService = tenantAccessService;
        this.auditService = auditService;
        this.examRepository = examRepository;
        this.gradingSchemeRepository = gradingSchemeRepository;
        this.studentScoreRepository = studentScoreRepository;
        this.userAccountRepository = userAccountRepository;
        this.notificationService = notificationService;
        this.subjectAssignmentRepository = subjectAssignmentRepository;
        this.accessScopeService = accessScopeService;
    }

    @Transactional
    public ExamResponse createExam(CreateExamRequest request, UUID actorId, PlatformRole actorRole) {
        UUID tenantId = tenantAccessService.requireTenant();
        ensureTeacherCanManageSubject(actorRole, tenantId, actorId, request.classId(), request.subjectId(), request.termId());
        Exam exam = new Exam();
        exam.setTenantId(tenantId);
        exam.setName(request.name());
        exam.setSubjectId(request.subjectId());
        exam.setClassId(request.classId());
        exam.setTermId(request.termId());
        exam.setMaxScore(request.maxScore());
        exam.setExamDate(request.examDate());
        examRepository.save(exam);
        auditService.log(tenantId, actorId, "EXAM_CREATED", "Exam", exam.getId().toString(), exam.getName());
        userAccountRepository.findAllByTenantId(tenantId).stream()
                .filter(user -> user.getRole() == PlatformRole.PARENT || user.getRole() == PlatformRole.STUDENT)
                .forEach(user -> notificationService.queueEmail(tenantId, user.getId(), "Exam scheduled", exam.getName() + " has been scheduled."));
        return new ExamResponse(exam.getId(), exam.getName(), exam.getSubjectId(), exam.getClassId(), exam.getTermId(), exam.getMaxScore());
    }

    @Transactional
    public GradingSchemeResponse createGradingScheme(CreateGradingSchemeRequest request, UUID actorId) {
        UUID tenantId = tenantAccessService.requireTenant();
        GradingScheme scheme = new GradingScheme();
        scheme.setTenantId(tenantId);
        scheme.setMinScore(request.minScore());
        scheme.setMaxScore(request.maxScore());
        scheme.setLetterGrade(request.letterGrade());
        scheme.setGradePoint(request.gradePoint());
        gradingSchemeRepository.save(scheme);
        auditService.log(tenantId, actorId, "GRADING_SCHEME_CREATED", "GradingScheme", scheme.getId().toString(), scheme.getLetterGrade());
        return new GradingSchemeResponse(scheme.getId(), scheme.getMinScore(), scheme.getMaxScore(), scheme.getLetterGrade(), scheme.getGradePoint());
    }

    @Transactional
    public ScoreResponse recordScore(RecordScoreRequest request, UUID actorId, PlatformRole actorRole) {
        UUID tenantId = tenantAccessService.requireTenant();
        Exam exam = examRepository.findByIdAndTenantId(request.examId(), tenantId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Exam not found."));
        ensureTeacherCanManageSubject(actorRole, tenantId, actorId, exam.getClassId(), exam.getSubjectId(), exam.getTermId());
        if (request.score() < 0) {
            throw new ResponseStatusException(BAD_REQUEST, "Score cannot be negative.");
        }
        if (request.score() > exam.getMaxScore()) {
            throw new ResponseStatusException(BAD_REQUEST, "Score cannot be greater than the exam max score.");
        }
        StudentScore score = new StudentScore();
        score.setTenantId(tenantId);
        score.setExamId(exam.getId());
        score.setStudentId(request.studentId());
        score.setScore(request.score());
        studentScoreRepository.save(score);
        String grade = resolveGrade(tenantId, request.score());
        auditService.log(tenantId, actorId, "GRADE_UPDATED", "StudentScore", score.getId().toString(), grade);
        return new ScoreResponse(score.getId(), score.getExamId(), score.getStudentId(), score.getScore(), grade);
    }

    @Transactional(readOnly = true)
    public List<ExamResponse> listExams(UUID actorId, PlatformRole actorRole) {
        UUID tenantId = tenantAccessService.requireTenant();
        return examRepository.findAllByTenantId(tenantId).stream()
                .filter(exam -> actorRole != PlatformRole.TEACHER
                        || subjectAssignmentRepository.existsByTenantIdAndClassIdAndSubjectIdAndTermIdAndTeacherId(
                                tenantId,
                                exam.getClassId(),
                                exam.getSubjectId(),
                                exam.getTermId(),
                                actorId
                        ))
                .map(exam -> new ExamResponse(exam.getId(), exam.getName(), exam.getSubjectId(), exam.getClassId(), exam.getTermId(), exam.getMaxScore()))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<RankingEntry> ranking(UUID classId, AcadexUserPrincipal principal) {
        UUID tenantId = tenantAccessService.requireTenant();
        if (!accessScopeService.canAccessClass(tenantId, classId, principal)) {
            throw new ResponseStatusException(FORBIDDEN, "You cannot view ranking for this class.");
        }
        List<UUID> examIds = examRepository.findAllByTenantIdAndClassId(tenantId, classId).stream().map(Exam::getId).toList();
        Map<UUID, Double> totals = studentScoreRepository.findAll().stream()
                .filter(item -> tenantId.equals(item.getTenantId()) && examIds.contains(item.getExamId()))
                .collect(Collectors.groupingBy(StudentScore::getStudentId, Collectors.summingDouble(StudentScore::getScore)));
        List<Map.Entry<UUID, Double>> ordered = totals.entrySet().stream()
                .sorted(Map.Entry.<UUID, Double>comparingByValue(Comparator.reverseOrder()))
                .toList();
        java.util.List<RankingEntry> ranking = new java.util.ArrayList<>();
        for (int i = 0; i < ordered.size(); i++) {
            ranking.add(new RankingEntry(ordered.get(i).getKey(), ordered.get(i).getValue(), i + 1));
        }
        return ranking;
    }

    @Transactional(readOnly = true)
    public ReportCardResponse reportCard(UUID studentId, AcadexUserPrincipal principal) {
        UUID tenantId = tenantAccessService.requireTenant();
        if (!accessScopeService.canAccessStudent(tenantId, studentId, principal)) {
            throw new ResponseStatusException(FORBIDDEN, "You cannot view this report card.");
        }
        List<StudentScore> scores = studentScoreRepository.findAllByTenantIdAndStudentId(tenantId, studentId);
        List<ReportCardRow> rows = scores.stream()
                .map(score -> new ReportCardRow(score.getExamId(), score.getScore(), resolveGrade(tenantId, score.getScore())))
                .toList();
        double total = scores.stream().mapToDouble(StudentScore::getScore).sum();
        return new ReportCardResponse(studentId, rows, total);
    }

    @Transactional(readOnly = true)
    public byte[] reportCardPdf(UUID studentId, AcadexUserPrincipal principal) {
        ReportCardResponse card = reportCard(studentId, principal);
        try (PDDocument document = new PDDocument(); ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
            PDPage page = new PDPage();
            document.addPage(page);
            try (PDPageContentStream contentStream = new PDPageContentStream(document, page)) {
                contentStream.beginText();
                contentStream.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD), 14);
                contentStream.newLineAtOffset(50, 750);
                contentStream.showText("Acadex Report Card");
                contentStream.newLineAtOffset(0, -20);
                contentStream.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA), 11);
                contentStream.showText("Student: " + studentId);
                for (ReportCardRow row : card.rows()) {
                    contentStream.newLineAtOffset(0, -18);
                    contentStream.showText("Exam " + row.examId() + " | Score: " + row.score() + " | Grade: " + row.letterGrade());
                }
                contentStream.newLineAtOffset(0, -20);
                contentStream.showText("Total: " + card.totalScore());
                contentStream.endText();
            }
            document.save(outputStream);
            return outputStream.toByteArray();
        } catch (IOException ex) {
            throw new IllegalStateException("Unable to generate PDF", ex);
        }
    }

    private String resolveGrade(UUID tenantId, double score) {
        return gradingSchemeRepository.findAllByTenantIdOrderByMaxScoreDesc(tenantId).stream()
                .filter(item -> score >= item.getMinScore() && score <= item.getMaxScore())
                .findFirst()
                .map(GradingScheme::getLetterGrade)
                .orElse("N/A");
    }

    private void ensureTeacherCanManageSubject(
            PlatformRole actorRole,
            UUID tenantId,
            UUID actorId,
            UUID classId,
            UUID subjectId,
            UUID termId
    ) {
        if (actorRole != PlatformRole.TEACHER) {
            return;
        }
        boolean assigned = subjectAssignmentRepository.existsByTenantIdAndClassIdAndSubjectIdAndTermIdAndTeacherId(
                tenantId,
                classId,
                subjectId,
                termId,
                actorId
        );
        if (!assigned) {
            throw new ResponseStatusException(FORBIDDEN, "You are not assigned to teach this class for the selected subject.");
        }
    }
}
