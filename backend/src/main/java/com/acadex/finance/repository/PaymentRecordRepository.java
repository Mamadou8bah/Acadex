package com.acadex.finance.repository;

import com.acadex.finance.model.PaymentRecord;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PaymentRecordRepository extends JpaRepository<PaymentRecord, UUID> {
    List<PaymentRecord> findAllByTenantIdAndStudentId(UUID tenantId, UUID studentId);
}
