package com.acadex.analytics.service;

import com.acadex.analytics.api.AnalyticsSummaryResponse;
import com.acadex.analytics.api.DashboardAnalyticsResponse;
import com.acadex.academic.repository.SchoolClassRepository;
import com.acadex.academic.repository.StudentEnrollmentRepository;
import com.acadex.academic.repository.SubjectAssignmentRepository;
import com.acadex.announcement.repository.AnnouncementRepository;
import com.acadex.attendance.model.AttendanceStatus;
import com.acadex.attendance.repository.AttendanceRecordRepository;
import com.acadex.exam.repository.ExamRepository;
import com.acadex.finance.repository.InvoiceRepository;
import com.acadex.finance.repository.PaymentRecordRepository;
import com.acadex.notification.repository.NotificationOutboxRepository;
import com.acadex.school.repository.SchoolRepository;
import com.acadex.tenant.TenantAccessService;
import com.acadex.user.repository.UserAccountRepository;
import java.util.UUID;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AnalyticsService {

    private final SchoolRepository schoolRepository;
    private final UserAccountRepository userAccountRepository;
    private final NotificationOutboxRepository notificationOutboxRepository;
    private final AnnouncementRepository announcementRepository;
    private final TenantAccessService tenantAccessService;
    private final StudentEnrollmentRepository studentEnrollmentRepository;
    private final SchoolClassRepository schoolClassRepository;
    private final AttendanceRecordRepository attendanceRecordRepository;
    private final InvoiceRepository invoiceRepository;
    private final PaymentRecordRepository paymentRecordRepository;
    private final ExamRepository examRepository;
    private final SubjectAssignmentRepository subjectAssignmentRepository;

    public AnalyticsService(
            SchoolRepository schoolRepository,
            UserAccountRepository userAccountRepository,
            NotificationOutboxRepository notificationOutboxRepository,
            AnnouncementRepository announcementRepository,
            TenantAccessService tenantAccessService,
            StudentEnrollmentRepository studentEnrollmentRepository,
            SchoolClassRepository schoolClassRepository,
            AttendanceRecordRepository attendanceRecordRepository,
            InvoiceRepository invoiceRepository,
            PaymentRecordRepository paymentRecordRepository,
            ExamRepository examRepository,
            SubjectAssignmentRepository subjectAssignmentRepository
    ) {
        this.schoolRepository = schoolRepository;
        this.userAccountRepository = userAccountRepository;
        this.notificationOutboxRepository = notificationOutboxRepository;
        this.announcementRepository = announcementRepository;
        this.tenantAccessService = tenantAccessService;
        this.studentEnrollmentRepository = studentEnrollmentRepository;
        this.schoolClassRepository = schoolClassRepository;
        this.attendanceRecordRepository = attendanceRecordRepository;
        this.invoiceRepository = invoiceRepository;
        this.paymentRecordRepository = paymentRecordRepository;
        this.examRepository = examRepository;
        this.subjectAssignmentRepository = subjectAssignmentRepository;
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "analytics-summary", key = "T(com.acadex.tenant.TenantContext).getTenantId().orElse(null)")
    public AnalyticsSummaryResponse summary() {
        UUID tenantId = tenantAccessService.requireTenant();
        return new AnalyticsSummaryResponse(
                schoolRepository.count(),
                userAccountRepository.countByTenantId(tenantId),
                notificationOutboxRepository.countByTenantId(tenantId),
                announcementRepository.findAllByTenantIdOrderByPublishAtDesc(tenantId).size()
        );
    }

    @Transactional(readOnly = true)
    public DashboardAnalyticsResponse dashboard() {
        UUID tenantId = tenantAccessService.requireTenant();
        double invoiced = invoiceRepository.findAllByTenantId(tenantId).stream().mapToDouble(item -> item.getAmount()).sum();
        double collected = paymentRecordRepository.findAll().stream()
                .filter(item -> tenantId.equals(item.getTenantId()))
                .mapToDouble(item -> item.getAmount())
                .sum();
        return new DashboardAnalyticsResponse(
                studentEnrollmentRepository.countByTenantId(tenantId),
                schoolClassRepository.countByTenantId(tenantId),
                attendanceRecordRepository.countByTenantIdAndStatus(tenantId, AttendanceStatus.PRESENT),
                attendanceRecordRepository.countByTenantIdAndStatus(tenantId, AttendanceStatus.ABSENT),
                invoiced,
                collected,
                examRepository.findAll().stream().filter(item -> tenantId.equals(item.getTenantId())).count(),
                subjectAssignmentRepository.findAllByTenantId(tenantId).size()
        );
    }
}
