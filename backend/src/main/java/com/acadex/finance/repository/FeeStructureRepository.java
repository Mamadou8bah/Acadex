package com.acadex.finance.repository;

import com.acadex.finance.model.FeeStructure;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FeeStructureRepository extends JpaRepository<FeeStructure, UUID> {
}
