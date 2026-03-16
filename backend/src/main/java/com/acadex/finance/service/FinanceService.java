package com.acadex.finance.service;

import com.acadex.academic.repository.StudentEnrollmentRepository;
import com.acadex.auth.security.AcadexUserPrincipal;
import com.acadex.audit.service.AuditService;
import com.acadex.feature.model.FeatureFlag;
import com.acadex.feature.service.FeatureAccessService;
import com.acadex.finance.api.FinanceRequests.CreateFeeStructureRequest;
import com.acadex.finance.api.FinanceRequests.GenerateInvoicesRequest;
import com.acadex.finance.api.FinanceRequests.RecordPaymentRequest;
import com.acadex.finance.api.FinanceResponses.FeeStructureResponse;
import com.acadex.finance.api.FinanceResponses.FinancialReportResponse;
import com.acadex.finance.api.FinanceResponses.InvoiceResponse;
import com.acadex.finance.api.FinanceResponses.OutstandingResponse;
import com.acadex.finance.api.FinanceResponses.PaymentResponse;
import com.acadex.finance.model.FeeStructure;
import com.acadex.finance.model.Invoice;
import com.acadex.finance.model.InvoiceStatus;
import com.acadex.finance.model.PaymentRecord;
import com.acadex.finance.repository.FeeStructureRepository;
import com.acadex.finance.repository.InvoiceRepository;
import com.acadex.finance.repository.PaymentRecordRepository;
import com.acadex.notification.service.NotificationService;
import com.acadex.security.AccessScopeService;
import com.acadex.school.model.School;
import com.acadex.school.repository.SchoolRepository;
import com.acadex.tenant.TenantAccessService;
import com.acadex.user.model.PlatformRole;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import static org.springframework.http.HttpStatus.FORBIDDEN;

@Service
public class FinanceService {

    private final TenantAccessService tenantAccessService;
    private final FeatureAccessService featureAccessService;
    private final SchoolRepository schoolRepository;
    private final FeeStructureRepository feeStructureRepository;
    private final InvoiceRepository invoiceRepository;
    private final PaymentRecordRepository paymentRecordRepository;
    private final StudentEnrollmentRepository studentEnrollmentRepository;
    private final AuditService auditService;
    private final NotificationService notificationService;
    private final AccessScopeService accessScopeService;

    public FinanceService(
            TenantAccessService tenantAccessService,
            FeatureAccessService featureAccessService,
            SchoolRepository schoolRepository,
            FeeStructureRepository feeStructureRepository,
            InvoiceRepository invoiceRepository,
            PaymentRecordRepository paymentRecordRepository,
            StudentEnrollmentRepository studentEnrollmentRepository,
            AuditService auditService,
            NotificationService notificationService,
            AccessScopeService accessScopeService
    ) {
        this.tenantAccessService = tenantAccessService;
        this.featureAccessService = featureAccessService;
        this.schoolRepository = schoolRepository;
        this.feeStructureRepository = feeStructureRepository;
        this.invoiceRepository = invoiceRepository;
        this.paymentRecordRepository = paymentRecordRepository;
        this.studentEnrollmentRepository = studentEnrollmentRepository;
        this.auditService = auditService;
        this.notificationService = notificationService;
        this.accessScopeService = accessScopeService;
    }

    @Transactional
    public FeeStructureResponse createFeeStructure(CreateFeeStructureRequest request, UUID actorId) {
        UUID tenantId = requireFinanceTenant();
        FeeStructure structure = new FeeStructure();
        structure.setTenantId(tenantId);
        structure.setName(request.name());
        structure.setClassId(request.classId());
        structure.setAmount(request.amount());
        structure.setDueDate(request.dueDate());
        feeStructureRepository.save(structure);
        auditService.log(tenantId, actorId, "FEE_STRUCTURE_CREATED", "FeeStructure", structure.getId().toString(), structure.getName());
        return new FeeStructureResponse(structure.getId(), structure.getName(), structure.getClassId(), structure.getAmount());
    }

    @Transactional
    public List<InvoiceResponse> generateInvoices(GenerateInvoicesRequest request, UUID actorId) {
        UUID tenantId = requireFinanceTenant();
        FeeStructure structure = feeStructureRepository.findById(request.feeStructureId()).orElseThrow();
        List<InvoiceResponse> responses = studentEnrollmentRepository.findAllByTenantIdAndClassId(tenantId, request.classId()).stream()
                .map(enrollment -> {
                    Invoice invoice = new Invoice();
                    invoice.setTenantId(tenantId);
                    invoice.setStudentId(enrollment.getStudentId());
                    invoice.setFeeStructureId(structure.getId());
                    invoice.setAmount(structure.getAmount());
                    invoice.setDueDate(structure.getDueDate());
                    invoice.setGeneratedAt(OffsetDateTime.now());
                    invoiceRepository.save(invoice);
                    notificationService.queueEmail(tenantId, enrollment.getStudentId(), "Invoice generated", "A new invoice has been generated.");
                    return new InvoiceResponse(invoice.getId(), invoice.getStudentId(), invoice.getFeeStructureId(), invoice.getAmount(), invoice.getStatus());
                })
                .toList();
        auditService.log(tenantId, actorId, "INVOICES_GENERATED", "Invoice", structure.getId().toString(), String.valueOf(responses.size()));
        return responses;
    }

    @Transactional
    public PaymentResponse recordPayment(RecordPaymentRequest request, UUID actorId) {
        UUID tenantId = requireFinanceTenant();
        Invoice invoice = invoiceRepository.findById(request.invoiceId()).orElseThrow();
        PaymentRecord payment = new PaymentRecord();
        payment.setTenantId(tenantId);
        payment.setInvoiceId(invoice.getId());
        payment.setStudentId(request.studentId());
        payment.setAmount(request.amount());
        payment.setReference(request.reference());
        payment.setPaidAt(OffsetDateTime.now());
        paymentRecordRepository.save(payment);
        invoice.setStatus(request.amount() >= invoice.getAmount() ? InvoiceStatus.PAID : InvoiceStatus.PARTIALLY_PAID);
        auditService.log(tenantId, actorId, "FEE_MODIFIED", "PaymentRecord", payment.getId().toString(), payment.getReference());
        return new PaymentResponse(payment.getId(), payment.getInvoiceId(), payment.getStudentId(), payment.getAmount(), payment.getReference());
    }

    @Transactional(readOnly = true)
    public OutstandingResponse outstanding(UUID studentId, AcadexUserPrincipal principal) {
        UUID tenantId = requireFinanceTenant();
        ensureFinanceAccess(tenantId, studentId, principal);
        List<Invoice> invoices = invoiceRepository.findAllByTenantIdAndStudentId(tenantId, studentId);
        List<InvoiceResponse> mapped = invoices.stream()
                .map(invoice -> new InvoiceResponse(invoice.getId(), invoice.getStudentId(), invoice.getFeeStructureId(), invoice.getAmount(), invoice.getStatus()))
                .toList();
        double outstanding = invoices.stream()
                .filter(invoice -> invoice.getStatus() != InvoiceStatus.PAID)
                .mapToDouble(Invoice::getAmount)
                .sum();
        return new OutstandingResponse(studentId, outstanding, mapped);
    }

    @Transactional(readOnly = true)
    public List<PaymentResponse> paymentHistory(UUID studentId, AcadexUserPrincipal principal) {
        UUID tenantId = requireFinanceTenant();
        ensureFinanceAccess(tenantId, studentId, principal);
        return paymentRecordRepository.findAllByTenantIdAndStudentId(tenantId, studentId).stream()
                .map(payment -> new PaymentResponse(payment.getId(), payment.getInvoiceId(), payment.getStudentId(), payment.getAmount(), payment.getReference()))
                .toList();
    }

    @Transactional(readOnly = true)
    public FinancialReportResponse financialReport(AcadexUserPrincipal principal) {
        UUID tenantId = requireFinanceTenant();
        if (principal.getRole() != PlatformRole.SCHOOL_ADMIN && principal.getRole() != PlatformRole.SUPER_ADMIN) {
            throw new ResponseStatusException(FORBIDDEN, "You cannot view school-wide finance reports.");
        }
        List<Invoice> invoices = invoiceRepository.findAllByTenantId(tenantId);
        double invoiced = invoices.stream().mapToDouble(Invoice::getAmount).sum();
        double collected = paymentRecordRepository.findAll().stream()
                .filter(payment -> tenantId.equals(payment.getTenantId()))
                .mapToDouble(PaymentRecord::getAmount)
                .sum();
        return new FinancialReportResponse(invoiced, collected, invoiced - collected);
    }

    private UUID requireFinanceTenant() {
        UUID tenantId = tenantAccessService.requireTenant();
        School school = schoolRepository.findById(tenantId).orElseThrow();
        featureAccessService.requireFeature(school, FeatureFlag.ENABLE_FINANCE_MODULE);
        return tenantId;
    }

    private void ensureFinanceAccess(UUID tenantId, UUID studentId, AcadexUserPrincipal principal) {
        if (!accessScopeService.canAccessStudent(tenantId, studentId, principal)) {
            throw new ResponseStatusException(FORBIDDEN, "You cannot view finance records for this student.");
        }
    }
}
