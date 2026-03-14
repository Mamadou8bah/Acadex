package com.acadex.exam.repository;

import com.acadex.exam.model.GradingScheme;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface GradingSchemeRepository extends JpaRepository<GradingScheme, UUID> {
    List<GradingScheme> findAllByTenantIdOrderByMaxScoreDesc(UUID tenantId);
}
