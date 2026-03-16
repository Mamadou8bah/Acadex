package com.acadex.academic.repository;

import com.acadex.academic.model.SubjectAssignment;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SubjectAssignmentRepository extends JpaRepository<SubjectAssignment, UUID> {
    List<SubjectAssignment> findAllByTenantId(UUID tenantId);
    List<SubjectAssignment> findAllByTenantIdAndTeacherId(UUID tenantId, UUID teacherId);
    boolean existsByTenantIdAndClassIdAndSubjectId(UUID tenantId, UUID classId, UUID subjectId);
    boolean existsByTenantIdAndClassIdAndSubjectIdAndTeacherId(UUID tenantId, UUID classId, UUID subjectId, UUID teacherId);
}
