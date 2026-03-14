package com.acadex.finance.repository;

import com.acadex.finance.model.Invoice;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InvoiceRepository extends JpaRepository<Invoice, UUID> {
    List<Invoice> findAllByTenantId(UUID tenantId);
    List<Invoice> findAllByTenantIdAndStudentId(UUID tenantId, UUID studentId);
}
