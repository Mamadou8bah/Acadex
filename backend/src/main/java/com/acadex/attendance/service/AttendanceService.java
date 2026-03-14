package com.acadex.attendance.service;

import com.acadex.attendance.api.AttendanceRequests.MarkAttendanceRequest;
import com.acadex.attendance.api.AttendanceResponses.AttendanceRecordResponse;
import com.acadex.attendance.api.AttendanceResponses.AttendanceReportResponse;
import com.acadex.attendance.model.AttendanceRecord;
import com.acadex.attendance.model.AttendanceStatus;
import com.acadex.attendance.repository.AttendanceRecordRepository;
import com.acadex.audit.service.AuditService;
import com.acadex.feature.model.FeatureFlag;
import com.acadex.feature.service.FeatureAccessService;
import com.acadex.notification.service.NotificationService;
import com.acadex.school.model.School;
import com.acadex.school.repository.SchoolRepository;
import com.acadex.tenant.TenantAccessService;
import com.acadex.user.model.PlatformRole;
import com.acadex.user.repository.UserAccountRepository;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AttendanceService {

    private final TenantAccessService tenantAccessService;
    private final AttendanceRecordRepository attendanceRecordRepository;
    private final AuditService auditService;
    private final SchoolRepository schoolRepository;
    private final FeatureAccessService featureAccessService;
    private final UserAccountRepository userAccountRepository;
    private final NotificationService notificationService;

    public AttendanceService(
            TenantAccessService tenantAccessService,
            AttendanceRecordRepository attendanceRecordRepository,
            AuditService auditService,
            SchoolRepository schoolRepository,
            FeatureAccessService featureAccessService,
            UserAccountRepository userAccountRepository,
            NotificationService notificationService
    ) {
        this.tenantAccessService = tenantAccessService;
        this.attendanceRecordRepository = attendanceRecordRepository;
        this.auditService = auditService;
        this.schoolRepository = schoolRepository;
        this.featureAccessService = featureAccessService;
        this.userAccountRepository = userAccountRepository;
        this.notificationService = notificationService;
    }

    @Transactional
    public AttendanceRecordResponse markAttendance(MarkAttendanceRequest request, UUID actorId) {
        UUID tenantId = tenantAccessService.requireTenant();
        AttendanceRecord record = new AttendanceRecord();
        record.setTenantId(tenantId);
        record.setStudentId(request.studentId());
        record.setClassId(request.classId());
        record.setAttendanceDate(request.attendanceDate());
        record.setStatus(request.status());
        record.setMarkedByUserId(actorId);
        attendanceRecordRepository.save(record);
        auditService.log(tenantId, actorId, "ATTENDANCE_MARKED", "AttendanceRecord", record.getId().toString(), request.status().name());

        if (request.status() == AttendanceStatus.ABSENT) {
            School school = schoolRepository.findById(tenantId).orElseThrow();
            if (school.getEnabledFeatures().contains(FeatureFlag.ENABLE_ATTENDANCE_ALERTS)) {
                featureAccessService.requireFeature(school, FeatureFlag.ENABLE_ATTENDANCE_ALERTS);
                userAccountRepository.findAllByTenantId(tenantId).stream()
                        .filter(user -> user.getRole() == PlatformRole.PARENT)
                        .forEach(parent -> notificationService.queueEmail(tenantId, parent.getId(), "Attendance alert", "A student was marked absent."));
            }
        }

        return new AttendanceRecordResponse(record.getId(), record.getStudentId(), record.getClassId(), record.getAttendanceDate(), record.getStatus(), record.getMarkedByUserId());
    }

    @Transactional(readOnly = true)
    public java.util.List<AttendanceRecordResponse> history(UUID studentId) {
        UUID tenantId = tenantAccessService.requireTenant();
        return attendanceRecordRepository.findAllByTenantIdAndStudentIdOrderByAttendanceDateDesc(tenantId, studentId).stream()
                .map(record -> new AttendanceRecordResponse(record.getId(), record.getStudentId(), record.getClassId(), record.getAttendanceDate(), record.getStatus(), record.getMarkedByUserId()))
                .toList();
    }

    @Transactional(readOnly = true)
    public AttendanceReportResponse report(UUID classId, LocalDate startDate, LocalDate endDate) {
        UUID tenantId = tenantAccessService.requireTenant();
        java.util.List<AttendanceRecord> records = attendanceRecordRepository.findAllByTenantIdAndClassIdAndAttendanceDateBetween(tenantId, classId, startDate, endDate);
        Map<AttendanceStatus, Long> grouped = Arrays.stream(AttendanceStatus.values())
                .collect(Collectors.toMap(Function.identity(), status -> records.stream().filter(item -> item.getStatus() == status).count()));
        return new AttendanceReportResponse(classId, startDate, endDate, records.size(), grouped);
    }
}
