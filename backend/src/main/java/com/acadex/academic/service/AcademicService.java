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
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

    public AcademicService(
            TenantAccessService tenantAccessService,
            AuditService auditService,
            AcademicYearRepository academicYearRepository,
            TermRepository termRepository,
            SchoolClassRepository schoolClassRepository,
            SubjectRepository subjectRepository,
            SubjectAssignmentRepository subjectAssignmentRepository,
            StudentEnrollmentRepository studentEnrollmentRepository
    ) {
        this.tenantAccessService = tenantAccessService;
        this.auditService = auditService;
        this.academicYearRepository = academicYearRepository;
        this.termRepository = termRepository;
        this.schoolClassRepository = schoolClassRepository;
        this.subjectRepository = subjectRepository;
        this.subjectAssignmentRepository = subjectAssignmentRepository;
        this.studentEnrollmentRepository = studentEnrollmentRepository;
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
        SubjectAssignment entity = new SubjectAssignment();
        entity.setTenantId(tenantId);
        entity.setSubjectId(request.subjectId());
        entity.setTeacherId(request.teacherId());
        entity.setClassId(request.classId());
        subjectAssignmentRepository.save(entity);
        auditService.log(tenantId, actorId, "SUBJECT_ASSIGNED", "SubjectAssignment", entity.getId().toString(), entity.getSubjectId().toString());
        return new SubjectAssignmentResponse(entity.getId(), entity.getSubjectId(), entity.getTeacherId(), entity.getClassId());
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
}
