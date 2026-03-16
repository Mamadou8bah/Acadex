package com.acadex.security;

import com.acadex.academic.model.SchoolClass;
import com.acadex.academic.model.StudentEnrollment;
import com.acadex.academic.repository.SchoolClassRepository;
import com.acadex.academic.repository.StudentEnrollmentRepository;
import com.acadex.academic.repository.SubjectAssignmentRepository;
import com.acadex.announcement.model.AnnouncementAudience;
import com.acadex.auth.security.AcadexUserPrincipal;
import com.acadex.user.model.PlatformRole;
import java.util.EnumSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import org.springframework.stereotype.Service;

@Service
public class AccessScopeService {

    private final StudentEnrollmentRepository studentEnrollmentRepository;
    private final SchoolClassRepository schoolClassRepository;
    private final SubjectAssignmentRepository subjectAssignmentRepository;

    public AccessScopeService(
            StudentEnrollmentRepository studentEnrollmentRepository,
            SchoolClassRepository schoolClassRepository,
            SubjectAssignmentRepository subjectAssignmentRepository
    ) {
        this.studentEnrollmentRepository = studentEnrollmentRepository;
        this.schoolClassRepository = schoolClassRepository;
        this.subjectAssignmentRepository = subjectAssignmentRepository;
    }

    public boolean canAccessStudent(UUID tenantId, UUID studentId, AcadexUserPrincipal principal) {
        if (isAdmin(principal.getRole())) {
            return true;
        }
        if (principal.getRole() == PlatformRole.STUDENT) {
            return principal.getUserId().equals(studentId);
        }
        if (principal.getRole() == PlatformRole.TEACHER) {
            return studentEnrollmentRepository.findAllByTenantIdAndStudentId(tenantId, studentId).stream()
                    .anyMatch(enrollment -> canAccessClass(tenantId, enrollment.getClassId(), principal));
        }
        return false;
    }

    public boolean canAccessClass(UUID tenantId, UUID classId, AcadexUserPrincipal principal) {
        if (isAdmin(principal.getRole())) {
            return true;
        }
        if (principal.getRole() == PlatformRole.TEACHER) {
            SchoolClass schoolClass = schoolClassRepository.findByIdAndTenantId(classId, tenantId).orElse(null);
            if (schoolClass != null && principal.getUserId().equals(schoolClass.getClassTeacherId())) {
                return true;
            }
            return subjectAssignmentRepository.findAllByTenantIdAndTeacherId(tenantId, principal.getUserId()).stream()
                    .anyMatch(assignment -> assignment.getClassId().equals(classId));
        }
        if (principal.getRole() == PlatformRole.STUDENT) {
            return studentEnrollmentRepository.findAllByTenantIdAndStudentId(tenantId, principal.getUserId()).stream()
                    .map(StudentEnrollment::getClassId)
                    .anyMatch(classId::equals);
        }
        return false;
    }

    public Set<AnnouncementAudience> allowedAudiences(PlatformRole role) {
        return switch (role) {
            case SUPER_ADMIN, SCHOOL_ADMIN -> EnumSet.allOf(AnnouncementAudience.class);
            case TEACHER -> EnumSet.of(AnnouncementAudience.SCHOOL_WIDE, AnnouncementAudience.TEACHERS, AnnouncementAudience.CLASS_SPECIFIC);
            case STUDENT -> EnumSet.of(AnnouncementAudience.SCHOOL_WIDE, AnnouncementAudience.STUDENTS, AnnouncementAudience.CLASS_SPECIFIC);
            case PARENT -> EnumSet.of(AnnouncementAudience.SCHOOL_WIDE, AnnouncementAudience.PARENTS, AnnouncementAudience.CLASS_SPECIFIC);
        };
    }

    public List<UUID> accessibleStudentIds(UUID tenantId, AcadexUserPrincipal principal) {
        if (principal.getRole() == PlatformRole.STUDENT) {
            return List.of(principal.getUserId());
        }
        if (principal.getRole() == PlatformRole.TEACHER) {
            return studentEnrollmentRepository.findAllByTenantId(tenantId).stream()
                    .filter(enrollment -> canAccessClass(tenantId, enrollment.getClassId(), principal))
                    .map(StudentEnrollment::getStudentId)
                    .distinct()
                    .toList();
        }
        return List.of();
    }

    private boolean isAdmin(PlatformRole role) {
        return role == PlatformRole.SUPER_ADMIN || role == PlatformRole.SCHOOL_ADMIN;
    }
}
