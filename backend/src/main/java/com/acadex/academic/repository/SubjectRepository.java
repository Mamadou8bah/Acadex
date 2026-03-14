package com.acadex.academic.repository;

import com.acadex.academic.model.Subject;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SubjectRepository extends JpaRepository<Subject, UUID> {
    List<Subject> findAllByTenantId(UUID tenantId);
}
