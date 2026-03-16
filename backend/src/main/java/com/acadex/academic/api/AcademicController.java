package com.acadex.academic.api;

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
import com.acadex.academic.service.AcademicService;
import com.acadex.auth.security.AcadexUserPrincipal;
import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/academic")
public class AcademicController {

    private final AcademicService academicService;

    public AcademicController(AcademicService academicService) {
        this.academicService = academicService;
    }

    @PostMapping("/years")
    @PreAuthorize("hasRole('SCHOOL_ADMIN') or hasRole('SUPER_ADMIN')")
    public AcademicYearResponse createYear(@RequestBody CreateAcademicYearRequest request, @AuthenticationPrincipal AcadexUserPrincipal principal) {
        return academicService.createAcademicYear(request, principal.getUserId());
    }

    @PostMapping("/terms")
    @PreAuthorize("hasRole('SCHOOL_ADMIN') or hasRole('SUPER_ADMIN')")
    public TermResponse createTerm(@RequestBody CreateTermRequest request, @AuthenticationPrincipal AcadexUserPrincipal principal) {
        return academicService.createTerm(request, principal.getUserId());
    }

    @PostMapping("/classes")
    @PreAuthorize("hasRole('SCHOOL_ADMIN') or hasRole('SUPER_ADMIN')")
    public SchoolClassResponse createClass(@RequestBody CreateClassRequest request, @AuthenticationPrincipal AcadexUserPrincipal principal) {
        return academicService.createClass(request, principal.getUserId());
    }

    @PostMapping("/subjects")
    @PreAuthorize("hasRole('SCHOOL_ADMIN') or hasRole('SUPER_ADMIN')")
    public SubjectResponse createSubject(@RequestBody CreateSubjectRequest request, @AuthenticationPrincipal AcadexUserPrincipal principal) {
        return academicService.createSubject(request, principal.getUserId());
    }

    @PostMapping("/subject-assignments")
    @PreAuthorize("hasRole('SCHOOL_ADMIN') or hasRole('SUPER_ADMIN')")
    public SubjectAssignmentResponse assignSubject(@RequestBody AssignSubjectRequest request, @AuthenticationPrincipal AcadexUserPrincipal principal) {
        return academicService.assignSubject(request, principal.getUserId());
    }

    @PostMapping("/enrollments")
    @PreAuthorize("hasRole('SCHOOL_ADMIN') or hasRole('SUPER_ADMIN')")
    public EnrollmentResponse enroll(@RequestBody EnrollStudentRequest request, @AuthenticationPrincipal AcadexUserPrincipal principal) {
        return academicService.enrollStudent(request, principal.getUserId());
    }

    @GetMapping("/years")
    public List<AcademicYearResponse> years() { return academicService.listAcademicYears(); }

    @GetMapping("/terms")
    public List<TermResponse> terms() { return academicService.listTerms(); }

    @GetMapping("/classes")
    public List<SchoolClassResponse> classesList() { return academicService.listClasses(); }

    @GetMapping("/subjects")
    public List<SubjectResponse> subjects() { return academicService.listSubjects(); }

    @GetMapping("/subject-assignments")
    @PreAuthorize("hasRole('SCHOOL_ADMIN') or hasRole('SUPER_ADMIN')")
    public List<SubjectAssignmentResponse> subjectAssignments() { return academicService.listSubjectAssignments(); }

    @GetMapping("/subject-assignments/me")
    @PreAuthorize("hasRole('TEACHER')")
    public List<TeacherAssignmentResponse> mySubjectAssignments(@AuthenticationPrincipal AcadexUserPrincipal principal) {
        return academicService.listTeacherAssignments(principal.getUserId());
    }

    @GetMapping("/enrollments")
    public List<EnrollmentResponse> enrollments() { return academicService.listEnrollments(); }
}
