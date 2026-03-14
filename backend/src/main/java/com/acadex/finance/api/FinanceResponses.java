package com.acadex.finance.api;

import com.acadex.finance.model.InvoiceStatus;
import java.util.List;
import java.util.UUID;

public final class FinanceResponses {
    private FinanceResponses() {}

    public record FeeStructureResponse(UUID id, String name, UUID classId, double amount) {}
    public record InvoiceResponse(UUID id, UUID studentId, UUID feeStructureId, double amount, InvoiceStatus status) {}
    public record PaymentResponse(UUID id, UUID invoiceId, UUID studentId, double amount, String reference) {}
    public record OutstandingResponse(UUID studentId, double totalOutstanding, List<InvoiceResponse> invoices) {}
    public record FinancialReportResponse(double totalInvoiced, double totalCollected, double outstandingBalance) {}
}
