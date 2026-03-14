package com.acadex.finance.api;

import java.time.LocalDate;
import java.util.UUID;

public final class FinanceRequests {
    private FinanceRequests() {}

    public record CreateFeeStructureRequest(String name, UUID classId, double amount, LocalDate dueDate) {}
    public record GenerateInvoicesRequest(UUID feeStructureId, UUID classId) {}
    public record RecordPaymentRequest(UUID invoiceId, UUID studentId, double amount, String reference) {}
}
