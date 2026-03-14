package com.acadex.report.api;

import com.acadex.report.service.ReportService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/reports")
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping("/tenant-user-summary")
    public BatchReportResponse tenantUserSummary(@RequestParam(defaultValue = "100") int batchSize) {
        return reportService.generateTenantUserReport(batchSize);
    }
}
