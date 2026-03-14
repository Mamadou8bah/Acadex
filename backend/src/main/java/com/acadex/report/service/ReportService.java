package com.acadex.report.service;

import com.acadex.report.api.BatchReportResponse;
import com.acadex.tenant.TenantAccessService;
import com.acadex.user.model.UserAccount;
import com.acadex.user.repository.UserAccountRepository;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ReportService {

    private final UserAccountRepository userAccountRepository;
    private final TenantAccessService tenantAccessService;

    public ReportService(UserAccountRepository userAccountRepository, TenantAccessService tenantAccessService) {
        this.userAccountRepository = userAccountRepository;
        this.tenantAccessService = tenantAccessService;
    }

    @Transactional(readOnly = true)
    public BatchReportResponse generateTenantUserReport(int batchSize) {
        UUID tenantId = tenantAccessService.requireTenant();
        int page = 0;
        int batches = 0;
        long processed = 0;

        Page<UserAccount> batch;
        do {
            batch = userAccountRepository.findAllByTenantId(tenantId, PageRequest.of(page, batchSize));
            processed += batch.getNumberOfElements();
            batches++;
            page++;
        } while (batch.hasNext());

        return new BatchReportResponse("tenant-user-summary", processed, batches);
    }
}
