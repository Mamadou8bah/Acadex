package com.acadex.academic.repository;

import com.acadex.academic.model.StudentEnrollment;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StudentEnrollmentRepository extends JpaRepository<StudentEnrollment, UUID> {
    List<StudentEnrollment> findAllByTenantId(UUID tenantId);
    List<StudentEnrollment> findAllByTenantIdAndStudentId(UUID tenantId, UUID studentId);
    List<StudentEnrollment> findAllByTenantIdAndClassId(UUID tenantId, UUID classId);
    long countByTenantId(UUID tenantId);
}
