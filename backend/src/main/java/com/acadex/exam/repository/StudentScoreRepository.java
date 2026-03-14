package com.acadex.exam.repository;

import com.acadex.exam.model.StudentScore;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StudentScoreRepository extends JpaRepository<StudentScore, UUID> {
    List<StudentScore> findAllByTenantIdAndStudentId(UUID tenantId, UUID studentId);
}
