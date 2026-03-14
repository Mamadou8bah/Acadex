package com.acadex.report.api;

public record BatchReportResponse(
        String reportName,
        long recordsProcessed,
        int batchesProcessed
) {
}
