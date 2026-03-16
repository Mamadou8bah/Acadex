package com.acadex.exam.repository;

import com.acadex.exam.model.Exam;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ExamRepository extends JpaRepository<Exam, UUID> {
    List<Exam> findAllByTenantId(UUID tenantId);
    List<Exam> findAllByTenantIdAndClassId(UUID tenantId, UUID classId);
    Optional<Exam> findByIdAndTenantId(UUID id, UUID tenantId);
}
