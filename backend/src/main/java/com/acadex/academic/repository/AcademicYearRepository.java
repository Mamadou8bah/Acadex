package com.acadex.academic.repository;

import com.acadex.academic.model.AcademicYear;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AcademicYearRepository extends JpaRepository<AcademicYear, UUID> {
    List<AcademicYear> findAllByTenantId(UUID tenantId);
}
