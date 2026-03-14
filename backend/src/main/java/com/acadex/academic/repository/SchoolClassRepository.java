package com.acadex.academic.repository;

import com.acadex.academic.model.SchoolClass;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SchoolClassRepository extends JpaRepository<SchoolClass, UUID> {
    List<SchoolClass> findAllByTenantId(UUID tenantId);
    long countByTenantId(UUID tenantId);
}
