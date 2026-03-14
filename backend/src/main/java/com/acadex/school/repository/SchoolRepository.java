package com.acadex.school.repository;

import com.acadex.school.model.School;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SchoolRepository extends JpaRepository<School, UUID> {
    Optional<School> findBySlug(String slug);
    Page<School> findAllByOrderByCreatedAtDesc(Pageable pageable);
}
