package com.acadex.finance.api;

import com.acadex.auth.security.AcadexUserPrincipal;
import com.acadex.finance.api.FinanceRequests.CreateFeeStructureRequest;
import com.acadex.finance.api.FinanceRequests.GenerateInvoicesRequest;
import com.acadex.finance.api.FinanceRequests.RecordPaymentRequest;
import com.acadex.finance.api.FinanceResponses.FeeStructureResponse;
import com.acadex.finance.api.FinanceResponses.FinancialReportResponse;
import com.acadex.finance.api.FinanceResponses.InvoiceResponse;
import com.acadex.finance.api.FinanceResponses.OutstandingResponse;
import com.acadex.finance.api.FinanceResponses.PaymentResponse;
import com.acadex.finance.service.FinanceService;
import java.util.List;
import java.util.UUID;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/finance")
public class FinanceController {

    private final FinanceService financeService;

    public FinanceController(FinanceService financeService) {
        this.financeService = financeService;
    }

    @PostMapping("/fee-structures")
    @PreAuthorize("hasRole('SCHOOL_ADMIN') or hasRole('SUPER_ADMIN')")
    public FeeStructureResponse createFeeStructure(@RequestBody CreateFeeStructureRequest request, @AuthenticationPrincipal AcadexUserPrincipal principal) {
        return financeService.createFeeStructure(request, principal.getUserId());
    }

    @PostMapping("/invoices")
    @PreAuthorize("hasRole('SCHOOL_ADMIN') or hasRole('SUPER_ADMIN')")
    public List<InvoiceResponse> generateInvoices(@RequestBody GenerateInvoicesRequest request, @AuthenticationPrincipal AcadexUserPrincipal principal) {
        return financeService.generateInvoices(request, principal.getUserId());
    }

    @PostMapping("/payments")
    @PreAuthorize("hasRole('SCHOOL_ADMIN') or hasRole('SUPER_ADMIN')")
    public PaymentResponse recordPayment(@RequestBody RecordPaymentRequest request, @AuthenticationPrincipal AcadexUserPrincipal principal) {
        return financeService.recordPayment(request, principal.getUserId());
    }

    @GetMapping("/students/{studentId}/outstanding")
    public OutstandingResponse outstanding(@PathVariable UUID studentId) {
        return financeService.outstanding(studentId);
    }

    @GetMapping("/students/{studentId}/payments")
    public List<PaymentResponse> payments(@PathVariable UUID studentId) {
        return financeService.paymentHistory(studentId);
    }

    @GetMapping("/reports/summary")
    public FinancialReportResponse summary() {
        return financeService.financialReport();
    }
}
