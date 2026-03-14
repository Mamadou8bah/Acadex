package com.acadex.academic.repository;

import com.acadex.academic.model.Term;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TermRepository extends JpaRepository<Term, UUID> {
    List<Term> findAllByTenantId(UUID tenantId);
}
