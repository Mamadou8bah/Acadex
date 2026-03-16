package com.acadex.academic.service;

import com.acadex.academic.api.AcademicRequests.AssignSubjectRequest;
import com.acadex.academic.api.AcademicRequests.CreateAcademicYearRequest;
import com.acadex.academic.api.AcademicRequests.CreateClassRequest;
import com.acadex.academic.api.AcademicRequests.CreateSubjectRequest;
import com.acadex.academic.api.AcademicRequests.CreateTermRequest;
import com.acadex.academic.api.AcademicRequests.EnrollStudentRequest;
import com.acadex.academic.api.AcademicResponses.AcademicYearResponse;
import com.acadex.academic.api.AcademicResponses.EnrollmentResponse;
import com.acadex.academic.api.AcademicResponses.SchoolClassResponse;
import com.acadex.academic.api.AcademicResponses.SubjectAssignmentResponse;
import com.acadex.academic.api.AcademicResponses.SubjectResponse;
import com.acadex.academic.api.AcademicResponses.TeacherAssignmentResponse;
import com.acadex.academic.api.AcademicResponses.TermResponse;
import com.acadex.academic.model.AcademicYear;
import com.acadex.academic.model.SchoolClass;
import com.acadex.academic.model.StudentEnrollment;
import com.acadex.academic.model.Subject;
import com.acadex.academic.model.SubjectAssignment;
import com.acadex.academic.model.Term;
import com.acadex.academic.repository.AcademicYearRepository;
import com.acadex.academic.repository.SchoolClassRepository;
import com.acadex.academic.repository.StudentEnrollmentRepository;
import com.acadex.academic.repository.SubjectAssignmentRepository;
import com.acadex.academic.repository.SubjectRepository;
import com.acadex.academic.repository.TermRepository;
import com.acadex.audit.service.AuditService;
import com.acadex.tenant.TenantAccessService;
import com.acadex.user.model.PlatformRole;
import com.acadex.user.model.UserAccount;
import com.acadex.user.repository.UserAccountRepository;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
public class AcademicService {

    private final TenantAccessService tenantAccessService;
    private final AuditService auditService;
    private final AcademicYearRepository academicYearRepository;
    private final TermRepository termRepository;
    private final SchoolClassRepository schoolClassRepository;
    private final SubjectRepository subjectRepository;
    private final SubjectAssignmentRepository subjectAssignmentRepository;
    private final StudentEnrollmentRepository studentEnrollmentRepository;
    private final UserAccountRepository userAccountRepository;

    public AcademicService(
            TenantAccessService tenantAccessService,
            AuditService auditService,
            AcademicYearRepository academicYearRepository,
            TermRepository termRepository,
            SchoolClassRepository schoolClassRepository,
            SubjectRepository subjectRepository,
            SubjectAssignmentRepository subjectAssignmentRepository,
            StudentEnrollmentRepository studentEnrollmentRepository,
            UserAccountRepository userAccountRepository
    ) {
        this.tenantAccessService = tenantAccessService;
        this.auditService = auditService;
        this.academicYearRepository = academicYearRepository;
        this.termRepository = termRepository;
        this.schoolClassRepository = schoolClassRepository;
        this.subjectRepository = subjectRepository;
        this.subjectAssignmentRepository = subjectAssignmentRepository;
        this.studentEnrollmentRepository = studentEnrollmentRepository;
        this.userAccountRepository = userAccountRepository;
    }

    @Transactional
    public AcademicYearResponse createAcademicYear(CreateAcademicYearRequest request, UUID actorId) {
        UUID tenantId = tenantAccessService.requireTenant();
        AcademicYear entity = new AcademicYear();
        entity.setTenantId(tenantId);
        entity.setName(request.name());
        entity.setStartDate(request.startDate());
        entity.setEndDate(request.endDate());
        entity.setActive(request.active());
        academicYearRepository.save(entity);
        auditService.log(tenantId, actorId, "ACADEMIC_YEAR_CREATED", "AcademicYear", entity.getId().toString(), entity.getName());
        return new AcademicYearResponse(entity.getId(), entity.getName(), entity.getStartDate(), entity.getEndDate(), entity.isActive());
    }

    @Transactional
    public TermResponse createTerm(CreateTermRequest request, UUID actorId) {
        UUID tenantId = tenantAccessService.requireTenant();
        Term entity = new Term();
        entity.setTenantId(tenantId);
        entity.setAcademicYearId(request.academicYearId());
        entity.setName(request.name());
        entity.setStartDate(request.startDate());
        entity.setEndDate(request.endDate());
        termRepository.save(entity);
        auditService.log(tenantId, actorId, "TERM_CREATED", "Term", entity.getId().toString(), entity.getName());
        return new TermResponse(entity.getId(), entity.getAcademicYearId(), entity.getName(), entity.getStartDate(), entity.getEndDate());
    }

    @Transactional
    public SchoolClassResponse createClass(CreateClassRequest request, UUID actorId) {
        UUID tenantId = tenantAccessService.requireTenant();
        SchoolClass entity = new SchoolClass();
        entity.setTenantId(tenantId);
        entity.setName(request.name());
        entity.setLevelName(request.levelName());
        entity.setClassTeacherId(request.classTeacherId());
        schoolClassRepository.save(entity);
        auditService.log(tenantId, actorId, "CLASS_CREATED", "SchoolClass", entity.getId().toString(), entity.getName());
        return new SchoolClassResponse(entity.getId(), entity.getName(), entity.getLevelName(), entity.getClassTeacherId());
    }

    @Transactional
    public SubjectResponse createSubject(CreateSubjectRequest request, UUID actorId) {
        UUID tenantId = tenantAccessService.requireTenant();
        Subject entity = new Subject();
        entity.setTenantId(tenantId);
        entity.setName(request.name());
        entity.setCode(request.code());
        subjectRepository.save(entity);
        auditService.log(tenantId, actorId, "SUBJECT_CREATED", "Subject", entity.getId().toString(), entity.getName());
        return new SubjectResponse(entity.getId(), entity.getName(), entity.getCode());
    }

    @Transactional
    public SubjectAssignmentResponse assignSubject(AssignSubjectRequest request, UUID actorId) {
        UUID tenantId = tenantAccessService.requireTenant();
        Subject subject = subjectRepository.findByIdAndTenantId(request.subjectId(), tenantId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Subject not found."));
        SchoolClass schoolClass = schoolClassRepository.findByIdAndTenantId(request.classId(), tenantId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Class not found."));
        UserAccount teacher = userAccountRepository.findByIdAndTenantId(request.teacherId(), tenantId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Teacher not found."));
        if (teacher.getRole() != PlatformRole.TEACHER) {
            throw new ResponseStatusException(BAD_REQUEST, "Only teachers can receive subject assignments.");
        }
        if (subjectAssignmentRepository.existsByTenantIdAndClassIdAndSubjectId(tenantId, request.classId(), request.subjectId())) {
            throw new ResponseStatusException(BAD_REQUEST, "This class already has a teacher assigned for the subject.");
        }
        SubjectAssignment entity = new SubjectAssignment();
        entity.setTenantId(tenantId);
        entity.setSubjectId(request.subjectId());
        entity.setTeacherId(request.teacherId());
        entity.setClassId(request.classId());
        subjectAssignmentRepository.save(entity);
        auditService.log(tenantId, actorId, "SUBJECT_ASSIGNED", "SubjectAssignment", entity.getId().toString(), entity.getSubjectId().toString());
        return new SubjectAssignmentResponse(entity.getId(), subject.getId(), teacher.getId(), schoolClass.getId());
    }

    @Transactional
    public EnrollmentResponse enrollStudent(EnrollStudentRequest request, UUID actorId) {
        UUID tenantId = tenantAccessService.requireTenant();
        StudentEnrollment entity = new StudentEnrollment();
        entity.setTenantId(tenantId);
        entity.setStudentId(request.studentId());
        entity.setClassId(request.classId());
        entity.setAcademicYearId(request.academicYearId());
        studentEnrollmentRepository.save(entity);
        auditService.log(tenantId, actorId, "STUDENT_ENROLLED", "StudentEnrollment", entity.getId().toString(), entity.getStudentId().toString());
        return new EnrollmentResponse(entity.getId(), entity.getStudentId(), entity.getClassId(), entity.getAcademicYearId(), entity.getStatus());
    }

    @Transactional(readOnly = true)
    public List<AcademicYearResponse> listAcademicYears() {
        UUID tenantId = tenantAccessService.requireTenant();
        return academicYearRepository.findAllByTenantId(tenantId).stream()
                .map(entity -> new AcademicYearResponse(entity.getId(), entity.getName(), entity.getStartDate(), entity.getEndDate(), entity.isActive()))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<TermResponse> listTerms() {
        UUID tenantId = tenantAccessService.requireTenant();
        return termRepository.findAllByTenantId(tenantId).stream()
                .map(entity -> new TermResponse(entity.getId(), entity.getAcademicYearId(), entity.getName(), entity.getStartDate(), entity.getEndDate()))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<SchoolClassResponse> listClasses() {
        UUID tenantId = tenantAccessService.requireTenant();
        return schoolClassRepository.findAllByTenantId(tenantId).stream()
                .map(entity -> new SchoolClassResponse(entity.getId(), entity.getName(), entity.getLevelName(), entity.getClassTeacherId()))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<SubjectResponse> listSubjects() {
        UUID tenantId = tenantAccessService.requireTenant();
        return subjectRepository.findAllByTenantId(tenantId).stream()
                .map(entity -> new SubjectResponse(entity.getId(), entity.getName(), entity.getCode()))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<EnrollmentResponse> listEnrollments() {
        UUID tenantId = tenantAccessService.requireTenant();
        return studentEnrollmentRepository.findAllByTenantId(tenantId).stream()
                .map(entity -> new EnrollmentResponse(entity.getId(), entity.getStudentId(), entity.getClassId(), entity.getAcademicYearId(), entity.getStatus()))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<SubjectAssignmentResponse> listSubjectAssignments() {
        UUID tenantId = tenantAccessService.requireTenant();
        return subjectAssignmentRepository.findAllByTenantId(tenantId).stream()
                .map(entity -> new SubjectAssignmentResponse(entity.getId(), entity.getSubjectId(), entity.getTeacherId(), entity.getClassId()))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<TeacherAssignmentResponse> listTeacherAssignments(UUID teacherId) {
        UUID tenantId = tenantAccessService.requireTenant();
        List<SchoolClass> classes = schoolClassRepository.findAllByTenantId(tenantId);
        List<Subject> subjects = subjectRepository.findAllByTenantId(tenantId);
        return subjectAssignmentRepository.findAllByTenantIdAndTeacherId(tenantId, teacherId).stream()
                .map(assignment -> toTeacherAssignmentResponse(assignment, classes, subjects))
                .toList();
    }

    private TeacherAssignmentResponse toTeacherAssignmentResponse(
            SubjectAssignment assignment,
            List<SchoolClass> classes,
            List<Subject> subjects
    ) {
        SchoolClass schoolClass = classes.stream()
                .filter(item -> item.getId().equals(assignment.getClassId()))
                .findFirst()
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Assigned class no longer exists."));
        Subject subject = subjects.stream()
                .filter(item -> item.getId().equals(assignment.getSubjectId()))
                .findFirst()
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Assigned subject no longer exists."));
        boolean isClassTeacher = assignment.getTeacherId().equals(schoolClass.getClassTeacherId());
        return new TeacherAssignmentResponse(
                assignment.getId(),
                assignment.getTeacherId(),
                schoolClass.getId(),
                schoolClass.getName(),
                schoolClass.getLevelName(),
                isClassTeacher,
                subject.getId(),
                subject.getName(),
                subject.getCode()
        );
    }
}
